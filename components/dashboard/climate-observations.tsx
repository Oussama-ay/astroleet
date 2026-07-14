"use client"

import * as React from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Link,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ThermostatIcon from "@mui/icons-material/Thermostat"
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined"
import WaterOutlinedIcon from "@mui/icons-material/WaterOutlined"
import type {
  EnvironmentalParameter,
  EnvironmentalSeries,
} from "@/lib/domain/environment"
import type { Region } from "@/lib/data"
import { colors } from "@/lib/theme"

interface PowerApiResponse {
  data: {
    series: EnvironmentalSeries[]
  }
  meta: {
    provider: string
    cacheTtlSeconds: number
  }
}

type ClimateParameter = Extract<
  EnvironmentalParameter,
  "air_temperature" | "precipitation" | "relative_humidity"
>

interface ClimateCardDefinition {
  parameter: ClimateParameter
  label: string
  icon: React.ReactNode
  accent: string
}

const CLIMATE_CARDS: ClimateCardDefinition[] = [
  {
    parameter: "air_temperature",
    label: "Air temperature",
    icon: <ThermostatIcon />,
    accent: colors.amber,
  },
  {
    parameter: "precipitation",
    label: "Corrected precipitation",
    icon: <WaterDropOutlinedIcon />,
    accent: colors.blue,
  },
  {
    parameter: "relative_humidity",
    label: "Relative humidity",
    icon: <WaterOutlinedIcon />,
    accent: colors.green,
  },
]

type LoadState =
  | { key: string; status: "success"; response: PowerApiResponse }
  | { key: string; status: "error"; message: string }

export default function ClimateObservations({ region }: { region: Region }) {
  const [attempt, setAttempt] = React.useState(0)
  const [loadState, setLoadState] = React.useState<LoadState | null>(null)
  const requestUrl = `/api/climate/power?latitude=${region.lat}&longitude=${region.lon}`
  const requestKey = `${region.name}:${attempt}`
  const currentState = loadState?.key === requestKey ? loadState : null

  React.useEffect(() => {
    const controller = new AbortController()

    fetch(requestUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Climate data is temporarily unavailable")
        }

        const payload = (await response.json()) as Partial<PowerApiResponse>
        if (!payload.data || !Array.isArray(payload.data.series) || !payload.meta) {
          throw new Error("Climate data returned an unexpected response")
        }

        return payload as PowerApiResponse
      })
      .then((response) => {
        setLoadState({ key: requestKey, status: "success", response })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : "Climate data could not be loaded"
        setLoadState({ key: requestKey, status: "error", message })
      })

    return () => controller.abort()
  }, [requestKey, requestUrl])

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, bgcolor: "#090B0C" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <CloudSyncOutlinedIcon sx={{ color: colors.blue }} />
            <Typography component="h2" variant="h5">
              Observed climate from NASA POWER
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Monthly climate observations for the {region.name} regional centroid.
          </Typography>
        </Box>
        <Chip
          label="Cached observed data"
          size="small"
          sx={{ bgcolor: colors.blueSoft, color: colors.blueDark, alignSelf: { xs: "flex-start" } }}
        />
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {!currentState && <ClimateLoading />}

      {currentState?.status === "error" && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => setAttempt((value) => value + 1)}>
              Retry
            </Button>
          }
          sx={{ bgcolor: "#211B12", color: "text.primary" }}
        >
          {currentState.message}. The demonstration indicators remain available below.
        </Alert>
      )}

      {currentState?.status === "success" && (
        <ClimateResults response={currentState.response} />
      )}
    </Card>
  )
}

function ClimateLoading() {
  return (
    <Grid container spacing={2} aria-label="Loading observed climate data">
      {CLIMATE_CARDS.map((card) => (
        <Grid key={card.parameter} size={{ xs: 12, sm: 4 }}>
          <Box sx={{ p: 2, border: `1px solid ${colors.line}`, minHeight: 142 }}>
            <Skeleton width="55%" />
            <Skeleton width="42%" height={54} />
            <Skeleton width="70%" />
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

function ClimateResults({ response }: { response: PowerApiResponse }) {
  const provenance = response.data.series[0]

  return (
    <>
      <Grid container spacing={2}>
        {CLIMATE_CARDS.map((card) => {
          const series = response.data.series.find(
            (candidate) => candidate.parameter === card.parameter,
          )
          const latest = series?.values.findLast((entry) => entry.value !== null)

          return (
            <Grid key={card.parameter} size={{ xs: 12, sm: 4 }}>
              <Box
                aria-label={`${card.label} observed value`}
                sx={{
                  position: "relative",
                  height: "100%",
                  minHeight: 142,
                  p: 2,
                  border: `1px solid ${colors.line}`,
                  bgcolor: "#0D1012",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 3,
                    bgcolor: card.accent,
                  },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: card.accent }}>
                  {card.icon}
                  <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    {card.label}
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ mt: 1.5, fontFamily: "var(--font-mono)" }}>
                  {latest && series ? formatClimateValue(latest.value, series.unit) : "Unavailable"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {latest ? `${formatObservationMonth(latest.observedAt)} monthly average` : "No valid observation"}
                </Typography>
              </Box>
            </Grid>
          )
        })}
      </Grid>

      {provenance && (
        <>
          <Divider sx={{ my: 2.5 }} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, md: 4 }}
            sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Provenance
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {provenance.source.provider} · {provenance.source.version}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {formatPeriod(provenance)} · {provenance.resolution.spatial} · {provenance.resolution.temporal}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Retrieved and normalized {formatProcessedAt(provenance.processedAt)}
              </Typography>
            </Box>
            <Link
              href={provenance.source.documentation}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13 }}
            >
              NASA POWER documentation <OpenInNewIcon sx={{ fontSize: 14 }} />
            </Link>
          </Stack>
        </>
      )}
    </>
  )
}

function formatClimateValue(value: number | null, unit: string) {
  if (value === null) return "Unavailable"
  return `${value.toFixed(unit === "%" ? 1 : 2)}${unit}`
}

function formatObservationMonth(timestamp: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp))
}

function formatPeriod(series: EnvironmentalSeries) {
  const start = new Date(series.period.start).getUTCFullYear()
  const end = new Date(series.period.end).getUTCFullYear()
  return start === end ? String(start) : `${start}–${end}`
}

function formatProcessedAt(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp))
}
