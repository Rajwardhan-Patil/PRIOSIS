import React, { useState } from 'react'
import {
  AlertTriangle,
  LifeBuoy,
  GitFork,
  Activity,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  Radio,
  Sparkles,
  Layers,
  ChevronDown,
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
    hydrology,
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

  const situationalBriefing = generateSituationalBriefing(zones, incidents, resources)

  return (
    <div className="space-y-4">
      {/* Precision Operational Telemetry Bar (No generic cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border-b border-[#1b253b] pb-3">
        <div className="p-3 bg-[#0a0f1b] border border-[#1b263c] rounded space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>ACTIVE INUNDATIONS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{activeIncidents.length}</span>
            <span className="text-[10px] text-red-400 font-mono font-medium">
              {incidents.filter(i => i.severity === 'critical').length} CRITICAL
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-[#162033]">
            <span>Resolved: {incidents.filter(i => i.status === 'resolved').length}</span>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              View Feed →
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#0a0f1b] border border-[#1b263c] rounded space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>HIGH-RISK SECTORS</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{criticalCount + highCount}</span>
            <span className="text-[10px] text-zinc-400 font-mono">OF {zones.length} MONITORED</span>
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-[#162033]">
            <span>Lead: <strong className="text-red-400 font-semibold">{rankedZones[0]?.name.split(' ')[0]}</strong></span>
            <button
              onClick={() => setActiveTab('risk')}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Inspect Weights →
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#0a0f1b] border border-[#1b263c] rounded space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>FLEET READINESS</span>
            <LifeBuoy className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{availableUnits.length}</span>
            <span className="text-[10px] text-teal-400 font-mono font-medium">
              READY / {resources.length} TOTAL
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-[#162033]">
            <span>Deployed: {resources.filter(r => r.status === 'assigned').length} units</span>
            <button
              onClick={() => setActiveTab('resources')}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Deploy Units →
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#0a0f1b] border border-[#1b263c] rounded space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span>CORRIDOR PASSABILITY</span>
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tracking-tight">{blockedRoutes.length}</span>
            <span className={`text-[10px] font-mono font-medium ${blockedRoutes.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {blockedRoutes.length > 0 ? 'CORRIDORS SEVERED' : 'ALL CLEAR'}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-[#162033]">
            <span>Network: 14 Links</span>
            <button
              onClick={() => setActiveTab('routing')}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Reroute Engine →
            </button>
          </div>
        </div>
      </div>

      {/* Structured Situational Directives */}
      <div className="p-3 bg-[#0b101c] border border-[#1c273e] rounded flex items-start gap-3">
        <div className="p-1.5 rounded bg-[#101726] border border-[#1f2b42] text-teal-400 shrink-0 mt-0.5">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              OPERATIONAL SITUATION DIRECTIVE · AUTO-SYNTHESIZED
            </span>
            <span className="text-[9px] font-mono text-zinc-500">MODEL REFRESH: REAL-TIME</span>
          </div>
          <p className="text-[11px] font-mono text-zinc-300 leading-relaxed whitespace-pre-line">
            {situationalBriefing}
          </p>
        </div>
      </div>

      {/* Main Command Grid: Geospatial Map + Operational Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Tactical Map */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
                Geospatial Command Map
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#0d1422] text-zinc-400 border border-[#1e2a42]">
                MUTHA-MULA CONFLUENCE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>LIVE CARTO TILES</span>
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

        {/* Right 5 Cols: Prioritized Ward Operational Queue */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
                Prioritized Ward Queue
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({filteredZones.length})
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-0.5 bg-[#0a0f1a] p-0.5 rounded border border-[#1b253b] text-[10px] font-mono">
              {['all', 'critical', 'high', 'moderate'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterPriority(f)}
                  className={`px-2 py-0.5 rounded uppercase font-medium transition-colors ${
                    filterPriority === f
                      ? 'bg-[#182338] text-teal-300 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredZones.map((zone, index) => {
              const isSelected = zone.id === selectedZoneId
              const priorityClass =
                zone.priority === 'Critical'
                  ? 'bg-red-950/70 text-red-300 border-red-800/80'
                  : zone.priority === 'High'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                  : zone.priority === 'Moderate'
                  ? 'bg-yellow-950/70 text-yellow-300 border-yellow-800/80'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#101726] border-teal-500/80 shadow-sm'
                      : 'bg-[#0a0f1b] border-[#1a2336] hover:border-[#283857] hover:bg-[#0e1524]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-zinc-500 font-bold">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-xs text-white">
                          {zone.name}
                        </h4>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                        <span>W{zone.wardNumber}</span>
                        <span className="text-zinc-600">·</span>
                        <span>POP {zone.population.toLocaleString()}</span>
                        <span className="text-zinc-600">·</span>
                        <span>INC: <strong className="text-zinc-300">{zone.activeIncidentCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-wider border ${priorityClass}`}>
                        {zone.priority}
                      </span>
                      <span className="text-sm font-mono font-bold text-white mt-0.5">
                        {zone.riskScore}
                        <span className="text-[10px] font-normal text-zinc-500">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Factor Contribution Micro-Bars */}
                  <div className="grid grid-cols-5 gap-1 mt-2 pt-1.5 border-t border-[#172134] text-[9px] font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[8px]">HAZ</span>
                      <div className="w-full bg-[#182337] h-1 rounded-sm mt-0.5">
                        <div className="h-full bg-red-500 rounded-sm" style={{ width: `${zone.factors.hazard}%` }} />
                      </div>
                      <span className="text-zinc-400">{zone.factors.hazard}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px]">EXP</span>
                      <div className="w-full bg-[#182337] h-1 rounded-sm mt-0.5">
                        <div className="h-full bg-amber-500 rounded-sm" style={{ width: `${zone.factors.exposure}%` }} />
                      </div>
                      <span className="text-zinc-400">{zone.factors.exposure}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px]">VUL</span>
                      <div className="w-full bg-[#182337] h-1 rounded-sm mt-0.5">
                        <div className="h-full bg-yellow-500 rounded-sm" style={{ width: `${zone.factors.vulnerability}%` }} />
                      </div>
                      <span className="text-zinc-400">{zone.factors.vulnerability}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px]">ACC</span>
                      <div className="w-full bg-[#182337] h-1 rounded-sm mt-0.5">
                        <div className="h-full bg-cyan-500 rounded-sm" style={{ width: `${zone.factors.accessibilityRisk}%` }} />
                      </div>
                      <span className="text-zinc-400">{zone.factors.accessibilityRisk}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px]">SCA</span>
                      <div className="w-full bg-[#182337] h-1 rounded-sm mt-0.5">
                        <div className="h-full bg-purple-500 rounded-sm" style={{ width: `${zone.factors.resourceScarcity}%` }} />
                      </div>
                      <span className="text-zinc-400">{zone.factors.resourceScarcity}</span>
                    </div>
                  </div>

                  {/* Primary Recommendation Line */}
                  <div className="mt-1.5 text-[10px] text-teal-300 font-mono bg-[#0c1422] p-1 rounded border border-[#18253a] flex items-center gap-1">
                    <span className="text-teal-400 font-bold shrink-0">REC:</span>
                    <span className="truncate">{zone.recommendedActions[0]}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Target Sector Directives & Mission Event Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Target Sector Focus Panel */}
        <div className="lg:col-span-7 bg-[#0a0f1b] border border-[#1b253b] rounded p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#172134] pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-teal-400">
                  Target Sector Telemetry
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#101726] text-zinc-400 border border-[#1d2940]">
                  Ward {selectedZone.wardNumber}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{selectedZone.name}</h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('risk')}
                className="px-2.5 py-1 rounded bg-[#121c2e] hover:bg-[#18253d] text-teal-300 border border-[#233554] text-[11px] font-medium transition-colors"
              >
                Analyze Factors
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-semibold transition-colors"
              >
                Dispatch Units
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-[#070b13] border border-[#162033] space-y-1">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                PRIMARY RISK DRIVERS
              </span>
              <ul className="space-y-0.5 text-zinc-300 font-mono text-[10px]">
                {selectedZone.topDrivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-teal-400">›</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded bg-[#070b13] border border-[#162033] space-y-1">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                TACTICAL RECOMMENDATIONS
              </span>
              <ul className="space-y-0.5 text-zinc-300 font-mono text-[10px]">
                {selectedZone.recommendedActions.slice(0, 3).map((a, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-400">›</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mission Event Ledger (Audit Log) */}
        <div className="lg:col-span-5 bg-[#0a0f1b] border border-[#1b253b] rounded p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-[#172134] pb-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>Real-Time Audit Ledger</span>
            </span>
            <span className="text-[9px] font-mono text-zinc-500">TAMPER-EVIDENT</span>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="p-1.5 rounded bg-[#070b13] border border-[#162033] text-[10px] font-mono space-y-0.5"
              >
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="font-semibold text-zinc-200 truncate">{log.title}</span>
                  <span className="text-zinc-500 text-[9px] ml-2 shrink-0">{log.timestamp}</span>
                </div>
                <p className="text-zinc-400 text-[9px] leading-tight line-clamp-1">
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
