"use client"

import * as React from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material"
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined"
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined"
import {
  aiClimateExplainResponseSchema,
  type AIClimateExplainResponse,
} from "@/lib/domain/ai-climate-explanation"
import type { EnvironmentalSeries } from "@/lib/domain/environment"
import { colors } from "@/lib/theme"

type ExplanationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; response: AIClimateExplainResponse }
  | { status: "error"; message: string }

export default function AIClimateExplanation({
  series,
}: {
  series: EnvironmentalSeries[]
}) {
  const [state, setState] = React.useState<ExplanationState>({ status: "idle" })

  async function explain() {
    setState({ status: "loading" })

    try {
      const response = await fetch("/api/climate/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series }),
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        const message = readErrorMessage(payload)
        throw new Error(message || "The AI explanation could not be generated")
      }

      const parsed = aiClimateExplainResponseSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error("The AI service returned an unexpected response")
      }

      setState({ status: "success", response: parsed.data })
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The AI explanation could not be generated",
      })
    }
  }

  return (
    <Box
      component="section"
      aria-labelledby="ai-interpretation-title"
      sx={{ px: { xs: 2, md: 3 }, py: 2.5, borderTop: `1px solid ${colors.line}` }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: colors.blue }}>
            Model synthesis
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.25, alignItems: "center" }}>
            <AutoAwesomeOutlinedIcon sx={{ color: colors.blue, fontSize: 20 }} />
            <Typography id="ai-interpretation-title" component="h3" variant="h5">
              AI-assisted interpretation
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
            On demand, compact deterministic evidence is sent to the configured AI provider. Exact
            point coordinates are excluded, and AI does not create new measurements or forecasts.
            Provider retention and training policies may still apply.
          </Typography>
        </Box>
        <Button
          type="button"
          variant={state.status === "success" ? "outlined" : "contained"}
          onClick={explain}
          disabled={state.status === "loading"}
          size="small"
          sx={{ flexShrink: 0 }}
          startIcon={
            state.status === "loading" ? (
              <CircularProgress size={16} color="inherit" />
            ) : state.status === "success" ? (
              <RefreshOutlinedIcon />
            ) : (
              <AutoAwesomeOutlinedIcon />
            )
          }
        >
          {state.status === "loading"
            ? "Explaining"
            : state.status === "success"
              ? "Regenerate"
              : "Explain with AI"}
        </Button>
      </Stack>

      {state.status === "error" && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={explain}>
              Retry
            </Button>
          }
          sx={{ mt: 2, bgcolor: "#211B12", color: "text.primary" }}
        >
          {state.message}. The deterministic signals remain available above.
        </Alert>
      )}

      {state.status === "success" && (
        <Box aria-live="polite" sx={{ mt: 2.5 }}>
          <Box sx={{ pl: 1.75, borderLeft: `2px solid ${colors.blue}` }}>
            <Typography variant="overline" color="text.secondary">
              Interpretation · verify before use
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25 }}>
              {state.response.data.explanation.headline}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.25, maxWidth: 920, lineHeight: 1.65 }}
          >
            {state.response.data.explanation.overview}
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(320px, 1fr))" },
              borderTop: `1px solid ${colors.line}`,
              borderBottom: `1px solid ${colors.line}`,
            }}
          >
            {state.response.data.explanation.signalExplanations.map((explanation, index) => (
              <Box
                key={explanation.signalId}
                sx={{
                  position: "relative",
                  py: 2,
                  px: { xs: 0, md: 2.25 },
                  borderBottom: { xs: `1px solid ${colors.line}`, md: 0 },
                  borderRight: { md: `1px solid ${colors.line}` },
                  "&:first-of-type": { pl: 0 },
                  "&:last-of-type": { pr: 0, borderRight: 0, borderBottom: 0 },
                }}
              >
                <Typography variant="overline" sx={{ color: colors.blue }}>
                  Signal {String(index + 1).padStart(2, "0")}
                </Typography>
                <Stack spacing={1.1} sx={{ mt: 0.75 }}>
                  <ResultField label="Meaning" value={explanation.meaning} />
                  <ResultField label="Why it matters" value={explanation.whyItMatters} />
                  <ResultField label="Verify next" value={explanation.verifyNext} accent />
                </Stack>
              </Box>
            ))}
          </Box>
          <Box
            sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(280px, 1fr)" }, gap: 2 }}
          >
            <Box sx={{ py: 1.5, px: 1.75, bgcolor: "rgba(240,179,109,0.07)" }}>
              <Typography variant="overline" sx={{ color: colors.amber }}>
                Important limitations
              </Typography>
              <Stack component="ul" spacing={0.5} sx={{ pl: 2.25, my: 0.5 }}>
                {state.response.data.explanation.caveats.map((caveat) => (
                  <Typography component="li" variant="caption" color="text.secondary" key={caveat}>
                    {caveat}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr)",
                  columnGap: 1.5,
                  rowGap: 0.5,
                }}
              >
                <ResultMeta label="Provider" value={state.response.meta.provider} />
                <ResultMeta label="Model" value={state.response.meta.model} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                AI text may be incomplete; deterministic evidence and local verification remain
                authoritative.
              </Typography>
              {state.response.meta.provider === "OpenRouter" &&
                state.response.meta.model.endsWith(":free") && (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 1, pl: 1.25, color: colors.amber, borderLeft: `2px solid ${colors.amber}` }}
                  >
                    This free OpenRouter endpoint may log request content under its provider policy.
                  </Typography>
                )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function ResultField({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: accent ? colors.blueDark : "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.15, lineHeight: 1.55 }}>
        {value}
      </Typography>
    </Box>
  )
}

function ResultMeta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontFamily: "var(--font-mono)", overflowWrap: "anywhere" }}
      >
        {value}
      </Typography>
    </>
  )
}

function readErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message
  }
  return undefined
}
