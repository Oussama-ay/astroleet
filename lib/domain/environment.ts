import { z } from "zod"

export const ENVIRONMENTAL_CONTRACT_VERSION = "1.0" as const

export const environmentalParameterSchema = z.enum([
  "ndvi",
  "moisture",
  "lst",
  "air_temperature",
  "precipitation",
  "relative_humidity",
])
export type EnvironmentalParameter = z.infer<typeof environmentalParameterSchema>

export const dataStatusSchema = z.enum([
  "live",
  "derived",
  "cached",
  "demonstration",
])
export type DataStatus = z.infer<typeof dataStatusSchema>

const coordinateSchema = z.strictObject({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
})

export const geographicCoverageSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("point"),
    label: z.string().min(1).optional(),
    ...coordinateSchema.shape,
  }),
  z.strictObject({
    type: z.literal("region"),
    id: z.string().min(1),
    name: z.string().min(1),
    centroid: coordinateSchema,
  }),
])
export type GeographicCoverage = z.infer<typeof geographicCoverageSchema>

export const observationPeriodSchema = z
  .strictObject({
    start: z.iso.datetime({ offset: true }),
    end: z.iso.datetime({ offset: true }),
    aggregation: z.enum(["instant", "daily", "monthly", "annual", "rolling"]),
  })
  .superRefine((period, context) => {
    if (Date.parse(period.start) > Date.parse(period.end)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "Period end must not be earlier than its start",
      })
    }
  })
export type ObservationPeriod = z.infer<typeof observationPeriodSchema>

export const observationQualitySchema = z.strictObject({
  status: z.enum(["valid", "estimated", "missing"]),
  flags: z.array(z.string().min(1)),
  notes: z.array(z.string().min(1)),
})
export type ObservationQuality = z.infer<typeof observationQualitySchema>

export const environmentalValueSchema = z
  .strictObject({
    observedAt: z.iso.datetime({ offset: true }),
    value: z.number().finite().nullable(),
    quality: observationQualitySchema,
  })
  .superRefine((observation, context) => {
    const isMissing = observation.quality.status === "missing"

    if (isMissing !== (observation.value === null)) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "Missing observations must have a null value, and only missing observations may be null",
      })
    }
  })
export type EnvironmentalValue = z.infer<typeof environmentalValueSchema>

export const environmentalSeriesSchema = z
  .strictObject({
    schemaVersion: z.literal(ENVIRONMENTAL_CONTRACT_VERSION),
    parameter: environmentalParameterSchema,
    unit: z.string().min(1),
    coverage: geographicCoverageSchema,
    period: observationPeriodSchema,
    source: z.strictObject({
      provider: z.string().min(1),
      product: z.string().min(1),
      version: z.string().min(1).optional(),
      documentation: z.string().min(1),
    }),
    resolution: z.strictObject({
      spatial: z.string().min(1),
      temporal: z.string().min(1),
    }),
    processedAt: z.iso.datetime({ offset: true }),
    status: dataStatusSchema,
    values: z.array(environmentalValueSchema).min(1),
  })
  .superRefine((series, context) => {
    const start = Date.parse(series.period.start)
    const end = Date.parse(series.period.end)
    const processedAt = Date.parse(series.processedAt)
    let previous = Number.NEGATIVE_INFINITY

    series.values.forEach((observation, index) => {
      const timestamp = Date.parse(observation.observedAt)

      if (timestamp < start || timestamp > end) {
        context.addIssue({
          code: "custom",
          path: ["values", index, "observedAt"],
          message: "Observation timestamp must fall inside the declared period",
        })
      }

      if (timestamp <= previous) {
        context.addIssue({
          code: "custom",
          path: ["values", index, "observedAt"],
          message: "Observation timestamps must be unique and chronological",
        })
      }

      previous = timestamp
    })

    if (processedAt < previous) {
      context.addIssue({
        code: "custom",
        path: ["processedAt"],
        message: "Processing time must not be earlier than the latest observation",
      })
    }
  })
export type EnvironmentalSeries = z.infer<typeof environmentalSeriesSchema>

export function parseEnvironmentalSeries(input: unknown): EnvironmentalSeries {
  return environmentalSeriesSchema.parse(input)
}
