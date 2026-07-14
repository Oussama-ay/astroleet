import type {
  EnvironmentalParameter,
  EnvironmentalSeries,
} from "./environment"

type ClimateParameter = Extract<
  EnvironmentalParameter,
  "air_temperature" | "precipitation" | "relative_humidity"
>

export type ObservedSignalSeverity = "warning" | "watch" | "info"

export interface ObservedClimateSignal {
  id: string
  severity: ObservedSignalSeverity
  title: string
  summary: string
  evidence: string[]
  actions: string[]
}

interface ClimateComparison {
  parameter: ClimateParameter
  unit: string
  current: number
  baseline: number
  delta: number
  priorObservations: number
}

export type ObservedClimateAssessment =
  | {
      status: "insufficient"
      reason: string
      requiredPriorObservations: number
      limitations: string[]
    }
  | {
      status: "ready"
      observedAt: string
      baselineStartYear: number
      baselineEndYear: number
      comparisons: Record<ClimateParameter, ClimateComparison>
      signals: ObservedClimateSignal[]
      limitations: string[]
    }

export const OBSERVED_CLIMATE_THRESHOLDS = {
  minimumPriorSameMonthObservations: 3,
  warmTemperatureDeltaC: 2,
  dryPrecipitationRatio: 0.6,
  dryPrecipitationDeltaMmPerDay: -0.5,
  wetPrecipitationRatio: 1.5,
  wetPrecipitationDeltaMmPerDay: 1,
  humidityDeltaPercentagePoints: 10,
} as const

const REQUIRED_PARAMETERS: ClimateParameter[] = [
  "air_temperature",
  "precipitation",
  "relative_humidity",
]

const LIMITATIONS = [
  "This is deterministic anomaly screening, not a weather forecast or an agronomic prescription.",
  "Monthly averages can hide daily extremes and short-lived events.",
  "Thresholds are transparent Astroleet screening rules, not universal risk standards.",
  "NASA POWER meteorology is gridded data; verify signals with local stations and field observations.",
]

export function assessObservedClimate(
  series: EnvironmentalSeries[],
): ObservedClimateAssessment {
  const requiredSeries = new Map<ClimateParameter, EnvironmentalSeries>()

  for (const parameter of REQUIRED_PARAMETERS) {
    const match = series.find((candidate) => candidate.parameter === parameter)
    if (!match) {
      return insufficient(`The ${parameterLabel(parameter)} series is unavailable.`)
    }
    requiredSeries.set(parameter, match)
  }

  const latestCommonTimestamp = findLatestCommonTimestamp(requiredSeries)
  if (!latestCommonTimestamp) {
    return insufficient("No month has valid temperature, precipitation, and humidity observations.")
  }

  const observedDate = new Date(latestCommonTimestamp)
  const observedMonth = observedDate.getUTCMonth()
  const comparisons = {} as Record<ClimateParameter, ClimateComparison>
  const baselineYears: number[] = []

  for (const parameter of REQUIRED_PARAMETERS) {
    const parameterSeries = requiredSeries.get(parameter)!
    const currentObservation = parameterSeries.values.find(
      (observation) => observation.observedAt === latestCommonTimestamp,
    )
    const priorValues = parameterSeries.values
      .filter((observation) => {
        if (observation.value === null || observation.observedAt >= latestCommonTimestamp) {
          return false
        }
        return new Date(observation.observedAt).getUTCMonth() === observedMonth
      })
      .map((observation) => ({
        value: observation.value!,
        year: new Date(observation.observedAt).getUTCFullYear(),
      }))

    if (
      currentObservation?.value === null ||
      currentObservation?.value === undefined ||
      priorValues.length < OBSERVED_CLIMATE_THRESHOLDS.minimumPriorSameMonthObservations
    ) {
      return insufficient(
        `At least ${OBSERVED_CLIMATE_THRESHOLDS.minimumPriorSameMonthObservations} prior ${formatMonth(latestCommonTimestamp)} observations are required for every climate metric.`,
      )
    }

    const baseline = median(priorValues.map((entry) => entry.value))
    comparisons[parameter] = {
      parameter,
      unit: parameterSeries.unit,
      current: currentObservation.value,
      baseline,
      delta: currentObservation.value - baseline,
      priorObservations: priorValues.length,
    }
    baselineYears.push(...priorValues.map((entry) => entry.year))
  }

  return {
    status: "ready",
    observedAt: latestCommonTimestamp,
    baselineStartYear: Math.min(...baselineYears),
    baselineEndYear: Math.max(...baselineYears),
    comparisons,
    signals: buildSignals(comparisons),
    limitations: LIMITATIONS,
  }
}

