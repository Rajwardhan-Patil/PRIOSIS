import React from 'react'
import {
  Map,
  AlertCircle,
  Activity,
  LifeBuoy,
  GitFork,
  Radio,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

interface LeftRailProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const LeftRail: React.FC<LeftRailProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, incidents } = useIncidentContext()

  const hasUncontainedIncidents = incidents.some(i => i.status === 'active' || i.status === 'reported')

  const navItems = [
    { id: 'dashboard', label: 'Command', icon: Map },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle, hasDot: hasUncontainedIncidents },
    { id: 'risk', label: 'Risk model', icon: Activity },
    { id: 'resources', label: 'Units', icon: LifeBuoy },
    { id: 'routing', label: 'Routes', icon: GitFork },
    { id: 'datasources', label: 'Data sources', icon: Radio },
    { id: 'about', label: 'About', icon: FileText },
  ]

  return (
    <nav
      className={`bg-[#181b22] border-r border-[#242833] flex flex-col justify-between select-none shrink-0 transition-all duration-200 ${
        isCollapsed ? 'w-12' : 'w-48'
      }`}
    >
      <div className="py-2 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors relative ${
                isActive
                  ? 'bg-[#222631] text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1e222b]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </div>

      <div className="p-2 border-t border-[#242833]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#222631] transition-colors"
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  )
}

