import { z } from "zod"

export const POWER_FIRST_YEAR = 1981
export const POWER_MAX_YEAR_SPAN = 10

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
