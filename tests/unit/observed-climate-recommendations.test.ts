import { describe, expect, it } from "vitest"
import type { EnvironmentalSeries } from "../../lib/domain/environment"
import { assessObservedClimate } from "../../lib/domain/observed-climate-recommendations"

describe("observed climate recommendations", () => {
  it("detects a compound warm and dry signal from same-month history", () => {
    const assessment = assessObservedClimate([
      makeSeries("air_temperature", "°C", [20, 21, 19, 24]),
      makeSeries("precipitation", "mm/day", [3, 4, 5, 1]),
      makeSeries("relative_humidity", "%", [55, 54, 56, 44]),
    ])

    expect(assessment.status).toBe("ready")
    if (assessment.status !== "ready") return

    expect(assessment.comparisons.air_temperature.baseline).toBe(20)
    expect(assessment.comparisons.precipitation.baseline).toBe(4)
    expect(assessment.signals.map((signal) => signal.id)).toEqual([
      "compound-warm-dry",
      "warmer-than-baseline",
      "drier-than-baseline",
      "lower-humidity",
    ])
    expect(assessment.signals[0].evidence).toEqual([
      "24°C vs 20°C baseline (+4°C).",
      "1 mm/day vs 4 mm/day baseline (-75%).",
    ])
  })

  it("returns an informational result when values stay inside the thresholds", () => {
    const assessment = assessObservedClimate([
      makeSeries("air_temperature", "°C", [20, 21, 19, 20.5]),
      makeSeries("precipitation", "mm/day", [3, 4, 5, 4.2]),
      makeSeries("relative_humidity", "%", [55, 54, 56, 58]),
    ])

    expect(assessment.status).toBe("ready")
    if (assessment.status !== "ready") return
    expect(assessment.signals).toHaveLength(1)
    expect(assessment.signals[0].id).toBe("no-configured-anomaly")
  })

  it("refuses to assess fewer than three prior same-month observations", () => {
    const assessment = assessObservedClimate([
      makeSeries("air_temperature", "°C", [20, 21]),
      makeSeries("precipitation", "mm/day", [3, 1]),
      makeSeries("relative_humidity", "%", [55, 40]),
    ])

    expect(assessment).toMatchObject({
      status: "insufficient",
      requiredPriorObservations: 3,
    })
  })

  it("refuses to assess when the metrics have no common valid month", () => {
    const humidity = makeSeries("relative_humidity", "%", [55, 54, 56, 44])
    humidity.values = humidity.values.map((value, index) =>
      index === humidity.values.length - 1
        ? { ...value, value: null, quality: { status: "missing", flags: [], notes: [] } }
        : value,
    )

    const assessment = assessObservedClimate([
      makeSeries("air_temperature", "°C", [20, 21, 19, 24]),
      makeSeries("precipitation", "mm/day", [3, 4, 5, 1]),
      humidity,
    ])

    expect(assessment.status).toBe("insufficient")
  })
})

function makeSeries(
  parameter: "air_temperature" | "precipitation" | "relative_humidity",
  unit: string,
  values: number[],
): EnvironmentalSeries {
  const startYear = 2022
  return {
    schemaVersion: "1.0",
    parameter,
    unit,
    coverage: { type: "point", latitude: 31.6, longitude: -8 },
    period: {
      start: `${startYear}-01-01T00:00:00.000Z`,
      end: `${startYear + values.length - 1}-12-31T23:59:59.999Z`,
      aggregation: "monthly",
    },
    source: {
      provider: "NASA POWER",
      product: "POWER Monthly and Annual API",
      documentation: "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/",
    },
    resolution: { spatial: "meteorological grid", temporal: "monthly average" },
    processedAt: `${startYear + values.length}-01-02T00:00:00.000Z`,
    status: "cached",
    values: values.map((value, index) => ({
      observedAt: `${startYear + index}-12-01T00:00:00.000Z`,
      value,
      quality: { status: "valid", flags: [], notes: [] },
    })),
  }
}
