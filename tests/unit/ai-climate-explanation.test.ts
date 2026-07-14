import { describe, expect, it } from "vitest"
import type { EnvironmentalSeries } from "../../lib/domain/environment"
import {
  aiClimateExplainRequestSchema,
  aiClimateExplainResponseSchema,
  AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS,
} from "../../lib/domain/ai-climate-explanation"
import { assessObservedClimate } from "../../lib/domain/observed-climate-recommendations"
import {
  buildAIClimateContext,
  generateAIClimateExplanation,
} from "../../lib/server/openai-climate-explanation"

describe("AI climate explanation contract", () => {
  it("builds bounded context from the deterministic assessment", () => {
    const series = makeClimateSeries()
    const request = aiClimateExplainRequestSchema.parse({ series })
    const assessment = assessObservedClimate(request.series)

    expect(assessment.status).toBe("ready")
    if (assessment.status !== "ready") return

    const context = buildAIClimateContext(assessment, request.series[0].coverage)
    expect(context.scope).toBe("selected analysis point")
    expect(context.baseline.method).toContain("same calendar month")
    expect(context.comparisons).toHaveLength(3)
    expect(context.deterministicSignals.map((signal) => signal.id)).toContain(
      "warmer-than-baseline",
    )
  })

  it("rejects duplicate metrics and oversized histories", () => {
    const series = makeClimateSeries()
    series[1] = { ...series[0] }
    series[2] = {
      ...series[2],
      values: Array.from(
        { length: AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS + 1 },
        (_, index) => ({
          observedAt: `${1900 + index}-12-01T00:00:00.000Z`,
          value: 50,
          quality: { status: "valid" as const, flags: [], notes: [] },
        }),
      ),
      period: {
        start: "1900-01-01T00:00:00.000Z",
        end: "2020-12-31T23:59:59.999Z",
        aggregation: "monthly",
      },
      processedAt: "2021-01-02T00:00:00.000Z",
    }

    const result = aiClimateExplainRequestSchema.safeParse({ series })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Exactly one precipitation series is required",
        `At most ${AI_CLIMATE_MAX_MONTHLY_OBSERVATIONS} monthly observations are allowed`,
      ]),
    )
  })

  it("validates structured API responses", () => {
    expect(() =>
      aiClimateExplainResponseSchema.parse({
        data: {
          explanation: {
            headline: "Observed warmth needs verification",
            overview: "The monthly signal exceeded the configured threshold.",
            signalExplanations: [
              {
                signalId: "warmer-than-baseline",
                meaning: "The monthly average is elevated.",
                whyItMatters: "It identifies an area for inspection.",
                verifyNext: "Compare with a local station.",
              },
            ],
            caveats: ["This is not a forecast.", "Monthly averages can hide extremes."],
          },
        },
        meta: {
          provider: "OpenAI",
          model: "gpt-5.6-luna",
          generatedAt: "2026-07-14T16:00:00.000Z",
        },
      }),
    ).not.toThrow()
  })

  it("fails safely without a server API key", async () => {
    const previousKey = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    try {
      await expect(
        generateAIClimateExplanation({
          scope: "selected analysis point",
          observedAt: "2025-12-01T00:00:00.000Z",
          baseline: { startYear: 2022, endYear: 2024, method: "same-month median" },
          comparisons: [],
          deterministicSignals: [],
          limitations: [],
        }),
      ).rejects.toMatchObject({ code: "not_configured" })
    } finally {
      if (previousKey === undefined) delete process.env.OPENAI_API_KEY
      else process.env.OPENAI_API_KEY = previousKey
    }
  })
})

function makeClimateSeries(): EnvironmentalSeries[] {
  return [
    makeSeries("air_temperature", "°C", [20, 21, 19, 24]),
    makeSeries("precipitation", "mm/day", [3, 4, 5, 4]),
    makeSeries("relative_humidity", "%", [55, 54, 56, 55]),
  ]
}

function makeSeries(
  parameter: "air_temperature" | "precipitation" | "relative_humidity",
  unit: string,
  values: number[],
): EnvironmentalSeries {
  return {
    schemaVersion: "1.0",
    parameter,
    unit,
    coverage: { type: "point", label: "Test location", latitude: 31.6, longitude: -8 },
    period: {
      start: "2022-01-01T00:00:00.000Z",
      end: "2025-12-31T23:59:59.999Z",
      aggregation: "monthly",
    },
    source: {
      provider: "NASA POWER",
      product: "POWER Monthly and Annual API",
      documentation: "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/",
    },
    resolution: { spatial: "meteorological grid", temporal: "monthly average" },
    processedAt: "2026-01-02T00:00:00.000Z",
    status: "cached",
    values: values.map((value, index) => ({
      observedAt: `${2022 + index}-12-01T00:00:00.000Z`,
      value,
      quality: { status: "valid", flags: [], notes: [] },
    })),
  }
}
