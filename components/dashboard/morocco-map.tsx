"use client"

import * as React from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { geoCircle, geoMercator, geoPath } from "d3-geo"
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import geoData from "@/lib/morocco-regions.json"
import { METRICS, metricsForRegion, REGIONS, type MetricKey, formatMetric } from "@/lib/data"
import type { DashboardClimateLocation } from "@/lib/domain/dashboard-share"
import { colorFor, rampStops } from "@/lib/scale"
import { colors } from "@/lib/theme"

interface Props {
  metric: MetricKey
  selected: string
  location: DashboardClimateLocation
  onRegionSelect: (name: string) => void
  onPointSelect: (regionName: string, latitude: number, longitude: number) => void
}

const WIDTH = 800
const HEIGHT = 620

// Fit the whole Morocco geometry into the viewport once, deterministically.
const projection = geoMercator().fitExtent(
  [
    [28, 28],
    [WIDTH - 28, HEIGHT - 28],
  ],
  geoData as never,
)
const pathGenerator = geoPath(projection)
const EARTH_RADIUS_KM = 6_371

function regionByName(name: string) {
  return REGIONS.find((r) => r.name === name)
}

const subscribeToHydration = () => () => {}

export default function MoroccoMap({
  metric,
  selected,
  location,
  onRegionSelect,
  onPointSelect,
}: Props) {
  const [hover, setHover] = React.useState<string | null>(null)
  const [selectionMode, setSelectionMode] = React.useState<"region" | "point">("region")
  const mounted = React.useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const def = METRICS[metric]
  const stops = rampStops(metric)
  const radiusPath =
    location.mode === "radius"
      ? pathGenerator(
          geoCircle()
            .center([location.longitude, location.latitude])
            .radius((location.radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI))
            .precision(2)(),
        )
      : null

  function selectGeography(
    event: React.MouseEvent<SVGPathElement>,
    regionName: string,
  ) {
    if (selectionMode === "region") {
      onRegionSelect(regionName)
      return
    }

    const coordinates = coordinatesFromPointer(event)
    if (!coordinates) return
    onPointSelect(regionName, coordinates.latitude, coordinates.longitude)
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: 1.5, justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Typography variant="caption" color="text.secondary">
          {selectionMode === "region"
            ? "Choose a region for its centroid and demonstration indicators."
            : "Click inside a region to analyze that exact climate point."}
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
          borderRadius: 0,
          overflow: "hidden",
          bgcolor: "#050607",
          border: `1px solid ${colors.line}`,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      >
        {!mounted && <Box sx={{ width: "100%", aspectRatio: `${WIDTH} / ${HEIGHT}` }} />}
        {mounted && (
        <ComposableMap
          projection={projection}
          width={WIDTH}
          height={HEIGHT}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <Geographies geography={geoData as object}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = String(geo.properties.name)
                const region = regionByName(name)
                const value = region ? metricsForRegion(region)[metric] : def.min
                const isSelected = name === selected
                const fill = colorFor(metric, value)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    data-region-name={name}
                    onMouseEnter={() => setHover(name)}
                    onMouseLeave={() => setHover(null)}
                    onClick={(event) => selectGeography(event, name)}
                    tabIndex={-1}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? colors.white : "rgba(255,255,255,0.38)",
                        strokeWidth: isSelected ? 2 : 0.8,
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 200ms ease, stroke 150ms ease",
                      },
                      hover: {
                        fill,
                        stroke: colors.white,
                        strokeWidth: 1.8,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { fill, stroke: colors.white, strokeWidth: 2, outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {location.mode === "radius" && radiusPath && (
            <path
              d={radiusPath}
              aria-label={`${location.radiusKm} km analysis radius`}
              fill="rgba(21, 149, 136, 0.16)"
              stroke={colors.green}
              strokeWidth={2.5}
              strokeDasharray="7 5"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}

          {REGIONS.map((r) => {
            const active = r.name === selected
            return (
              <Marker key={r.name} coordinates={[r.lon, r.lat]}>
                <circle
                  r={active ? 5 : 2.6}
                  fill={active ? colors.white : "rgba(255,255,255,0.64)"}
                  stroke="#050607"
                  strokeWidth={active ? 1.6 : 0.9}
                  style={{ cursor: "pointer" }}
                  onClick={() => onRegionSelect(r.name)}
                />
                {active && location.mode === "region" && (
                  <text
                    textAnchor="middle"
                    y={-10}
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      fill: colors.white,
                      paintOrder: "stroke",
                      stroke: "#050607",
                      strokeWidth: 3,
                    }}
                  >
                    {r.name}
                  </text>
                )}
              </Marker>
            )
          })}

          {location.mode !== "region" && (
            <Marker coordinates={[location.longitude, location.latitude]}>
              <g aria-label="Selected analysis point" pointerEvents="none">
                <circle
                  r={11}
                  fill="rgba(5,6,7,0.72)"
                  stroke={colors.blue}
                  strokeWidth={2}
                />
                <circle r={4.5} fill={colors.white} stroke={colors.blue} strokeWidth={2} />
                <path d="M -16 0 H 16 M 0 -16 V 16" stroke={colors.blue} strokeWidth={1.5} />
                <text
                  textAnchor="middle"
                  y={-22}
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    fill: colors.white,
                    paintOrder: "stroke",
                    stroke: "#050607",
                    strokeWidth: 3,
                  }}
                >
                  {location.mode === "radius" ? `${location.radiusKm} km radius` : "Analysis point"}
                </text>
              </g>
            </Marker>
          )}
        </ComposableMap>
        )}
      </Box>

      {/* Hover tooltip */}
      {hover &&
        (() => {
          const r = regionByName(hover)
          if (!r) return null
          return (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                px: 1.75,
                py: 1,
                borderRadius: 0,
                bgcolor: "rgba(5,6,7,0.94)",
                border: `1px solid ${colors.line}`,
                color: "#EAF2EF",
                pointerEvents: "none",
                maxWidth: 240,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#fff" }}>
                {hover}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "var(--font-mono)" }}>
                {def.short}: {formatMetric(metric, metricsForRegion(r)[metric])}
              </Typography>
            </Box>
          )
        })()}

      {/* Legend */}
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
              borderRadius: 0,
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

function coordinatesFromPointer(event: React.MouseEvent<SVGPathElement>) {
  const svg = event.currentTarget.ownerSVGElement
  if (!svg || !projection.invert) return null

  const bounds = svg.getBoundingClientRect()
  const point: [number, number] = [
    ((event.clientX - bounds.left) / bounds.width) * WIDTH,
    ((event.clientY - bounds.top) / bounds.height) * HEIGHT,
  ]
  const coordinates = projection.invert(point)
  if (!coordinates) return null

  return {
    longitude: roundCoordinate(coordinates[0]),
    latitude: roundCoordinate(coordinates[1]),
  }
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000
}
