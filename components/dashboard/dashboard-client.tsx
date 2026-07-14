"use client"

import * as React from "react"
import { Box, Container, Typography, Grid, Stack } from "@mui/material"
import BackgroundVideo from "@/components/background-video"
import PageShell from "@/components/page-shell"
import { REGIONS, type MetricKey } from "@/lib/data"
import { colors } from "@/lib/theme"
import MoroccoMap from "./morocco-map"
import LocationControls from "./location-controls"
import MetricCards from "./metric-cards"
import HistoryChart from "./history-chart"
import Recommendations from "./recommendations"
import ClimateObservations, { type ClimateLocation } from "./climate-observations"
import type { ClimateHistoryYears } from "@/lib/domain/climate-history"
import type { DashboardShareState } from "@/lib/domain/dashboard-share"
import { regionForMoroccoPoint } from "@/lib/domain/morocco-geography"

export default function DashboardClient({
  initialShareState,
}: {
  initialShareState: DashboardShareState | null
}) {
  const defaultRegion = REGIONS[6]
  const [regionName, setRegionName] = React.useState(
    initialShareState?.regionName ?? defaultRegion.name,
  )
  const [metric, setMetric] = React.useState<MetricKey>(initialShareState?.metric ?? "ndvi")
  const [climatePoint, setClimatePoint] = React.useState<ClimateLocation | null>(
    initialShareState?.location.mode === "region" ? null : (initialShareState?.location ?? null),
  )
  const [climateHistoryYears, setClimateHistoryYears] = React.useState<ClimateHistoryYears>(
    initialShareState?.historyYears ?? 1,
  )

  const region = REGIONS.find((r) => r.name === regionName) ?? REGIONS[0]
  const climateLocation: ClimateLocation = climatePoint ?? {
    mode: "region",
    label: `the ${region.name} regional centroid`,
    latitude: region.lat,
    longitude: region.lon,
  }
  const shareState: DashboardShareState = {
    regionName: region.name,
    metric,
    historyYears: climateHistoryYears,
    location: climateLocation,
  }

  function selectRegion(name: string) {
    setRegionName(name)
    setClimatePoint(null)
  }

  function selectMapPoint(name: string, latitude: number, longitude: number) {
    setRegionName(name)
    setClimatePoint({
      mode: "point",
      label: `Exact point ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude,
      longitude,
    })
  }

  function setClimateLocation(location: ClimateLocation | null) {
    if (location) {
      const containingRegion = regionForMoroccoPoint(location.latitude, location.longitude)
      if (!containingRegion) return
      setRegionName(containingRegion)
    }
    setClimatePoint(location)
  }

  return (
    <PageShell>
      <Box
        component="section"
        sx={{
          position: "relative",
          minHeight: { xs: 280, md: 300 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          bgcolor: "#050607",
          backgroundImage: "url('/images/dashboard-orbit-background.png')",
          backgroundSize: "cover",
          backgroundPosition: { xs: "58% center", md: "center 46%" },
          borderBottom: `1px solid ${colors.line}`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(5,6,7,0.26) 0%, rgba(5,6,7,0.5) 45%, rgba(5,6,7,0.96) 100%), linear-gradient(90deg, rgba(5,6,7,0.78) 0%, rgba(5,6,7,0.12) 76%)",
          },
        }}
      >
        <BackgroundVideo
          src="/videos/dashboard-morocco.mp4"
          poster="/images/dashboard-orbit-background.png"
          objectPosition={{ xs: "58% center", md: "center 52%" }}
        />
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pb: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
        >
          <Box>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.25 }}>
              <Box sx={{ width: 7, height: 7, bgcolor: colors.green }} />
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)" }}>
                Earth observation workspace / Morocco
              </Typography>
            </Stack>
            <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, textTransform: "uppercase", lineHeight: 0.96 }}>
              Morocco environmental atlas
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.25, color: "rgba(255,255,255,0.72)" }}>
              {region.name} · {region.zone}
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: { sm: 310 },
              pl: { sm: 3 },
              borderLeft: { sm: "1px solid rgba(255,255,255,0.24)" },
              display: "grid",
              gridTemplateColumns: "auto auto",
              columnGap: 3,
              rowGap: 0.5,
            }}
          >
            <HeroMeta label="Observed source" value="NASA POWER" />
            <HeroMeta
              label="Analysis mode"
              value={
                climateLocation.mode === "region"
                  ? "Regional centroid"
                  : climateLocation.mode === "radius"
                    ? `${climateLocation.radiusKm} km radius`
                    : "Exact point"
              }
            />
            <HeroMeta
              label="Climate window"
              value={`${climateHistoryYears} ${climateHistoryYears === 1 ? "year" : "years"}`}
            />
          </Box>
        </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "clip",
          bgcolor: "#050607",
          backgroundImage: "url('/images/dashboard-orbit-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
      <Box
        aria-hidden="true"
        sx={{
          position: "sticky",
          top: 0,
          height: "100svh",
          mb: "-100svh",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <BackgroundVideo
          src="/videos/dashboard-morocco.mp4"
          poster="/images/dashboard-orbit-background.png"
          objectPosition={{ xs: "60% center", md: "center center" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(5,6,7,0.91), rgba(5,6,7,0.96))",
          }}
        />
      </Box>
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: { xs: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={12}>
            <Box
              component="section"
              aria-labelledby="map-workspace-title"
              sx={{ border: `1px solid ${colors.line}`, bgcolor: "rgba(7,9,10,0.94)" }}
            >
              <Grid container>
                <Grid
                  size={{ xs: 12, md: 3 }}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRight: { md: `1px solid ${colors.line}` },
                    borderBottom: { xs: `1px solid ${colors.line}`, md: 0 },
                  }}
                >
                  <SectionIndex index="01" label="Position & layer" />
                  <Box sx={{ mt: 3 }}>
              <LocationControls
                region={region}
                metric={metric}
                onRegionChange={selectRegion}
                onMetricChange={setMetric}
              />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 9 }} sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ mb: 2, justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
                  >
                    <Box>
                      <SectionIndex index="02" label="Geographic canvas" />
                      <Typography
                        id="map-workspace-title"
                        variant="h5"
                        sx={{ mt: 0.75, textTransform: "uppercase" }}
                      >
                        Morocco map explorer
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Region polygons · exact points · sampled radius
                    </Typography>
                  </Stack>
              <MoroccoMap
                metric={metric}
                selected={regionName}
                location={climateLocation}
                onRegionSelect={selectRegion}
                onPointSelect={selectMapPoint}
              />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid size={12}>
            <ClimateObservations
              key={`${climateLocation.mode}:${climateLocation.latitude}:${climateLocation.longitude}:${climateLocation.mode === "radius" ? climateLocation.radiusKm : "point"}`}
              location={climateLocation}
              onLocationChange={setClimateLocation}
              historyYears={climateHistoryYears}
              onHistoryYearsChange={setClimateHistoryYears}
              shareState={shareState}
            />
          </Grid>

          <Grid size={12} sx={{ mt: { md: 1 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
            >
              <Box>
                <SectionIndex index="04" label="Experimental layers" />
                <Typography component="h2" variant="h4" sx={{ mt: 0.75 }}>
                  Satellite layer laboratory
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Synthetic regional values for interface exploration—not live observations.
                </Typography>
              </Box>
              <Typography variant="overline" sx={{ color: colors.amber }}>
                Demonstration / non-operational
              </Typography>
            </Stack>
          </Grid>

          <Grid size={12}>
            <MetricCards region={region} active={metric} onSelect={setMetric} />
          </Grid>

          <Grid size={12}>
            <Box sx={{ border: `1px solid ${colors.line}`, bgcolor: "rgba(7,9,10,0.94)" }}>
              <Grid container>
                <Grid
                  size={{ xs: 12, md: 7 }}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRight: { md: `1px solid ${colors.line}` },
                    borderBottom: { xs: `1px solid ${colors.line}`, md: 0 },
                  }}
                >
                  <HistoryChart region={region} metric={metric} />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ p: { xs: 2, md: 3 } }}>
                  <Recommendations region={region} />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, pt: 2, borderTop: `1px solid ${colors.line}` }}>
          <Typography variant="caption" color="text.secondary">
            Experimental satellite layers are synthesised demonstration data modelled on Moroccan
            agro-climatic gradients. Observed climate values above come from NASA POWER.
          </Typography>
        </Box>
      </Container>
      </Box>
    </PageShell>
  )
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: colors.white, fontFamily: "var(--font-mono)", textAlign: "right" }}
      >
        {value}
      </Typography>
    </>
  )
}

function SectionIndex({ index, label }: { index: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography variant="overline" sx={{ color: colors.blue, fontFamily: "var(--font-mono)" }}>
        {index}
      </Typography>
      <Box sx={{ width: 28, height: "1px", bgcolor: colors.line }} />
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}
