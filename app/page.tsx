"use client"

import Link from "next/link"
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import GrassIcon from "@mui/icons-material/Grass"
import WaterDropIcon from "@mui/icons-material/WaterDrop"
import ThermostatIcon from "@mui/icons-material/Thermostat"
import PageShell from "@/components/page-shell"
import { colors } from "@/lib/theme"

const PILLARS = [
  {
    number: "01",
    icon: <GrassIcon />,
    title: "Vegetation vigour",
    text: "NDVI from multispectral reflectance tracks canopy health and biomass across Morocco.",
  },
  {
    number: "02",
    icon: <WaterDropIcon />,
    title: "Soil moisture",
    text: "Root-zone water content combines microwave radiometry with reanalysis data.",
  },
  {
    number: "03",
    icon: <ThermostatIcon />,
    title: "Surface temperature",
    text: "Thermal-infrared land temperature reveals heat and evaporative stress.",
  },
]

export default function HomePage() {
  return (
    <PageShell>
      <Box
        component="section"
        aria-labelledby="hero-title"
        sx={{
          position: "relative",
          minHeight: { xs: "84svh", md: "88svh" },
          maxHeight: { md: 920 },
          height: { md: 840 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          bgcolor: "#050607",
          color: "#fff",
        }}
      >
        <Box
          component="video"
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/morocco-satellite.png"
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: { xs: "58% center", md: "center center" },
            zIndex: 0,
          }}
        >
          <source src="/videos/morocco-aerial.mp4" type="video/mp4" />
        </Box>

        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.16) 58%, rgba(0,0,0,0.82) 100%), linear-gradient(90deg, rgba(0,0,0,0.54) 0%, transparent 64%)",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            pb: { xs: 8, md: 10 },
          }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Typography
              variant="overline"
              component="p"
              sx={{
                mb: 1.5,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "0.14em",
                fontSize: { xs: "0.7rem", md: "0.76rem" },
              }}
            >
              Earth intelligence / Morocco
            </Typography>
            <Typography
              id="hero-title"
              component="h1"
              sx={{
                m: 0,
                maxWidth: 720,
                fontSize: { xs: "clamp(2.65rem, 12vw, 4.4rem)", md: "clamp(4.2rem, 6.7vw, 6.4rem)" },
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: 0,
                textTransform: "uppercase",
                textWrap: "balance",
                textShadow: "0 2px 24px rgba(0,0,0,0.32)",
              }}
            >
              Morocco, from orbit.
            </Typography>
            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 570,
                color: "rgba(255,255,255,0.82)",
                fontSize: { xs: "0.95rem", md: "1.08rem" },
                lineHeight: 1.65,
              }}
            >
              Satellite observations translated into clear measures of vegetation,
              water and heat across every region of the country.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5, alignItems: { xs: "stretch", sm: "center" } }}>
              <Button
                component={Link}
                href="/dashboard"
                className="hero-action"
                variant="outlined"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  minWidth: 230,
                  minHeight: 52,
                  borderRadius: 0,
                  borderColor: "rgba(255,255,255,0.86)",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.78rem",
                  "&:hover": { borderColor: "#fff", color: "#050607" },
                  "& > *": { position: "relative", zIndex: 1 },
                }}
              >
                Explore Morocco
              </Button>
              <Button
                component={Link}
                href="/methodology"
                size="large"
                sx={{ color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.75rem" }}
              >
                View methodology
              </Button>
            </Stack>
          </Box>

          <Box className="scroll-cue" aria-hidden="true" sx={{ position: "absolute", right: { xs: 24, md: 32 }, bottom: { xs: 34, md: 42 }, width: "1px", height: 58, bgcolor: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
            <Box sx={{ width: "100%", height: 24, bgcolor: "#fff" }} />
          </Box>

          <Typography
            component="a"
            href="https://www.pexels.com/video/aerial-view-of-a-landscape-at-sunset-3015516/"
            target="_blank"
            rel="noreferrer"
            variant="caption"
            sx={{
              position: "absolute",
              display: { xs: "none", md: "block" },
              right: { xs: 24, md: 56 },
              top: { xs: 24, md: 16 },
              color: "rgba(255,255,255,0.56)",
              textDecoration: "none",
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              "&:hover": { color: "#fff" },
            }}
          >
            Visual: Taryn Elliott / Pexels
          </Typography>
        </Container>
      </Box>

      <Box component="section" sx={{ bgcolor: "#0B0D0E", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <Container maxWidth="lg">
          <Grid container>
            {[
              ["12", "Regions mapped"],
              ["03", "Core indicators"],
              ["12 mo", "Observation window"],
            ].map(([value, label], index) => (
              <Grid
                size={{ xs: 12, sm: 4 }}
                key={label}
                sx={{
                  py: { xs: 2.5, md: 3.5 },
                  px: { sm: 3 },
                  borderLeft: { sm: index === 0 ? "none" : "1px solid rgba(255,255,255,0.12)" },
                  borderTop: { xs: index === 0 ? "none" : "1px solid rgba(255,255,255,0.12)", sm: "none" },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-mono)", fontSize: "1.35rem", fontWeight: 600 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.56)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          bgcolor: "#090B0C",
          color: colors.ink,
          py: { xs: 8, md: 12 },
          borderTop: `1px solid ${colors.line}`,
          backgroundImage:
            "linear-gradient(rgba(5,6,7,0.88), rgba(5,6,7,0.94)), url('/images/methodology-atlas-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundAttachment: { xs: "scroll", md: "fixed" },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.12em" }}>
                The signal
              </Typography>
              <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: "2.2rem", md: "3.4rem" }, lineHeight: 1.04, fontWeight: 700, letterSpacing: 0 }}>
                One clear view of changing land.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              {PILLARS.map((pillar, index) => (
                <Box
                  key={pillar.title}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "42px 1fr", sm: "64px 1fr" },
                    gap: { xs: 2, sm: 3 },
                    py: 3,
                    borderTop: `1px solid ${colors.line}`,
                    borderBottom: index === PILLARS.length - 1 ? `1px solid ${colors.line}` : "none",
                  }}
                >
                  <Box sx={{ color: colors.blue, pt: 0.25 }}>{pillar.icon}</Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "var(--font-mono)" }}>{pillar.number}</Typography>
                    <Typography variant="h5" sx={{ mt: 0.5, letterSpacing: 0 }}>{pillar.title}</Typography>
                    <Typography sx={{ mt: 1, maxWidth: 560, color: "text.secondary", lineHeight: 1.65 }}>{pillar.text}</Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageShell>
  )
}
