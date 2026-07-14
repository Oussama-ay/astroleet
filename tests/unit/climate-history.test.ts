import { describe, expect, it } from "vitest"
import { getCompletedClimateHistoryPeriod } from "../../lib/domain/climate-history"

describe("climate history period", () => {
  it("ends at the latest complete UTC year", () => {
    const now = new Date("2026-07-14T00:00:00.000Z")

    expect(getCompletedClimateHistoryPeriod(1, now)).toEqual({ start: 2025, end: 2025 })
    expect(getCompletedClimateHistoryPeriod(5, now)).toEqual({ start: 2021, end: 2025 })
    expect(getCompletedClimateHistoryPeriod(10, now)).toEqual({ start: 2016, end: 2025 })
  })
})