function buildSignals(
  comparisons: Record<ClimateParameter, ClimateComparison>,
): ObservedClimateSignal[] {
  const temperature = comparisons.air_temperature
  const precipitation = comparisons.precipitation
  const humidity = comparisons.relative_humidity
  const precipitationRatio =
    precipitation.baseline > 0 ? precipitation.current / precipitation.baseline : null
  const warm = temperature.delta >= OBSERVED_CLIMATE_THRESHOLDS.warmTemperatureDeltaC
  const dry =
    precipitationRatio !== null &&
    precipitationRatio <= OBSERVED_CLIMATE_THRESHOLDS.dryPrecipitationRatio &&
    precipitation.delta <= OBSERVED_CLIMATE_THRESHOLDS.dryPrecipitationDeltaMmPerDay
  const wet =
    precipitationRatio !== null &&
    precipitationRatio >= OBSERVED_CLIMATE_THRESHOLDS.wetPrecipitationRatio &&
    precipitation.delta >= OBSERVED_CLIMATE_THRESHOLDS.wetPrecipitationDeltaMmPerDay
  const lowHumidity =
    humidity.delta <= -OBSERVED_CLIMATE_THRESHOLDS.humidityDeltaPercentagePoints
  const highHumidity =
    humidity.delta >= OBSERVED_CLIMATE_THRESHOLDS.humidityDeltaPercentagePoints
  const signals: ObservedClimateSignal[] = []

  if (warm && dry) {
    signals.push({
      id: "compound-warm-dry",
      severity: "warning",
      title: "Compound warm and dry signal",
      summary:
        "Temperature is elevated while precipitation is substantially below its seasonal baseline.",
      evidence: [temperatureEvidence(temperature), precipitationEvidence(precipitation)],
      actions: [
        "Check local soil moisture and crop stress before changing irrigation.",
        "Prioritize field verification in exposed or water-limited areas.",
      ],
    })
  }

  if (warm) {
    signals.push({
      id: "warmer-than-baseline",
      severity: "watch",
      title: "Warmer than seasonal baseline",
      summary: "The latest monthly temperature exceeds the configured screening threshold.",
      evidence: [temperatureEvidence(temperature)],
      actions: ["Review local heat observations and inspect heat-sensitive areas."],
    })
  }

  if (dry) {
    signals.push({
      id: "drier-than-baseline",
      severity: "watch",
      title: "Drier than seasonal baseline",
      summary: "The latest monthly precipitation is substantially below its seasonal baseline.",
      evidence: [precipitationEvidence(precipitation)],
      actions: ["Compare the signal with rain gauges and current soil-moisture conditions."],
    })
  }

  if (wet) {
    signals.push({
      id: "wetter-than-baseline",
      severity: "watch",
      title: "Wetter than seasonal baseline",
      summary: "The latest monthly precipitation is substantially above its seasonal baseline.",
      evidence: [precipitationEvidence(precipitation)],
      actions: ["Inspect drainage-sensitive locations and verify totals with local rain gauges."],
    })
  }

  if (lowHumidity || highHumidity) {
    signals.push({
      id: lowHumidity ? "lower-humidity" : "higher-humidity",
      severity: "watch",
      title: `${lowHumidity ? "Lower" : "Higher"} humidity than seasonal baseline`,
      summary: `The latest monthly relative humidity is ${lowHumidity ? "below" : "above"} the configured screening threshold.`,
      evidence: [humidityEvidence(humidity)],
      actions: ["Validate the signal with local humidity readings and field conditions."],
    })
  }

  if (signals.length === 0) {
    signals.push({
      id: "no-configured-anomaly",
      severity: "info",
      title: "No configured anomaly signal",
      summary: "The latest values remain inside Astroleet's current screening thresholds.",
      evidence: [
        temperatureEvidence(temperature),
        precipitationEvidence(precipitation),
        humidityEvidence(humidity),
      ],
      actions: ["Continue routine monitoring; absence of a signal does not mean absence of risk."],
    })
  }

  return signals.map((signal) => ({
    ...signal,
    actions: [
      ...signal.actions,
      "Confirm with local stations and field observations before operational decisions.",
    ],
  }))
}

function findLatestCommonTimestamp(
  series: Map<ClimateParameter, EnvironmentalSeries>,
): string | undefined {
  const validTimestamps = REQUIRED_PARAMETERS.map((parameter) =>
    new Set(
      series
        .get(parameter)!
        .values.filter((observation) => observation.value !== null)
        .map((observation) => observation.observedAt),
    ),
  )

  return [...validTimestamps[0]]
    .filter((timestamp) => validTimestamps.every((timestamps) => timestamps.has(timestamp)))
    .sort()
    .at(-1)
}

function insufficient(reason: string): ObservedClimateAssessment {
  return {
    status: "insufficient",
    reason,
    requiredPriorObservations:
      OBSERVED_CLIMATE_THRESHOLDS.minimumPriorSameMonthObservations,
    limitations: LIMITATIONS,
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function temperatureEvidence(comparison: ClimateComparison) {
  return `${formatNumber(comparison.current)}${comparison.unit} vs ${formatNumber(comparison.baseline)}${comparison.unit} baseline (${formatSigned(comparison.delta)}${comparison.unit}).`
}

function precipitationEvidence(comparison: ClimateComparison) {
  const percentage =
    comparison.baseline > 0
      ? `${formatSigned((comparison.current / comparison.baseline - 1) * 100)}%`
      : "not comparable as a percentage"
  return `${formatNumber(comparison.current)} ${comparison.unit} vs ${formatNumber(comparison.baseline)} ${comparison.unit} baseline (${percentage}).`
}

function humidityEvidence(comparison: ClimateComparison) {
  return `${formatNumber(comparison.current)}% vs ${formatNumber(comparison.baseline)}% baseline (${formatSigned(comparison.delta)} percentage points).`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value)
}

function formatSigned(value: number) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}`
}

function formatMonth(timestamp: string) {
  return new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(
    new Date(timestamp),
  )
}

function parameterLabel(parameter: ClimateParameter) {
  return parameter.replaceAll("_", " ")
}
