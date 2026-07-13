"use client"

import { Box } from "@mui/material"

type BackgroundVideoProps = {
  src: string
  poster: string
  objectPosition?: string | { xs?: string; sm?: string; md?: string }
}

export default function BackgroundVideo({
  src,
  poster,
  objectPosition = "center center",
}: BackgroundVideoProps) {
  return (
    <Box
      component="video"
      className="background-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition,
        pointerEvents: "none",
      }}
    >
      <source src={src} type="video/mp4" />
    </Box>
  )
}
