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
    <Box sx={{ mt: 2, p: 2, border: `1px solid ${colors.line}`, bgcolor: colors.sandSoft }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AutoAwesomeOutlinedIcon sx={{ color: colors.blue }} />
            <Typography component="h4" variant="subtitle1" sx={{ fontWeight: 700 }}>
              AI-assisted interpretation
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
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
        <Box aria-live="polite" sx={{ mt: 2 }}>
          <Typography variant="h6">{state.response.data.explanation.headline}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {state.response.data.explanation.overview}
          </Typography>
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {state.response.data.explanation.signalExplanations.map((explanation) => (
              <Box
                key={explanation.signalId}
                sx={{ p: 1.5, borderLeft: `3px solid ${colors.blue}`, bgcolor: "#0D1012" }}
              >
                <Typography variant="subtitle2">What the signal means</Typography>
                <Typography variant="body2" color="text.secondary">
                  {explanation.meaning}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: colors.blueDark }}>
                  Why it matters: {explanation.whyItMatters}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verify next: {explanation.verifyNext}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Important limitations
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, my: 0 }}>
            {state.response.data.explanation.caveats.map((caveat) => (
              <Typography component="li" variant="caption" color="text.secondary" key={caveat}>
                {caveat}
              </Typography>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Generated by {state.response.meta.provider} · {state.response.meta.model}. AI text may
            be incomplete; deterministic evidence and local verification remain authoritative.
          </Typography>
          {state.response.meta.provider === "OpenRouter" &&
            state.response.meta.model.endsWith(":free") && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: "block", mt: 0.5 }}
              >
                This free OpenRouter endpoint may log request content under its provider policy.
              </Typography>
            )}
        </Box>
      )}
    </Box>
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
