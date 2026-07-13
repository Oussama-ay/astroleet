"use client"

import { Box, Typography } from "@mui/material"

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        aria-hidden
        sx={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          position: "relative",
          background: "linear-gradient(140deg, #0F5FA6 0%, #2E8B6B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(45deg)",
            backgroundColor: "#E9DEC8",
          }}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: "1.15rem",
          letterSpacing: "-0.02em",
          color: light ? "#F6F1E7" : "text.primary",
        }}
      >
        Astroleat
      </Typography>
    </Box>
  )
}
