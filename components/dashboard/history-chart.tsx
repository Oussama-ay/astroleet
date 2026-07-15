"use client"

import { Box, Typography, Stack } from "@mui/material"
import { LineChart } from "@mui/x-charts/LineChart"
import { METRICS, historyForRegion, MONTHS, type MetricKey, type Region } from "@/lib/data"
import { colors } from "@/lib/theme"
import DataStatusBadge from "@/components/data-status-badge"

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
      <Stack direction="row" spacing={2} sx={{ mb: 1, justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Synthetic composite
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.25 }}>
            Twelve-month model
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {def.label} · {region.name}
          </Typography>
        </Box>
        <DataStatusBadge status="synthetic" />
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
            "& .MuiMarkElement-root": { fill: "#090B0C", stroke, strokeWidth: 2, r: 3.5 },
            "& .MuiChartsGrid-line": { stroke: colors.line },
            "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: colors.line },
          }}
        />
      </Box>
    </Box>
  )
}
