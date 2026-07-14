// Deterministic mock environmental data for Astroleet.
// Values are synthesised from a seeded generator so the dashboard is stable
// across renders while remaining representative of Moroccan agro-climatic zones.

export type MetricKey = "ndvi" | "moisture" | "lst"

export interface MetricDef {
  key: MetricKey
  label: string
  short: string
  unit: string
  description: string
  // domain used for choropleth + gauges
  min: number
  max: number
  // higher is better?
  goodHigh: boolean
}

export const METRICS: Record<MetricKey, MetricDef> = {
  ndvi: {
    key: "ndvi",
    label: "Vegetation Index (NDVI)",
    short: "Vegetation",
    unit: "",
    description:
      "Normalised Difference Vegetation Index derived from multispectral satellite reflectance. Tracks canopy vigour and biomass.",
    min: 0.05,
    max: 0.8,
    goodHigh: true,
  },
  moisture: {
    key: "moisture",
    label: "Soil Moisture",
    short: "Soil Moisture",
    unit: "%",
    description:
      "Volumetric water content in the root zone, retrieved from passive microwave radiometry and reanalysis.",
    min: 5,
    max: 45,
    goodHigh: true,
  },
  lst: {
    key: "lst",
    label: "Land Surface Temperature",
    short: "Surface Temp",
    unit: "°C",
    description:
      "Daytime land surface temperature from thermal infrared bands, a proxy for heat and evaporative stress.",
    min: 14,
    max: 44,
    goodHigh: false,
  },
}

export interface Region {
  name: string
  lat: number
  lon: number
  zone: string
}

// The 12 administrative regions of Morocco (matching the map GeoJSON names).
export const REGIONS: Region[] = [
  { name: "Tangier-Tetouan-Al Hoceima", lat: 35.2, lon: -5.4, zone: "Mediterranean north" },
  { name: "Oriental", lat: 34.0, lon: -2.5, zone: "Eastern highlands & steppe" },
  { name: "Fez-Meknes", lat: 33.8, lon: -4.6, zone: "Middle Atlas" },
  { name: "Rabat-Salé-Kenitra", lat: 34.2, lon: -6.3, zone: "Atlantic coastal plain" },
  { name: "Béni Mellal-Khénifra", lat: 32.5, lon: -6.0, zone: "Tadla irrigated plain" },
  { name: "Casablanca-Settat", lat: 33.2, lon: -7.4, zone: "Central Atlantic plain" },
  { name: "Marrakech-Safi", lat: 31.6, lon: -8.0, zone: "Haouz & High Atlas" },
  { name: "Drâa-Tafilalet", lat: 31.3, lon: -5.3, zone: "Pre-Saharan oases" },
  { name: "Souss-Massa", lat: 30.4, lon: -8.6, zone: "Souss agricultural basin" },
  { name: "Guelmim-Oued Noun", lat: 28.9, lon: -10.0, zone: "Semi-arid south" },
  { name: "Laâyoune-Sakia El Hamra", lat: 27.1, lon: -13.0, zone: "Saharan coast" },
  { name: "Dakhla-Oued Ed-Dahab", lat: 23.7, lon: -15.0, zone: "Deep Sahara" },
]

// aridity increases from north to south -> use latitude to shape values
function seeded(seed: number) {
  const s = Math.sin(seed) * 10000
  return s - Math.floor(s)
}

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffff
  return h
}

export interface RegionMetrics {
  ndvi: number
  moisture: number
  lst: number
}

