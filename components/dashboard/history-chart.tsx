"use client"

import { Box, Typography, Stack } from "@mui/material"
import { LineChart } from "@mui/x-charts/LineChart"
import { METRICS, historyForRegion, MONTHS, type MetricKey, type Region } from "@/lib/data"
import { colors } from "@/lib/theme"

const SERIES_COLOR: Record<MetricKey, string> = {
  ndvi: colors.green,
  moisture: colors.blue,
  lst: colors.amber,
}

interface Props {
  region: Region
  metric: MetricKey
}

export default function HistoryChart({ region, metric }: Props) {
  const def = METRICS[metric]
  const data = historyForRegion(region, metric)
  const stroke = SERIES_COLOR[metric]

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", alignItems: "baseline" }}>
        <Box>
          <Typography variant="h6">Twelve-month history</Typography>
          <Typography variant="body2" color="text.secondary">
            {def.label} · {region.name}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ fontFamily: "var(--font-mono)", color: "text.secondary" }}
        >
          monthly composite
        </Typography>
      </Stack>

      <Box sx={{ width: "100%", height: 300 }}>
        <LineChart
          height={300}
          margin={{ left: 12, right: 16, top: 16, bottom: 24 }}
          xAxis={[
            {
              scaleType: "point",
              data: MONTHS,
              tickLabelStyle: { fontSize: 11, fill: colors.slate },
            },
          ]}
          yAxis={[
            {
              tickLabelStyle: { fontSize: 11, fill: colors.slate },
              width: 40,
            },
          ]}
          series={[
            {
              data,
              label: def.short,
              color: stroke,
              area: true,
              showMark: true,
              curve: "monotoneX",
              valueFormatter: (v) =>
                v == null ? "" : metric === "ndvi" ? v.toFixed(2) : v.toFixed(1) + def.unit,
            },
          ]}
          slotProps={{ legend: { hidden: true } as never }}
          sx={{
            "& .MuiAreaElement-root": { fill: stroke, fillOpacity: 0.12 },
            "& .MuiLineElement-root": { strokeWidth: 2.5 },
            "& .MuiMarkElement-root": { fill: "#fff", stroke, strokeWidth: 2, r: 3.5 },
          }}
        />
      </Box>
    </Box>
  )
}
