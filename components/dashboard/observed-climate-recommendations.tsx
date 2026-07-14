import {
  Alert,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import {
  assessObservedClimate,
  OBSERVED_CLIMATE_THRESHOLDS,
  type ObservedSignalSeverity,
} from "@/lib/domain/observed-climate-recommendations"
import type { EnvironmentalSeries } from "@/lib/domain/environment"
import { colors } from "@/lib/theme"
import AIClimateExplanation from "./ai-climate-explanation"

const SIGNAL_STYLE: Record<
  ObservedSignalSeverity,
  { background: string; color: string; label: string; icon: React.ReactNode }
> = {
  warning: {
    background: "#2B1A12",
    color: "#F0B36D",
    label: "Compound signal",
    icon: <PriorityHighIcon sx={{ fontSize: 18 }} />,
  },
  watch: {
    background: colors.blueSoft,
    color: colors.blueDark,
    label: "Watch",
    icon: <WarningAmberIcon sx={{ fontSize: 18 }} />,
  },
  info: {
    background: colors.greenSoft,
    color: colors.greenDark,
    label: "Within thresholds",
    icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} />,
  },
}

export default function ObservedClimateRecommendations({
  series,
}: {
  series: EnvironmentalSeries[]
}) {
  const assessment = assessObservedClimate(series)

  return (
    <Box component="section" aria-labelledby="observed-climate-signals-title" sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2.5 }} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 0.75 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <RuleOutlinedIcon sx={{ color: colors.green }} />
          <Typography id="observed-climate-signals-title" component="h3" variant="h6">
            Observed climate signals
          </Typography>
        </Stack>
        <Chip
          label="Deterministic screening"
          size="small"
          variant="outlined"
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, borderColor: colors.line }}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Latest month compared with the median for the same calendar month in prior years. This is
        not a forecast.
      </Typography>

      {assessment.status === "insufficient" ? (
        <Alert severity="info" sx={{ bgcolor: colors.blueSoft, color: "text.primary" }}>
          <Typography variant="subtitle2">Longer history required</Typography>
          <Typography variant="body2">
            {assessment.reason} Select at least 5 years of history to enable screening.
          </Typography>
        </Alert>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Baseline: same-month observations from {assessment.baselineStartYear}–
            {assessment.baselineEndYear}.
          </Typography>
          <Stack spacing={1.5}>
            {assessment.signals.map((signal) => {
              const style = SIGNAL_STYLE[signal.severity]
              return (
                <Box
                  key={signal.id}
                  sx={{ p: 2, border: `1px solid ${colors.line}`, bgcolor: "#0D1012" }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: style.background,
                          color: style.color,
                        }}
                      >
                        {style.icon}
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {signal.title}
                      </Typography>
                    </Stack>
                    <Chip
                      label={style.label}
                      size="small"
                      sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, bgcolor: style.background, color: style.color }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {signal.summary}
                  </Typography>
                  <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, my: 1.25 }}>
                    {signal.evidence.map((evidence) => (
                      <Typography component="li" variant="caption" color="text.secondary" key={evidence}>
                        {evidence}
                      </Typography>
                    ))}
                  </Stack>
                  <Typography variant="caption" sx={{ color: style.color }}>
                    Suggested check: {signal.actions.join(" ")}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
          <AIClimateExplanation
            key={`${assessment.observedAt}:${assessment.baselineStartYear}:${assessment.baselineEndYear}`}
            series={series}
          />
        </>
      )}

      <Box sx={{ mt: 2, p: 1.5, borderLeft: `3px solid ${colors.line}`, bgcolor: colors.sandSoft }}>
        <Typography variant="caption" color="text.secondary">
          Screening rules: temperature ≥ +{OBSERVED_CLIMATE_THRESHOLDS.warmTemperatureDeltaC}°C;
          dry precipitation ≤ {OBSERVED_CLIMATE_THRESHOLDS.dryPrecipitationRatio * 100}% and at
          least {Math.abs(OBSERVED_CLIMATE_THRESHOLDS.dryPrecipitationDeltaMmPerDay)} mm/day below;
          wet precipitation ≥ {OBSERVED_CLIMATE_THRESHOLDS.wetPrecipitationRatio * 100}% and at
          least {OBSERVED_CLIMATE_THRESHOLDS.wetPrecipitationDeltaMmPerDay} mm/day above; humidity
          ±{OBSERVED_CLIMATE_THRESHOLDS.humidityDeltaPercentagePoints} percentage points. Monthly
          averages can hide daily extremes; verify with local observations before decisions.
        </Typography>
      </Box>
    </Box>
  )
}
