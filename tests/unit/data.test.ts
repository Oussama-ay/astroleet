import { describe, expect, it } from "vitest"
import {
  METRICS,
  MONTHS,
  REGIONS,
  environmentalSeriesForRegion,
  historyForRegion,
  metricsForRegion,
  recommendationsForRegion,
  type MetricKey,
} from "../../lib/data"

const metricKeys = Object.keys(METRICS) as MetricKey[]

describe("environmental demonstration data", () => {
  it("covers Morocco's 12 administrative regions", () => {
    expect(REGIONS).toHaveLength(12)
    expect(new Set(REGIONS.map((region) => region.name)).size).toBe(12)
  })

  it("generates deterministic current values inside each metric domain", () => {
    for (const region of REGIONS) {
      expect(metricsForRegion(region)).toEqual(metricsForRegion(region))

      for (const metric of metricKeys) {
        const value = metricsForRegion(region)[metric]
        expect(value).toBeGreaterThanOrEqual(METRICS[metric].min)
        expect(value).toBeLessThanOrEqual(METRICS[metric].max)
      }
    }
  })

  it("creates a bounded value for every month in each history", () => {
    for (const region of REGIONS) {
      for (const metric of metricKeys) {
        const history = historyForRegion(region, metric)

        expect(history).toHaveLength(MONTHS.length)
        for (const value of history) {
          expect(value).toBeGreaterThanOrEqual(METRICS[metric].min)
          expect(value).toBeLessThanOrEqual(METRICS[metric].max)
        }
      }
    }
  })

  it("publishes demo values through the auditable environmental contract", () => {
    for (const region of REGIONS) {
      for (const metric of metricKeys) {
        const series = environmentalSeriesForRegion(region, metric)

        expect(series).toMatchObject({
          schemaVersion: "1.0",
          parameter: metric,
          status: "demonstration",
          coverage: {
            type: "region",
            name: region.name,
          },
          source: {
            provider: "Astroleet",
          },
        })
        expect(series.values).toHaveLength(MONTHS.length)
        expect(series.values.every((entry) => entry.quality.status === "estimated")).toBe(
          true,
        )
      }
    }
  })

  it("always marks satellite recommendations for ground verification", () => {
    for (const region of REGIONS) {
      expect(recommendationsForRegion(region)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "verify", severity: "info" }),
        ]),
      )
    }
  })
})
