import { describe, expect, it } from "vitest"
import {
  isPointInsideMorocco,
  MOROCCO_GEOGRAPHIC_BOUNDS,
  regionForMoroccoPoint,
} from "../../lib/domain/morocco-geography"

describe("Morocco geography", () => {
  it("derives bounds from the complete regional geometry", () => {
    expect(MOROCCO_GEOGRAPHIC_BOUNDS.south).toBeLessThan(22)
    expect(MOROCCO_GEOGRAPHIC_BOUNDS.north).toBeGreaterThan(35)
    expect(MOROCCO_GEOGRAPHIC_BOUNDS.west).toBeLessThan(-17)
    expect(MOROCCO_GEOGRAPHIC_BOUNDS.east).toBeGreaterThan(-1.1)
  })

  it("identifies points through the regional polygons", () => {
    expect(regionForMoroccoPoint(31.63, -8)).toBe("Marrakech-Safi")
    expect(regionForMoroccoPoint(33.57, -7.59)).toBe("Casablanca-Settat")
    expect(isPointInsideMorocco(23.7, -15)).toBe(true)
  })

  it("rejects points outside Morocco even when coordinates are globally valid", () => {
    expect(regionForMoroccoPoint(40, -8)).toBeNull()
    expect(isPointInsideMorocco(31.63, 10)).toBe(false)
  })
})
