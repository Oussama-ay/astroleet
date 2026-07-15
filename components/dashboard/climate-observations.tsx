"use client"

import * as React from "react"
import {
  Alert,
  Box,
  Button,
  Grid,
  Link,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ThermostatIcon from "@mui/icons-material/Thermostat"
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined"
import WaterOutlinedIcon from "@mui/icons-material/WaterOutlined"
import type {
  EnvironmentalParameter,
  EnvironmentalSeries,
} from "@/lib/domain/environment"
import {
  CLIMATE_HISTORY_YEAR_OPTIONS,
  getCompletedClimateHistoryPeriod,
  type ClimateHistoryYears,
} from "@/lib/domain/climate-history"
import type {
  DashboardClimateLocation,
  DashboardShareState,
} from "@/lib/domain/dashboard-share"
import {
  isPointInsideMorocco,
  MOROCCO_GEOGRAPHIC_BOUNDS,
} from "@/lib/domain/morocco-geography"
import { colors } from "@/lib/theme"
import { assessObservedClimate } from "@/lib/domain/observed-climate-recommendations"
import ClimateHistory from "./climate-history"
import DashboardShareActions from "./dashboard-share-actions"
import ClimateExportActions from "./climate-export-actions"
import ObservedClimateRecommendations from "./observed-climate-recommendations"
import AIClimateExplanation from "./ai-climate-explanation"
import DataStatusBadge from "@/components/data-status-badge"

interface PowerApiResponse {
  data: {
    series: EnvironmentalSeries[]
  }
  meta: {
    provider: string
    cacheTtlSeconds: number
    method?: string
    sampleCount?: number
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

export type ClimateLocation = DashboardClimateLocation

interface ClimateObservationsProps {
  location: ClimateLocation
  onLocationChange: (location: ClimateLocation | null) => void
  historyYears: ClimateHistoryYears
  onHistoryYearsChange: (years: ClimateHistoryYears) => void
  shareState: DashboardShareState
}

export default function ClimateObservations({
  location,
  onLocationChange,
  historyYears,
  onHistoryYearsChange,
  shareState,
}: ClimateObservationsProps) {
  const [attempt, setAttempt] = React.useState(0)
  const [loadState, setLoadState] = React.useState<LoadState | null>(null)
  const [draftLatitude, setDraftLatitude] = React.useState(String(location.latitude))
  const [draftLongitude, setDraftLongitude] = React.useState(String(location.longitude))
  const [draftRadius, setDraftRadius] = React.useState<50 | 100 | 200>(
    location.mode === "radius" ? location.radiusKm : 100,
  )
  const pointValidation = validatePoint(draftLatitude, draftLongitude)
  const historyPeriod = getCompletedClimateHistoryPeriod(historyYears)
  const historyQuery = `start=${historyPeriod.start}&end=${historyPeriod.end}`
  const requestUrl =
    location.mode === "radius"
      ? `/api/climate/power/radius?latitude=${location.latitude}&longitude=${location.longitude}&radiusKm=${location.radiusKm}&${historyQuery}`
      : `/api/climate/power?latitude=${location.latitude}&longitude=${location.longitude}&${historyQuery}`
  const requestKey = `${location.mode}:${location.latitude}:${location.longitude}:${location.mode === "radius" ? location.radiusKm : "point"}:${historyYears}:${attempt}`
  const currentState = loadState?.key === requestKey ? loadState : null

  function applyPoint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pointValidation.valid) return

    onLocationChange({
      mode: "point",
      label: `Exact point ${pointValidation.latitude.toFixed(4)}, ${pointValidation.longitude.toFixed(4)}`,
      latitude: pointValidation.latitude,
      longitude: pointValidation.longitude,
    })
  }

  function applyRadius() {
    if (!pointValidation.valid) return

    onLocationChange({
      mode: "radius",
      label: `a ${draftRadius} km radius around ${pointValidation.latitude.toFixed(4)}, ${pointValidation.longitude.toFixed(4)}`,
      latitude: pointValidation.latitude,
      longitude: pointValidation.longitude,
      radiusKm: draftRadius,
    })
  }

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
    <Box
      component="section"
      aria-labelledby="observed-climate-title"
      sx={{ border: `1px solid ${colors.line}`, bgcolor: "rgba(7,9,10,0.96)" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.25,
          justifyContent: "space-between",
          alignItems: { sm: "flex-end" },
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="overline" sx={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
              03
            </Typography>
            <Box sx={{ width: 28, height: "1px", bgcolor: colors.line }} />
            <Typography variant="overline" color="text.secondary">
              Observed evidence
            </Typography>
            <DataStatusBadge status="observed" />
          </Stack>
          <Typography id="observed-climate-title" component="h2" variant="h4" sx={{ mt: 0.75 }}>
            Climate record
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monthly climate observations for {location.label}.
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={{ xs: 2, md: 3 }}
          sx={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <ObservationMeta
            label="Geometry"
            value={
              location.mode === "region"
                ? "Regional centroid"
                : location.mode === "radius"
                  ? `${location.radiusKm} km radius`
                  : "Exact point"
            }
          />
          <ObservationMeta
            label="Status"
            value={location.mode === "radius" ? "Derived radius mean" : "Cached observed data"}
          />
          <ObservationMeta
            label="Window"
            value={`${historyYears}-year history`}
          />
          <DashboardShareActions state={shareState} />
        </Stack>
      </Stack>

      <Grid container sx={{ borderBottom: `1px solid ${colors.line}` }}>
        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{
            borderRight: { lg: `1px solid ${colors.line}` },
            borderBottom: { xs: `1px solid ${colors.line}`, lg: 0 },
            bgcolor: "rgba(255,255,255,0.018)",
          }}
        >
          <Box
            component="form"
            onSubmit={applyPoint}
            sx={{ p: { xs: 2, md: 3 }, height: "100%" }}
          >
            <Typography variant="overline" sx={{ color: colors.white }}>
              Inputs / analysis geometry
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
              Define a point, radius and comparison window.
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, lg: 12, xl: 6 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={draftLatitude}
                  onChange={(event) => setDraftLatitude(event.target.value)}
                  size="small"
                  type="number"
                  error={!pointValidation.valid && pointValidation.field === "latitude"}
                  slotProps={{
                    htmlInput: {
                      step: "any",
                      min: MOROCCO_GEOGRAPHIC_BOUNDS.south,
                      max: MOROCCO_GEOGRAPHIC_BOUNDS.north,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 12, xl: 6 }}>
                <TextField
                  fullWidth
                  label="Longitude"
                  value={draftLongitude}
                  onChange={(event) => setDraftLongitude(event.target.value)}
                  size="small"
                  type="number"
                  error={!pointValidation.valid && pointValidation.field === "longitude"}
                  slotProps={{
                    htmlInput: {
                      step: "any",
                      min: MOROCCO_GEOGRAPHIC_BOUNDS.west,
                      max: MOROCCO_GEOGRAPHIC_BOUNDS.east,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ display: "block", mt: 2.5, mb: 0.75, color: "text.secondary" }}>
              Radius
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={draftRadius}
              aria-label="Radius"
              onChange={(_, value) => value && setDraftRadius(value as 50 | 100 | 200)}
              sx={segmentedControlStyles}
            >
              {[50, 100, 200].map((radius) => (
                <ToggleButton key={radius} value={radius} aria-label={`${radius} km radius`}>
                  {radius} km
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant="overline" sx={{ display: "block", mt: 2, mb: 0.75, color: "text.secondary" }}>
              History
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={historyYears}
              aria-label="History"
              onChange={(_, value) =>
                value && onHistoryYearsChange(value as ClimateHistoryYears)
              }
              sx={segmentedControlStyles}
            >
              {CLIMATE_HISTORY_YEAR_OPTIONS.map((years) => (
                <ToggleButton key={years} value={years} aria-label={`${years} ${years === 1 ? "year" : "years"} history`}>
                  {years}y
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Stack spacing={1} sx={{ mt: 2.5 }}>
              <Button type="submit" fullWidth variant="contained" disabled={!pointValidation.valid}>
                Apply point
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outlined"
                aria-label="Analyze radius"
                disabled={!pointValidation.valid}
                onClick={applyRadius}
              >
                Analyze {draftRadius} km radius
              </Button>
              {location.mode !== "region" && (
                <Button type="button" fullWidth variant="text" onClick={() => onLocationChange(null)}>
                  Use regional centroid
                </Button>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, lineHeight: 1.5 }}>
              {pointValidation.valid
                ? "Radius analysis averages the center and four boundary samples. It is an estimate, not a complete area scan."
                : pointValidation.message}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="overline" sx={{ color: colors.white }}>
                  Outputs / latest month
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  NASA POWER normalized monthly observations
                </Typography>
              </Box>
              <DataStatusBadge status="observed" />
            </Stack>
          </Box>

          {!currentState && (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <ClimateLoading />
            </Box>
          )}

          {currentState?.status === "error" && (
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={() => setAttempt((value) => value + 1)}>
                  Retry
                </Button>
              }
              sx={{ m: { xs: 2, md: 3 }, bgcolor: "#211B12", color: "text.primary" }}
            >
              {currentState.message}. The demonstration indicators remain available below.
            </Alert>
          )}

          {currentState?.status === "success" && (
            <ClimateMetricCards response={currentState.response} />
          )}
        </Grid>
      </Grid>

      {currentState?.status === "success" && (
        <ClimateResultDetails response={currentState.response} />
      )}
    </Box>
  )
}

type PointValidation =
  | { valid: true; latitude: number; longitude: number }
  | { valid: false; field: "latitude" | "longitude"; message: string }

function validatePoint(latitudeInput: string, longitudeInput: string): PointValidation {
  const latitude = Number(latitudeInput)
  const longitude = Number(longitudeInput)

  if (latitudeInput.trim() === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return {
      valid: false,
      field: "latitude",
      message: "Latitude must be a number between −90 and 90.",
    }
  }

  if (
    longitudeInput.trim() === "" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      field: "longitude",
      message: "Longitude must be a number between −180 and 180.",
    }
  }

  if (!isPointInsideMorocco(latitude, longitude)) {
    return {
      valid: false,
      field: "latitude",
      message: "Select a point inside Morocco's mapped regions.",
    }
  }

  return { valid: true, latitude, longitude }
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

function ClimateMetricCards({ response }: { response: PowerApiResponse }) {
  return (
    <Grid container spacing={0} sx={{ mt: 1.5 }}>
      {CLIMATE_CARDS.map((card) => {
        const series = response.data.series.find(
          (candidate) => candidate.parameter === card.parameter,
        )
        const latest = series?.values.findLast((entry) => entry.value !== null)

        return (
          <Grid
            key={card.parameter}
            size={{ xs: 12, sm: 4 }}
            sx={{
              borderRight: { sm: `1px solid ${colors.line}` },
              borderTop: `1px solid ${colors.line}`,
              "&:last-of-type": { borderRight: 0 },
            }}
          >
            <Box
              aria-label={`${card.label} observed value`}
              sx={{
                position: "relative",
                height: "100%",
                minHeight: 164,
                px: { xs: 2, md: 2.5 },
                py: 2.25,
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "auto 24px 0 24px",
                  height: 2,
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
              <Typography variant="h4" sx={{ mt: 1.25, fontFamily: "var(--font-mono)" }}>
                {latest && series ? formatClimateValue(latest.value, series.unit) : "Unavailable"}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="caption" color="text.secondary">
                  {latest ? `${formatObservationMonth(latest.observedAt)} monthly average` : "No valid observation"}
                </Typography>
                <DataStatusBadge status="observed" />
              </Stack>
            </Box>
          </Grid>
        )
      })}
    </Grid>
  )
}

function ClimateResultDetails({ response }: { response: PowerApiResponse }) {
  const provenance = response.data.series[0]
  const assessment = assessObservedClimate(response.data.series)

  return (
    <>
      <Grid container>
        <Grid
          size={{ xs: 12, lg: 7 }}
          sx={{
            borderRight: { lg: `1px solid ${colors.line}` },
            borderBottom: { xs: `1px solid ${colors.line}`, lg: 0 },
          }}
        >
          <ClimateHistory series={response.data.series} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ObservedClimateRecommendations series={response.data.series} />
        </Grid>
      </Grid>

      {assessment.status !== "insufficient" && (
        <AIClimateExplanation
          key={`${assessment.observedAt}:${assessment.baselineStartYear}:${assessment.baselineEndYear}`}
          series={response.data.series}
        />
      )}

      {provenance && (
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2.25,
            borderTop: `1px solid ${colors.line}`,
            bgcolor: "rgba(255,255,255,0.018)",
          }}
        >
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
              {provenance.coverage.type === "radius" && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Derived mean of {provenance.coverage.sampleCount} samples across a {provenance.coverage.radiusKm} km radius
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Retrieved and normalized {formatProcessedAt(provenance.processedAt)}
              </Typography>
            </Box>
            <Stack spacing={1} sx={{ alignItems: { md: "flex-end" } }}>
              <ClimateExportActions series={response.data.series} />
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
          </Stack>
        </Box>
      )}
    </>
  )
}

function ObservationMeta({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="overline" sx={{ display: "block", color: "text.secondary", lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.white, fontFamily: "var(--font-mono)" }}>
        {value}
      </Typography>
    </Box>
  )
}

const segmentedControlStyles = {
  border: `1px solid ${colors.line}`,
  "& .MuiToggleButton-root": {
    border: 0,
    color: "text.secondary",
    "&.Mui-selected": {
      color: colors.white,
      bgcolor: "rgba(85,167,232,0.18)",
      boxShadow: `inset 0 -2px 0 ${colors.blue}`,
    },
    "&.Mui-selected:hover": { bgcolor: "rgba(85,167,232,0.24)" },
  },
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
