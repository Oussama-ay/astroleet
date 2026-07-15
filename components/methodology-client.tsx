"use client"

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt"
import LayersIcon from "@mui/icons-material/Layers"
import RuleIcon from "@mui/icons-material/Rule"
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined"
import BackgroundVideo from "@/components/background-video"
import PageShell from "@/components/page-shell"
import { colors } from "@/lib/theme"
import DataStatusBadge from "@/components/data-status-badge"

const PIPELINE = [
  {
    step: "01",
    title: "Acquisition",
    text: "Multispectral, thermal-infrared and passive-microwave observations are ingested as calibrated top-of-atmosphere and brightness-temperature products.",
  },
  {
    step: "02",
    title: "Correction",
    text: "Atmospheric correction, cloud and cloud-shadow masking, and geometric co-registration produce analysis-ready surface reflectance and temperature.",
  },
  {
    step: "03",
    title: "Indicator retrieval",
    text: "NDVI, root-zone soil moisture and land surface temperature are computed per pixel, then aggregated to regional zonal statistics.",
  },
  {
    step: "04",
    title: "Composite & QA",
    text: "Monthly best-pixel composites reduce noise; quality flags and in-situ cross-checks constrain uncertainty before publication.",
  },
]

const SOURCES = [
  {
    name: "Sentinel-2 MSI",
    provider: "Copernicus / ESA",
    use: "Surface reflectance for NDVI",
    resolution: "10–20 m",
    cadence: "5-day",
  },
  {
    name: "MODIS (Terra/Aqua)",
    provider: "NASA",
    use: "Land surface temperature",
    resolution: "1 km",
    cadence: "Daily",
  },
  {
    name: "SMAP L-band",
    provider: "NASA",
    use: "Surface & root-zone soil moisture",
    resolution: "9 km",
    cadence: "2–3 day",
  },
  {
    name: "ERA5-Land",
    provider: "ECMWF / Copernicus",
    use: "Reanalysis blending & gap-fill",
    resolution: "9 km",
    cadence: "Hourly",
  },
  {
    name: "geoBoundaries ADM1",
    provider: "W&M geoLab",
    use: "Administrative region boundaries",
    resolution: "Vector",
    cadence: "Static",
  },
]

const METRIC_DOCS = [
  {
    title: "Vegetation Index (NDVI)",
    formula: "NDVI = (NIR − Red) / (NIR + Red)",
    text: "Ranges from about 0 (bare soil) to 0.8 (dense canopy). Sensitive to chlorophyll and leaf area, making it a robust proxy for vegetation vigour and phenology.",
    color: colors.green,
  },
  {
    title: "Soil Moisture",
    formula: "θ = f(T_b, vegetation optical depth)",
    text: "Volumetric water content retrieved from L-band brightness temperature and blended with reanalysis. Reported as percent of soil volume in the root zone.",
    color: colors.blue,
  },
  {
    title: "Land Surface Temperature",
    formula: "LST = f(TIR radiance, emissivity)",
    text: "Derived from thermal-infrared radiance corrected for surface emissivity. A daytime proxy for surface heat load and evaporative demand.",
    color: colors.amber,
  },
]

