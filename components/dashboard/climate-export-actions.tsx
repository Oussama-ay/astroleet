"use client"

import * as React from "react"
import { Button, Stack, Typography } from "@mui/material"
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined"
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined"
import type { EnvironmentalSeries } from "@/lib/domain/environment"
import {
  climateExportFilename,
  createClimateCsvExport,
  createClimateJsonExport,
  type ClimateExportExtension,
} from "@/lib/domain/climate-export"

export default function ClimateExportActions({ series }: { series: EnvironmentalSeries[] }) {
  const [feedback, setFeedback] = React.useState("")

  function download(format: ClimateExportExtension) {
    const content =
      format === "csv" ? createClimateCsvExport(series) : createClimateJsonExport(series)
    const mimeType = format === "csv" ? "text/csv;charset=utf-8" : "application/json"
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = climateExportFilename(series, format)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setFeedback(`${format.toUpperCase()} export downloaded`)
  }

  return (
    <Stack spacing={0.5} sx={{ alignItems: { md: "flex-end" } }}>
      <Stack direction="row" spacing={1}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<TableViewOutlinedIcon />}
          onClick={() => download("csv")}
        >
          Export CSV
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<DataObjectOutlinedIcon />}
          onClick={() => download("json")}
        >
          Export JSON
        </Button>
      </Stack>
      <Typography role="status" aria-live="polite" variant="caption" color="text.secondary">
        {feedback || "Observations, quality flags, and provenance"}
      </Typography>
    </Stack>
  )
}
