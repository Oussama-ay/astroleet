import { describe, expect, it, vi } from "vitest"
import type { EnvironmentalParameter, EnvironmentalSeries } from "../../lib/domain/environment"
import {
  buildRadiusSamplePoints,
  fetchNasaPowerRadius,
} from "../../lib/server/providers/nasa-power-radius"

const query = {
  latitude: 31.63,
  longitude: -8,
  radiusKm: 100 as const,
  start: 2025,
  end: 2025,
}

function series(
  parameter: EnvironmentalParameter,
  value: number | null,
  sampleNumber: number,
): EnvironmentalSeries {
  return {
    schemaVersion: "1.0",
    parameter,
    unit: parameter === "air_temperature" ? "°C" : parameter === "precipitation" ? "mm/day" : "%",
    coverage: {
      type: "point",
      label: `Sample ${sampleNumber}`,
      latitude: 31.63,
      longitude: -8,
    },
    period: {
      start: "2025-01-01T00:00:00.000Z",
      end: "2025-12-31T23:59:59.999Z",
      aggregation: "monthly",
    },
    source: {
      provider: "NASA POWER",
      product: "POWER Monthly and Annual API",
      version: "v2.9.7",
      documentation: "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/",
    },
    resolution: {
      spatial: "0.5° latitude × 0.625° longitude meteorological grid",
      temporal: "Monthly average",
    },
    processedAt: `2026-01-0${sampleNumber + 1}T00:00:00.000Z`,
    status: "cached",
    values: [
      {
        observedAt: "2025-01-01T00:00:00.000Z",
        value,
        quality: {
          status: value === null ? "missing" : "valid",
          flags: value === null ? ["provider-fill-value"] : [],
          notes: value === null ? ["Missing at provider"] : [],
        },
      },
    ],
  }
}

describe("NASA POWER radius provider", () => {
  it("samples the center and four points on the requested boundary", () => {
    const points = buildRadiusSamplePoints(query.latitude, query.longitude, query.radiusKm)

    expect(points).toHaveLength(5)
    expect(points[0]).toEqual({ latitude: 31.63, longitude: -8 })
    expect(points[1].latitude).toBeCloseTo(32.529, 2)
    expect(points[2].longitude).toBeCloseTo(-6.944, 2)
    expect(points[3].latitude).toBeCloseTo(30.731, 2)
    expect(points[4].longitude).toBeCloseTo(-9.056, 2)
  })

  it("returns a derived monthly mean with sampled-radius provenance", async () => {
    let sampleNumber = 0
    const pointFetcher = vi.fn(async () => {
      sampleNumber += 1
      return {
        series: [
          series("air_temperature", sampleNumber * 10, sampleNumber),
          series("precipitation", sampleNumber, sampleNumber),
          series("relative_humidity", 40 + sampleNumber, sampleNumber),
        ],
      }
    })

    const result = await fetchNasaPowerRadius(query, { pointFetcher })
    const temperature = result.series[0]

    expect(pointFetcher).toHaveBeenCalledTimes(5)
    expect(result.sampleCount).toBe(5)
    expect(temperature).toMatchObject({
      status: "derived",
      coverage: {
        type: "radius",
        center: { latitude: 31.63, longitude: -8 },
        radiusKm: 100,
        sampleCount: 5,
      },
      source: { product: expect.stringContaining("Five-point radius mean") },
      values: [
        {
          value: 30,
          quality: {
            status: "estimated",
            flags: ["radius-mean", "five-point-sample"],
          },
        },
      ],
    })
    expect(temperature.processedAt).toBe("2026-01-06T00:00:00.000Z")
  })

  it("averages valid samples and identifies a partial sample", async () => {
    let sampleNumber = 0
    const result = await fetchNasaPowerRadius(query, {
      pointFetcher: async () => {
        sampleNumber += 1
        return {
          series: [
            series("air_temperature", sampleNumber === 5 ? null : sampleNumber, sampleNumber),
            series("precipitation", sampleNumber, sampleNumber),
            series("relative_humidity", sampleNumber, sampleNumber),
          ],
        }
      },
    })

    expect(result.series[0].values[0]).toMatchObject({
      value: 2.5,
      quality: { status: "estimated", flags: ["radius-mean", "partial-sample"] },
    })
  })
})
