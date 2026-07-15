import { z } from "zod"
import { REGIONS, type MetricKey } from "../data"
import type { ClimateHistoryYears } from "./climate-history"
import { regionForMoroccoPoint } from "./morocco-geography"

export type DashboardClimateLocation =
  | {
      mode: "region" | "point"
      label: string
      latitude: number
      longitude: number
    }
  | {
      mode: "radius"
      label: string
      latitude: number
      longitude: number
      radiusKm: 50 | 100 | 200
    }

export interface DashboardShareState {
  regionName: string
  metric: MetricKey
  historyYears: ClimateHistoryYears
  location: DashboardClimateLocation
}

export type DashboardSearchParams = Record<string, string | string[] | undefined>

const decimalSchema = z
  .string()
  .trim()
  .regex(/^-?(?:\d+(?:\.\d+)?|\.\d+)$/)
  .transform(Number)

const baseShareSchema = z.object({
  view: z.literal("1"),
  region: z.string().min(1),
  metric: z.enum(["ndvi", "moisture", "lst"]),
  history: z
    .enum(["1", "3", "5", "10"])
    .transform(Number)
    .pipe(z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)])),
  mode: z.enum(["region", "point", "radius"]),
})

const coordinateSchema = z.object({
  latitude: decimalSchema.pipe(z.number().finite().min(-90).max(90)),
  longitude: decimalSchema.pipe(z.number().finite().min(-180).max(180)),
})

const radiusSchema = z
  .enum(["50", "100", "200"])
  .transform(Number)
  .pipe(z.union([z.literal(50), z.literal(100), z.literal(200)]))

export function parseDashboardShareSearchParams(
  searchParams: DashboardSearchParams,
): DashboardShareState | null {
  const base = baseShareSchema.safeParse({
    view: scalar(searchParams.view),
    region: scalar(searchParams.region),
    metric: scalar(searchParams.metric),
    history: scalar(searchParams.history),
    mode: scalar(searchParams.mode),
  })
  if (!base.success) return null

  const region = REGIONS.find((candidate) => candidate.name === base.data.region)
  if (!region) return null

  if (base.data.mode === "region") {
    return {
      regionName: region.name,
      metric: base.data.metric,
      historyYears: base.data.history,
      location: {
        mode: "region",
        label: `the ${region.name} regional centroid`,
        latitude: region.lat,
        longitude: region.lon,
      },
    }
  }

  const coordinates = coordinateSchema.safeParse({
    latitude: scalar(searchParams.latitude),
    longitude: scalar(searchParams.longitude),
  })
  if (!coordinates.success) return null

  const { latitude, longitude } = coordinates.data
  const coordinateRegion = regionForMoroccoPoint(latitude, longitude)
  if (!coordinateRegion) return null

  if (base.data.mode === "point") {
    return {
      regionName: coordinateRegion,
      metric: base.data.metric,
      historyYears: base.data.history,
      location: {
        mode: "point",
        label: `Exact point ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
      },
    }
  }

  const radius = radiusSchema.safeParse(scalar(searchParams.radius))
  if (!radius.success) return null

  return {
    regionName: coordinateRegion,
    metric: base.data.metric,
    historyYears: base.data.history,
    location: {
      mode: "radius",
      label: `a ${radius.data} km radius around ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
      radiusKm: radius.data,
    },
  }
}

export function serializeDashboardShareState(state: DashboardShareState): URLSearchParams {
  const searchParams = new URLSearchParams({
    view: "1",
    region: state.regionName,
    metric: state.metric,
    history: String(state.historyYears),
    mode: state.location.mode,
  })

  if (state.location.mode !== "region") {
    searchParams.set("latitude", formatCoordinate(state.location.latitude))
    searchParams.set("longitude", formatCoordinate(state.location.longitude))
  }

  if (state.location.mode === "radius") {
    searchParams.set("radius", String(state.location.radiusKm))
  }

  return searchParams
}

export function buildDashboardShareUrl(origin: string, state: DashboardShareState): string {
  const url = new URL("/dashboard", origin)
  url.search = serializeDashboardShareState(state).toString()
  return url.toString()
}

function scalar(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

function formatCoordinate(value: number) {
  return String(Math.round(value * 1_000_000) / 1_000_000)
}
