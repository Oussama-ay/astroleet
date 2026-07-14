import { describe, expect, it } from "vitest"
import type { EnvironmentalSeries } from "../../lib/domain/environment"
import {
  climateExportFilename,
  createClimateCsvExport,
  createClimateJsonExport,
} from "../../lib/domain/climate-export"

const series: EnvironmentalSeries = {
  schemaVersion: "1.0",
  parameter: "air_temperature",
  unit: "°C",
  coverage: {
    type: "radius",
    label: "100 km around Casablanca",
    center: { latitude: 33.57, longitude: -7.59 },
    radiusKm: 100,
    sampleCount: 5,
  },
  period: {
    start: "2021-01-01T00:00:00.000Z",
    end: "2025-12-31T23:59:59.999Z",
    aggregation: "monthly",
  },
  source: {
    provider: "NASA POWER",
    product: '=Unsafe, "spreadsheet" product',
    version: "v2.9.7",
    documentation: "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/",
  },
  resolution: {
    spatial: "0.5° latitude × 0.625° longitude meteorological grid",
    temporal: "Monthly average",
  },
  processedAt: "2026-01-02T00:00:00.000Z",
  status: "derived",
  values: [
    {
      observedAt: "2021-01-01T00:00:00.000Z",
      value: 12.5,
      quality: {
        status: "estimated",
        flags: ["radius-mean", "five-point-sample"],
        notes: ["Arithmetic mean of five samples"],
      },
    },
    {
      observedAt: "2021-02-01T00:00:00.000Z",
      value: null,
      quality: {
        status: "missing",
        flags: ["no-valid-samples"],
        notes: ["No valid values"],
      },
    },
  ],
}

describe("climate data export", () => {
  it("preserves the normalized contract in a versioned JSON envelope", () => {
    const exportedAt = new Date("2026-07-14T12:00:00.000Z")
    const payload = JSON.parse(createClimateJsonExport([series], exportedAt))

    expect(payload).toEqual({
      format: "astroleet.environmental-series",
      version: "1.0",
      exportedAt: exportedAt.toISOString(),
      series: [series],
    })
  })

  it("creates observation rows with coverage, quality, and safe provenance fields", () => {
    const csv = createClimateCsvExport([series])
    const lines = csv.trim().split("\r\n")

    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain("schema_version,parameter,unit,coverage_type")
    expect(lines[1]).toContain('"radius-mean|five-point-sample"')
    expect(lines[1]).toContain('"\'=Unsafe, ""spreadsheet"" product"')
    expect(lines[2]).toContain('"missing","no-valid-samples"')
  })

  it("builds deterministic filenames from coverage and period", () => {
    expect(climateExportFilename([series], "csv")).toBe(
      "astroleet-climate-radius-2021-2025.csv",
    )
    expect(climateExportFilename([], "json")).toBe("astroleet-climate.json")
  })
})
