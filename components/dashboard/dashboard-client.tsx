"use client"

import * as React from "react"
import { Box, Container, Typography, Grid, Card, Chip, Stack, Divider } from "@mui/material"
import PublicIcon from "@mui/icons-material/Public"
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

export default function DashboardClient() {
  const [regionName, setRegionName] = React.useState(REGIONS[6].name) // Marrakech-Safi
  const [metric, setMetric] = React.useState<MetricKey>("ndvi")
  const [climatePoint, setClimatePoint] = React.useState<ClimateLocation | null>(null)

  const region = REGIONS.find((r) => r.name === regionName) ?? REGIONS[0]
  const climateLocation: ClimateLocation = climatePoint ?? {
    mode: "region",
    label: `the ${region.name} regional centroid`,
    latitude: region.lat,
    longitude: region.lon,
  }

  function selectRegion(name: string) {
    setRegionName(name)
    setClimatePoint(null)
  }

  return (
    <PageShell>
      <Box
        component="section"
        sx={{
          position: "relative",
          minHeight: { xs: 330, md: 410 },
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
              "linear-gradient(180deg, rgba(5,6,7,0.18) 0%, rgba(5,6,7,0.34) 38%, rgba(5,6,7,0.94) 100%), linear-gradient(90deg, rgba(5,6,7,0.72) 0%, rgba(5,6,7,0.12) 72%)",
          },
        }}
      >
        <BackgroundVideo
          src="/videos/dashboard-morocco.mp4"
          poster="/images/dashboard-orbit-background.png"
          objectPosition={{ xs: "58% center", md: "center 52%" }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, pb: { xs: 4, md: 5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
        >
          <Box>
            <Chip
              icon={<PublicIcon sx={{ fontSize: 16 }} />}
              label="Geospatial dashboard"
              size="small"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.34)", color: "rgba(255,255,255,0.78)", mb: 1.5, "& .MuiChip-icon": { color: colors.green } }}
            />
            <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "2rem", md: "3rem" }, textTransform: "uppercase", lineHeight: 1 }}>
              Morocco environmental monitor
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "rgba(255,255,255,0.76)" }}>
              Select a region and layer to inspect current conditions and 12-month trends.
            </Typography>
          </Box>
          <Box sx={{ textAlign: { sm: "right" } }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.62)", fontFamily: "var(--font-mono)" }}>
              Last composite
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              Demo model · 12-month window
            </Typography>
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
            background: "linear-gradient(180deg, rgba(5,6,7,0.88), rgba(5,6,7,0.94))",
          }}
        />
      </Box>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {/* Left: controls */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ p: 2.5, position: { md: "sticky" }, top: { md: 88 }, bgcolor: "#090B0C" }}>
              <LocationControls
                region={region}
                metric={metric}
                onRegionChange={selectRegion}
                onMetricChange={setMetric}
              />
            </Card>
          </Grid>

          {/* Right: map */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ p: { xs: 2, md: 3 }, bgcolor: "#090B0C" }}>
              <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ textTransform: "uppercase" }}>Morocco map explorer</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Select a region to inspect
                </Typography>
              </Stack>
              <MoroccoMap metric={metric} selected={regionName} onSelect={selectRegion} />
            </Card>
          </Grid>

          {/* Observed climate */}
          <Grid size={12}>
            <ClimateObservations
              key={`${climateLocation.mode}:${climateLocation.latitude}:${climateLocation.longitude}`}
              location={climateLocation}
              onLocationChange={setClimatePoint}
            />
          </Grid>

          {/* Demonstration satellite indicators */}
          <Grid size={12} sx={{ mt: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
            >
              <Box>
                <Typography component="h2" variant="h5">
                  Demonstration satellite indicators
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Synthetic values—not live observations. Use them only to explore the interface.
                </Typography>
              </Box>
              <Chip
                label="Synthetic demonstration"
                size="small"
                sx={{ bgcolor: colors.sand, color: "text.secondary", alignSelf: { xs: "flex-start" } }}
              />
            </Stack>
          </Grid>

          {/* Metric cards */}
          <Grid size={12}>
            <MetricCards region={region} active={metric} onSelect={setMetric} />
          </Grid>

          {/* Chart + recommendations */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ p: { xs: 2, md: 3 }, height: "100%", bgcolor: "#090B0C" }}>
              <HistoryChart region={region} metric={metric} />
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: { xs: 2, md: 3 }, height: "100%", bgcolor: "#090B0C" }}>
              <Recommendations region={region} />
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 5, mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Satellite indicator values and recommendations are synthesised demonstration data
          modelled on Moroccan agro-climatic gradients. See the methodology page for sources
          and processing.
        </Typography>
      </Container>
      </Box>
    </PageShell>
  )
}
