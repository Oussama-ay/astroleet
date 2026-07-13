"use client"

import { Card, CardActionArea, Box, Typography, Stack, Grid } from "@mui/material"
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
    <Grid container spacing={2.5}>
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
          <Grid size={{ xs: 12, sm: 4 }} key={key}>
            <Card
              sx={{
                height: "100%",
                borderColor: isActive ? "primary.main" : colors.line,
                borderWidth: isActive ? 2 : 1,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardActionArea onClick={() => onSelect(key)} sx={{ p: 2.5, height: "100%" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: accent,
                  }}
                />
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(15,95,166,0.08)",
                      color: "primary.main",
                    }}
                  >
                    {ICONS[key]}
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: "center",
                      px: 1,
                      py: 0.25,
                      borderRadius: 5,
                      bgcolor: positive ? colors.greenSoft : "#F6E3D6",
                      color: positive ? colors.greenDark : "#A85E14",
                    }}
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

                <Typography variant="body2" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
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
              </CardActionArea>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
