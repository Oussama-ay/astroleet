"use client"

import { Box, Typography, Stack, Chip } from "@mui/material"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined"
import { recommendationsForRegion, type Region, type Recommendation } from "@/lib/data"
import { colors } from "@/lib/theme"

const STYLE: Record<
  Recommendation["severity"],
  { bg: string; fg: string; label: string; icon: React.ReactNode }
> = {
  high: { bg: "#F6E3D6", fg: "#A85E14", label: "Priority", icon: <PriorityHighIcon sx={{ fontSize: 18 }} /> },
  medium: { bg: colors.blueSoft, fg: colors.blueDark, label: "Watch", icon: <WarningAmberIcon sx={{ fontSize: 18 }} /> },
  info: { bg: colors.greenSoft, fg: colors.greenDark, label: "Guidance", icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} /> },
}

export default function Recommendations({ region }: { region: Region }) {
  const recs = recommendationsForRegion(region)

  return (
    <Box>
      <Stack direction="row" spacing={1.25} sx={{ mb: 0.5, alignItems: "center" }}>
        <ScienceOutlinedIcon sx={{ color: "secondary.main" }} />
        <Typography variant="h6">Evidence-based recommendations</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Generated from current indicator values for {region.name}. Each action cites the
        measurement that triggered it.
      </Typography>

      <Stack spacing={1.5}>
        {recs.map((rec) => {
          const s = STYLE[rec.severity]
          return (
            <Box
              key={rec.id}
              sx={{
                display: "flex",
                gap: 1.75,
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${colors.line}`,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: s.bg,
                  color: s.fg,
                }}
              >
                {s.icon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {rec.title}
                  </Typography>
                  <Chip
                    label={s.label}
                    size="small"
                    sx={{ bgcolor: s.bg, color: s.fg, height: 20, fontSize: 11 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.55 }}>
                  {rec.detail}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "inline-block",
                    mt: 1,
                    fontFamily: "var(--font-mono)",
                    color: "text.secondary",
                    bgcolor: colors.sandSoft,
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    border: `1px solid ${colors.line}`,
                  }}
                >
                  basis: {rec.basis}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
