import React, { useState } from 'react'
import { HelpCircle, X, Sun, Moon, Sparkles } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

interface StatusBarProps {
  onOpenShortcuts: () => void
  onToggleTour: () => void
  onOpenNuGenAdvisor?: () => void
  isTourOpen: boolean
}

export const StatusBar: React.FC<StatusBarProps> = ({
  onOpenShortcuts,
  onOpenNuGenAdvisor,
}) => {
  const {
    rankedZones,
    incidents,
    resources,
    hydrology,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
  } = useIncidentContext()

  const [isDemoNoticeOpen, setIsDemoNoticeOpen] = useState(false)

  const criticalCount = rankedZones.filter(z => z.priority === 'Critical').length
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'reported').length
  const readyUnits = resources.filter(r => r.status === 'available').length
  const totalUnits = resources.length

  const navTabs = [
    { id: 'dashboard', label: language === 'mr' ? 'कमांड' : 'Command' },
    { id: 'incidents', label: language === 'mr' ? 'घटना' : 'Incidents' },
    { id: 'resources', label: language === 'mr' ? 'पथके' : 'Units' },
    { id: 'routing', label: language === 'mr' ? 'मार्ग' : 'Routes' },
    { id: 'risk', label: language === 'mr' ? 'जोखीम मॉडेल' : 'Risk model' },
    { id: 'datasources', label: language === 'mr' ? 'डेटा स्रोत' : 'Data' },
  ]

  return (
    <header className="h-12 bg-[#15171A] border-b border-[#2A2D33] text-[#ECEDEF] px-3.5 flex items-center justify-between select-none relative z-30">
      {/* Left: Wordmark, Place & Navigation Text Tabs */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-[#ECEDEF]">PRIORIS</span>
          <span className="text-[#858A93]">/</span>
          <span className="text-xs text-[#A1A5AD]">Pune Urban Basin</span>
        </div>

        {/* Text Navigation Tabs (Horizontal top bar, no icon rail) */}
        <nav className="flex items-center gap-1">
          {navTabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs rounded transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#1C1F23] text-[#ECEDEF] font-medium'
                    : 'text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23]/60'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Center: Single Status Line with Explicit Units (Appears once in the whole app!) */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-[#A1A5AD]">
        <span className="font-medium text-[#F2555A] font-mono-numbers">{criticalCount} critical</span>
        <span className="text-[#858A93]">·</span>
        <span className="font-mono-numbers">{activeIncidents} active incidents</span>
        <span className="text-[#858A93]">·</span>
        <span className="text-[#4CB782] font-mono-numbers">{readyUnits} of {totalUnits} units ready</span>
        <span className="text-[#858A93]">·</span>
        <span className="font-mono-numbers">{hydrology.outflowDischargeCusecs.toLocaleString()} cusecs</span>
        <span className="text-[#858A93]">·</span>
        <span className="font-mono-numbers">544.2 m MSL</span>
      </div>

      {/* Right: Language toggle, Dark/White mode, Help, Demo Popover */}
      <div className="flex items-center gap-2 text-xs">
        {/* NuGen Tactical Advisor */}
        {onOpenNuGenAdvisor && (
          <button
            onClick={onOpenNuGenAdvisor}
            className="px-2 py-0.5 rounded text-[11px] font-medium border border-[#2A2D33] text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] flex items-center gap-1 transition-colors"
            title="NuGen Tactical Advisor (N)"
          >
            <Sparkles className="w-3 h-3 text-[#E8B923]" />
            <span>NuGen</span>
          </button>
        )}

        {/* Marathi / English Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-2 py-0.5 rounded text-[11px] font-medium border border-[#2A2D33] text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] transition-colors"
          title="Toggle English / मराठी language"
        >
          {language === 'mr' ? 'English' : 'मराठी'}
        </button>

        {/* Dark / White Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] transition-colors"
          title={theme === 'dark' ? 'Switch to White mode (T)' : 'Switch to Dark mode (T)'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Keyboard Shortcuts Helper */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] transition-colors"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Demo Tag with Popover */}
        <div className="relative">
          <button
            onClick={() => setIsDemoNoticeOpen(!isDemoNoticeOpen)}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1C1F23] text-[#A1A5AD] hover:text-[#ECEDEF] border border-[#2A2D33] transition-colors"
          >
            Demo
          </button>

          {isDemoNoticeOpen && (
            <div className="absolute right-0 top-8 z-[9998] w-72 bg-[#15171A] border border-[#2A2D33] rounded-md p-3 text-xs text-[#ECEDEF] shadow-lg space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span>Prototype Decision Support</span>
                <button
                  onClick={() => setIsDemoNoticeOpen(false)}
                  className="text-[#858A93] hover:text-[#ECEDEF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#A1A5AD] leading-relaxed">
                PRIORIS is an experimental decision-support system built for research and evaluation. It assists human duty officers and does not supersede national emergency channels (112, NDMA, IMD).
              </p>
              <div className="text-[10px] text-[#858A93] pt-1 border-t border-[#2A2D33]">
                Location: Pune Urban Basin · Direct OSM base map
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
