declare module "d3-geo" {
  export interface GeoProjection {
    (coordinates: [number, number]): [number, number] | null
    fitExtent(extent: [[number, number], [number, number]], object: unknown): this
    invert?(point: [number, number]): [number, number] | null
  }

  export interface GeoCircleGenerator {
    (): unknown
    center(coordinates: [number, number]): this
    radius(angle: number): this
    precision(precision: number): this
  }

  export interface GeoPathGenerator {
    (object: unknown): string | null
  }

  export function geoCircle(): GeoCircleGenerator
  export function geoMercator(): GeoProjection
  export function geoPath(projection?: GeoProjection): GeoPathGenerator
}

declare module "react-simple-maps" {
  import type * as React from "react"

  export interface GeographyFeature {
    rsmKey: string
    properties: Record<string, unknown>
  }

  export function ComposableMap(
    props: React.PropsWithChildren<{
      projection?: unknown
      width?: number
      height?: number
      style?: React.CSSProperties
    }>,
  ): React.ReactElement

  export function Geographies(props: {
    geography: object
    children: (args: { geographies: GeographyFeature[] }) => React.ReactNode
  }): React.ReactElement

  export function Geography(props: {
    geography: GeographyFeature
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    onClick?: React.MouseEventHandler<SVGPathElement>
    "data-region-name"?: string
    tabIndex?: number
    style?: Record<string, Record<string, unknown>>
  }): React.ReactElement

  export function Marker(
    props: React.PropsWithChildren<{
      coordinates: [number, number]
    }>,
  ): React.ReactElement
}
