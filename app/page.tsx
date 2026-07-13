"use client"

import Link from "next/link"
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
} from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt"
import GrassIcon from "@mui/icons-material/Grass"
import WaterDropIcon from "@mui/icons-material/WaterDrop"
import ThermostatIcon from "@mui/icons-material/Thermostat"
import PageShell from "@/components/page-shell"
import { colors } from "@/lib/theme"

const PILLARS = [
  {
    icon: <GrassIcon />,
    title: "Vegetation vigour",
    text: "NDVI from multispectral reflectance to track canopy health and biomass over time.",
    tint: colors.greenSoft,
    fg: colors.greenDark,
  },
  {
    icon: <WaterDropIcon />,
    title: "Soil moisture",
    text: "Root-zone water content from microwave radiometry and reanalysis blends.",
    tint: colors.blueSoft,
    fg: colors.blueDark,
  },
  {
    icon: <ThermostatIcon />,
    title: "Surface temperature",
    text: "Thermal-infrared land surface temperature as a proxy for evaporative stress.",
    tint: "#F3E7D0",
    fg: colors.amber,
  },
]

export default function HomePage() {
  return (
    <PageShell>
      {/* Hero */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                icon={<SatelliteAltIcon sx={{ fontSize: 18 }} />}
                label="Earth observation for Morocco"
                sx={{
                  bgcolor: colors.blueSoft,
                  color: colors.blueDark,
                  mb: 3,
                  "& .MuiChip-icon": { color: colors.blueDark },
                }}
              />
              <Typography variant="h1" sx={{ fontSize: { xs: "2.4rem", md: "3.4rem" } }}>
                Environmental intelligence you can{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  verify
                </Box>
                .
              </Typography>
              <Typography
                variant="h6"
                sx={{ mt: 3, color: "text.secondary", fontWeight: 400, maxWidth: 520, lineHeight: 1.6 }}
              >
                Astroleat transforms satellite data into transparent measures of vegetation,
                soil moisture and land surface temperature — mapped across every region of
                Morocco.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  Explore the dashboard
                </Button>
                <Button component={Link} href="/methodology" variant="outlined" size="large">
                  How it works
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  border: `1px solid ${colors.line}`,
                  boxShadow: "0 24px 60px -30px rgba(15,95,166,0.45)",
                  aspectRatio: "4 / 3",
                }}
              >
                <Box
                  component="img"
                  src="/images/morocco-satellite.png"
                  alt="Satellite view of Morocco showing the Atlas mountains, agricultural valleys and desert plains"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 16,
                    bottom: 16,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: "rgba(22,36,44,0.72)",
                    backdropFilter: "blur(4px)",
                    color: "#EAF2EF",
                  }}
                >
                  <Typography variant="caption" sx={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                    MAR · 12 regions · multi-sensor composite
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Pillars */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          What we measure
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, mb: 4, maxWidth: 560 }}>
          Three grounded indicators, one coherent picture of land condition.
        </Typography>
        <Grid container spacing={3}>
          {PILLARS.map((p) => (
            <Grid size={{ xs: 12, md: 4 }} key={p.title}>
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: `1px solid ${colors.line}`,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: p.tint,
                    color: p.fg,
                    mb: 2,
                  }}
                >
                  {p.icon}
                </Box>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", lineHeight: 1.6 }}>
                  {p.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PageShell>
  )
}
