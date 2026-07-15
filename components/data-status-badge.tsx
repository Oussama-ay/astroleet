"use client"

import { Box, Stack, Typography } from "@mui/material"
import { colors } from "@/lib/theme"

type DataStatus = "observed" | "synthetic"

const STATUS_STYLES: Record<
  DataStatus,
  { label: string; color: string; background: string; border: string; filled: boolean }
> = {
  observed: {
    label: "Observed",
    color: colors.greenDark,
    background: "rgba(85,182,139,0.1)",
    border: "rgba(85,182,139,0.42)",
    filled: true,
  },
  synthetic: {
    label: "Synthetic",
    color: "#F0BE75",
    background: "rgba(231,168,75,0.07)",
    border: "rgba(231,168,75,0.5)",
    filled: false,
  },
}

export default function DataStatusBadge({
  status,
  label,
}: {
  status: DataStatus
  label?: string
}) {
  const style = STATUS_STYLES[status]

  return (
    <Stack
      component="span"
      direction="row"
      spacing={0.75}
      aria-label={`${label ?? style.label} data status`}
      sx={{
        width: "fit-content",
        px: 1,
        py: 0.45,
        alignItems: "center",
        color: style.color,
        bgcolor: style.background,
        border: `1px ${status === "synthetic" ? "dashed" : "solid"} ${style.border}`,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: style.filled ? style.color : "transparent",
          border: `1px solid ${style.color}`,
        }}
      />
      <Typography
        component="span"
        variant="overline"
        sx={{ color: "inherit", fontSize: "0.62rem", lineHeight: 1.2, letterSpacing: "0.1em" }}
      >
        {label ?? style.label}
      </Typography>
    </Stack>
  )
}
