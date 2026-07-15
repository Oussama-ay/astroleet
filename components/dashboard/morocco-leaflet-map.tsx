"use client"

import * as React from "react"
import type { Feature, GeoJsonObject } from "geojson"
import type {
  Circle as LeafletCircle,
  CircleMarker as LeafletCircleMarker,
  Layer,
  LatLngExpression,
  LeafletMouseEvent,
  Path as LeafletPath,
} from "leaflet"
import { latLngBounds } from "leaflet"
import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
} from "react-leaflet"
import geoData from "@/lib/morocco-regions.json"
import {
  MOROCCO_GEOGRAPHIC_BOUNDS,
  regionForMoroccoPoint,
} from "@/lib/domain/morocco-geography"
import { METRICS, metricsForRegion, REGIONS, type MetricKey, formatMetric } from "@/lib/data"
import type { DashboardClimateLocation } from "@/lib/domain/dashboard-share"
import { colorFor } from "@/lib/scale"
import { colors } from "@/lib/theme"

interface Props {
  metric: MetricKey
  selected: string
  location: DashboardClimateLocation
  selectionMode: "region" | "point"
  onRegionSelect: (name: string) => void
  onPointSelect: (regionName: string, latitude: number, longitude: number) => void
}

const MOROCCO_BOUNDS = latLngBounds(
  [MOROCCO_GEOGRAPHIC_BOUNDS.south, MOROCCO_GEOGRAPHIC_BOUNDS.west],
  [MOROCCO_GEOGRAPHIC_BOUNDS.north, MOROCCO_GEOGRAPHIC_BOUNDS.east],
)
const PADDED_MOROCCO_BOUNDS = MOROCCO_BOUNDS.pad(0.04)
const OUTSIDE_MOROCCO_MASK = createOutsideMoroccoMask()

export default function MoroccoLeafletMap({
  metric,
  selected,
  location,
  selectionMode,
  onRegionSelect,
  onPointSelect,
}: Props) {
  const def = METRICS[metric]
  const minimumZoom = window.matchMedia("(max-width: 600px)").matches ? 4 : 5

  function connectRegion(feature: Feature, layer: Layer) {
    const name = String(feature.properties?.name ?? "")
    const region = REGIONS.find((candidate) => candidate.name === name)
    if (!region) return

    const path = layer as LeafletPath
    path.on("add", () => path.getElement()?.setAttribute("data-region-name", name))
    layer.bindTooltip(
      `${name} · ${def.short}: ${formatMetric(metric, metricsForRegion(region)[metric])}`,
      { sticky: true, className: "astroleet-map-tooltip" },
    )
    layer.on("click", (event: LeafletMouseEvent) => {
      if (selectionMode === "region") {
        onRegionSelect(name)
        return
      }

      const regionName = regionForMoroccoPoint(event.latlng.lat, event.latlng.lng)
      if (!regionName) return
      onPointSelect(
        regionName,
        roundCoordinate(event.latlng.lat),
        roundCoordinate(event.latlng.lng),
      )
    })
  }

  return (
    <div role="region" aria-label="Interactive map restricted to Morocco">
      <MapContainer
        bounds={MOROCCO_BOUNDS}
        maxBounds={PADDED_MOROCCO_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={minimumZoom}
        maxZoom={11}
        scrollWheelZoom
        worldCopyJump={false}
        className="astroleet-leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />
        <Polygon
          positions={OUTSIDE_MOROCCO_MASK}
          interactive={false}
          pathOptions={{
            fillColor: "#050607",
            fillOpacity: 0.76,
            fillRule: "evenodd",
            stroke: false,
          }}
        />
        <GeoJSON
          key={`${metric}:${selected}:${selectionMode}`}
          data={geoData as GeoJsonObject}
          onEachFeature={connectRegion}
          style={(feature) => {
            const name = String(feature?.properties?.name ?? "")
            const region = REGIONS.find((candidate) => candidate.name === name)
            const value = region ? metricsForRegion(region)[metric] : def.min
            const active = name === selected
            return {
              fillColor: colorFor(metric, value),
              fillOpacity: active ? 0.86 : 0.7,
              color: active ? colors.white : "rgba(255,255,255,0.62)",
              weight: active ? 3 : 1.2,
              opacity: 1,
            }
          }}
        />

        {REGIONS.map((region) => {
          const active = region.name === selected
          return (
            <CircleMarker
              key={region.name}
              center={[region.lat, region.lon]}
              radius={active ? 6 : 3}
              pathOptions={{
                color: "#050607",
                weight: active ? 2 : 1,
                fillColor: active ? colors.white : "rgba(255,255,255,0.8)",
                fillOpacity: 1,
              }}
              eventHandlers={{ click: () => onRegionSelect(region.name) }}
            >
              <Tooltip permanent={active && location.mode === "region"} direction="top">
                {region.name}
              </Tooltip>
            </CircleMarker>
          )
        })}

        {location.mode === "radius" && (
          <AccessibleCircle
            center={[location.latitude, location.longitude]}
            radius={location.radiusKm * 1_000}
            label={`${location.radiusKm} km analysis radius`}
          />
        )}

        {location.mode !== "region" && (
          <AccessiblePoint
            center={[location.latitude, location.longitude]}
            label="Selected analysis point"
          />
        )}
      </MapContainer>
    </div>
  )
}

function AccessibleCircle({
  center,
  radius,
  label,
}: {
  center: [number, number]
  radius: number
  label: string
}) {
  const circleRef = React.useRef<LeafletCircle | null>(null)

  React.useEffect(() => {
    circleRef.current?.getElement()?.setAttribute("aria-label", label)
  }, [label])

  return (
    <Circle
      ref={circleRef}
      center={center}
      radius={radius}
      pathOptions={{
        color: colors.green,
        weight: 2.5,
        dashArray: "7 5",
        fillColor: colors.green,
        fillOpacity: 0.16,
      }}
    />
  )
}

function AccessiblePoint({
  center,
  label,
}: {
  center: [number, number]
  label: string
}) {
  const pointRef = React.useRef<LeafletCircleMarker | null>(null)

  React.useEffect(() => {
    pointRef.current?.getElement()?.setAttribute("aria-label", label)
  }, [label])

  return (
    <CircleMarker
      ref={pointRef}
      center={center}
      radius={8}
      pathOptions={{
        color: colors.blue,
        weight: 3,
        fillColor: colors.white,
        fillOpacity: 1,
      }}
    >
      <Tooltip permanent direction="top">
        Analysis point
      </Tooltip>
    </CircleMarker>
  )
}

function roundCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000
}

function createOutsideMoroccoMask(): LatLngExpression[][] {
  const outerRing: LatLngExpression[] = [
    [-85, -180],
    [-85, 180],
    [85, 180],
    [85, -180],
  ]
  const regionRings = geoData.features.flatMap((feature) => {
    const geometry = feature.geometry as {
      type: "Polygon" | "MultiPolygon"
      coordinates: number[][][] | number[][][][]
    }
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates as number[][][]]
        : (geometry.coordinates as number[][][][])
    return polygons.map((polygon) =>
      polygon[0].map(([longitude, latitude]) => [latitude, longitude] as LatLngExpression),
    )
  })

  return [outerRing, ...regionRings]
}
