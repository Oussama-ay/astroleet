"use client"

import Image from "next/image"
import { Box } from "@mui/material"

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        width: { xs: 168, sm: 190 },
        aspectRatio: "1225 / 144",
        flexShrink: 0,
        opacity: light ? 1 : 0.96,
      }}
    >
      <Image
        src="/images/astroleet-logo.png"
        alt="Astroleet"
        width={1225}
        height={144}
        priority
        sizes="(max-width: 600px) 168px, 190px"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </Box>
  )
}
