"use client"

import * as React from "react"
import { Box, Button, Stack, Typography } from "@mui/material"
import { LineChart } from "@mui/x-charts/LineChart"
import type {
  EnvironmentalParameter,
  EnvironmentalSeries,
} from "@/lib/domain/environment"
import { colors } from "@/lib/theme"

type ClimateParameter = Extract<
  EnvironmentalParameter,
  "air_temperature" | "precipitation" | "relative_humidity"
>

const PARAMETERS: Array<{
  parameter: ClimateParameter
  label: string
  color: string
}> = [
  { parameter: "air_temperature", label: "Temperature", color: colors.amber },
  { parameter: "precipitation", label: "Precipitation", color: colors.blue },
  { parameter: "relative_humidity", label: "Humidity", color: colors.green },
]

export default function ClimateHistory({ series }: { series: EnvironmentalSeries[] }) {
  const [parameter, setParameter] = React.useState<ClimateParameter>("air_temperature")
  const definition = PARAMETERS.find((candidate) => candidate.parameter === parameter)!
  const activeSeries = series.find((candidate) => candidate.parameter === parameter)

  if (!activeSeries) return null

  const validValues = activeSeries.values
    .map((observation) => observation.value)
    .filter((value): value is number => value !== null)
  const average =
    validValues.length > 0
      ? validValues.reduce((total, value) => total + value, 0) / validValues.length
      : null
  const minimum = validValues.length > 0 ? Math.min(...validValues) : null
  const maximum = validValues.length > 0 ? Math.max(...validValues) : null

  return (
    <Box
      aria-label="Observed climate history"
      sx={{ mt: 2.5, p: { xs: 1.5, md: 2 }, border: `1px solid ${colors.line}`, bgcolor: "#0D1012" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { md: "flex-start" } }}
      >
        <Box>
          <Typography component="h3" variant="h6">
            Observed climate history
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeSeries.values.length} monthly observations · {formatPeriod(activeSeries)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {PARAMETERS.map((candidate) => (
            <Button
              key={candidate.parameter}
              type="button"
              size="small"
              variant={candidate.parameter === parameter ? "contained" : "outlined"}
              aria-pressed={candidate.parameter === parameter}
              onClick={() => setParameter(candidate.parameter)}
            >
              {candidate.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ width: "100%", height: 300, mt: 1 }}>
        <LineChart
          height={300}
          margin={{ left: 12, right: 16, top: 16, bottom: 30 }}
          xAxis={[
            {
              scaleType: "utc",
              data: activeSeries.values.map((observation) => new Date(observation.observedAt)),
              tickNumber: 6,
              valueFormatter: (value: Date, context) =>
                formatHistoryDate(value, context.location === "tooltip"),
              tickLabelStyle: { fontSize: 11, fill: colors.slate },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: { fontSize: 11, fill: colors.slate },
              valueFormatter: (value: number) => formatAxisValue(value, activeSeries.unit),
              width: 48,
            },
          ]}
          series={[
            {
              data: activeSeries.values.map((observation) => observation.value),
              label: definition.label,
              color: definition.color,
              area: true,
              showMark: activeSeries.values.length <= 24,
              curve: "monotoneX",
              valueFormatter: (value) =>
                value === null ? "Unavailable" : formatClimateValue(value, activeSeries.unit),
            },
          ]}
          grid={{ horizontal: true }}
          slotProps={{ legend: { hidden: true } as never }}
          sx={{
            "& .MuiAreaElement-root": {
              fill: definition.color,
              fillOpacity: 0.12,
            },
            "& .MuiLineElement-root": { strokeWidth: 2.5 },
            "& .MuiMarkElement-root": {
              fill: "#090B0C",
              stroke: definition.color,
              strokeWidth: 2,
              r: 3,
            },
            "& .MuiChartsGrid-line": { stroke: colors.line },
            "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: colors.line },
          }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        {average === null || minimum === null || maximum === null
          ? "No valid observations are available for this period."
          : `Period average ${formatClimateValue(average, activeSeries.unit)} · Range ${formatClimateValue(minimum, activeSeries.unit)}–${formatClimateValue(maximum, activeSeries.unit)}`}
      </Typography>
    </Box>
  )
}

function formatHistoryDate(value: Date, includeMonth: boolean) {
  return new Intl.DateTimeFormat("en", {
    month: includeMonth ? "short" : undefined,
    year: "numeric",
    timeZone: "UTC",
  }).format(value)
}

function formatPeriod(series: EnvironmentalSeries) {
  const start = new Date(series.period.start).getUTCFullYear()
  const end = new Date(series.period.end).getUTCFullYear()
  return start === end ? String(start) : `${start}–${end}`
}

function formatAxisValue(value: number, unit: string) {
  return `${value.toFixed(unit === "%" ? 0 : 1)}${unit}`
}

function formatClimateValue(value: number, unit: string) {
  return `${value.toFixed(unit === "%" ? 1 : 2)}${unit}`
}
