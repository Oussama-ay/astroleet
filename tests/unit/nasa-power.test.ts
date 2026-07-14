import { describe, expect, it, vi } from "vitest"
import {
  NASA_POWER_CACHE_SECONDS,
  fetchNasaPowerClimate,
} from "../../lib/server/providers/nasa-power"

const query = { latitude: 31.63, longitude: -8, start: 2025, end: 2025 }
const processedAt = new Date("2026-01-02T00:00:00.000Z")

const responsePayload = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [-8, 31.63, 836.94] },
  properties: {
    parameter: {
      T2M: { "202501": 11.77, "202502": 12.27, "202513": 20.02 },
      PRECTOTCORR: { "202501": 0.43, "202502": -999, "202513": 0.86 },
      RH2M: { "202501": 44.31, "202502": 48.15, "202513": 45.52 },
    },
  },
  header: {
    api: { version: "v2.9.7", name: "POWER Monthly and Annual API" },
    fill_value: -999,
  },
  parameters: {
    T2M: { units: "C", longname: "Temperature at 2 Meters" },
    PRECTOTCORR: { units: "mm/day", longname: "Precipitation Corrected" },
    RH2M: { units: "%", longname: "Relative Humidity at 2 Meters" },
  },
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("NASA POWER provider", () => {
  it("requests monthly agroclimatology data with a revalidated cache", async () => {
    const fetcher = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        void input
        void init
        return jsonResponse(responsePayload)
      },
    )

    const result = await fetchNasaPowerClimate(query, {
      fetcher,
      now: () => processedAt,
    })

    const [url, init] = fetcher.mock.calls[0]
    expect(String(url)).toContain("/api/temporal/monthly/point?")
    expect(String(url)).toContain("parameters=T2M%2CPRECTOTCORR%2CRH2M")
    expect(String(url)).toContain("community=AG")
    expect(init).toMatchObject({ next: { revalidate: NASA_POWER_CACHE_SECONDS } })
    expect(result.series.map((series) => series.parameter)).toEqual([
      "air_temperature",
      "precipitation",
      "relative_humidity",
    ])
  })

  it("normalizes provenance, units, annual keys, and missing values", async () => {
    const result = await fetchNasaPowerClimate(query, {
      fetcher: async () => jsonResponse(responsePayload),
      now: () => processedAt,
    })

    const temperature = result.series[0]
    const precipitation = result.series[1]

    expect(temperature).toMatchObject({
      parameter: "air_temperature",
      unit: "°C",
      status: "cached",
      source: { provider: "NASA POWER", version: "v2.9.7" },
      coverage: { type: "point", latitude: 31.63, longitude: -8 },
    })
    expect(temperature.values).toHaveLength(2)
    expect(precipitation.values[1]).toMatchObject({
      value: null,
      quality: { status: "missing", flags: ["provider-fill-value"] },
    })
  })

  it("maps provider throttling and malformed payloads to safe errors", async () => {
    await expect(
      fetchNasaPowerClimate(query, { fetcher: async () => jsonResponse({}, 429) }),
    ).rejects.toMatchObject({ code: "rate_limited", upstreamStatus: 429 })

    await expect(
      fetchNasaPowerClimate(query, { fetcher: async () => jsonResponse({}) }),
    ).rejects.toMatchObject({ code: "invalid_response" })
  })
})
