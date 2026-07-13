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
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"
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
        <Typography variant="overline" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
          <PlaceOutlinedIcon sx={{ fontSize: 16 }} /> Region
        </Typography>
        <Autocomplete
          size="small"
          disableClearable
          options={REGIONS.map((r) => r.name)}
          value={region.name}
          onChange={(_, v) => v && onRegionChange(v)}
          sx={{ mt: 1 }}
          renderInput={(params) => <TextField {...params} placeholder="Select region" />}
        />
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary" }}>
          {region.zone} · {region.lat.toFixed(1)}°N, {Math.abs(region.lon).toFixed(1)}°W
        </Typography>
      </Box>

      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Active layer
        </Typography>
        <ToggleButtonGroup
          value={metric}
          exclusive
          fullWidth
          onChange={(_, v) => v && onMetricChange(v as MetricKey)}
          sx={{
            mt: 1,
            flexDirection: "column",
            gap: 1,
            "& .MuiToggleButton-root": {
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: "0 !important",
              border: `1px solid ${colors.line} !important`,
              px: 1.5,
              py: 1,
              color: "text.secondary",
            },
            "& .Mui-selected": {
              bgcolor: `${colors.blueSoft} !important`,
              color: `${colors.white} !important`,
              borderColor: `${colors.blue} !important`,
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
                  {METRICS[k].label}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )
}
