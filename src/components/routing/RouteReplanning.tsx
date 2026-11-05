import React, { useState } from 'react'
import {
  GitFork,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Compass,
  MapPin,
  Waves,
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

  const [isSimulatedDispatchConfirmed, setIsSimulatedDispatchConfirmed] = useState(false)
  const [dispatchStatusMessage, setDispatchStatusMessage] = useState<string | null>(null)

  const handleConfirmDispatch = () => {
    setIsSimulatedDispatchConfirmed(true)
    setDispatchStatusMessage('Simulated dispatch authorization transmitted to mobile terminal over cellular fallback.')
    setTimeout(() => {
      setDispatchStatusMessage(null)
    }, 4000)
  }

  const handleRejectDispatch = () => {
    setIsSimulatedDispatchConfirmed(false)
    setDispatchStatusMessage('Route dispatch canceled by tactical coordinator. Pending alternate waypoints.')
    setTimeout(() => {
      setDispatchStatusMessage(null)
    }, 4000)
  }

  const blockedCount = roadSegments.filter(s => s.isBlocked).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-teal-400" />
            <span>Autonomous Route Replanning & Inundation Bypass</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dijkstra graph optimization with real-time road blockage detection and multi-hazard clearance verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Corridor Status:</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
              blockedCount > 0
                ? 'bg-red-950 text-red-300 border-red-700'
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}
          >
            {blockedCount > 0 ? `${blockedCount} Roads Blocked` : 'All Roads Open'}
          </span>
        </div>
      </div>

      {/* Origin / Destination Controls & Dispatch Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Staging Post (Origin)
            </label>
            <select
              value={routeFromNode}
              onChange={e => setRouteNodes(e.target.value, routeToNode)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            >
              {Object.values(PUNE_ROAD_NODES).map(node => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Destination Sector Junction
            </label>
            <select
              value={routeToNode}
              onChange={e => setRouteNodes(routeFromNode, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
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
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Force Recalculate Route"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalculate</span>
            </button>
            <button
              onClick={handleConfirmDispatch}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-teal-950"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Simulated Dispatch</span>
            </button>
          </div>
        </div>

        {dispatchStatusMessage && (
          <div className="p-3 rounded-lg bg-teal-950/70 border border-teal-500/50 text-teal-300 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{dispatchStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Map + Route Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Map View */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Live Pathfinding Visualizer
            </span>
            <span className="text-[11px] text-slate-400">
              Click road segments or buttons to toggle blockages
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

        {/* Right 5 Cols: Replanning Rationale & Road Segments */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Route Telemetry Card */}
          {activeRouteResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                  Calculated Transit Solution
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeRouteResult.isDirectRouteBlocked
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {activeRouteResult.isDirectRouteBlocked ? 'DETOUR ACTIVE' : 'DIRECT PATH CLEAR'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Transit Distance</span>
                  <span className="text-xl font-black text-slate-100">
                    {activeRouteResult.currentDistanceKm} km
                  </span>
                  {activeRouteResult.isDirectRouteBlocked && (
                    <span className="text-[10px] text-amber-400 block font-semibold mt-0.5">
                      +{activeRouteResult.detourDistanceKm} km detour
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estimated Travel Time</span>
                  <span className="text-xl font-black text-slate-100">
                    ~{activeRouteResult.currentTimeMin} mins
                  </span>
                  {activeRouteResult.isDirectRouteBlocked && (
                    <span className="text-[10px] text-amber-400 block font-semibold mt-0.5">
                      +{activeRouteResult.detourTimeMin} mins delay
                    </span>
                  )}
                </div>
              </div>

              {/* AI Rerouting Rationale */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <span className="font-bold text-slate-300 text-[11px] block">
                  Autonomous Decision Rationale:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeRouteResult.rerouteReason}
                </p>

                <div className="space-y-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  {activeRouteResult.safetyNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waypoint Sequence */}
              <div className="text-[11px] text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Active Corridor Nodes: </span>
                <span className="text-teal-300 font-mono">
                  {activeRouteResult.currentPath.map(n => PUNE_ROAD_NODES[n]?.name || n).join(' → ')}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Road Blockage Toggles */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100">
                Key Arterial Road Blockage Controls
              </h3>
              <span className="text-[10px] text-slate-400">Simulation Scenarios</span>
            </div>

            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 text-xs">
              {roadSegments.map(seg => (
                <div
                  key={seg.id}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">{seg.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {seg.distanceKm} km · {seg.isBlocked ? `${seg.waterDepthCm}cm water` : 'Passable'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleRoadBlockage(seg.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition shrink-0 ${
                      seg.isBlocked
                        ? 'bg-red-950 text-red-300 border border-red-700 hover:bg-red-900'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {seg.isBlocked ? 'Blocked (Unblock)' : 'Simulate Block'}
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
