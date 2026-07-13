"use client"

import { Box, Typography } from "@mui/material"

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", minWidth: 154 }}>
      <Box sx={{ position: "relative", display: "inline-flex", pr: 1 }}>
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -5,
            right: -6,
            width: 82,
            height: 21,
            borderTop: "2px solid #55A7E8",
            borderRadius: "50%",
            transform: "rotate(-8deg)",
            opacity: 0.95,
            pointerEvents: "none",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 1,
            right: -7,
            width: 3,
            height: 3,
            bgcolor: "#55A7E8",
            transform: "rotate(45deg)",
          }}
        />
      <Typography
        component="span"
        sx={{
            position: "relative",
            zIndex: 1,
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.08rem" },
            lineHeight: 1,
            letterSpacing: "0.13em",
            color: light ? "#FFFFFF" : "text.primary",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
        }}
      >
          Astro<Box component="span" sx={{ color: "#DCEAF5" }}>leet</Box>
      </Typography>
      </Box>
    </Box>
  )
}
