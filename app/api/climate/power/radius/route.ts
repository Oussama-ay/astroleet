import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  NASA_POWER_CACHE_SECONDS,
  NasaPowerError,
} from "@/lib/server/providers/nasa-power"
import { fetchNasaPowerRadius } from "@/lib/server/providers/nasa-power-radius"
import { parsePowerRadiusSearchParams } from "@/lib/validation/power"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const query = parsePowerRadiusSearchParams(request.nextUrl.searchParams)
    const result = await fetchNasaPowerRadius(query)

    return NextResponse.json(
      {
        data: { series: result.series },
        meta: {
          provider: "NASA POWER",
          method: "five-point-radius-mean",
          sampleCount: result.sampleCount,
          cacheTtlSeconds: NASA_POWER_CACHE_SECONDS,
        },
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${NASA_POWER_CACHE_SECONDS}, stale-while-revalidate=604800`,
        },
      },
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Request parameters are invalid",
            issues: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        { status: 400 },
      )
    }

    if (error instanceof NasaPowerError) {
      const status = error.code === "timeout" ? 504 : error.code === "rate_limited" ? 503 : 502
      return NextResponse.json(
        {
          error: {
            code: `NASA_POWER_${error.code.toUpperCase()}`,
            message: error.message,
          },
        },
        {
          status,
          headers: error.code === "rate_limited" ? { "Retry-After": "60" } : undefined,
        },
      )
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The radius climate service could not complete the request",
        },
      },
      { status: 500 },
    )
  }
}
