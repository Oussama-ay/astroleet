import { z } from "zod"
import {
  parseEnvironmentalSeries,
  type EnvironmentalParameter,
  type EnvironmentalSeries,
} from "../../domain/environment"
import type { PowerClimateQuery } from "../../validation/power"

export const NASA_POWER_CACHE_SECONDS = 86_400
export const NASA_POWER_TIMEOUT_MS = 30_000

const NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
const NASA_POWER_DOCUMENTATION =
  "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/"
const NASA_POWER_FILL_FALLBACK = -999

const powerParameterSchema = z.enum(["T2M", "PRECTOTCORR", "RH2M"])
type PowerParameter = z.infer<typeof powerParameterSchema>

const powerResponseSchema = z.object({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number().finite()).min(2),
  }),
  properties: z.object({
    parameter: z.object({
      T2M: z.record(z.string(), z.number().finite()),
      PRECTOTCORR: z.record(z.string(), z.number().finite()),
      RH2M: z.record(z.string(), z.number().finite()),
    }),
  }),
  header: z.object({
    api: z.object({
      version: z.string().min(1),
      name: z.string().min(1),
    }),
    fill_value: z.number().finite().optional(),
  }),
  parameters: z.object({
    T2M: z.object({ units: z.string().min(1), longname: z.string().min(1) }),
    PRECTOTCORR: z.object({ units: z.string().min(1), longname: z.string().min(1) }),
    RH2M: z.object({ units: z.string().min(1), longname: z.string().min(1) }),
  }),
})

const PARAMETER_MAP: Record<
  PowerParameter,
  { parameter: EnvironmentalParameter; normalizeUnit: (unit: string) => string }
> = {
  T2M: {
    parameter: "air_temperature",
    normalizeUnit: (unit) => (unit === "C" ? "°C" : unit),
  },
  PRECTOTCORR: {
    parameter: "precipitation",
    normalizeUnit: (unit) => unit,
  },
  RH2M: {
    parameter: "relative_humidity",
    normalizeUnit: (unit) => unit,
  },
}

export type NasaPowerErrorCode =
  | "timeout"
  | "rate_limited"
  | "upstream"
  | "invalid_response"

export class NasaPowerError extends Error {
  constructor(
    public readonly code: NasaPowerErrorCode,
    message: string,
    public readonly upstreamStatus?: number,
  ) {
    super(message)
    this.name = "NasaPowerError"
  }
}

interface FetchNasaPowerOptions {
  fetcher?: typeof fetch
  now?: () => Date
  timeoutMs?: number
}

export interface NasaPowerClimateResult {
  series: EnvironmentalSeries[]
}

export async function fetchNasaPowerClimate(
  query: PowerClimateQuery,
  options: FetchNasaPowerOptions = {},
): Promise<NasaPowerClimateResult> {
  const fetcher = options.fetcher ?? fetch
  const now = options.now ?? (() => new Date())
  const timeoutMs = options.timeoutMs ?? NASA_POWER_TIMEOUT_MS
  const url = buildNasaPowerUrl(query)

  let response: Response
  try {
    response = await fetcher(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Astroleet/1.0",
      },
      next: { revalidate: NASA_POWER_CACHE_SECONDS },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new NasaPowerError("timeout", "NASA POWER request timed out")
    }

    throw new NasaPowerError("upstream", "NASA POWER could not be reached")
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new NasaPowerError(
        "rate_limited",
        "NASA POWER temporarily rejected the request rate",
        response.status,
      )
    }

    throw new NasaPowerError(
      "upstream",
      "NASA POWER returned an unsuccessful response",
      response.status,
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new NasaPowerError("invalid_response", "NASA POWER returned invalid JSON")
  }

  const parsed = powerResponseSchema.safeParse(payload)
  if (!parsed.success) {
    throw new NasaPowerError(
      "invalid_response",
      "NASA POWER response did not match the expected schema",
    )
  }

  try {
    return {
      series: normalizeNasaPowerResponse(parsed.data, query, now()),
    }
  } catch (error) {
    if (error instanceof NasaPowerError) throw error

    throw new NasaPowerError(
      "invalid_response",
      "NASA POWER data could not be normalized safely",
    )
  }
}

function buildNasaPowerUrl(query: PowerClimateQuery): URL {
  const url = new URL(NASA_POWER_URL)
  url.search = new URLSearchParams({
    parameters: powerParameterSchema.options.join(","),
    community: "AG",
    longitude: String(query.longitude),
    latitude: String(query.latitude),
    format: "JSON",
    start: String(query.start),
    end: String(query.end),
  }).toString()
  return url
}

function normalizeNasaPowerResponse(
  response: z.infer<typeof powerResponseSchema>,
  query: PowerClimateQuery,
  processedAt: Date,
): EnvironmentalSeries[] {
  const [longitude, latitude] = response.geometry.coordinates
  const fillValue = response.header.fill_value ?? NASA_POWER_FILL_FALLBACK

  return powerParameterSchema.options.map((powerParameter) => {
    const mapping = PARAMETER_MAP[powerParameter]
    const metadata = response.parameters[powerParameter]
    const monthlyValues = Object.entries(response.properties.parameter[powerParameter])
      .filter(([key]) => /^\d{6}$/.test(key) && key.slice(4) !== "13")
      .sort(([left], [right]) => left.localeCompare(right))

    if (monthlyValues.length === 0) {
      throw new NasaPowerError(
        "invalid_response",
        `NASA POWER returned no monthly values for ${powerParameter}`,
      )
    }

    return parseEnvironmentalSeries({
      schemaVersion: "1.0",
      parameter: mapping.parameter,
      unit: mapping.normalizeUnit(metadata.units),
      coverage: {
        type: "point",
        label: `${query.latitude}, ${query.longitude}`,
        latitude,
        longitude,
      },
      period: {
        start: `${query.start}-01-01T00:00:00.000Z`,
        end: `${query.end}-12-31T23:59:59.999Z`,
        aggregation: "monthly",
      },
      source: {
        provider: "NASA POWER",
        product: `${metadata.longname} — ${response.header.api.name}`,
        version: response.header.api.version,
        documentation: NASA_POWER_DOCUMENTATION,
      },
      resolution: {
        spatial: "0.5° latitude × 0.625° longitude meteorological grid",
        temporal: "Monthly average",
      },
      processedAt: processedAt.toISOString(),
      status: "cached",
      values: monthlyValues.map(([key, rawValue]) => {
        const missing = rawValue === fillValue
        return {
          observedAt: `${key.slice(0, 4)}-${key.slice(4)}-01T00:00:00.000Z`,
          value: missing ? null : rawValue,
          quality: {
            status: missing ? "missing" : "valid",
            flags: missing ? ["provider-fill-value"] : [],
            notes: missing ? ["NASA POWER reported its missing-data sentinel"] : [],
          },
        }
      }),
    })
  })
}
