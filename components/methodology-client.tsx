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
import PageShell from "@/components/page-shell"
import { colors } from "@/lib/theme"

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
      <Box sx={{ borderBottom: `1px solid ${colors.line}`, bgcolor: "background.paper" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Chip
            icon={<SatelliteAltIcon sx={{ fontSize: 16 }} />}
            label="Methodology & data sources"
            size="small"
            sx={{ bgcolor: colors.blueSoft, color: colors.blueDark, mb: 2, "& .MuiChip-icon": { color: colors.blueDark } }}
          />
          <Typography variant="h2" sx={{ fontSize: { xs: "2.1rem", md: "2.8rem" }, maxWidth: 760 }}>
            Transparent by design, verifiable by default.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2.5, fontWeight: 400, color: "text.secondary", maxWidth: 680, lineHeight: 1.6 }}>
            Astroleat combines multiple open Earth-observation missions into consistent
            regional indicators. Every value can be traced back to its sensor, processing step
            and known limitations.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {/* Metric definitions */}
        <SectionHeading icon={<LayersIcon />} overline="Indicators" title="What each metric means" />
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {METRIC_DOCS.map((m) => (
            <Grid size={{ xs: 12, md: 4 }} key={m.title}>
              <Card sx={{ p: 3, height: "100%", borderTop: `4px solid ${m.color}` }}>
                <Typography variant="h6">{m.title}</Typography>
                <Box
                  sx={{
                    my: 1.5,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: colors.sandSoft,
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
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {PIPELINE.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.step}>
              <Box sx={{ height: "100%", p: 2.5, borderRadius: 3, border: `1px solid ${colors.line}`, bgcolor: "background.paper" }}>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "var(--font-mono)", color: "primary.main", fontWeight: 700 }}
                >
                  {p.step}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>
                  {p.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", lineHeight: 1.55 }}>
                  {p.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Data sources table */}
        <SectionHeading icon={<SatelliteAltIcon />} overline="Provenance" title="Data sources" />
        <Card sx={{ mb: 8, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.sandSoft }}>
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
                    <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{s.provider}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{s.use}</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-mono)", color: "text.secondary" }}>{s.resolution}</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-mono)", color: "text.secondary" }}>{s.cadence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Uncertainty */}
        <Card sx={{ p: { xs: 3, md: 4 }, bgcolor: colors.greenSoft, border: `1px solid ${colors.green}33` }}>
          <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: "center" }}>
            <VerifiedOutlinedIcon sx={{ color: colors.greenDark }} />
            <Typography variant="h6" sx={{ color: colors.greenDark }}>
              Uncertainty & responsible use
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colors.ink, lineHeight: 1.7, maxWidth: 820 }}>
            Satellite retrievals carry uncertainty from atmospheric conditions, sensor
            calibration, mixed pixels and interpolation. Regional aggregates mask
            within-region variability. Astroleat is intended for situational awareness and
            planning; operational decisions should be validated against in-situ measurements
            and local expertise. The values shown in this demonstration are synthesised to
            reflect Morocco&apos;s north–south aridity gradient and are not live observations.
          </Typography>
        </Card>

        <Divider sx={{ my: 5 }} />
        <Typography variant="caption" color="text.secondary">
          Region geometries: geoBoundaries (Open) ADM1 for Morocco. Sensor descriptions
          reference publicly documented mission specifications.
        </Typography>
      </Container>
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
      <Typography variant="h4" sx={{ mt: 0.5 }}>
        {title}
      </Typography>
    </Box>
  )
}
