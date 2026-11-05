import React, { useState } from 'react'
import {
  AlertTriangle,
  Flame,
  LifeBuoy,
  GitFork,
  Activity,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Radio,
  Sparkles,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { LeafletMap } from '../map/LeafletMap'
import { generateSituationalBriefing } from '../../services/aiExplanationEngine'

export const OperationsDashboard: React.FC = () => {
  const {
    zones,
    rankedZones,
    incidents,
    resources,
    shelters,
    roadSegments,
    auditLogs,
    selectedZoneId,
    setSelectedZoneId,
    setActiveTab,
    toggleRoadBlockage,
    activeRouteResult,
  } = useIncidentContext()

  const [filterPriority, setFilterPriority] = useState<string>('all')

  const criticalCount = zones.filter(z => z.priority === 'Critical').length
  const highCount = zones.filter(z => z.priority === 'High').length
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'reported')
  const availableUnits = resources.filter(r => r.status === 'available')
  const blockedRoutes = roadSegments.filter(s => s.isBlocked)

  const selectedZone = zones.find(z => z.id === selectedZoneId) || rankedZones[0]

  const filteredZones = rankedZones.filter(z => {
    if (filterPriority === 'all') return true
    return z.priority.toLowerCase() === filterPriority.toLowerCase()
  })

  // Executive AI briefing
  const situationalBriefing = generateSituationalBriefing(zones, incidents, resources)

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Incidents
            </span>
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{activeIncidents.length}</span>
            <span className="text-xs text-red-400 font-semibold">
              {incidents.filter(i => i.severity === 'critical').length} Critical Inundations
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Resolved: {incidents.filter(i => i.status === 'resolved').length}</span>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
            >
              <span>Explorer</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: High Priority Zones */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              High / Critical Zones
            </span>
            <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{criticalCount + highCount}</span>
            <span className="text-xs text-slate-400">of {zones.length} monitored sectors</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Top Sector: <strong className="text-red-400">{rankedZones[0]?.name.split(' ')[0]}</strong></span>
            <button
              onClick={() => setActiveTab('risk')}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
            >
              <span>Explain</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Available Response Units */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Units
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{availableUnits.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">
              Ready for immediate dispatch
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Deployed: {resources.filter(r => r.status === 'assigned').length} units</span>
            <button
              onClick={() => setActiveTab('resources')}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
            >
              <span>Allocate</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Blocked Corridors */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Blocked Corridors
            </span>
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{blockedRoutes.length}</span>
            <span className={`text-xs font-semibold ${blockedRoutes.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {blockedRoutes.length > 0 ? 'Detours Active' : 'All Passable'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Network: 14 Segments</span>
            <button
              onClick={() => setActiveTab('routing')}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
            >
              <span>Replanning</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Situational Briefing Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3 shadow-md">
        <div className="p-2 rounded-lg bg-teal-500/15 border border-teal-400/30 text-teal-400 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-300 uppercase tracking-wide">
              Autonomous AI Situational Briefing
            </span>
            <span className="text-[10px] text-slate-400">Updated Real-Time</span>
          </div>
          <p className="leading-relaxed text-slate-300 whitespace-pre-line font-mono text-[11px]">
            {situationalBriefing}
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Ranked Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                Geospatial Operational Map
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Pune Urban Basin
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>Live OSM Tiles</span>
              </span>
            </div>
          </div>

          <LeafletMap
            zones={zones}
            incidents={incidents}
            resources={resources}
            shelters={shelters}
            roadSegments={roadSegments}
            activeRoute={activeRouteResult}
            selectedZoneId={selectedZoneId}
            onSelectZone={id => setSelectedZoneId(id)}
            onToggleBlockage={id => toggleRoadBlockage(id)}
            height="520px"
          />
        </div>

        {/* Right 5 Cols: Ranked Zone Priority Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Prioritized Zone Queue</span>
            </h2>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              {['all', 'critical', 'high', 'moderate'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterPriority(f)}
                  className={`px-2 py-0.5 rounded capitalize font-medium transition ${
                    filterPriority === f
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Ranked Zone Cards */}
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredZones.map((zone, index) => {
              const isSelected = zone.id === selectedZoneId
              const badgeClass =
                zone.priority === 'Critical'
                  ? 'bg-red-950 text-red-300 border-red-700'
                  : zone.priority === 'High'
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : zone.priority === 'Moderate'
                  ? 'bg-yellow-950 text-yellow-300 border-yellow-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h3 className="font-bold text-sm text-slate-100 hover:text-teal-300 transition">
                          {zone.name}
                        </h3>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Ward {zone.wardNumber}</span>
                        <span>Pop: {zone.population.toLocaleString()}</span>
                        <span>Incidents: {zone.activeIncidentCount}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                        {zone.priority}
                      </span>
                      <span className="text-xl font-black text-slate-100 mt-0.5">
                        {zone.riskScore}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Factor Progress Bars mini */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-400 text-[9px] block">Hazard (35%)</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-0.5">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${zone.factors.hazard}%` }} />
                      </div>
                      <span className="text-slate-300 font-mono mt-0.5 block">{zone.factors.hazard}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Expo (25%)</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-0.5">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${zone.factors.exposure}%` }} />
                      </div>
                      <span className="text-slate-300 font-mono mt-0.5 block">{zone.factors.exposure}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Vuln (20%)</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-0.5">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${zone.factors.vulnerability}%` }} />
                      </div>
                      <span className="text-slate-300 font-mono mt-0.5 block">{zone.factors.vulnerability}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Access (10%)</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-0.5">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${zone.factors.accessibilityRisk}%` }} />
                      </div>
                      <span className="text-slate-300 font-mono mt-0.5 block">{zone.factors.accessibilityRisk}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Scarce (10%)</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-0.5">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${zone.factors.resourceScarcity}%` }} />
                      </div>
                      <span className="text-slate-300 font-mono mt-0.5 block">{zone.factors.resourceScarcity}</span>
                    </div>
                  </div>

                  {/* Recommended Action Pill */}
                  <div className="mt-2 text-[11px] text-teal-300 bg-teal-950/40 p-2 rounded-lg border border-teal-900/50 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">Rec:</span>
                    <span className="line-clamp-1">{zone.recommendedActions[0]}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Selected Zone Action Deep Dive + Audit Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Zone Inspection Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                  Target Sector Focus
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Ward {selectedZone.wardNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100">{selectedZone.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('risk')}
                className="px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/50 text-xs font-semibold transition"
              >
                Deep Factor Analysis
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                Dispatch Units
              </button>
            </div>
          </div>

          {/* Primary Ranking Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wide text-[10px]">
                Top Ranking Drivers
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedZone.topDrivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wide text-[10px]">
                Field Response Actions
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedZone.recommendedActions.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Last Sensor Synchronization: <strong>{selectedZone.dataFreshnessMinutes} mins ago</strong></span>
            <span>Assigned Units: <strong className="text-teal-400">{selectedZone.assignedResourceIds.length}</strong></span>
          </div>
        </div>

        {/* Audit Log / Event Feed */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Real-Time Audit Trail</span>
            </h3>
            <span className="text-[10px] text-slate-400">Deterministic Log</span>
          </div>

          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
            {auditLogs.slice(0, 6).map(log => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{log.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
