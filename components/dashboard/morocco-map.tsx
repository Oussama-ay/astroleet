"use client"

import * as React from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { geoMercator } from "d3-geo"
import { Box, Typography, Stack } from "@mui/material"
import geoData from "@/lib/morocco-regions.json"
import { METRICS, metricsForRegion, REGIONS, type MetricKey, formatMetric } from "@/lib/data"
import { colorFor, rampStops } from "@/lib/scale"
import { colors } from "@/lib/theme"

interface Props {
  metric: MetricKey
  selected: string
  onSelect: (name: string) => void
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

function regionByName(name: string) {
  return REGIONS.find((r) => r.name === name)
}

const subscribeToHydration = () => () => {}

export default function MoroccoMap({ metric, selected, onSelect }: Props) {
  const [hover, setHover] = React.useState<string | null>(null)
  const mounted = React.useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const def = METRICS[metric]
  const stops = rampStops(metric)

  return (
    <Box sx={{ position: "relative" }}>
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
                    onMouseEnter={() => setHover(name)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onSelect(name)}
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
                  onClick={() => onSelect(r.name)}
                />
                {active && (
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
      </Stack>
    </Box>
  )
}
