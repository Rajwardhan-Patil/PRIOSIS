import React from 'react'
import {
  LayoutDashboard,
  AlertCircle,
  Activity,
  LifeBuoy,
  GitFork,
  Radio,
  FileText,
  Waves,
  Gauge,
  ArrowUpRight,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    incidents,
    resources,
    roadSegments,
    rankedZones,
    hydrology,
  } = useIncidentContext()

  const criticalZoneCount = rankedZones.filter(z => z.priority === 'Critical').length
  const activeIncidentCount = incidents.filter(i => i.status === 'active' || i.status === 'reported').length
  const availableResourceCount = resources.filter(r => r.status === 'available').length
  const blockedRoadCount = roadSegments.filter(r => r.isBlocked).length

  const primaryNav = [
    {
      id: 'dashboard',
      label: 'Operations Command',
      icon: LayoutDashboard,
      badge: criticalZoneCount > 0 ? `${criticalZoneCount} CRIT` : undefined,
      badgeStyle: 'bg-red-950/60 text-red-400 border-red-800/60',
    },
    {
      id: 'incidents',
      label: 'Incident Explorer',
      icon: AlertCircle,
      badge: `${activeIncidentCount}`,
      badgeStyle: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    },
    {
      id: 'risk',
      label: 'Risk Analysis Engine',
      icon: Activity,
      badge: '5-FACTOR',
      badgeStyle: 'bg-teal-950/60 text-teal-400 border-teal-800/60',
    },
    {
      id: 'resources',
      label: 'Resource Allocation',
      icon: LifeBuoy,
      badge: `${availableResourceCount} AVAIL`,
      badgeStyle: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    },
    {
      id: 'routing',
      label: 'Route Replanning',
      icon: GitFork,
      badge: blockedRoadCount > 0 ? `${blockedRoadCount} BLOCKED` : 'CLEAR',
      badgeStyle: blockedRoadCount > 0 ? 'bg-red-950/60 text-red-400 border-red-800/60' : 'bg-[#131c2d] text-zinc-400 border-[#23314c]',
    },
  ]

  const secondaryNav = [
    {
      id: 'datasources',
      label: 'Telemetry & Ingestion',
      icon: Radio,
      badge: 'LIVE',
      badgeStyle: 'bg-teal-950/60 text-teal-400 border-teal-800/60',
    },
    {
      id: 'about',
      label: 'Architecture & Scope',
      icon: FileText,
    },
  ]

  return (
    <aside className="w-full lg:w-60 bg-[#080c14] border-r border-[#1a2233] flex flex-col justify-between p-2.5 select-none shrink-0">
      {/* Top Navigation */}
      <div className="space-y-4">
        <div>
          <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider uppercase text-zinc-500 font-semibold">
            Tactical Operations
          </div>
          <nav className="space-y-0.5">
            {primaryNav.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#121c2e] text-teal-300 font-semibold border-l-2 border-teal-400 pl-2'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#0e1524]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-teal-400' : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${item.badgeStyle}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div>
          <div className="px-2.5 py-1.5 text-[9px] font-mono tracking-wider uppercase text-zinc-500 font-semibold">
            System & Provenance
          </div>
          <nav className="space-y-0.5">
            {secondaryNav.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#121c2e] text-teal-300 font-semibold border-l-2 border-teal-400 pl-2'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#0e1524]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-teal-400' : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${item.badgeStyle}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Basin Telemetry Console Widget */}
      <div className="mt-4 p-2.5 rounded bg-[#0b111d] border border-[#1b253b] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-semibold">
            <Waves className="w-3.5 h-3.5 text-teal-400" />
            <span>Mutha Basin Gauge</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-400 font-bold border border-amber-800/70">
            {hydrology.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-[#070b13] border border-[#172134]">
            <span className="text-zinc-500 block text-[9px]">DISCHARGE</span>
            <span className="text-zinc-200 font-bold">{hydrology.outflowDischargeCusecs.toLocaleString()}</span>
            <span className="text-zinc-500 text-[8px] ml-0.5">cfs</span>
          </div>
          <div className="p-1.5 rounded bg-[#070b13] border border-[#172134]">
            <span className="text-zinc-500 block text-[9px]">STORAGE</span>
            <span className="text-zinc-200 font-bold">{hydrology.reservoirCapacityPercent}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-mono text-zinc-500">
            <span>RIVER LEVEL</span>
            <span className="text-zinc-300 font-semibold">{hydrology.muthaRiverLevelMeters}m / {hydrology.dangerLevelMeters}m</span>
          </div>
          <div className="w-full bg-[#162033] h-1 rounded-sm overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-sm"
              style={{ width: `${(hydrology.muthaRiverLevelMeters / hydrology.dangerLevelMeters) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
