import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  NASA_POWER_CACHE_SECONDS,
  NasaPowerError,
  fetchNasaPowerClimate,
} from "@/lib/server/providers/nasa-power"
import { parsePowerClimateSearchParams } from "@/lib/validation/power"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const query = parsePowerClimateSearchParams(request.nextUrl.searchParams)
    const result = await fetchNasaPowerClimate(query)

    return NextResponse.json(
      {
        data: result,
        meta: {
          provider: "NASA POWER",
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
          message: "The climate service could not complete the request",
        },
      },
      { status: 500 },
    )
  }
}
