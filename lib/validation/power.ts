import { z } from "zod"

export const POWER_FIRST_YEAR = 1981
export const POWER_MAX_YEAR_SPAN = 10
export const POWER_RADIUS_OPTIONS = [50, 100, 200] as const
export type PowerRadiusKm = (typeof POWER_RADIUS_OPTIONS)[number]

const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^-?(?:\d+(?:\.\d+)?|\.\d+)$/, "Must be a decimal number")
  .transform(Number)

const yearStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Must be a four-digit year")
  .transform(Number)

function powerClimateQuerySchema(latestCompleteYear: number) {
  return z
    .strictObject({
      latitude: decimalStringSchema.pipe(z.number().finite().min(-90).max(90)),
      longitude: decimalStringSchema.pipe(z.number().finite().min(-180).max(180)),
      start: yearStringSchema.pipe(
        z.number().int().min(POWER_FIRST_YEAR).max(latestCompleteYear),
      ),
      end: yearStringSchema.pipe(
        z.number().int().min(POWER_FIRST_YEAR).max(latestCompleteYear),
      ),
    })
    .superRefine((query, context) => {
      if (query.start > query.end) {
        context.addIssue({
          code: "custom",
          path: ["end"],
          message: "End year must not be earlier than start year",
        })
      }

      if (query.end - query.start + 1 > POWER_MAX_YEAR_SPAN) {
        context.addIssue({
          code: "custom",
          path: ["end"],
          message: `Date range cannot exceed ${POWER_MAX_YEAR_SPAN} years`,
        })
      }
    })
}

export interface PowerClimateQuery {
  latitude: number
  longitude: number
  start: number
  end: number
}

export interface PowerRadiusQuery extends PowerClimateQuery {
  radiusKm: PowerRadiusKm
}

export function parsePowerClimateSearchParams(
  searchParams: URLSearchParams,
  now = new Date(),
): PowerClimateQuery {
  const latestCompleteYear = now.getUTCFullYear() - 1
  const defaultYear = String(latestCompleteYear)

  return powerClimateQuerySchema(latestCompleteYear).parse({
    latitude: searchParams.get("latitude"),
    longitude: searchParams.get("longitude"),
    start: searchParams.get("start") ?? defaultYear,
    end: searchParams.get("end") ?? defaultYear,
  })
}

export function parsePowerRadiusSearchParams(
  searchParams: URLSearchParams,
  now = new Date(),
): PowerRadiusQuery {
  const query = parsePowerClimateSearchParams(searchParams, now)
  const radiusKm = z
    .enum(POWER_RADIUS_OPTIONS.map(String) as [string, ...string[]])
    .transform(Number)
    .pipe(z.union([z.literal(50), z.literal(100), z.literal(200)]))
    .parse(searchParams.get("radiusKm"))

  return { ...query, radiusKm }
}