export default function MethodologyClient() {
  return (
    <PageShell>
      {/* Intro */}
      <Box
        component="section"
        sx={{
          position: "relative",
          minHeight: { xs: 560, md: 510 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          borderBottom: `1px solid ${colors.line}`,
          bgcolor: "#090B0C",
          backgroundImage: "url('/images/methodology-atlas-background.png')",
          backgroundSize: "cover",
          backgroundPosition: { xs: "64% center", md: "center 48%" },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(5,6,7,0.16) 0%, rgba(5,6,7,0.38) 42%, rgba(5,6,7,0.96) 100%), linear-gradient(90deg, rgba(5,6,7,0.84) 0%, rgba(5,6,7,0.14) 76%)",
          },
        }}
      >
        <BackgroundVideo
          src="/videos/methodology-morocco.mp4"
          poster="/images/methodology-atlas-background.png"
          objectPosition={{ xs: "62% center", md: "center 48%" }}
        />
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            pt: { xs: 11, md: 0 },
            pb: { xs: 5, md: 6 },
          }}
        >
          <Chip
            icon={<SatelliteAltIcon sx={{ fontSize: 16 }} />}
            label="Methodology & data sources"
            size="small"
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.34)", color: "rgba(255,255,255,0.76)", mb: 2, "& .MuiChip-icon": { color: colors.blue } }}
          />
          <Typography component="h1" variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "4rem" }, maxWidth: 880, textTransform: "uppercase", lineHeight: 1 }}>
            Transparent by design, verifiable by default.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2.5, fontWeight: 400, color: "rgba(255,255,255,0.72)", maxWidth: 680, lineHeight: 1.6 }}>
            Astroleet combines multiple open Earth-observation missions into consistent
            regional indicators. Every value can be traced back to its sensor, processing step
            and known limitations.
          </Typography>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "clip",
          bgcolor: "#050607",
          backgroundImage: "url('/images/methodology-atlas-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
      <Box
        aria-hidden="true"
        sx={{
          position: "sticky",
          top: 0,
          height: "100svh",
          mb: "-100svh",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <BackgroundVideo
          src="/videos/methodology-morocco.mp4"
          poster="/images/methodology-atlas-background.png"
          objectPosition={{ xs: "58% center", md: "center center" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(5,6,7,0.89), rgba(5,6,7,0.95))",
          }}
        />
      </Box>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 } }}>
        {/* Metric definitions */}
        <SectionHeading icon={<LayersIcon />} overline="Indicators" title="What each metric means" />
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {METRIC_DOCS.map((m) => (
            <Grid size={{ xs: 12, md: 4 }} key={m.title}>
              <Card sx={{ p: 3, height: "100%", borderTop: `3px solid ${m.color}`, bgcolor: "#090B0C" }}>
                <Typography variant="h6">{m.title}</Typography>
                <Box
                  sx={{
                    my: 1.5,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 0,
                    bgcolor: "#050607",
                    border: `1px solid ${colors.line}`,
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "text.primary",
                  }}
                >
                  {m.formula}
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  {m.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pipeline */}
        <SectionHeading icon={<RuleIcon />} overline="Processing" title="From raw radiance to regional indicators" />
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          sx={{
            mb: 8,
            position: "relative",
            "&::before": {
              content: '""',
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: 31,
              left: "12.5%",
              right: "12.5%",
              height: 1,
              bgcolor: colors.blue,
              opacity: 0.45,
            },
          }}
        >
          {PIPELINE.map((p, index) => (
            <Grid size={{ xs: 12, md: 3 }} key={p.step}>
              <Box sx={{ position: "relative", height: "100%", pl: { xs: 9.5, md: 0 } }}>
                <Box
                  sx={{
                    position: { xs: "absolute", md: "relative" },
                    left: { xs: 0, md: "auto" },
                    top: 0,
                    zIndex: 1,
                    width: 62,
                    height: 62,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#090B0C",
                    border: `1px solid ${colors.blue}`,
                    fontFamily: "var(--font-mono)",
                    color: colors.blueDark,
                    fontWeight: 700,
                  }}
                >
                  {p.step}
                </Box>
                <Box
                  sx={{
                    height: "100%",
                    mt: { md: 2 },
                    p: { xs: 2, md: 2.5 },
                    border: `1px solid ${colors.line}`,
                    bgcolor: "#090B0C",
                    "&::before": {
                      content: '""',
                      display: { xs: index === PIPELINE.length - 1 ? "none" : "block", md: "none" },
                      position: "absolute",
                      left: 30,
                      top: 62,
                      bottom: -16,
                      width: 1,
                      bgcolor: colors.blue,
                      opacity: 0.42,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary", lineHeight: 1.6 }}>
                    {p.text}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Data sources table */}
        <SectionHeading icon={<SatelliteAltIcon />} overline="Provenance" title="Data sources" />
        <Card sx={{ mb: 8, overflow: "hidden", bgcolor: "#090B0C" }}>
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#111416" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Used for</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resolution</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cadence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SOURCES.map((s) => (
                  <TableRow key={s.name} hover>
                    <TableCell sx={{ py: 2.25, fontWeight: 600 }}>{s.name}</TableCell>
                    <TableCell sx={{ py: 2.25, color: "text.secondary" }}>{s.provider}</TableCell>
                    <TableCell sx={{ py: 2.25, color: "text.secondary" }}>{s.use}</TableCell>
                    <TableCell sx={{ py: 2.25, fontFamily: "var(--font-mono)", color: "text.secondary" }}>{s.resolution}</TableCell>
                    <TableCell sx={{ py: 2.25, fontFamily: "var(--font-mono)", color: "text.secondary" }}>{s.cadence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Uncertainty */}
        <Card sx={{ p: { xs: 3, md: 4 }, bgcolor: "#0C1713", border: `1px solid ${colors.green}55` }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: "center" }}>
            <VerifiedOutlinedIcon sx={{ color: colors.greenDark }} />
            <Typography variant="h6" sx={{ color: colors.greenDark, textTransform: "uppercase" }}>
              Uncertainty & responsible use
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 820 }}>
            Satellite retrievals carry uncertainty from atmospheric conditions, sensor
            calibration, mixed pixels and interpolation. Regional aggregates mask
            within-region variability. Astroleet is intended for situational awareness and
            planning; operational decisions should be validated against in-situ measurements
            and local expertise.
          </Typography>
          <Box
            role="note"
            sx={{
              mt: 3,
              p: { xs: 2, md: 2.5 },
              bgcolor: "rgba(231,168,75,0.08)",
              border: "1px dashed rgba(231,168,75,0.58)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "#F0BE75" }}>
                  Demonstration disclosure
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, maxWidth: 740, fontWeight: 700 }}>
                  Values shown in the experimental layers are synthesised and are not live
                  observations.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  They model Morocco&apos;s north–south aridity gradient for interface exploration.
                </Typography>
              </Box>
              <DataStatusBadge status="synthetic" label="Demo / non-operational" />
            </Stack>
          </Box>
        </Card>

        <Divider sx={{ my: 5 }} />
        <Typography variant="caption" color="text.secondary">
          Region geometries: geoBoundaries (Open) ADM1 for Morocco. Sensor descriptions
          reference publicly documented mission specifications.
        </Typography>
      </Container>
      </Box>
    </PageShell>
  )
}

function SectionHeading({
  icon,
  overline,
  title,
}: {
  icon: React.ReactNode
  overline: string
  title: string
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "secondary.main" }}>
        {icon}
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          {overline}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ mt: 0.5, textTransform: "uppercase", letterSpacing: 0 }}>
        {title}
      </Typography>
    </Box>
  )
}
