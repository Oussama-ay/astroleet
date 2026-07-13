declare module "d3-geo" {
  export interface GeoProjection {
    (coordinates: [number, number]): [number, number] | null
    fitExtent(extent: [[number, number], [number, number]], object: unknown): this
  }

  export function geoMercator(): GeoProjection
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
    onClick?: () => void
    tabIndex?: number
    style?: Record<string, Record<string, unknown>>
  }): React.ReactElement

  export function Marker(
    props: React.PropsWithChildren<{
      coordinates: [number, number]
    }>,
  ): React.ReactElement
}
