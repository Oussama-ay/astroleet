import geoData from "../morocco-regions.json"

type Position = [number, number]
type PolygonCoordinates = Position[][]
type MoroccoGeometry =
  | { type: "Polygon"; coordinates: PolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: PolygonCoordinates[] }

interface MoroccoFeature {
  properties: { name: string }
  geometry: MoroccoGeometry
}

const features = geoData.features as unknown as MoroccoFeature[]

export const MOROCCO_GEOGRAPHIC_BOUNDS = calculateBounds(features)

export function regionForMoroccoPoint(latitude: number, longitude: number) {
  const point: Position = [longitude, latitude]
  return (
    features.find((feature) => pointInGeometry(point, feature.geometry))?.properties.name ??
    null
  )
}

export function isPointInsideMorocco(latitude: number, longitude: number) {
  return regionForMoroccoPoint(latitude, longitude) !== null
}

function calculateBounds(source: MoroccoFeature[]) {
  let south = Number.POSITIVE_INFINITY
  let west = Number.POSITIVE_INFINITY
  let north = Number.NEGATIVE_INFINITY
  let east = Number.NEGATIVE_INFINITY

  for (const feature of source) {
    visitPositions(feature.geometry.coordinates, ([longitude, latitude]) => {
      south = Math.min(south, latitude)
      west = Math.min(west, longitude)
      north = Math.max(north, latitude)
      east = Math.max(east, longitude)
    })
  }

  return { south, west, north, east }
}

function visitPositions(value: unknown, visit: (position: Position) => void) {
  if (!Array.isArray(value)) return
  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    visit(value as Position)
    return
  }
  value.forEach((child) => visitPositions(child, visit))
}

function pointInGeometry(point: Position, geometry: MoroccoGeometry) {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
  return polygons.some((polygon) => pointInPolygon(point, polygon))
}

function pointInPolygon(point: Position, rings: PolygonCoordinates) {
  if (!rings[0] || !pointInRing(point, rings[0])) return false
  return rings.slice(1).every((hole) => !pointInRing(point, hole))
}

function pointInRing([x, y]: Position, ring: Position[]) {
  let inside = false

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [currentX, currentY] = ring[index]
    const [previousX, previousY] = ring[previous]
    const crosses =
      currentY > y !== previousY > y &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX
    if (crosses) inside = !inside
  }

  return inside
}
