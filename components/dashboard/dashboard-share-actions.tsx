"use client"

import * as React from "react"
import { Button, Stack, Typography } from "@mui/material"
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined"
import {
  buildDashboardShareUrl,
  type DashboardShareState,
} from "@/lib/domain/dashboard-share"

export default function DashboardShareActions({ state }: { state: DashboardShareState }) {
  const [feedback, setFeedback] = React.useState("")

  async function shareAnalysis() {
    const url = buildDashboardShareUrl(window.location.origin, state)
    window.history.replaceState(window.history.state, "", url)

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Astroleet environmental analysis",
          text: `Astroleet climate view for ${state.location.label}`,
          url,
        })
        setFeedback("Analysis shared")
      } else {
        await copyToClipboard(url)
        setFeedback("Analysis link copied")
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      setFeedback("Could not share this link")
    }
  }

  return (
    <Stack spacing={0.5} sx={{ alignItems: { sm: "flex-end" } }}>
      <Button
        type="button"
        size="small"
        variant="outlined"
        startIcon={<ShareOutlinedIcon />}
        onClick={shareAnalysis}
      >
        Share analysis
      </Button>
      <Typography role="status" aria-live="polite" variant="caption" color="text.secondary">
        {feedback}
      </Typography>
    </Stack>
  )
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"
  document.body.appendChild(textArea)
  textArea.select()
  const copied = document.execCommand("copy")
  textArea.remove()
  if (!copied) throw new Error("Clipboard access is unavailable")
}
