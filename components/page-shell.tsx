"use client"

import { Box } from "@mui/material"
import SiteHeader from "./site-header"
import SiteFooter from "./site-footer"

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh", bgcolor: "background.default" }}>
      <SiteHeader />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  )
}
