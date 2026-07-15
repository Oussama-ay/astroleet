import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { aiClimateExplainRequestSchema } from "@/lib/domain/ai-climate-explanation"
import { assessObservedClimate } from "@/lib/domain/observed-climate-recommendations"
import { logOperationalEvent } from "@/lib/server/operational-telemetry"
import {
  AIClimateExplanationError,
  buildAIClimateContext,
  generateAIClimateExplanation,
} from "@/lib/server/openai-climate-explanation"
import {
  aiExplanationRateLimiter,
  getClientRateLimitIdentifier,
  type RateLimitResult,
} from "@/lib/server/request-rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const startedAt = performance.now()
  const rateLimit = aiExplanationRateLimiter.consume(getClientRateLimitIdentifier(request))
  const respond = createResponder(requestId, startedAt, rateLimit)

  if (!rateLimit.allowed) {
    return respond(
      {
        error: {
          code: "AI_REQUEST_LIMITED",
          message: "Too many AI explanation requests; please try again shortly",
          requestId,
        },
      },
      429,
      "rejected",
      { errorCode: "AI_REQUEST_LIMITED" },
      { "Retry-After": retryAfter(rateLimit) },
    )
  }

  try {
    const payload = aiClimateExplainRequestSchema.parse(await request.json())
    const assessment = assessObservedClimate(payload.series)

    if (assessment.status === "insufficient") {
      return respond(
        {
          error: {
            code: "INSUFFICIENT_HISTORY",
            message: assessment.reason,
            requestId,
          },
        },
        422,
        "rejected",
        { errorCode: "INSUFFICIENT_HISTORY" },
      )
    }

    const context = buildAIClimateContext(assessment, payload.series[0].coverage)
    const result = await generateAIClimateExplanation(context)

    return respond(
      {
        data: { explanation: result.explanation },
        meta: {
          provider: result.provider,
          model: result.model,
          generatedAt: new Date().toISOString(),
          requestId,
        },
      },
      200,
      "success",
      {
        provider: result.provider,
        model: result.model,
        signalCount: assessment.signals.length,
      },
    )
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return respond(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The climate explanation request is invalid",
            requestId,
            issues:
              error instanceof ZodError
                ? error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                  }))
                : undefined,
          },
        },
        400,
        "rejected",
        { errorCode: "INVALID_REQUEST" },
      )
    }

    if (error instanceof AIClimateExplanationError) {
      const mapped = mapAIError(error)
      return respond(
        {
          error: {
            code: mapped.publicCode,
            message: error.message,
            requestId,
          },
        },
        mapped.status,
        "failed",
        { errorCode: mapped.publicCode },
        mapped.retryAfter ? { "Retry-After": mapped.retryAfter } : undefined,
      )
    }

    return respond(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The climate explanation could not be completed",
          requestId,
        },
      },
      500,
      "failed",
      { errorCode: "INTERNAL_ERROR" },
    )
  }
}

function createResponder(requestId: string, startedAt: number, rateLimit: RateLimitResult) {
  return (
    body: object,
    status: number,
    outcome: "success" | "rejected" | "failed",
    details: {
      errorCode?: string
      provider?: "OpenAI" | "OpenRouter"
      model?: string
      signalCount?: number
    },
    extraHeaders?: Record<string, string>,
  ) => {
    logOperationalEvent({
      event: "ai_explanation_request",
      requestId,
      route: "/api/climate/explain",
      outcome,
      status,
      durationMs: performance.now() - startedAt,
      ...details,
    })

    return NextResponse.json(body, {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Request-Id": requestId,
        "RateLimit-Limit": String(rateLimit.limit),
        "RateLimit-Remaining": String(rateLimit.remaining),
        "RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1_000)),
        ...extraHeaders,
      },
    })
  }
}

function mapAIError(error: AIClimateExplanationError) {
  switch (error.code) {
    case "not_configured":
      return { status: 503, publicCode: "AI_NOT_CONFIGURED" }
    case "quota_exceeded":
      return { status: 503, publicCode: "AI_QUOTA_EXCEEDED" }
    case "authentication_failed":
      return { status: 503, publicCode: "AI_CONFIGURATION_REJECTED" }
    case "rate_limited":
      return { status: 429, publicCode: "AI_PROVIDER_RATE_LIMITED", retryAfter: "60" }
    case "timeout":
      return { status: 504, publicCode: "AI_PROVIDER_TIMEOUT" }
    case "invalid_output":
      return { status: 502, publicCode: "AI_INVALID_OUTPUT" }
    default:
      return { status: 502, publicCode: "AI_PROVIDER_UNAVAILABLE" }
  }
}

function retryAfter(rateLimit: RateLimitResult) {
  return String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1_000)))
}
