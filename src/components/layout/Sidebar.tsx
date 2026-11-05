import React from 'react'
import {
  LayoutDashboard,
  AlertCircle,
  Activity,
  LifeBuoy,
  GitFork,
  Radio,
  Info,
  Waves,
  ChevronRight,
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

  const navItems = [
    {
      id: 'dashboard',
      label: 'Operations Dashboard',
      icon: LayoutDashboard,
      badge: criticalZoneCount > 0 ? `${criticalZoneCount} Crit` : undefined,
      badgeColor: 'bg-red-950 text-red-300 border-red-800',
    },
    {
      id: 'incidents',
      label: 'Incident Explorer',
      icon: AlertCircle,
      badge: `${activeIncidentCount}`,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'risk',
      label: 'Risk Analysis Engine',
      icon: Activity,
      badge: '5 Factors',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    },
    {
      id: 'resources',
      label: 'Resource Allocation',
      icon: LifeBuoy,
      badge: `${availableResourceCount} Free`,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      id: 'routing',
      label: 'Route Replanning',
      icon: GitFork,
      badge: blockedRoadCount > 0 ? `${blockedRoadCount} Blocked` : 'Clear',
      badgeColor: blockedRoadCount > 0 ? 'bg-red-950 text-red-300 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'datasources',
      label: 'Data Sources & Feeds',
      icon: Radio,
      badge: 'Live',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    },
    {
      id: 'about',
      label: 'About & Governance',
      icon: Info,
    },
  ]

  return (
    <aside className="w-full lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-3 select-none">
      {/* Navigation Links */}
      <nav className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Command & Control
        </div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* River Basin Hydrology Widget */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <Waves className="w-4 h-4" />
            <span>Khadakwasla Spillway</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
            {hydrology.status.toUpperCase()}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Discharge: <strong className="text-slate-200">{hydrology.outflowDischargeCusecs.toLocaleString()}</strong> cusecs
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${hydrology.reservoirCapacityPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Capacity: {hydrology.reservoirCapacityPercent}%</span>
          <span>River: {hydrology.muthaRiverLevelMeters}m</span>
        </div>
      </div>
    </aside>
  )
}
