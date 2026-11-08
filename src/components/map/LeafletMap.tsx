import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Zone, Incident, Resource, Shelter, RoadSegment, RouteRecalculationResult } from '../../types'

interface LeafletMapProps {
  zones: Zone[]
  incidents: Incident[]
  resources: Resource[]
  shelters: Shelter[]
  roadSegments: RoadSegment[]
  activeRoute?: RouteRecalculationResult | null
  selectedZoneId?: string | null
  onSelectZone?: (id: string) => void
  onSelectIncident?: (id: string) => void
  onToggleBlockage?: (segmentId: string) => void
  height?: string
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  zones,
  incidents,
  resources,
  shelters,
  roadSegments,
  activeRoute,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  onToggleBlockage,
  height = '560px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersRef = useRef<{
    zones: L.LayerGroup
    incidents: L.LayerGroup
    resources: L.LayerGroup
    shelters: L.LayerGroup
    roads: L.LayerGroup
    routes: L.LayerGroup
  } | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [18.525, 73.856],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    // CartoDB Voyager tiles with muted dark styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    L.control.attribution({
      position: 'bottomright',
      prefix: 'OpenStreetMap · PRIORIS Decision Support',
    }).addTo(map)

    const zonesLayer = L.layerGroup().addTo(map)
    const roadsLayer = L.layerGroup().addTo(map)
    const routesLayer = L.layerGroup().addTo(map)
    const sheltersLayer = L.layerGroup().addTo(map)
    const resourcesLayer = L.layerGroup().addTo(map)
    const incidentsLayer = L.layerGroup().addTo(map)

    layersRef.current = {
      zones: zonesLayer,
      incidents: incidentsLayer,
      resources: resourcesLayer,
      shelters: sheltersLayer,
      roads: roadsLayer,
      routes: routesLayer,
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Zones Layer
  useEffect(() => {
    if (!layersRef.current || !mapInstanceRef.current) return
    const layer = layersRef.current.zones
    layer.clearLayers()

    zones.forEach(zone => {
      const isSelected = zone.id === selectedZoneId
      const color =
        zone.priority === 'Critical'
          ? '#ef4444'
          : zone.priority === 'High'
          ? '#f59e0b'
          : zone.priority === 'Moderate'
          ? '#eab308'
          : '#10b981'

      const polygon = L.polygon(zone.boundary, {
        color: color,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 1 : 0.7,
        fillColor: color,
        fillOpacity: isSelected ? 0.22 : 0.08,
      })

      polygon.bindTooltip(
        `<div style="font-family: var(--font-sans); font-size: 11px;">
          <div style="font-weight: 700; color: #f8fafc;">${zone.name}</div>
          <div style="color: #94a3b8; margin-top: 2px;">Risk Score: <strong style="color: ${color}; font-family: var(--font-mono);">${zone.riskScore}</strong> (${zone.priority})</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 1px;">Active Incidents: ${zone.activeIncidentCount} · Pop: ${zone.population.toLocaleString()}</div>
        </div>`,
        { sticky: true, className: '!bg-[#090e1a] !text-zinc-200 !border-[#1e2a40] !rounded !px-2.5 !py-1.5' }
      )

      polygon.on('click', () => {
        if (onSelectZone) onSelectZone(zone.id)
      })

      layer.addLayer(polygon)

      // Center text badge
      const labelIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `<div style="font-family: var(--font-mono); font-size: 9px;" class="px-1.5 py-0.5 rounded font-bold tracking-tight whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
          isSelected
            ? 'bg-[#0b1220] text-teal-300 border border-teal-500 shadow-md'
            : 'bg-[#080d18]/90 text-zinc-300 border border-[#1e293b]'
        }">${zone.name.split(' ')[0]} <span style="color: ${color};">${zone.riskScore}</span></div>`,
      })

      const marker = L.marker(zone.center, { icon: labelIcon })
      marker.on('click', () => {
        if (onSelectZone) onSelectZone(zone.id)
      })
      layer.addLayer(marker)
    })
  }, [zones, selectedZoneId, onSelectZone])

  // Update Road Segments Layer
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.roads
    layer.clearLayers()

    roadSegments.forEach(seg => {
      const isBlocked = seg.isBlocked
      const polyline = L.polyline(seg.coordinates, {
        color: isBlocked ? '#ef4444' : '#475569',
        weight: isBlocked ? 4 : 2,
        opacity: isBlocked ? 0.95 : 0.4,
        dashArray: isBlocked ? '6, 6' : undefined,
      })

      polyline.bindPopup(`
        <div style="font-family: var(--font-sans); font-size: 11px; padding: 4px;" class="space-y-1">
          <div class="font-bold text-slate-100">${seg.name}</div>
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              isBlocked ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }">
              ${isBlocked ? 'IMPASSABLE' : 'TRANSIT CLEAR'}
            </span>
            <span class="text-zinc-400 text-[10px] font-mono">${seg.distanceKm} km · ${seg.speedLimitKmh} km/h</span>
          </div>
          ${isBlocked ? `<p class="text-red-300 text-[10px] mt-1">${seg.blockageReason}</p>` : ''}
          <div class="pt-2">
            <button id="toggle-seg-${seg.id}" class="w-full text-center px-2 py-1 text-[11px] font-semibold rounded ${
        isBlocked ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
      }">
              ${isBlocked ? 'Clear Corridor Blockage' : 'Simulate Flood Blockage'}
            </button>
          </div>
        </div>
      `)

      polyline.on('popupopen', () => {
        const btn = document.getElementById(`toggle-seg-${seg.id}`)
        if (btn && onToggleBlockage) {
          btn.onclick = () => {
            onToggleBlockage(seg.id)
          }
        }
      })

      layer.addLayer(polyline)
    })
  }, [roadSegments, onToggleBlockage])

  // Update Active Route Layer
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.routes
    layer.clearLayers()

    if (!activeRoute) return

    // Original blocked route in red dashed
    if (activeRoute.isDirectRouteBlocked && activeRoute.originalCoordinates.length > 0) {
      const origLine = L.polyline(activeRoute.originalCoordinates, {
        color: '#f43f5e',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '5, 6',
      })
      origLine.bindTooltip('Severed Direct Corridor (Flooded)', { sticky: true })
      layer.addLayer(origLine)
    }

    // Active safe detour route in emerald green / cyan
    if (activeRoute.currentCoordinates.length > 0) {
      const activeLine = L.polyline(activeRoute.currentCoordinates, {
        color: activeRoute.isDirectRouteBlocked ? '#10b981' : '#0ea5e9',
        weight: 4.5,
        opacity: 0.95,
      })
      activeLine.bindTooltip(
        activeRoute.isDirectRouteBlocked
          ? `Safe Reroute Detour: ${activeRoute.currentDistanceKm} km (~${activeRoute.currentTimeMin} min)`
          : `Fastest Direct Response Route: ${activeRoute.currentDistanceKm} km`,
        { sticky: true }
      )
      layer.addLayer(activeLine)
    }
  }, [activeRoute])

  // Update Incidents Layer with vector icons
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.incidents
    layer.clearLayers()

    incidents.forEach(inc => {
      const isCritical = inc.severity === 'critical'
      const iconHtml = `
        <div class="relative cursor-pointer">
          <div class="w-6 h-6 rounded flex items-center justify-center border ${
            isCritical
              ? 'bg-red-600/90 border-red-300 text-white'
              : 'bg-amber-600/90 border-amber-300 text-white'
          }">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          ${isCritical ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 beacon-pulse"></span>' : ''}
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(inc.coordinates, { icon })

      marker.bindPopup(`
        <div style="font-family: var(--font-sans); font-size: 11px; padding: 4px; max-width: 250px;" class="space-y-1.5">
          <div class="flex items-center justify-between gap-1">
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
              isCritical ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }">${inc.severity} · ${inc.hazardType.replace('_', ' ')}</span>
            <span class="text-zinc-500 font-mono text-[9px]">${inc.reportedAt}</span>
          </div>
          <div class="font-bold text-white text-xs">${inc.title}</div>
          <div class="text-zinc-300 text-[10px] leading-relaxed">${inc.description}</div>
          <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-[#1d273c]">
            <span>DEPTH: <strong class="text-zinc-200">${inc.waterDepthCm || 0} cm</strong></span>
            <span>STATUS: <strong class="text-teal-400">${inc.status.toUpperCase()}</strong></span>
          </div>
        </div>
      `)

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc.id)
      })

      layer.addLayer(marker)
    })
  }, [incidents, onSelectIncident])

  // Update Resources Layer with vector SVG icons (NO EMOJIS)
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.resources
    layer.clearLayers()

    resources.forEach(res => {
      const isAvailable = res.status === 'available'
      // SVG vector symbol per resource type
      const svgPath =
        res.type === 'rescue_boat'
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v13m0 0l-4-4m4 4l4-4M4 17l1.5 3h13L20 17"/>'
          : res.type === 'ambulance'
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m-8-8h16"/>'
          : res.type === 'fire_rescue'
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>'

      const iconHtml = `
        <div class="relative cursor-pointer group" title="${res.name}">
          <div class="w-6 h-6 rounded flex items-center justify-center border shadow ${
            isAvailable
              ? 'bg-[#0f2430] border-teal-500/80 text-teal-300'
              : 'bg-[#1e1b4b] border-indigo-500/80 text-indigo-300'
          }">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${svgPath}
            </svg>
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            isAvailable ? 'bg-emerald-400' : 'bg-amber-400'
          }"></span>
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(res.coordinates, { icon })

      marker.bindPopup(`
        <div style="font-family: var(--font-sans); font-size: 11px; padding: 4px; max-width: 240px;" class="space-y-1">
          <div class="font-bold text-white">${res.name}</div>
          <div class="text-[10px] text-zinc-400 font-mono">${res.unitCode} · ${res.stationName}</div>
          <div class="flex items-center gap-2 pt-1">
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
              isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
            }">${res.status.toUpperCase()}</span>
            <span class="text-zinc-400 text-[10px]">Capacity: ${res.capacity}</span>
          </div>
          <div class="text-[10px] text-teal-300 pt-1 border-t border-[#1d273c]">
            ${res.specialization.slice(0, 2).join(' · ')}
          </div>
        </div>
      `)

      layer.addLayer(marker)
    })
  }, [resources])

  // Update Shelters Layer with vector tent/shelter SVG
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.shelters
    layer.clearLayers()

    shelters.forEach(shl => {
      const occPercent = Math.round((shl.capacityOccupied / shl.capacityTotal) * 100)
      const iconHtml = `
        <div class="relative cursor-pointer" title="${shl.name}">
          <div class="w-5 h-5 rounded flex items-center justify-center bg-[#0d1e38] border border-[#234575] text-cyan-300 shadow">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11"/>
            </svg>
          </div>
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const marker = L.marker(shl.coordinates, { icon })
      marker.bindPopup(`
        <div style="font-family: var(--font-sans); font-size: 11px; padding: 4px; max-width: 220px;" class="space-y-1">
          <div class="font-bold text-white">${shl.name}</div>
          <div class="text-zinc-400 text-[10px] font-mono">CENSUS: ${shl.capacityOccupied}/${shl.capacityTotal} (${occPercent}%)</div>
          <div class="w-full bg-[#1b2538] h-1 rounded overflow-hidden">
            <div class="h-full bg-cyan-500 rounded" style="width: ${occPercent}%"></div>
          </div>
          <div class="text-zinc-500 text-[9px] flex items-center justify-between pt-1">
            <span>${shl.hasMedicalPost ? '✓ Med Staging' : ''}</span>
            <span>${shl.hasPowerBackup ? '✓ Generator' : ''}</span>
          </div>
        </div>
      `)

      layer.addLayer(marker)
    })
  }, [shelters])

  // Center on selected zone if changed
  useEffect(() => {
    if (!selectedZoneId || !mapInstanceRef.current) return
    const target = zones.find(z => z.id === selectedZoneId)
    if (target) {
      mapInstanceRef.current.flyTo(target.center, 13.5, { duration: 0.6 })
    }
  }, [selectedZoneId, zones])

  return (
    <div className="relative w-full rounded border border-[#1b253b] overflow-hidden bg-[#070b14]">
      <div ref={mapContainerRef} style={{ height }} className="z-0" />

      {/* Low-profile Tactical Map HUD Overlay */}
      <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-[#090d18]/90 backdrop-blur-sm border border-[#1b263c] rounded p-2 text-[10px] font-mono text-zinc-300 pointer-events-auto space-y-1">
        <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold border-b border-[#1b263c] pb-1 flex justify-between">
          <span>Map HUD</span>
          <span className="text-teal-400">PUNE CARTOGRAPHY</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500 inline-block"></span>
            <span>Critical Ward</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500 inline-block"></span>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-red-500 inline-block"></span>
            <span>Flood Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-teal-500 inline-block"></span>
            <span>Response Asset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-red-500 inline-block"></span>
            <span>Severed Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
            <span>Bypass Route</span>
          </div>
        </div>
      </div>
    </div>
  )
}
