import React, { useState } from 'react'
import {
  GitFork,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { CommandMap } from '../map/CommandMap'
import { PUNE_ROAD_NODES } from '../../services/routingEngine'
import { Toast, ToastMessage } from '../common/Toast'

export const RoutesView: React.FC = () => {
  const {
    zones,
    incidents,
    resources,
    roadSegments,
    routeFromNode,
    routeToNode,
    setRouteNodes,
    activeRouteResult,
    toggleRoadBlockage,
    recomputeActiveRoute,
    selectedZoneId,
    setSelectedZoneId,
  } = useIncidentContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterState, setFilterState] = useState<'all' | 'blocked' | 'passable'>('all')
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const blockedCount = roadSegments.filter(s => s.isBlocked).length
  const passableCount = roadSegments.length - blockedCount

  const filteredSegments = roadSegments.filter(seg => {
    const matchesSearch =
      seg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seg.blockageReason && seg.blockageReason.toLowerCase().includes(searchTerm.toLowerCase()))
    if (!matchesSearch) return false

    if (filterState === 'blocked') return seg.isBlocked
    if (filterState === 'passable') return !seg.isBlocked
    return true
  })

  const handleToggleBlockage = (segmentId: string) => {
    const seg = roadSegments.find(s => s.id === segmentId)
    if (!seg) return

    const willBlock = !seg.isBlocked
    toggleRoadBlockage(
      segmentId,
      willBlock,
      willBlock ? 'Baba Bhide causeway flooded, 0.85 m' : undefined
    )

    setToast({
      id: `toast-${Date.now()}`,
      title: willBlock ? `Closed: ${seg.name}` : `Reopened: ${seg.name}`,
      description: willBlock
        ? 'Route graph recalculated. Alternate corridor activated.'
        : 'Segment restored to passable network.',
      undoAction: () => {
        toggleRoadBlockage(segmentId, !willBlock)
      },
    })
  }

  const handleTriggerReroute = () => {
    setIsRecalculating(true)
    recomputeActiveRoute()
    setTimeout(() => {
      setIsRecalculating(false)
      setToast({
        id: `toast-${Date.now()}`,
        title: 'Route recalculated',
        description: 'Updated corridor coordinates based on current road network state.',
      })
    }, 300)
  }

  const handleSetPreset = (from: string, to: string) => {
    setRouteNodes(from, to)
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-48px)] overflow-hidden bg-[#0E0F11] text-[#ECEDEF]">
      {/* Toast notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Main split: Map (60%) + Route Inspector Panel (40%) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Map */}
        <div className="lg:w-[58%] h-72 lg:h-full relative shrink-0 border-b lg:border-b-0 lg:border-r border-[#2A2D33]">
          <CommandMap
            zones={zones}
            incidents={incidents}
            resources={resources}
            roadSegments={roadSegments}
            activeRoute={activeRouteResult}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            onToggleBlockage={handleToggleBlockage}
          />
        </div>

        {/* Right: Route planning & corridors panel */}
        <div className="lg:w-[42%] flex-1 flex flex-col bg-[#0E0F11] overflow-hidden">
          {/* Header Strip */}
          <div className="p-3.5 border-b border-[#2A2D33] bg-[#15171A] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-medium text-[#ECEDEF]">Transit corridors & routing</h2>
                <p className="text-xs text-[#A1A5AD]">
                  {blockedCount > 0 ? (
                    <span className="text-[#F2555A] font-medium">
                      {blockedCount} arterial corridor{blockedCount > 1 ? 's' : ''} blocked
                    </span>
                  ) : (
                    <span className="text-[#4CB782] font-medium">All corridors passable</span>
                  )}
                  <span className="text-[#858A93] mx-1.5">·</span>
                  <span>{passableCount} open</span>
                </p>
              </div>

              <button
                onClick={handleTriggerReroute}
                disabled={isRecalculating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#ECEDEF] hover:bg-[#FFFFFF] text-[#0E0F11] transition-colors shadow-sm"
                title="Recalculate route based on latest road blockages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                <span>Re-route</span>
              </button>
            </div>

            {/* Origin & Destination pickers */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#858A93] mb-1">Origin</label>
                <select
                  value={routeFromNode}
                  onChange={e => setRouteNodes(e.target.value, routeToNode)}
                  className="w-full bg-[#0E0F11] border border-[#2A2D33] rounded px-2 py-1.5 text-xs text-[#ECEDEF] focus:outline-none"
                >
                  {Object.values(PUNE_ROAD_NODES).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#858A93] mb-1">Destination</label>
                <select
                  value={routeToNode}
                  onChange={e => setRouteNodes(routeFromNode, e.target.value)}
                  className="w-full bg-[#0E0F11] border border-[#2A2D33] rounded px-2 py-1.5 text-xs text-[#ECEDEF] focus:outline-none"
                >
                  {Object.values(PUNE_ROAD_NODES).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Route Presets */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px]">
              <span className="text-zinc-500 shrink-0">Presets:</span>
              <button
                onClick={() => handleSetPreset('N_SHIVAJINAGAR', 'N_DECCAN')}
                className="px-2 py-0.5 rounded bg-[#222631] text-zinc-300 hover:text-white hover:bg-[#2b303e] shrink-0"
              >
                Shivajinagar → Deccan
              </button>
              <button
                onClick={() => handleSetPreset('N_PUNE_STATION', 'N_KASBA_PETH')}
                className="px-2 py-0.5 rounded bg-[#222631] text-zinc-300 hover:text-white hover:bg-[#2b303e] shrink-0"
              >
                Station → Kasba Peth
              </button>
              <button
                onClick={() => handleSetPreset('N_SWARGATE', 'N_YERAWADA')}
                className="px-2 py-0.5 rounded bg-[#222631] text-zinc-300 hover:text-white hover:bg-[#2b303e] shrink-0"
              >
                Swargate → Yerawada
              </button>
            </div>
          </div>

          {/* Scrollable Content: Active Route Summary + Corridors List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* Active Route Analysis Card */}
            {activeRouteResult && (
              <div
                className={`p-3 rounded-lg border space-y-2.5 ${
                  activeRouteResult.isDirectRouteBlocked
                    ? 'bg-[#1e1919] border-red-900/60'
                    : 'bg-[#181b22] border-[#242833]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeRouteResult.isDirectRouteBlocked ? (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white">
                      {activeRouteResult.isDirectRouteBlocked ? 'Detour Active (Direct Path Severed)' : 'Direct Path Clear'}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      activeRouteResult.isDirectRouteBlocked
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {activeRouteResult.isDirectRouteBlocked ? 'Rerouted' : 'Optimal'}
                  </span>
                </div>

                {/* Before vs After Distance & ETA Comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#111317] border border-[#242833]">
                    <div className="text-[11px] text-zinc-400">Baseline (Direct)</div>
                    <div className="text-sm font-semibold text-zinc-300 mt-0.5 font-mono-numbers">
                      {activeRouteResult.originalDistanceKm} km · {activeRouteResult.originalTimeMin} min
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#111317] border border-[#242833]">
                    <div className="text-[11px] text-zinc-400">Current (Active)</div>
                    <div
                      className={`text-sm font-semibold mt-0.5 font-mono-numbers ${
                        activeRouteResult.isDirectRouteBlocked ? 'text-amber-300' : 'text-emerald-400'
                      }`}
                    >
                      {activeRouteResult.currentDistanceKm} km · {activeRouteResult.currentTimeMin} min
                      {activeRouteResult.detourDistanceKm > 0 && (
                        <span className="text-xs text-red-400 block font-normal">
                          +{activeRouteResult.detourDistanceKm} km (+{activeRouteResult.detourTimeMin} min)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="text-xs text-zinc-300 leading-relaxed bg-[#111317] p-2 rounded border border-[#242833]">
                  <span className="font-medium text-white block mb-0.5">Corridor Assessment:</span>
                  {activeRouteResult.rerouteReason}
                </div>

                {/* Waypoints sequence */}
                {activeRouteResult.currentPath.length > 0 && (
                  <div className="text-xs text-zinc-400">
                    <span className="text-[11px] font-medium text-zinc-500 block mb-1">Waypoints:</span>
                    <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono-numbers text-zinc-300">
                      {activeRouteResult.currentPath.map((nodeKey, idx) => (
                        <React.Fragment key={nodeKey}>
                          <span className="px-1.5 py-0.5 rounded bg-[#222631] text-zinc-200">
                            {PUNE_ROAD_NODES[nodeKey]?.name || nodeKey}
                          </span>
                          {idx < activeRouteResult.currentPath.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Arterial Corridors Inventory */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Arterial Corridors ({filteredSegments.length})</span>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setFilterState('all')}
                    className={`px-2 py-0.5 rounded ${
                      filterState === 'all' ? 'bg-[#2563eb] text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterState('blocked')}
                    className={`px-2 py-0.5 rounded ${
                      filterState === 'blocked' ? 'bg-red-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Blocked ({blockedCount})
                  </button>
                  <button
                    onClick={() => setFilterState('passable')}
                    className={`px-2 py-0.5 rounded ${
                      filterState === 'passable' ? 'bg-emerald-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Passable
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter corridor by name or bridge..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#181b22] border border-[#242833] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Corridors list */}
              <div className="space-y-1.5">
                {filteredSegments.map(seg => {
                  return (
                    <div
                      key={seg.id}
                      className={`p-2.5 rounded border transition-colors ${
                        seg.isBlocked
                          ? 'bg-[#1e1919] border-red-900/50'
                          : 'bg-[#181b22] border-[#242833] hover:border-[#2d3342]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{seg.name}</span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                seg.isBlocked
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {seg.isBlocked ? 'Blocked' : 'Passable'}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-400 font-mono-numbers">
                            {PUNE_ROAD_NODES[seg.fromNode]?.name || seg.fromNode} ↔{' '}
                            {PUNE_ROAD_NODES[seg.toNode]?.name || seg.toNode} · {seg.distanceKm} km · Max {seg.speedLimitKmh} km/h
                          </div>

                          {seg.isBlocked && (
                            <div className="text-[11px] text-red-300 pt-0.5">
                              <span>Reason: </span>
                              <span className="font-medium">{seg.blockageReason || 'Severe inundation'}</span>
                              {seg.waterDepthCm ? ` (${seg.waterDepthCm} cm depth)` : ''}
                            </div>
                          )}
                        </div>

                        {/* Toggle button */}
                        <button
                          onClick={() => handleToggleBlockage(seg.id)}
                          className={`text-xs px-2 py-1 rounded font-medium shrink-0 transition-colors ${
                            seg.isBlocked
                              ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                              : 'bg-[#222631] hover:bg-red-950 hover:text-red-300 text-zinc-300 border border-[#2d3240]'
                          }`}
                        >
                          {seg.isBlocked ? 'Clear' : 'Mark blocked'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
