import { METRICS, type MetricKey } from "./data"

// Sequential color ramps per metric (light -> saturated), themed blue/green/sand.
const RAMPS: Record<MetricKey, string[]> = {
  // vegetation: sand -> green
  ndvi: ["#EFE6D2", "#CDE3CE", "#93C6A6", "#4F9E77", "#1F6650"],
  // moisture: sand -> blue
  moisture: ["#F0E7D4", "#CFE0EE", "#8FBBDD", "#3E82B8", "#0B4478"],
  // temperature: cool -> warm (blue -> sand -> amber)
  lst: ["#CFE0EE", "#E4E1CF", "#E9CF97", "#D79A3C", "#A85E14"],
}

export function colorFor(metric: MetricKey, value: number): string {
  const def = METRICS[metric]
  const ramp = RAMPS[metric]
  const t = clamp((value - def.min) / (def.max - def.min), 0, 1)
  const idx = t * (ramp.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, ramp.length - 1)
  return mix(ramp[lo], ramp[hi], idx - lo)
}

export function rampStops(metric: MetricKey): string[] {
  return RAMPS[metric]
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function mix(a: string, b: string, t: number) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t)
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t)
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}
