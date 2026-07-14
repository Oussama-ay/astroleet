import {
  parseEnvironmentalSeries,
  type EnvironmentalSeries,
} from "../../domain/environment"
import type { PowerClimateQuery, PowerRadiusQuery } from "../../validation/power"
import {
  fetchNasaPowerClimate,
  type NasaPowerClimateResult,
} from "./nasa-power"

const EARTH_RADIUS_KM = 6_371
export const NASA_POWER_RADIUS_SAMPLE_COUNT = 5

type PointClimateFetcher = (query: PowerClimateQuery) => Promise<NasaPowerClimateResult>

interface FetchNasaPowerRadiusOptions {
  pointFetcher?: PointClimateFetcher
}

export interface NasaPowerRadiusResult extends NasaPowerClimateResult {
  sampleCount: number
}

export async function fetchNasaPowerRadius(
  query: PowerRadiusQuery,
  options: FetchNasaPowerRadiusOptions = {},
): Promise<NasaPowerRadiusResult> {
  const pointFetcher = options.pointFetcher ?? fetchNasaPowerClimate
  const points = buildRadiusSamplePoints(query.latitude, query.longitude, query.radiusKm)
  const samples = await Promise.all(
    points.map((point) => pointFetcher({ ...point, start: query.start, end: query.end })),
  )

  return {
    series: aggregateRadiusSeries(samples, query),
    sampleCount: points.length,
  }
}

export function buildRadiusSamplePoints(
  latitude: number,
  longitude: number,
  radiusKm: number,
): Array<{ latitude: number; longitude: number }> {
  return [
    { latitude, longitude },
    ...[0, 90, 180, 270].map((bearing) =>
      destinationPoint(latitude, longitude, bearing, radiusKm),
    ),
  ]
}

function destinationPoint(
  latitude: number,
  longitude: number,
  bearingDegrees: number,
  distanceKm: number,
) {
  const latitudeRadians = degreesToRadians(latitude)
  const longitudeRadians = degreesToRadians(longitude)
  const bearingRadians = degreesToRadians(bearingDegrees)
  const angularDistance = distanceKm / EARTH_RADIUS_KM
  const destinationLatitude = Math.asin(
    Math.sin(latitudeRadians) * Math.cos(angularDistance) +
      Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearingRadians),
  )
  const destinationLongitude =
    longitudeRadians +
    Math.atan2(
      Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitudeRadians),
      Math.cos(angularDistance) - Math.sin(latitudeRadians) * Math.sin(destinationLatitude),
    )

  return {
    latitude: roundCoordinate(radiansToDegrees(destinationLatitude)),
    longitude: roundCoordinate(normalizeLongitude(radiansToDegrees(destinationLongitude))),
  }
}

function aggregateRadiusSeries(
  samples: NasaPowerClimateResult[],
  query: PowerRadiusQuery,
): EnvironmentalSeries[] {
  const firstSample = samples[0]
  if (!firstSample) return []

  return firstSample.series.map((reference) => {
    const matchingSeries = samples.map((sample) => findMatchingSeries(sample.series, reference))

    return parseEnvironmentalSeries({
      ...reference,
      coverage: {
        type: "radius",
        label: `${query.radiusKm} km radius around ${query.latitude}, ${query.longitude}`,
        center: { latitude: query.latitude, longitude: query.longitude },
        radiusKm: query.radiusKm,
        sampleCount: samples.length,
      },
      source: {
        ...reference.source,
        product: `Five-point radius mean — ${reference.source.product}`,
      },
      resolution: {
        ...reference.resolution,
        spatial: `${reference.resolution.spatial}; center plus four boundary samples`,
      },
      processedAt: latestProcessedAt(matchingSeries),
      status: "derived",
      values: reference.values.map((referenceValue) => {
        const values = matchingSeries
          .map((series) =>
            series.values.find((value) => value.observedAt === referenceValue.observedAt)?.value,
          )
          .filter((value): value is number => value !== null && value !== undefined)

        if (values.length === 0) {
          return {
            observedAt: referenceValue.observedAt,
            value: null,
            quality: {
              status: "missing",
              flags: ["radius-mean", "no-valid-samples"],
              notes: ["No sampled NASA POWER points contained a valid value for this month"],
            },
          }
        }

        return {
          observedAt: referenceValue.observedAt,
          value: roundValue(values.reduce((sum, value) => sum + value, 0) / values.length),
          quality: {
            status: "estimated",
            flags: [
              "radius-mean",
              values.length === samples.length ? "five-point-sample" : "partial-sample",
            ],
            notes: [
              `Arithmetic mean of ${values.length} valid center/boundary NASA POWER point samples`,
            ],
          },
        }
      }),
    })
  })
}

function findMatchingSeries(
  series: EnvironmentalSeries[],
  reference: EnvironmentalSeries,
): EnvironmentalSeries {
  const match = series.find(
    (candidate) => candidate.parameter === reference.parameter && candidate.unit === reference.unit,
  )
  if (!match) {
    throw new Error(`A radius sample omitted ${reference.parameter}`)
  }
  return match
}

function latestProcessedAt(series: EnvironmentalSeries[]) {
  return series.reduce(
    (latest, candidate) =>
      Date.parse(candidate.processedAt) > Date.parse(latest) ? candidate.processedAt : latest,
    series[0].processedAt,
  )
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 540) % 360) - 180
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000
}

function roundValue(value: number) {
  return Math.round(value * 10_000) / 10_000
}
