import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { aiClimateExplainRequestSchema } from "@/lib/domain/ai-climate-explanation"
import { assessObservedClimate } from "@/lib/domain/observed-climate-recommendations"
import {
  AIClimateExplanationError,
  buildAIClimateContext,
  generateAIClimateExplanation,
} from "@/lib/server/openai-climate-explanation"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const payload = aiClimateExplainRequestSchema.parse(await request.json())
    const assessment = assessObservedClimate(payload.series)

    if (assessment.status === "insufficient") {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_HISTORY",
            message: assessment.reason,
          },
        },
        { status: 422, headers: noStoreHeaders() },
      )
    }

    const context = buildAIClimateContext(assessment, payload.series[0].coverage)
    const result = await generateAIClimateExplanation(context)

    return NextResponse.json(
      {
        data: { explanation: result.explanation },
        meta: {
          provider: "OpenAI",
          model: result.model,
          generatedAt: new Date().toISOString(),
        },
      },
      { headers: noStoreHeaders() },
    )
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The climate explanation request is invalid",
            issues:
              error instanceof ZodError
                ? error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                  }))
                : undefined,
          },
        },
        { status: 400, headers: noStoreHeaders() },
      )
    }

    if (error instanceof AIClimateExplanationError) {
      const status = error.code === "not_configured" ? 503 : 502
      return NextResponse.json(
        {
          error: {
            code:
              error.code === "not_configured"
                ? "AI_NOT_CONFIGURED"
                : "AI_PROVIDER_UNAVAILABLE",
            message: error.message,
          },
        },
        { status, headers: noStoreHeaders() },
      )
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The climate explanation could not be completed",
        },
      },
      { status: 500, headers: noStoreHeaders() },
    )
  }
}

function noStoreHeaders() {
  return { "Cache-Control": "private, no-store" }
}
