"use client"

import { Box, ButtonBase, Typography, Stack, Grid } from "@mui/material"
import GrassIcon from "@mui/icons-material/Grass"
import WaterDropIcon from "@mui/icons-material/WaterDrop"
import ThermostatIcon from "@mui/icons-material/Thermostat"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import {
  METRICS,
  metricsForRegion,
  historyForRegion,
  formatMetric,
  type MetricKey,
  type Region,
} from "@/lib/data"
import { colorFor } from "@/lib/scale"
import { colors } from "@/lib/theme"

const ICONS: Record<MetricKey, React.ReactNode> = {
  ndvi: <GrassIcon />,
  moisture: <WaterDropIcon />,
  lst: <ThermostatIcon />,
}

interface Props {
  region: Region
  active: MetricKey
  onSelect: (m: MetricKey) => void
}

export default function MetricCards({ region, active, onSelect }: Props) {
  const values = metricsForRegion(region)
  const order: MetricKey[] = ["ndvi", "moisture", "lst"]

  return (
    <Grid container spacing={0} sx={{ border: `1px solid ${colors.line}`, bgcolor: "rgba(7,9,10,0.94)" }}>
      {order.map((key) => {
        const def = METRICS[key]
        const value = values[key]
        const hist = historyForRegion(region, key)
        const prev = hist[hist.length - 2]
        const delta = value - prev
        const isActive = key === active
        // "good" direction: for temperature down is good
        const positive = def.goodHigh ? delta >= 0 : delta <= 0
        const accent = colorFor(key, value)

        return (
          <Grid
            size={{ xs: 12, sm: 4 }}
            key={key}
            sx={{
              borderRight: { sm: `1px solid ${colors.line}` },
              borderBottom: { xs: `1px solid ${colors.line}`, sm: 0 },
              "&:last-of-type": { borderRight: 0, borderBottom: 0 },
            }}
          >
            <ButtonBase
              onClick={() => onSelect(key)}
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                p: { xs: 2, md: 2.5 },
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                bgcolor: isActive ? "rgba(85,167,232,0.07)" : "transparent",
              }}
            >
                <Box
                  sx={{
                    position: "absolute",
                    top: 18,
                    left: 0,
                    bottom: 18,
                    width: isActive ? "3px" : "1px",
                    bgcolor: accent,
                  }}
                />
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: accent,
                    }}
                  >
                    {ICONS[key]}
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: "center", color: positive ? colors.greenDark : "#F0B36D" }}
                  >
                    {delta >= 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 15 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {delta >= 0 ? "+" : ""}
                      {key === "ndvi" ? delta.toFixed(2) : delta.toFixed(1)}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography variant="overline" sx={{ mt: 2, display: "block", color: "text.secondary" }}>
                  {def.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 0.5, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                >
                  {formatMetric(key, value)}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  vs. previous month
                </Typography>
            </ButtonBase>
          </Grid>
        )
      })}
    </Grid>
  )
}
