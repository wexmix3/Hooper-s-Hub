'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Map, { Source, Layer, type MapRef, GeolocateControl, NavigationControl } from 'react-map-gl/mapbox'
import type { MapMouseEvent, GeoJSONSource } from 'mapbox-gl'
import { MAPBOX_TOKEN, DEFAULT_VIEW, MAP_STYLE } from '@/lib/mapbox'
import type { Court, CourtFilters, CourtGeoJSON } from '@/types'
import { FilterChips } from './FilterChips'
import { CourtBottomSheet } from './CourtBottomSheet'
import { useCourts } from '@/hooks/useCourts'
import { useGeolocation } from '@/hooks/useGeolocation'
import 'mapbox-gl/dist/mapbox-gl.css'

const CLUSTER_LAYER_ID = 'clusters'
const UNCLUSTERED_LAYER_ID = 'unclustered-point'

export function CourtMap() {
  const mapRef = useRef<MapRef>(null)
  const { coords } = useGeolocation()
  const [filters, setFilters] = useState<CourtFilters>({
    borough: 'all',
    indoor: null,
    bookable: null,
  })
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [cursor, setCursor] = useState('grab')

  const { courts, loading } = useCourts(filters, coords)

  // Build GeoJSON from courts
  const geojson: CourtGeoJSON = {
    type: 'FeatureCollection',
    features: courts.map((c) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: {
        id: c.id,
        name: c.name,
        type: c.type,
        borough: c.borough,
        is_bookable: c.is_bookable,
        indoor: c.indoor,
        avg_rating: c.avg_rating,
        hourly_rate: c.hourly_rate,
      },
    })),
  }

  const onMapClick = useCallback(
    (e: MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      const features = map.queryRenderedFeatures(e.point, {
        layers: [CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID],
      })

      if (!features.length) {
        setSelectedCourt(null)
        return
      }

      const feature = features[0]

      // Handle cluster click — zoom in
      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id as number
        const source = map.getSource('courts') as GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !feature.geometry || feature.geometry.type !== 'Point') return
          map.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: (zoom ?? 12) + 1,
          })
        })
        return
      }

      // Individual court clicked
      const courtId = feature.properties?.id as string
      const court = courts.find((c) => c.id === courtId)
      if (court) {
        setSelectedCourt(court)
        map.easeTo({
          center: [court.lng, court.lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: 400,
        })
      }
    },
    [courts]
  )

  // Center on user location when available
  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.easeTo({
        center: [coords.lng, coords.lat],
        zoom: 13,
        duration: 1000,
      })
    }
  }, [coords])

  return (
    <div className="relative map-container">
      {/* Filter chips */}
      <div className="absolute top-2 left-0 right-0 z-20">
        <FilterChips filters={filters} onChange={setFilters} />
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-white rounded-full px-3 py-1.5 shadow-md text-sm text-slate-600 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-[#1B3A5C] border-t-transparent rounded-full animate-spin" />
          Loading courts...
        </div>
      )}

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        initialViewState={DEFAULT_VIEW}
        style={{ width: '100%', height: '100%' }}
        onClick={onMapClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        cursor={cursor}
        interactiveLayerIds={[CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID]}
      >
        {/* Controls */}
        <GeolocateControl
          position="bottom-right"
          style={{ marginBottom: '60px' }}
          trackUserLocation
          showUserHeading
        />
        <NavigationControl position="bottom-right" style={{ marginBottom: '110px' }} />

        {/* Court markers source */}
        <Source
          id="courts"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id={CLUSTER_LAYER_ID}
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': '#1B3A5C',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                18, 10,
                24, 50,
                30,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            }}
          />
          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 13,
            }}
            paint={{ 'text-color': '#fff' }}
          />
          {/* Individual court points */}
          <Layer
            id={UNCLUSTERED_LAYER_ID}
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['==', ['get', 'is_bookable'], true], '#1B3A5C',
                '#22C55E',
              ],
              'circle-radius': 9,
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#fff',
            }}
          />
          {/* Court name labels at high zoom */}
          <Layer
            id="court-labels"
            type="symbol"
            minzoom={15}
            filter={['!', ['has', 'point_count']]}
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-max-width': 10,
            }}
            paint={{
              'text-color': '#0F172A',
              'text-halo-color': '#fff',
              'text-halo-width': 1.5,
            }}
          />
        </Source>
      </Map>

      {/* Bottom sheet */}
      {selectedCourt && (
        <CourtBottomSheet
          court={selectedCourt}
          onClose={() => setSelectedCourt(null)}
          userCoords={coords}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-md px-3 py-2 text-xs text-slate-600 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Public courts
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1B3A5C]" />
          Private / Bookable
        </div>
      </div>
    </div>
  )
}
