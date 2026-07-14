import { describe, expect, it } from "vitest"
import {
  parsePowerClimateSearchParams,
  parsePowerRadiusSearchParams,
} from "../../lib/validation/power"

const NOW = new Date("2026-07-14T00:00:00.000Z")

describe("NASA POWER request validation", () => {
  it("uses the latest complete year when dates are omitted", () => {
    const query = parsePowerClimateSearchParams(
      new URLSearchParams({ latitude: "31.63", longitude: "-8" }),
      NOW,
    )

    expect(query).toEqual({ latitude: 31.63, longitude: -8, start: 2025, end: 2025 })
  })

  it("rejects missing or out-of-range coordinates", () => {
    expect(() =>
      parsePowerClimateSearchParams(new URLSearchParams({ longitude: "-8" }), NOW),
    ).toThrow()
    expect(() =>
      parsePowerClimateSearchParams(
        new URLSearchParams({ latitude: "91", longitude: "-8" }),
        NOW,
      ),
    ).toThrow()
  })

  it("rejects future, reversed, and excessively large year ranges", () => {
    const base = { latitude: "31.63", longitude: "-8" }

    expect(() =>
      parsePowerClimateSearchParams(
        new URLSearchParams({ ...base, start: "2025", end: "2026" }),
        NOW,
      ),
    ).toThrow()
    expect(() =>
      parsePowerClimateSearchParams(
        new URLSearchParams({ ...base, start: "2025", end: "2024" }),
        NOW,
      ),
    ).toThrow()
    expect(() =>
      parsePowerClimateSearchParams(
        new URLSearchParams({ ...base, start: "2015", end: "2025" }),
        NOW,
      ),
    ).toThrow()
  })

  it("accepts only supported radius sample sizes", () => {
    const params = { latitude: "31.63", longitude: "-8", radiusKm: "100" }

    expect(parsePowerRadiusSearchParams(new URLSearchParams(params), NOW)).toEqual({
      latitude: 31.63,
      longitude: -8,
      radiusKm: 100,
      start: 2025,
      end: 2025,
    })
    expect(() =>
      parsePowerRadiusSearchParams(
        new URLSearchParams({ ...params, radiusKm: "25" }),
        NOW,
      ),
    ).toThrow()
    expect(() =>
      parsePowerRadiusSearchParams(
        new URLSearchParams({ latitude: "31.63", longitude: "-8" }),
        NOW,
      ),
    ).toThrow()
  })
})