export function metricsForRegion(region: Region): RegionMetrics {
  // north (lat ~35) greener/cooler, south (lat ~23) drier/hotter
  const aridity = clamp((35.5 - region.lat) / 12, 0, 1)
  const jitter = seeded(hash(region.name))
  const ndvi = round(lerp(0.62, 0.09, aridity) + (jitter - 0.5) * 0.12, 2)
  const moisture = round(lerp(38, 7, aridity) + (jitter - 0.5) * 6, 1)
  const lst = round(lerp(22, 40, aridity) + (jitter - 0.5) * 4, 1)
  return {
    ndvi: clamp(ndvi, 0.05, 0.8),
    moisture: clamp(moisture, 5, 45),
    lst: clamp(lst, 14, 44),
  }
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// 12-month synthetic history with a seasonal signal (wet winters, dry summers).
export function historyForRegion(region: Region, metric: MetricKey): number[] {
  const base = metricsForRegion(region)[metric]
  const def = METRICS[metric]
  const phase = hash(region.name + metric) % 6
  return MONTHS.map((_, i) => {
    // seasonal curve: peak vegetation/moisture in late winter/spring, temp peaks summer
    const season = Math.cos(((i - 2) / 12) * 2 * Math.PI)
    const amp = (def.max - def.min) * 0.16
    const dir = metric === "lst" ? -1 : 1
    const wobble = (seeded(hash(region.name) + i + phase) - 0.5) * amp * 0.5
    const v = base + dir * season * amp + wobble
    return clamp(round(v, metric === "ndvi" ? 2 : 1), def.min, def.max)
  })
}

// Evidence-based recommendation engine driven by the region's current metrics.
export interface Recommendation {
  id: string
  title: string
  detail: string
  severity: "high" | "medium" | "info"
  basis: string
}

export function recommendationsForRegion(region: Region): Recommendation[] {
  const m = metricsForRegion(region)
  const recs: Recommendation[] = []

  if (m.moisture < 15) {
    recs.push({
      id: "irrigation",
      title: "Prioritise deficit irrigation scheduling",
      detail:
        "Root-zone moisture is below the 15% stress threshold. Shift to early-morning drip cycles and mulch bare soil to cut evaporative losses.",
      severity: "high",
      basis: "Soil moisture " + m.moisture + "% vs. 15% wilting-risk threshold",
    })
  } else if (m.moisture < 25) {
    recs.push({
      id: "irrigation-monitor",
      title: "Monitor irrigation demand weekly",
      detail:
        "Moisture is adequate but trending toward stress. Track evapotranspiration and pre-position water allocations.",
      severity: "medium",
      basis: "Soil moisture " + m.moisture + "% within cautionary band",
    })
  }

  if (m.ndvi < 0.25) {
    recs.push({
      id: "revegetation",
      title: "Target degraded land for revegetation",
      detail:
        "Low canopy vigour indicates sparse cover. Prioritise drought-tolerant species and windbreaks to reduce erosion.",
      severity: "high",
      basis: "NDVI " + m.ndvi + " indicates low biomass",
    })
  } else if (m.ndvi > 0.5) {
    recs.push({
      id: "yield",
      title: "Protect high-productivity cropland",
      detail:
        "Strong vegetation vigour. Maintain soil health practices and guard against over-abstraction of groundwater.",
      severity: "info",
      basis: "NDVI " + m.ndvi + " reflects healthy canopy",
    })
  }

  if (m.lst > 34) {
    recs.push({
      id: "heat",
      title: "Deploy heat-stress mitigation",
      detail:
        "Elevated surface temperature raises crop and livestock heat stress. Increase shading, adjust planting calendars, and protect water points.",
      severity: "high",
      basis: "Surface temperature " + m.lst + "°C exceeds 34°C stress line",
    })
  }

  recs.push({
    id: "verify",
    title: "Validate with in-situ sampling",
    detail:
      "Cross-check satellite retrievals against ground stations before operational decisions to constrain uncertainty.",
    severity: "info",
    basis: "Standard remote-sensing verification protocol",
  })

  return recs
}

// helpers
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}
function round(v: number, d: number) {
  const f = Math.pow(10, d)
  return Math.round(v * f) / f
}

export function formatMetric(metric: MetricKey, value: number) {
  const def = METRICS[metric]
  return metric === "ndvi" ? value.toFixed(2) : value.toFixed(1) + def.unit
}
