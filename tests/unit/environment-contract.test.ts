import { describe, expect, it } from "vitest"
import {
  environmentalSeriesSchema,
  parseEnvironmentalSeries,
} from "../../lib/domain/environment"

const validSeries = {
  schemaVersion: "1.0",
  parameter: "moisture",
  unit: "%",
  coverage: {
    type: "point",
    label: "Marrakech",
    latitude: 31.63,
    longitude: -8,
  },
  period: {
    start: "2026-01-01T00:00:00.000Z",
    end: "2026-01-31T23:59:59.000Z",
    aggregation: "monthly",
  },
  source: {
    provider: "Example provider",
    product: "Example product",
    documentation: "https://example.com/product",
  },
  resolution: {
    spatial: "0.5 degrees",
    temporal: "monthly",
  },
  processedAt: "2026-02-01T00:00:00.000Z",
  status: "live",
  values: [
    {
      observedAt: "2026-01-15T00:00:00.000Z",
      value: 21.4,
      quality: {
        status: "valid",
        flags: [],
        notes: [],
      },
    },
  ],
} as const

describe("environmental data contract", () => {
  it("parses a complete provider-independent series", () => {
    expect(parseEnvironmentalSeries(validSeries)).toEqual(validSeries)
  })

  it("rejects coordinates outside the geographic domain", () => {
    const result = environmentalSeriesSchema.safeParse({
      ...validSeries,
      coverage: { ...validSeries.coverage, latitude: 91 },
    })

    expect(result.success).toBe(false)
  })

  it("requires missing quality status and null values to agree", () => {
    const result = environmentalSeriesSchema.safeParse({
      ...validSeries,
      values: [
        {
          ...validSeries.values[0],
          value: null,
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  it("rejects observations outside their declared period", () => {
    const result = environmentalSeriesSchema.safeParse({
      ...validSeries,
      values: [
        {
          ...validSeries.values[0],
          observedAt: "2026-02-15T00:00:00.000Z",
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  it("rejects processing timestamps earlier than the latest observation", () => {
    const result = environmentalSeriesSchema.safeParse({
      ...validSeries,
      processedAt: "2026-01-01T00:00:00.000Z",
    })

    expect(result.success).toBe(false)
  })
})
