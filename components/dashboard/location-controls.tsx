"use client"

import {
  Box,
  Typography,
  Stack,
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import { METRICS, REGIONS, type MetricKey, type Region } from "@/lib/data"
import { colors } from "@/lib/theme"

interface Props {
  region: Region
  metric: MetricKey
  onRegionChange: (name: string) => void
  onMetricChange: (m: MetricKey) => void
}

export default function LocationControls({ region, metric, onRegionChange, onMetricChange }: Props) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Administrative region
        </Typography>
        <Autocomplete
          size="small"
          disableClearable
          options={REGIONS.map((r) => r.name)}
          value={region.name}
          onChange={(_, v) => v && onRegionChange(v)}
          sx={{ mt: 1.25 }}
          renderInput={(params) => <TextField {...params} placeholder="Select region" />}
        />
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
          {region.zone} · {region.lat.toFixed(1)}°N, {Math.abs(region.lon).toFixed(1)}°W
        </Typography>
      </Box>

      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Map layer
        </Typography>
        <ToggleButtonGroup
          value={metric}
          exclusive
          fullWidth
          onChange={(_, v) => v && onMetricChange(v as MetricKey)}
          sx={{
            mt: 1,
            flexDirection: "column",
            gap: 0,
            border: `1px solid ${colors.line}`,
            "& .MuiToggleButton-root": {
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: "0 !important",
              border: "0 !important",
              borderBottom: `1px solid ${colors.line} !important`,
              borderLeft: "3px solid transparent !important",
              px: 1.5,
              py: 1.25,
              color: "text.secondary",
              "&:last-of-type": { borderBottom: "0 !important" },
            },
            "& .Mui-selected": {
              bgcolor: "rgba(85,167,232,0.08) !important",
              color: `${colors.white} !important`,
              borderLeftColor: `${colors.blue} !important`,
            },
          }}
        >
          {(Object.keys(METRICS) as MetricKey[]).map((k) => (
            <ToggleButton key={k} value={k}>
              <Stack sx={{ width: "100%", alignItems: "flex-start" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {METRICS[k].short}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "left" }}>
                  Synthetic regional layer
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )
}
