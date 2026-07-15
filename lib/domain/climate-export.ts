import type { EnvironmentalSeries, GeographicCoverage } from "./environment"

export const CLIMATE_EXPORT_FORMAT = "astroleet.environmental-series" as const
export const CLIMATE_EXPORT_VERSION = "1.0" as const

export type ClimateExportExtension = "csv" | "json"

export interface ClimateJsonExport {
  format: typeof CLIMATE_EXPORT_FORMAT
  version: typeof CLIMATE_EXPORT_VERSION
  exportedAt: string
  series: EnvironmentalSeries[]
}

const CSV_COLUMNS = [
  "schema_version",
  "parameter",
  "unit",
  "coverage_type",
  "coverage_label",
  "latitude",
  "longitude",
  "radius_km",
  "sample_count",
  "period_start",
  "period_end",
  "aggregation",
  "observed_at",
  "value",
  "quality_status",
  "quality_flags",
  "quality_notes",
  "source_provider",
  "source_product",
  "source_version",
  "source_documentation",
  "spatial_resolution",
  "temporal_resolution",
  "processed_at",
  "data_status",
] as const

export function createClimateJsonExport(
  series: EnvironmentalSeries[],
  now = new Date(),
): string {
  const payload: ClimateJsonExport = {
    format: CLIMATE_EXPORT_FORMAT,
    version: CLIMATE_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    series,
  }

  return `${JSON.stringify(payload, null, 2)}\n`
}

export function createClimateCsvExport(series: EnvironmentalSeries[]): string {
  const rows = series.flatMap((item) => {
    const coverage = getCoverageFields(item.coverage)

    return item.values.map((observation) => [
      item.schemaVersion,
      item.parameter,
      item.unit,
      item.coverage.type,
      coverage.label,
      coverage.latitude,
      coverage.longitude,
      coverage.radiusKm,
      coverage.sampleCount,
      item.period.start,
      item.period.end,
      item.period.aggregation,
      observation.observedAt,
      observation.value,
      observation.quality.status,
      observation.quality.flags.join("|"),
      observation.quality.notes.join("|"),
      item.source.provider,
      item.source.product,
      item.source.version ?? "",
      item.source.documentation,
      item.resolution.spatial,
      item.resolution.temporal,
      item.processedAt,
      item.status,
    ])
  })

  return `\uFEFF${[
    CSV_COLUMNS.join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n")}\r\n`
}

export function climateExportFilename(
  series: EnvironmentalSeries[],
  extension: ClimateExportExtension,
): string {
  const reference = series[0]
  if (!reference) return `astroleet-climate.${extension}`

  const start = new Date(reference.period.start).getUTCFullYear()
  const end = new Date(reference.period.end).getUTCFullYear()
  const period = start === end ? String(start) : `${start}-${end}`
  return `astroleet-climate-${reference.coverage.type}-${period}.${extension}`
}

function getCoverageFields(coverage: GeographicCoverage) {
  if (coverage.type === "region") {
    return {
      label: coverage.name,
      latitude: coverage.centroid.latitude,
      longitude: coverage.centroid.longitude,
      radiusKm: null,
      sampleCount: null,
    }
  }

  if (coverage.type === "radius") {
    return {
      label: coverage.label ?? "",
      latitude: coverage.center.latitude,
      longitude: coverage.center.longitude,
      radiusKm: coverage.radiusKm,
      sampleCount: coverage.sampleCount,
    }
  }

  return {
    label: coverage.label ?? "",
    latitude: coverage.latitude,
    longitude: coverage.longitude,
    radiusKm: null,
    sampleCount: null,
  }
}

function csvCell(value: string | number | null) {
  if (value === null) return ""
  if (typeof value === "number") return String(value)

  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}
