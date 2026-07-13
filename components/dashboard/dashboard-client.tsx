"use client"

import * as React from "react"
import { Box, Container, Typography, Grid, Card, Chip, Stack, Divider } from "@mui/material"
import PublicIcon from "@mui/icons-material/Public"
import PageShell from "@/components/page-shell"
import { REGIONS, type MetricKey } from "@/lib/data"
import { colors } from "@/lib/theme"
import MoroccoMap from "./morocco-map"
import LocationControls from "./location-controls"
import MetricCards from "./metric-cards"
import HistoryChart from "./history-chart"
import Recommendations from "./recommendations"

export default function DashboardClient() {
  const [regionName, setRegionName] = React.useState(REGIONS[6].name) // Marrakech-Safi
  const [metric, setMetric] = React.useState<MetricKey>("ndvi")

  const region = REGIONS.find((r) => r.name === regionName) ?? REGIONS[0]

  return (
    <PageShell>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4, justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <Box>
            <Chip
              icon={<PublicIcon sx={{ fontSize: 16 }} />}
              label="Geospatial dashboard"
              size="small"
              sx={{ bgcolor: colors.greenSoft, color: colors.greenDark, mb: 1.5, "& .MuiChip-icon": { color: colors.greenDark } }}
            />
            <Typography variant="h3" sx={{ fontSize: { xs: "1.9rem", md: "2.3rem" } }}>
              Morocco environmental monitor
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Select a region and layer to inspect current conditions and 12-month trends.
            </Typography>
          </Box>
          <Box sx={{ textAlign: { sm: "right" } }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "var(--font-mono)" }}>
              Last composite
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              2026 · 12-month window
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Left: controls */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ p: 2.5, position: { md: "sticky" }, top: { md: 88 } }}>
              <LocationControls
                region={region}
                metric={metric}
                onRegionChange={setRegionName}
                onMetricChange={setMetric}
              />
            </Card>
          </Grid>

          {/* Right: map */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Regional choropleth</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Click a region to select
                </Typography>
              </Stack>
              <MoroccoMap metric={metric} selected={regionName} onSelect={setRegionName} />
            </Card>
          </Grid>

          {/* Metric cards */}
          <Grid size={12}>
            <MetricCards region={region} active={metric} onSelect={setMetric} />
          </Grid>

          {/* Chart + recommendations */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
              <HistoryChart region={region} metric={metric} />
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
              <Recommendations region={region} />
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 5, mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Values shown are synthesised demonstration data modelled on Moroccan agro-climatic
          gradients. See the methodology page for sources and processing.
        </Typography>
      </Container>
    </PageShell>
  )
}
