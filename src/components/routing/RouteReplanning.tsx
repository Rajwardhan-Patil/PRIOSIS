import React, { useState } from 'react'
import {
  GitFork,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Compass,
  MapPin,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { LeafletMap } from '../map/LeafletMap'
import { PUNE_ROAD_NODES } from '../../services/routingEngine'

export const RouteReplanning: React.FC = () => {
  const {
    zones,
    incidents,
    resources,
    shelters,
    roadSegments,
    routeFromNode,
    routeToNode,
    setRouteNodes,
    activeRouteResult,
    toggleRoadBlockage,
    recomputeActiveRoute,
  } = useIncidentContext()

  const [dispatchStatusMessage, setDispatchStatusMessage] = useState<string | null>(null)

  const handleConfirmDispatch = () => {
    setDispatchStatusMessage('Simulated dispatch order authorized. Routing waypoints pushed to mobile responder telemetry.')
    setTimeout(() => {
      setDispatchStatusMessage(null)
    }, 4000)
  }

  const blockedCount = roadSegments.filter(s => s.isBlocked).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b253b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              Autonomous Route Replanning & Inundation Bypass
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101726] text-teal-400 border border-[#1e2a42]">
              DIJKSTRA GRAPH
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time arterial severance detection, flood bypass calculations, and multi-node transit clearance.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-zinc-500">CORRIDOR INTEGRITY:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
              blockedCount > 0
                ? 'bg-red-950/70 text-red-400 border-red-800'
                : 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
            }`}
          >
            {blockedCount > 0 ? `${blockedCount} SEVERED` : '100% PASSABLE'}
          </span>
        </div>
      </div>

      {/* Origin / Destination Controls & Dispatch Bar */}
      <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
              Origin (Staging Post / Depot)
            </label>
            <select
              value={routeFromNode}
              onChange={e => setRouteNodes(e.target.value, routeToNode)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 text-xs focus:outline-none focus:border-teal-500 font-mono"
            >
              {Object.values(PUNE_ROAD_NODES).map(node => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
              Destination Sector Junction
            </label>
            <select
              value={routeToNode}
              onChange={e => setRouteNodes(routeFromNode, e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 text-xs focus:outline-none focus:border-teal-500 font-mono"
            >
              {Object.values(PUNE_ROAD_NODES).map(node => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-start md:justify-end gap-2 pt-2 md:pt-4">
            <button
              onClick={recomputeActiveRoute}
              className="px-3 py-1.5 rounded bg-[#121c2e] hover:bg-[#18263f] text-zinc-300 border border-[#202f4a] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Force Recalculate Route"
            >
              <RefreshCw className="w-3 h-3 text-teal-400" />
              <span>Recalculate</span>
            </button>
            <button
              onClick={handleConfirmDispatch}
              className="px-3.5 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Authorize Dispatch</span>
            </button>
          </div>
        </div>

        {dispatchStatusMessage && (
          <div className="p-2.5 rounded bg-[#0d1f1f] border border-teal-500/50 text-teal-300 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{dispatchStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Main Pathfinding Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Tactical Pathfinding Map */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
              Live Pathfinding Cartography
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              CLICK ARTERIALS TO TOGGLE SEVERANCE
            </span>
          </div>

          <LeafletMap
            zones={zones}
            incidents={incidents}
            resources={resources}
            shelters={shelters}
            roadSegments={roadSegments}
            activeRoute={activeRouteResult}
            onToggleBlockage={id => toggleRoadBlockage(id)}
            height="480px"
          />
        </div>

        {/* Right 5 Cols: Replanning Rationale & Arterial Network Matrix */}
        <div className="lg:col-span-5 space-y-3">
          {/* Active Route Telemetry */}
          {activeRouteResult && (
            <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#162033] pb-1.5">
                <span className="text-[10px] uppercase font-bold text-teal-400">
                  OPTIMAL TRANSIT SOLUTION
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                    activeRouteResult.isDirectRouteBlocked
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {activeRouteResult.isDirectRouteBlocked ? 'DETOUR ACTIVE' : 'DIRECT PATH CLEAR'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-[9px] text-zinc-500 block">TOTAL TRANSIT DISTANCE</span>
                  <span className="text-base font-bold text-white">
                    {activeRouteResult.currentDistanceKm} km
                  </span>
                  {activeRouteResult.isDirectRouteBlocked && (
                    <span className="text-[9px] text-amber-400 block font-semibold mt-0.5">
                      +{activeRouteResult.detourDistanceKm} km detour
                    </span>
                  )}
                </div>

                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-[9px] text-zinc-500 block">ESTIMATED TRAVEL TIME</span>
                  <span className="text-base font-bold text-white">
                    ~{activeRouteResult.currentTimeMin} mins
                  </span>
                  {activeRouteResult.isDirectRouteBlocked && (
                    <span className="text-[9px] text-amber-400 block font-semibold mt-0.5">
                      +{activeRouteResult.detourTimeMin} mins delay
                    </span>
                  )}
                </div>
              </div>

              {/* AI Rerouting Rationale */}
              <div className="p-2.5 rounded bg-[#070b13] border border-[#162033] space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                  AUTONOMOUS REROUTING RATIONALE
                </span>
                <p className="text-zinc-300 text-[10px] leading-relaxed">
                  {activeRouteResult.rerouteReason}
                </p>

                <div className="space-y-0.5 pt-1 border-t border-[#162033] text-[9px] text-zinc-400">
                  {activeRouteResult.safetyNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-teal-400">›</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waypoint Sequence */}
              <div className="text-[10px] text-zinc-400 pt-0.5">
                <span className="text-zinc-500 uppercase block text-[9px]">WAYPOINT SEQUENCE:</span>
                <span className="text-teal-300 font-bold">
                  {activeRouteResult.currentPath.map(n => PUNE_ROAD_NODES[n]?.name || n).join(' → ')}
                </span>
              </div>
            </div>
          )}

          {/* Key Arterial Status & Toggles */}
          <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2">
            <div className="flex items-center justify-between border-b border-[#162033] pb-1.5">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
                Arterial Corridor Status & Controls
              </span>
              <span className="text-[9px] font-mono text-zinc-500">14 SEGMENTS</span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs font-mono">
              {roadSegments.map(seg => (
                <div
                  key={seg.id}
                  className="p-1.5 rounded bg-[#070b13] border border-[#162033] flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-semibold text-zinc-200 block text-[11px] truncate">{seg.name}</span>
                    <span className="text-[9px] text-zinc-500">
                      {seg.distanceKm} km · {seg.isBlocked ? `${seg.waterDepthCm}cm water` : 'PASSABLE'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleRoadBlockage(seg.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors shrink-0 ${
                      seg.isBlocked
                        ? 'bg-red-950/80 text-red-300 border border-red-800 hover:bg-red-900'
                        : 'bg-[#121c2e] text-zinc-400 border border-[#202f4a] hover:text-white'
                    }`}
                  >
                    {seg.isBlocked ? 'SEVERED (CLEAR)' : 'SIMULATE SEVER'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
