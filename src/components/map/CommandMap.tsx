import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { Zone, Incident, Resource, RoadSegment, RouteRecalculationResult } from '../../types'
import { tokens, getSeverityColors } from '../../tokens'
import { RIVER_GAUGE_STATIONS, MUTHA_MULA_RIVER_PATHS } from '../../data/initialData'
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Navigation,
  Layers,
  RotateCcw,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react'

interface CommandMapProps {
  zones: Zone[]
  incidents: Incident[]
  resources: Resource[]
  roadSegments: RoadSegment[]
  activeRoute?: RouteRecalculationResult | null
  selectedZoneId?: string | null
  language?: 'en' | 'mr'
  onSelectZone: (id: string) => void
  onSelectIncident?: (id: string) => void
  onToggleBlockage?: (segmentId: string) => void
}

export const CommandMap: React.FC<CommandMapProps> = ({
  zones,
  incidents,
  resources,
  roadSegments,
  activeRoute,
  selectedZoneId,
  language = 'en',
  onSelectZone,
  onSelectIncident,
  onToggleBlockage,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [basemapFailed, setBasemapFailed] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(13)
  const [isLegendOpen, setIsLegendOpen] = useState(false)
  const [isLayersOpen, setIsLayersOpen] = useState(false)

  // Dynamic Layer Visibility
  const [layerVisibility, setLayerVisibility] = useState({
    water: true,
    zones: true,
    roads: true,
    routes: true,
    resources: true,
    incidents: true,
    gauges: true,
  })

  const layersRef = useRef<{
    water: L.LayerGroup
    zones: L.LayerGroup
    roads: L.LayerGroup
    routes: L.LayerGroup
    incidents: L.LayerGroup
    resources: L.LayerGroup
    gauges: L.LayerGroup
  } | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [18.525, 73.856],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false,
    })

    // Direct OpenStreetMap base link (No API keys, no Carto, no watermarks)
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    })

    tileLayer.on('tileerror', () => {
      setBasemapFailed(true)
    })

    tileLayer.addTo(map)

    // Attribution bottom-right
    L.control.attribution({
      position: 'bottomright',
      prefix: 'OpenStreetMap contributors',
    }).addTo(map)

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom())
    })

    // Layer groups for precise control-room stacking
    const waterLayer = L.layerGroup().addTo(map)
    const zonesLayer = L.layerGroup().addTo(map)
    const roadsLayer = L.layerGroup().addTo(map)
    const routesLayer = L.layerGroup().addTo(map)
    const resourcesLayer = L.layerGroup().addTo(map)
    const incidentsLayer = L.layerGroup().addTo(map)
    const gaugesLayer = L.layerGroup().addTo(map)

    layersRef.current = {
      water: waterLayer,
      zones: zonesLayer,
      roads: roadsLayer,
      routes: routesLayer,
      resources: resourcesLayer,
      incidents: incidentsLayer,
      gauges: gaugesLayer,
    }

    mapInstanceRef.current = map

    // Ensure map tiles properly layout after initial DOM paint
    setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // ResizeObserver: auto-invalidates container sizing when tabs or layouts switch
  useEffect(() => {
    if (!mapContainerRef.current) return
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })
    ro.observe(mapContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Dynamic Camera: smoothly flyTo selected zone
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedZoneId) return
    const targetZone = zones.find(z => z.id === selectedZoneId)
    if (targetZone) {
      mapInstanceRef.current.flyTo(targetZone.center, Math.max(mapInstanceRef.current.getZoom(), 14), {
        duration: 0.7,
        easeLinearity: 0.25,
      })
    }
  }, [selectedZoneId, zones])

  // Toggle individual layer visibility
  const toggleLayerVisibility = (key: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (layersRef.current && mapInstanceRef.current) {
        const group = layersRef.current[key]
        if (group) {
          if (next[key]) {
            mapInstanceRef.current.addLayer(group)
          } else {
            mapInstanceRef.current.removeLayer(group)
          }
        }
      }
      return next
    })
  }

  // Reset viewport to entire Pune confluence basin
  const handleFitBasin = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.525, 73.856], 13, { duration: 0.6 })
    }
  }, [])

  // Fit viewport to active route corridor
  const handleFitRoute = useCallback(() => {
    if (mapInstanceRef.current && activeRoute && activeRoute.currentCoordinates.length > 0) {
      const bounds = L.latLngBounds(activeRoute.currentCoordinates)
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true })
    }
  }, [activeRoute])

  // 1. Water & Hydrology (Animated river current in hydrology blue #4C9BE8)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.water
    layer.clearLayers()

    // Confluence Flood Extent (Mutha & Mula basin)
    const floodExtentCoords: [number, number][] = [
      [18.5210, 73.8400],
      [18.5320, 73.8440],
      [18.5350, 73.8580],
      [18.5390, 73.8820],
      [18.5320, 73.8810],
      [18.5260, 73.8560],
      [18.5160, 73.8430],
    ]
    const floodPolygon = L.polygon(floodExtentCoords, {
      color: '#4C9BE8',
      weight: 1,
      dashArray: '3, 4',
      fillColor: '#4C9BE8',
      fillOpacity: 0.18,
    })
    floodPolygon.bindTooltip('Simulated flood inundation corridor', { sticky: true })
    layer.addLayer(floodPolygon)

    // River Courses: Base river bed + animated flow line
    MUTHA_MULA_RIVER_PATHS.forEach(path => {
      // Solid base river bed
      const riverBase = L.polyline(path, {
        color: '#4C9BE8',
        weight: 6,
        opacity: 0.85,
      })
      layer.addLayer(riverBase)

      // Animated live current stream
      const riverCurrent = L.polyline(path, {
        color: '#85C1F5',
        weight: 3,
        opacity: 0.95,
        className: 'animate-river-flow',
      })
      riverCurrent.bindTooltip('Mutha-Mula confluence stream (18,500 cusecs)', { sticky: true })
      layer.addLayer(riverCurrent)
    })
  }, [])

  // 2. Ward Boundaries & Collision-Aware Labels & Radar Beacon for Critical Ward
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.zones
    layer.clearLayers()

    // Top 3 worst wards always show label; others only at higher zoom
    const sortedWards = [...zones].sort((a, b) => b.riskScore - a.riskScore)
    const top3Ids = new Set(sortedWards.slice(0, 3).map(z => z.id))

    zones.forEach(zone => {
      const isSelected = zone.id === selectedZoneId
      const colors = getSeverityColors(zone.priority)

      // Encoding: 12% fill of severity color, 1.5px outline. Selected gets 2.5px light outline; others dim to 60%.
      const polygon = L.polygon(zone.boundary, {
        color: isSelected ? '#ECEDEF' : colors.solid,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isSelected ? 1 : 0.6,
        fillColor: colors.solid,
        fillOpacity: isSelected ? 0.22 : 0.12,
        className: 'cursor-pointer',
      })

      const wardDisplayName = language === 'mr' && zone.nameMr ? zone.nameMr : zone.name

      polygon.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 600; color: #ECEDEF;">${wardDisplayName}</div>
          <div style="color: #A1A5AD; margin-top: 2px;">
            Priority: <strong style="color: ${colors.solid};">${zone.priority}</strong> (${zone.riskScore.toFixed(1)})
          </div>
          <div style="color: #858A93; font-size: 11px;">${zone.topDrivers[0]}</div>
          <div style="color: #A1A5AD; font-size: 10px; margin-top: 4px; border-top: 1px solid #2A2D33; padding-top: 2px;">Click to select and center ward</div>
        </div>`,
        { sticky: true }
      )

      polygon.on('click', () => {
        onSelectZone(zone.id)
      })

      layer.addLayer(polygon)

      // Live Radar Beacon for Critical Ward Epicenter
      if (zone.priority === 'Critical') {
        const pulseIcon = L.divIcon({
          className: 'bg-transparent border-0 pointer-events-none',
          html: `<div class="relative w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span class="absolute inset-0 rounded-full bg-[#F2555A] animate-radar-beacon"></span>
            <span class="absolute w-3 h-3 rounded-full bg-[#F2555A] shadow-md border border-[#ECEDEF]"></span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        const pulseMarker = L.marker(zone.center, { icon: pulseIcon, interactive: false })
        layer.addLayer(pulseMarker)
      }

      // Label Collision Control: Top 3 wards by default; others on zoom >= 14 or when selected
      const shouldShowLabel = top3Ids.has(zone.id) || currentZoom >= 14 || isSelected

      if (shouldShowLabel) {
        const labelIcon = L.divIcon({
          className: 'bg-transparent border-0 pointer-events-none',
          html: `<div style="font-family: ${language === 'mr' ? 'var(--font-devanagari)' : 'var(--font-sans)'}; font-size: 12px;" class="px-2 py-0.5 rounded font-medium whitespace-nowrap -translate-x-1/2 -translate-y-1/2 select-none ${
            isSelected
              ? 'bg-[#15171A] text-[#ECEDEF] border border-[#ECEDEF] shadow-md font-semibold'
              : 'bg-[#15171A]/90 text-[#A1A5AD] border border-[#2A2D33]'
          }">${wardDisplayName.split(' ')[0]}</div>`,
        })

        const marker = L.marker(zone.center, { icon: labelIcon, interactive: false })
        layer.addLayer(marker)
      }
    })
  }, [zones, selectedZoneId, currentZoom, language, onSelectZone])

  // 3. Road Network & Interactive Blockages (Click road on map to toggle blockage!)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.roads
    layer.clearLayers()

    roadSegments.forEach(seg => {
      const isBlocked = seg.isBlocked

      const polyline = L.polyline(seg.coordinates, {
        color: isBlocked ? '#F2555A' : '#3B4048',
        weight: isBlocked ? 4 : 2.5,
        dashArray: isBlocked ? '6, 6' : undefined,
        opacity: isBlocked ? 0.95 : 0.65,
        className: 'cursor-pointer',
      })

      polyline.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 12px;" class="space-y-1">
          <div class="font-medium text-[#ECEDEF]">${seg.name}</div>
          <div class="${isBlocked ? 'text-[#F2555A] font-medium' : 'text-[#4CB782] font-medium'}">
            ${isBlocked ? `Severed: ${seg.blockageReason || 'Water depth > 0.8m'}` : 'Passable'}
          </div>
          <div class="text-[11px] text-[#858A93] font-mono-numbers">
            ${seg.distanceKm} km · ${seg.speedLimitKmh} km/h
          </div>
          <div class="text-[10px] text-[#A1A5AD] pt-1 border-t border-[#2A2D33]/40">
            Click to ${isBlocked ? 'clear blockage' : 'simulate flood severance'}
          </div>
        </div>`,
        { sticky: true }
      )

      polyline.on('click', () => {
        if (onToggleBlockage) {
          onToggleBlockage(seg.id)
        }
      })

      layer.addLayer(polyline)
    })
  }, [roadSegments, onToggleBlockage])

  // 4. Recommended Route (Solid white 3px line + animated transit flow + ETA tag at midpoint)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.routes
    layer.clearLayers()

    if (!activeRoute || !activeRoute.currentCoordinates || activeRoute.currentCoordinates.length === 0) return

    // Base solid white line
    const routeLine = L.polyline(activeRoute.currentCoordinates, {
      color: '#FFFFFF',
      weight: 4,
      opacity: 1,
    })
    layer.addLayer(routeLine)

    // Animated dynamic transit flow along the active route
    const animatedRoute = L.polyline(activeRoute.currentCoordinates, {
      color: '#0E0F11',
      weight: 2,
      opacity: 0.9,
      className: 'animate-route-flow',
    })
    layer.addLayer(animatedRoute)

    // ETA Tag at Midpoint
    const midIdx = Math.floor(activeRoute.currentCoordinates.length / 2)
    const midCoord = activeRoute.currentCoordinates[midIdx]
    if (midCoord) {
      const etaIcon = L.divIcon({
        className: 'bg-transparent border-0 pointer-events-none',
        html: `<div style="font-family: var(--font-mono); font-size: 11px;" class="px-2 py-0.5 rounded bg-[#15171A] text-[#ECEDEF] border border-[#2A2D33] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap shadow-md">
          ETA ${activeRoute.currentTimeMin} min
        </div>`,
      })
      const etaMarker = L.marker(midCoord, { icon: etaIcon, interactive: false })
      layer.addLayer(etaMarker)
    }
  }, [activeRoute])

  // 5. River Gauges (Station name, level in m, trend arrow)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.gauges
    layer.clearLayers()

    RIVER_GAUGE_STATIONS.forEach(g => {
      const arrow = g.trend === 'rising' ? '↑' : g.trend === 'falling' ? '↓' : '→'
      const isDanger = g.status === 'danger'

      const tagIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `<div style="font-family: var(--font-sans); font-size: 11px;" class="px-2 py-0.5 rounded flex items-center gap-1 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap shadow cursor-pointer ${
          isDanger
            ? 'bg-[#15171A] text-[#F2555A] border border-[#F2555A]'
            : 'bg-[#15171A] text-[#A1A5AD] border border-[#2A2D33]'
        }">
          <span>${g.name.split(' ')[0]}</span>
          <span class="font-mono-numbers font-semibold ${isDanger ? 'text-[#F2555A]' : 'text-[#ECEDEF]'}">${g.levelMeters} m ${arrow}</span>
        </div>`,
      })

      const marker = L.marker(g.coordinates, { icon: tagIcon })
      marker.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 12px;">
          <div class="font-medium text-[#ECEDEF]">${g.name}</div>
          <div class="text-[#A1A5AD] font-mono-numbers">Level: ${g.levelMeters} m (${g.trend})</div>
          <div class="text-[11px] text-[#858A93]">Telemetry Station: Active</div>
        </div>`,
        { sticky: true }
      )
      layer.addLayer(marker)
    })
  }, [])

  // 6. Response Units (White circle with type glyph + interactive select)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.resources
    layer.clearLayers()

    resources.forEach(unit => {
      const isAssigned = unit.status === 'assigned'

      // White circle (24px) with crisp dark glyph inside
      const unitIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `<div class="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#0E0F11] flex items-center justify-center shadow-md cursor-pointer text-[#0E0F11] hover:scale-110 transition-transform">
          ${
            unit.type === 'rescue_boat'
              ? `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 17l10 5 10-5M12 2v15M4 10l8-4 8 4"/></svg>`
              : unit.type === 'ambulance'
              ? `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`
              : `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>`
          }
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(unit.coordinates, { icon: unitIcon })
      marker.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 12px;">
          <div class="font-medium text-[#ECEDEF]">${unit.name}</div>
          <div class="text-[#A1A5AD]">${unit.stationName}</div>
          <div class="text-[11px] text-[#858A93] font-mono-numbers">Status: <strong class="${isAssigned ? 'text-[#E8B923]' : 'text-[#4CB782]'}">${unit.status}</strong></div>
          ${unit.assignedZoneId ? `<div class="text-[10px] text-[#A1A5AD]">Assigned to: ${unit.assignedZoneId}</div>` : ''}
        </div>`,
        { sticky: true }
      )

      marker.on('click', () => {
        if (unit.assignedZoneId) {
          onSelectZone(unit.assignedZoneId)
        }
      })

      layer.addLayer(marker)
    })
  }, [resources, onSelectZone])

  // 7. Incidents (Severity-colored diamond + pulsing critical beacon)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.incidents
    layer.clearLayers()

    incidents.forEach(inc => {
      const colors = inc.severity === 'critical' ? tokens.colors.severity.critical : tokens.colors.severity.high

      // Diamond marker (20x20) with live pulse ring for critical incidents
      const diamondIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `<div class="cursor-pointer -translate-x-1/2 -translate-y-1/2 relative flex items-center justify-center">
          ${inc.severity === 'critical' ? '<span class="absolute -inset-1.5 rounded-full border border-[#F2555A] animate-ping opacity-60 pointer-events-none"></span>' : ''}
          <svg class="w-5 h-5 drop-shadow hover:scale-125 transition-transform" viewBox="0 0 24 24">
            <polygon points="12,2 22,12 12,22 2,12" fill="${colors.solid}" stroke="#0E0F11" stroke-width="2"/>
          </svg>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const marker = L.marker(inc.coordinates, { icon: diamondIcon })
      marker.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 12px;">
          <div class="font-medium text-[#ECEDEF]">${inc.title}</div>
          <div class="text-[11px] text-[#A1A5AD]">${inc.locationName}</div>
          <div style="color: ${colors.solid};" class="font-semibold text-xs mt-0.5 uppercase">${inc.severity}</div>
          <div class="text-[10px] text-[#858A93] mt-1 pt-1 border-t border-[#2A2D33]/40">Click to view incident details</div>
        </div>`,
        { sticky: true }
      )
      if (onSelectIncident) {
        marker.on('click', () => onSelectIncident(inc.id))
      }
      layer.addLayer(marker)
    })
  }, [incidents, onSelectIncident])

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0E0F11] select-none">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Tactical Map Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-[#15171A]/95 border border-[#2A2D33] rounded-md p-1 shadow-md text-xs">
        {/* Re-center Basin button */}
        <button
          onClick={handleFitBasin}
          className="px-2 py-1 rounded text-[11px] font-medium text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] flex items-center gap-1 transition-colors"
          title="Center Pune Basin view"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Basin</span>
        </button>

        {/* Fit Active Route (if active) */}
        {activeRoute && activeRoute.currentCoordinates.length > 0 && (
          <button
            onClick={handleFitRoute}
            className="px-2 py-1 rounded text-[11px] font-medium text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] flex items-center gap-1 transition-colors"
            title="Zoom to active route corridor"
          >
            <Navigation className="w-3 h-3 text-[#ECEDEF]" />
            <span>Route</span>
          </button>
        )}

        <div className="w-px h-3.5 bg-[#2A2D33] mx-0.5" />

        {/* Layer Visibility Toggle Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="px-2 py-1 rounded text-[11px] font-medium text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] flex items-center gap-1 transition-colors"
            title="Toggle map layers"
          >
            <Layers className="w-3 h-3" />
            <span>Layers</span>
          </button>

          {isLayersOpen && (
            <div className="absolute right-0 top-7 z-50 w-44 bg-[#15171A] border border-[#2A2D33] rounded-md p-2 shadow-xl space-y-1 text-[11px] text-[#ECEDEF]">
              <div className="font-medium text-[10px] text-[#858A93] uppercase tracking-wider pb-1 border-b border-[#2A2D33]">
                Layer Visibility
              </div>

              {[
                { key: 'water', label: 'River & Hydrology' },
                { key: 'zones', label: 'Ward Boundaries' },
                { key: 'roads', label: 'Roads & Blockages' },
                { key: 'routes', label: 'Active Route' },
                { key: 'resources', label: 'Emergency Fleet' },
                { key: 'incidents', label: 'Active Incidents' },
                { key: 'gauges', label: 'River Telemetry' },
              ].map(item => {
                const isVisible = layerVisibility[item.key as keyof typeof layerVisibility]
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleLayerVisibility(item.key as keyof typeof layerVisibility)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#1C1F23] text-left transition-colors"
                  >
                    <span>{item.label}</span>
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-[#4CB782]" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[#858A93]" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Live Stream Flow Indicator */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1C1F23] text-[10px] font-mono text-[#85C1F5] border border-[#4C9BE8]/30">
          <Activity className="w-2.5 h-2.5 text-[#4C9BE8] animate-pulse" />
          <span>FLOW</span>
        </div>
      </div>

      {/* Flat dark fallback banner if basemap tile load fails */}
      {basemapFailed && (
        <div className="absolute bottom-6 left-4 z-[999] px-2.5 py-1 rounded bg-[#15171A] border border-[#2A2D33] text-[11px] text-[#858A93]">
          Basemap unavailable · Offline vector overlay active
        </div>
      )}

      {/* Collapsible Symbology Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#15171A]/95 border border-[#2A2D33] rounded text-xs text-[#A1A5AD] shadow-sm max-w-[220px]">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="w-full px-3 py-1.5 flex items-center justify-between font-medium text-[11px] text-[#ECEDEF] hover:bg-[#1C1F23]"
        >
          <span>Map Symbology</span>
          {isLegendOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {isLegendOpen && (
          <div className="px-3 pb-2 pt-1 border-t border-[#2A2D33] space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rotate-45 bg-[#F2555A] border border-[#0E0F11] inline-block shrink-0" />
              <span>Incident marker (clickable)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFFFFF] border border-[#0E0F11] inline-block shrink-0" />
              <span>Response unit (clickable)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#4C9BE8] inline-block shrink-0" />
              <span>River current (animated flow)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-[#F2555A] inline-block shrink-0" />
              <span>Blocked road (click to toggle)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#FFFFFF] inline-block shrink-0" />
              <span>Active route (animated transit)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2555A] animate-ping inline-block shrink-0" />
              <span>Critical ward radar beacon</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
