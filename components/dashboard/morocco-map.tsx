"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Box, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { METRICS, type MetricKey, formatMetric } from "@/lib/data"
import type { DashboardClimateLocation } from "@/lib/domain/dashboard-share"
import { rampStops } from "@/lib/scale"
import { colors } from "@/lib/theme"

interface Props {
  metric: MetricKey
  selected: string
  location: DashboardClimateLocation
  onRegionSelect: (name: string) => void
  onPointSelect: (regionName: string, latitude: number, longitude: number) => void
}

const MoroccoLeafletMap = dynamic(() => import("./morocco-leaflet-map"), {
  ssr: false,
  loading: () => (
    <Skeleton
      variant="rectangular"
      aria-label="Loading interactive Morocco map"
      sx={{ height: "clamp(430px, 65vw, 620px)", bgcolor: "rgba(255,255,255,0.05)" }}
    />
  ),
})

export default function MoroccoMap({
  metric,
  selected,
  location,
  onRegionSelect,
  onPointSelect,
}: Props) {
  const [selectionMode, setSelectionMode] = React.useState<"region" | "point">("region")
  const def = METRICS[metric]
  const stops = rampStops(metric)

  return (
    <Box sx={{ position: "relative" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: 1.5, justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Typography variant="caption" color="text.secondary">
          {selectionMode === "region"
            ? "Choose a Moroccan region for its centroid and demonstration indicators."
            : "Click inside Morocco to analyze that exact climate point."}
        </Typography>
        <ToggleButtonGroup
          value={selectionMode}
          exclusive
          size="small"
          aria-label="Map selection mode"
          onChange={(_, value) => value && setSelectionMode(value)}
        >
          <ToggleButton value="region">Region select</ToggleButton>
          <ToggleButton value="point">Point select</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          overflow: "hidden",
          bgcolor: "#050607",
          border: `1px solid ${colors.line}`,
        }}
      >
        <MoroccoLeafletMap
          metric={metric}
          selected={selected}
          location={location}
          selectionMode={selectionMode}
          onRegionSelect={onRegionSelect}
          onPointSelect={onPointSelect}
        />
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mt: 2, flexWrap: "wrap", gap: 1, alignItems: "center" }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {def.label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatMetric(metric, def.min)}
          </Typography>
          <Box
            sx={{
              width: 160,
              height: 10,
              background: `linear-gradient(90deg, ${stops.join(", ")})`,
              border: `1px solid ${colors.line}`,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatMetric(metric, def.max)}
          </Typography>
        </Box>
        {location.mode !== "region" && (
          <Typography variant="caption" sx={{ color: colors.blue }}>
            Analysis point · {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Typography>
        )}
        {location.mode === "radius" && (
          <Typography variant="caption" sx={{ color: colors.green }}>
            Dashed outline · {location.radiusKm} km radius
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
