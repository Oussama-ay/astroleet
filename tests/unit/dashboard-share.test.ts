import { describe, expect, it } from "vitest"
import {
  buildDashboardShareUrl,
  parseDashboardShareSearchParams,
  serializeDashboardShareState,
  type DashboardShareState,
} from "../../lib/domain/dashboard-share"

const radiusState: DashboardShareState = {
  regionName: "Béni Mellal-Khénifra",
  metric: "lst",
  historyYears: 5,
  location: {
    mode: "radius",
    label: "a 100 km radius around 33.5700, -7.5900",
    latitude: 33.57,
    longitude: -7.59,
    radiusKm: 100,
  },
}

describe("dashboard share state", () => {
  it("round-trips a radius analysis through URL parameters", () => {
    const params = serializeDashboardShareState(radiusState)
    const parsed = parseDashboardShareSearchParams(Object.fromEntries(params))

    expect(parsed).toEqual(radiusState)
    expect(buildDashboardShareUrl("https://astroleet.example/path", radiusState)).toBe(
      `https://astroleet.example/dashboard?${params.toString()}`,
    )
  })

  it("restores regional views from canonical region metadata", () => {
    const parsed = parseDashboardShareSearchParams({
      view: "1",
      region: "Marrakech-Safi",
      metric: "moisture",
      history: "3",
      mode: "region",
    })

    expect(parsed).toMatchObject({
      regionName: "Marrakech-Safi",
      metric: "moisture",
      historyYears: 3,
      location: { mode: "region", latitude: 31.6, longitude: -8 },
    })
  })

  it("rejects malformed or unsupported shared views", () => {
    expect(parseDashboardShareSearchParams({})).toBeNull()
    expect(
      parseDashboardShareSearchParams({
        view: "1",
        region: "Marrakech-Safi",
        metric: "ndvi",
        history: "25",
        mode: "point",
        latitude: "91",
        longitude: "-8",
      }),
    ).toBeNull()
  })
})
