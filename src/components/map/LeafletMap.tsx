import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Zone, Incident, Resource, Shelter, RoadSegment, RouteRecalculationResult } from '../../types'
import { PUNE_ROAD_NODES } from '../../services/routingEngine'

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

    // Center on central Pune (Shivajinagar / Kasba Peth)
    const map = L.map(mapContainerRef.current, {
      center: [18.525, 73.856],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    // Add CartoDB Dark Matter / OSM Tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Attribution
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
          ? '#f97316'
          : zone.priority === 'Moderate'
          ? '#eab308'
          : '#22c55e'

      const polygon = L.polygon(zone.boundary, {
        color: color,
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 1 : 0.8,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.18,
        dashArray: isSelected ? '4, 4' : undefined,
      })

      polygon.bindTooltip(
        `<div class="font-sans text-xs">
          <div class="font-bold text-slate-100">${zone.name}</div>
          <div class="text-slate-300">Score: <strong style="color:${color}">${zone.riskScore}</strong> (${zone.priority})</div>
          <div class="text-slate-400 mt-0.5">Active Incidents: ${zone.activeIncidentCount}</div>
        </div>`,
        { sticky: true, className: '!bg-slate-900 !text-slate-100 !border-slate-700 !rounded-md !px-2.5 !py-1.5' }
      )

      polygon.on('click', () => {
        if (onSelectZone) onSelectZone(zone.id)
      })

      layer.addLayer(polygon)

      // Add center text label marker
      const labelIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `<div class="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight shadow whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
          isSelected
            ? 'bg-slate-900 text-teal-300 border border-teal-400 shadow-teal-500/30'
            : 'bg-slate-900/90 text-slate-200 border border-slate-700'
        }">${zone.name.split(' ')[0]} · ${zone.riskScore}</div>`,
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
        color: isBlocked ? '#ef4444' : '#64748b',
        weight: isBlocked ? 5 : 3,
        opacity: isBlocked ? 0.95 : 0.5,
        dashArray: isBlocked ? '8, 8' : undefined,
      })

      polyline.bindPopup(`
        <div class="font-sans text-xs space-y-1 p-1">
          <div class="font-bold text-sm text-slate-100">${seg.name}</div>
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isBlocked ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
            }">
              ${isBlocked ? 'BLOCKED / SUBMERGED' : 'PASSABLE'}
            </span>
            <span class="text-slate-400 text-[11px]">${seg.distanceKm} km · ${seg.speedLimitKmh} km/h limit</span>
          </div>
          ${isBlocked ? `<p class="text-red-400 text-[11px] mt-1">${seg.blockageReason}</p>` : ''}
          <div class="pt-2">
            <button id="toggle-seg-${seg.id}" class="w-full text-center px-2 py-1 text-xs font-semibold rounded ${
        isBlocked ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
      }">
              ${isBlocked ? 'Clear Blockage' : 'Simulate Road Blockage'}
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

    // If direct route was blocked, draw original path in red dashed line
    if (activeRoute.isDirectRouteBlocked && activeRoute.originalCoordinates.length > 0) {
      const origLine = L.polyline(activeRoute.originalCoordinates, {
        color: '#f43f5e',
        weight: 4,
        opacity: 0.7,
        dashArray: '5, 8',
      })
      origLine.bindTooltip('Unsafe Original Corridor (Blocked)', { sticky: true })
      layer.addLayer(origLine)
    }

    // Draw active / detour route in high-visibility cyan / emerald
    if (activeRoute.currentCoordinates.length > 0) {
      const activeLine = L.polyline(activeRoute.currentCoordinates, {
        color: activeRoute.isDirectRouteBlocked ? '#10b981' : '#06b6d4',
        weight: 6,
        opacity: 0.95,
      })
      activeLine.bindTooltip(
        activeRoute.isDirectRouteBlocked
          ? `Safe Alternate Detour: ${activeRoute.currentDistanceKm} km (${activeRoute.currentTimeMin} min)`
          : `Fastest Direct Response Route: ${activeRoute.currentDistanceKm} km`,
        { sticky: true }
      )
      layer.addLayer(activeLine)
    }
  }, [activeRoute])

  // Update Incidents Layer
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.incidents
    layer.clearLayers()

    incidents.forEach(inc => {
      const isCritical = inc.severity === 'critical'
      const iconHtml = `
        <div class="relative cursor-pointer">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
            isCritical
              ? 'bg-red-600 border-red-300 text-white critical-pulse'
              : 'bg-amber-600 border-amber-300 text-white'
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-slate-900 border border-slate-700 text-[9px] font-bold flex items-center justify-center rounded-full text-white">!</span>
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker(inc.coordinates, { icon })

      marker.bindPopup(`
        <div class="font-sans text-xs space-y-2 p-1 max-w-[260px]">
          <div class="flex items-center justify-between gap-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isCritical ? 'bg-red-950 text-red-300 border border-red-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
            }">${inc.severity} · ${inc.hazardType.replace('_', ' ')}</span>
            <span class="text-slate-400 text-[10px]">${inc.reportedAt}</span>
          </div>
          <div class="font-bold text-slate-100 text-sm leading-tight">${inc.title}</div>
          <div class="text-slate-300 text-[11px] leading-relaxed">${inc.description}</div>
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Water Depth: <strong class="text-slate-200">${inc.waterDepthCm || 0} cm</strong></span>
            <span>Status: <strong class="text-teal-400">${inc.status}</strong></span>
          </div>
        </div>
      `)

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc.id)
      })

      layer.addLayer(marker)
    })
  }, [incidents, onSelectIncident])

  // Update Resources Layer
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.resources
    layer.clearLayers()

    resources.forEach(res => {
      const isAvailable = res.status === 'available'
      const iconHtml = `
        <div class="relative cursor-pointer group" title="${res.name}">
          <div class="w-7 h-7 rounded-md flex items-center justify-center shadow border ${
            isAvailable
              ? 'bg-teal-700 border-teal-300 text-white'
              : 'bg-indigo-800 border-indigo-400 text-white'
          }">
            <span class="text-[10px] font-black tracking-tight">${
              res.type === 'rescue_boat' ? '🛥️' : res.type === 'ambulance' ? '🚑' : res.type === 'fire_rescue' ? '🚒' : '🛡️'
            }</span>
          </div>
          <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 ${
            isAvailable ? 'bg-emerald-400' : 'bg-amber-400'
          }"></span>
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker(res.coordinates, { icon })

      marker.bindPopup(`
        <div class="font-sans text-xs space-y-1.5 p-1 max-w-[240px]">
          <div class="font-bold text-slate-100 text-sm leading-tight">${res.name}</div>
          <div class="text-[11px] text-slate-400">${res.unitCode} · ${res.stationName}</div>
          <div class="flex items-center gap-2 pt-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
            }">${res.status.toUpperCase()}</span>
            <span class="text-slate-300 text-[11px]">Capacity: ${res.capacity}</span>
          </div>
          <div class="text-[11px] text-teal-300 pt-1 border-t border-slate-800">
            ${res.specialization.slice(0, 2).join(' · ')}
          </div>
        </div>
      `)

      layer.addLayer(marker)
    })
  }, [resources])

  // Update Shelters Layer
  useEffect(() => {
    if (!layersRef.current) return
    const layer = layersRef.current.shelters
    layer.clearLayers()

    shelters.forEach(shl => {
      const occPercent = Math.round((shl.capacityOccupied / shl.capacityTotal) * 100)
      const iconHtml = `
        <div class="relative cursor-pointer" title="${shl.name}">
          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-blue-700 border border-blue-300 text-white shadow">
            <span class="text-[9px]">⛺</span>
          </div>
        </div>
      `

      const icon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(shl.coordinates, { icon })
      marker.bindPopup(`
        <div class="font-sans text-xs space-y-1.5 p-1 max-w-[230px]">
          <div class="font-bold text-slate-100 text-sm">${shl.name}</div>
          <div class="text-slate-300 text-[11px]">Occupancy: ${shl.capacityOccupied} / ${shl.capacityTotal} (${occPercent}%)</div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full" style="width: ${occPercent}%"></div>
          </div>
          <div class="text-slate-400 text-[10px] flex items-center justify-between pt-1">
            <span>${shl.hasMedicalPost ? '✓ Med Post' : ''}</span>
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
      mapInstanceRef.current.flyTo(target.center, 14, { duration: 0.8 })
    }
  }, [selectedZoneId, zones])

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} style={{ height }} className="z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs space-y-1.5 pointer-events-auto max-w-[220px]">
        <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
          <span>Map Legend</span>
          <span className="text-[10px] text-teal-400 font-normal">Pune Basin</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/50 border border-red-500 inline-block"></span>
            <span>Critical Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500 inline-block"></span>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
            <span>Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-600 inline-block"></span>
            <span>Unit Asset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 inline-block"></span>
            <span>Blocked Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-emerald-500 inline-block rounded"></span>
            <span>Safe Detour</span>
          </div>
        </div>
      </div>
    </div>
  )
}
