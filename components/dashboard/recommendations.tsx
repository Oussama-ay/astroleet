"use client"

import { Box, Typography, Stack } from "@mui/material"
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
  high: { bg: "#2B1A12", fg: "#F0B36D", label: "Priority", icon: <PriorityHighIcon sx={{ fontSize: 18 }} /> },
  medium: { bg: colors.blueSoft, fg: colors.blueDark, label: "Watch", icon: <WarningAmberIcon sx={{ fontSize: 18 }} /> },
  info: { bg: colors.greenSoft, fg: colors.greenDark, label: "Guidance", icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} /> },
}

export default function Recommendations({ region }: { region: Region }) {
  const recs = recommendationsForRegion(region)

  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        Synthetic guidance
      </Typography>
      <Stack direction="row" spacing={1.25} sx={{ mt: 0.25, mb: 0.5, alignItems: "center" }}>
        <ScienceOutlinedIcon sx={{ color: colors.amber }} />
        <Typography variant="h6">Model recommendations</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Generated from demonstration values for {region.name}. Each action identifies the
        synthetic measurement that triggered it.
      </Typography>

      <Stack>
        {recs.map((rec) => {
          const s = STYLE[rec.severity]
          return (
            <Box
              key={rec.id}
              sx={{
                position: "relative",
                display: "flex",
                gap: 1.75,
                py: 2,
                pl: 2,
                borderTop: `1px solid ${colors.line}`,
                "&::before": {
                  content: '\"\"',
                  position: "absolute",
                  left: 0,
                  top: 20,
                  bottom: 20,
                  width: 2,
                  bgcolor: s.fg,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 0,
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
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 0.5, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {rec.title}
                  </Typography>
                  <Typography variant="overline" sx={{ color: s.fg }}>
                    {s.label}
                  </Typography>
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
