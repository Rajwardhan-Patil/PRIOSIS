import React, { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown,
  ChevronRight,
  LifeBuoy,
  AlertTriangle,
  CheckSquare,
  Square,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { CommandMap } from '../map/CommandMap'
import { Toast, ToastMessage } from '../common/Toast'
import { getSeverityColors } from '../../tokens'
import { generateNuGenDirective } from '../../services/nugenService'

interface CommandViewProps {
  onOpenNuGenAdvisor?: () => void
}

export const CommandView: React.FC<CommandViewProps> = ({ onOpenNuGenAdvisor }) => {
  const {
    zones,
    rankedZones,
    incidents,
    resources,
    roadSegments,
    activeRouteResult,
    selectedZoneId,
    setSelectedZoneId,
    setActiveTab,
    assignResource,
    unassignResource,
    toggleRoadBlockage,
    toggleChecklistStep,
    language,
  } = useIncidentContext()

  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(rankedZones[0]?.id || null)
  const [showAllFactors, setShowAllFactors] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const selectedZone = zones.find(z => z.id === selectedZoneId) || rankedZones[0]
  const worstZone = rankedZones[0]

  const [directiveText, setDirectiveText] = useState<string>(
    `Send rescue units to ${worstZone?.name.split(' ')[0] || 'Kasba'} first, then stage at Deccan Gymkhana. Khadakwasla spillway discharge increased to 18,500 cusecs, overtopping low causeways.`
  )
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [isNuGenSource, setIsNuGenSource] = useState(false)

  const handleSynthesizeDirective = async () => {
    setIsSynthesizing(true)
    try {
      const blockedNames = roadSegments.filter(r => r.isBlocked).map(r => r.name)
      const res = await generateNuGenDirective({
        worstWardName: worstZone?.name || 'Kasba Peth',
        worstWardPriority: worstZone?.priority || 'Critical',
        worstWardScore: worstZone?.riskScore || 84.1,
        dischargeCusecs: 18500,
        activeIncidentsCount: incidents.filter(i => i.status !== 'resolved').length,
        readyUnitsCount: resources.filter(r => r.status === 'available').length,
        blockedRoads: blockedNames,
      })
      setDirectiveText(res)
      setIsNuGenSource(true)
      setToast({
        id: `nugen-${Date.now()}`,
        title: 'NuGen AI Directive Synthesized',
        description: 'Real-time operational directive updated via Qwen2.5.',
      })
    } catch {
      // handled inside service
    } finally {
      setIsSynthesizing(false)
    }
  }

  // Synchronize expanded state with selectedZoneId
  useEffect(() => {
    if (selectedZoneId) {
      setExpandedZoneId(selectedZoneId)
    }
  }, [selectedZoneId])

  // Keyboard navigation through queue
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return

      const currentIndex = rankedZones.findIndex(z => z.id === (selectedZoneId || rankedZones[0]?.id))

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = Math.min(rankedZones.length - 1, currentIndex + 1)
        const nextId = rankedZones[nextIndex].id
        setSelectedZoneId(nextId)
        setExpandedZoneId(nextId)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = Math.max(0, currentIndex - 1)
        const prevId = rankedZones[prevIndex].id
        setSelectedZoneId(prevId)
        setExpandedZoneId(prevId)
      } else if (e.key === 'Enter') {
        if (selectedZoneId) {
          setExpandedZoneId(prev => (prev === selectedZoneId ? null : selectedZoneId))
        }
      } else if (e.key === 'd' || e.key === 'D') {
        handleDispatchNearest(selectedZone)
      }
    },
    [rankedZones, selectedZoneId, selectedZone]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleDispatchNearest = (target: typeof selectedZone) => {
    const availableUnit = resources.find(r => r.status === 'available')
    if (!availableUnit) {
      setToast({
        id: `toast-${Date.now()}`,
        title: 'No response units available',
        description: 'All 7 registered units are currently deployed or out of service.',
      })
      return
    }

    assignResource(availableUnit.id, target.id)

    setToast({
      id: `toast-${Date.now()}`,
      title: `Dispatched ${availableUnit.name}`,
      description: `En route to ${target.name}. ETA 8 min.`,
      undoAction: () => {
        unassignResource(availableUnit.id)
      },
    })
  }

  const nearestAvailableUnit = resources.find(r => r.status === 'available') || resources[0]
  const wardIncidents = incidents.filter(i => i.zoneId === selectedZone.id && i.status !== 'resolved')

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-48px)] overflow-hidden bg-[#0E0F11] text-[#ECEDEF]">
      {/* 1. Hero Map (Edge-to-edge left area) */}
      <div className="flex-1 h-[55vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-[#2A2D33] overflow-hidden">
        <CommandMap
          zones={zones}
          incidents={incidents}
          resources={resources}
          roadSegments={roadSegments}
          activeRoute={activeRouteResult}
          selectedZoneId={selectedZoneId}
          language={language}
          onSelectZone={id => {
            setSelectedZoneId(id)
            setExpandedZoneId(id)
          }}
          onToggleBlockage={id => toggleRoadBlockage(id)}
        />
      </div>

      {/* 2. Fixed 420px Operations Side Panel */}
      <div className="w-full lg:w-[420px] shrink-0 h-[45vh] lg:h-full flex flex-col bg-[#15171A] border-l border-[#2A2D33] overflow-hidden">
        {/* Briefing Strip (Action first, cause second; max 2 sentences) */}
        <div className="p-4 border-b border-[#2A2D33] bg-[#15171A]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-[#858A93]">Current operational directive</span>
              {isNuGenSource && (
                <span className="px-1 py-0.2 rounded text-[9px] font-mono text-[#E8B923] bg-[#E8B923]/10 border border-[#E8B923]/20">
                  NUGEN
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSynthesizeDirective}
                disabled={isSynthesizing}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#2A2D33] text-[#A1A5AD] hover:text-[#ECEDEF] hover:bg-[#1C1F23] disabled:opacity-50 transition-colors"
                title="Synthesize real-time directive using NuGen Qwen2.5"
              >
                <Sparkles className={`w-2.5 h-2.5 text-[#E8B923] ${isSynthesizing ? 'animate-spin' : ''}`} />
                <span>{isSynthesizing ? 'Synthesizing...' : 'NuGen AI'}</span>
              </button>
              {onOpenNuGenAdvisor && (
                <button
                  onClick={onOpenNuGenAdvisor}
                  className="text-[10px] text-[#858A93] hover:text-[#ECEDEF] underline transition-colors"
                  title="Open NuGen Tactical Advisor (N)"
                >
                  Advisor
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-[#ECEDEF] leading-relaxed">
            {directiveText}
          </p>
        </div>

        {/* Section Header: Ward Queue */}
        <div className="px-4 py-2 border-b border-[#2A2D33] flex items-center justify-between text-xs bg-[#15171A]">
          <span className="text-[12px] font-medium text-[#A1A5AD]">Ranked ward queue</span>
          <span className="text-[11px] text-[#858A93] font-mono-numbers">{rankedZones.length} wards assessed</span>
        </div>

        {/* Ranked Ward List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2A2D33]">
          {rankedZones.map((zone, index) => {
            const isSelected = zone.id === selectedZoneId
            const isExpanded = zone.id === expandedZoneId
            const colors = getSeverityColors(zone.priority)
            const displayName = language === 'mr' && zone.nameMr ? zone.nameMr : zone.name

            return (
              <div
                key={zone.id}
                className={`transition-colors duration-150 ${isSelected ? 'bg-[#1C1F23]' : 'hover:bg-[#1C1F23]/60'
                  }`}
              >
                {/* Collapsed Row */}
                <div
                  onClick={() => {
                    setSelectedZoneId(zone.id)
                    setExpandedZoneId(isExpanded ? null : zone.id)
                  }}
                  className="p-3.5 cursor-pointer space-y-2 select-none"
                >
                  {/* Top line: Rank, severity dot + label, name, score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-[#858A93] font-mono-numbers w-4 shrink-0">
                        {index + 1}.
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: colors.solid }}
                        />
                        <span
                          className="text-xs font-medium uppercase text-[11px]"
                          style={{ color: colors.solid }}
                        >
                          {zone.priority}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${language === 'mr' ? 'font-devanagari' : ''
                          } ${isSelected ? 'text-[#ECEDEF] font-semibold' : 'text-[#A1A5AD]'}`}
                      >
                        {displayName}
                      </span>
                    </div>

                    {/* Numeric Score */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-numbers text-xs font-semibold text-[#ECEDEF]">
                        {zone.riskScore}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#858A93]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#858A93]" />
                      )}
                    </div>
                  </div>

                  {/* Secondary line: Single-hue thin risk bar + Top driver in plain words */}
                  <div className="flex items-center gap-3 pl-6">
                    {/* Monochromatic single-hue risk bar */}
                    <div className="w-20 h-1 bg-[#24272D] rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-[#A1A5AD] rounded-full"
                        style={{ width: `${zone.riskScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#858A93] truncate">
                      {zone.topDrivers[0]}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Card */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#2A2D33] space-y-4 bg-[#15171A]">
                    {/* Why it ranks here: Top 2 drivers only */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[12px] font-medium text-[#A1A5AD]">Primary risk drivers</span>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setShowAllFactors(!showAllFactors)
                          }}
                          className="text-[11px] text-[#858A93] hover:text-[#ECEDEF] underline transition-colors"
                        >
                          {showAllFactors ? 'Hide factor list' : 'All factors'}
                        </button>
                      </div>

                      <div className="space-y-1 text-xs text-[#ECEDEF]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A1A5AD]">{zone.topDrivers[0]}</span>
                          <span className="font-mono-numbers text-xs text-[#ECEDEF]">
                            +{zone.factorContributions.hazard} pts
                          </span>
                        </div>
                        {zone.topDrivers[1] && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#A1A5AD]">{zone.topDrivers[1]}</span>
                            <span className="font-mono-numbers text-xs text-[#ECEDEF]">
                              +{zone.factorContributions.exposure} pts
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Monochromatic Factor Breakdown (Only when toggled) */}
                      {showAllFactors && (
                        <div className="mt-2 p-2.5 rounded bg-[#1C1F23] border border-[#2A2D33] space-y-1.5 text-xs">
                          <div className="flex justify-between text-[#858A93] text-[11px]">
                            <span>Hazard (35%)</span>
                            <span className="font-mono-numbers text-[#ECEDEF]">{zone.factors.hazard}/100</span>
                          </div>
                          <div className="flex justify-between text-[#858A93] text-[11px]">
                            <span>Exposure (25%)</span>
                            <span className="font-mono-numbers text-[#ECEDEF]">{zone.factors.exposure}/100</span>
                          </div>
                          <div className="flex justify-between text-[#858A93] text-[11px]">
                            <span>Vulnerability (20%)</span>
                            <span className="font-mono-numbers text-[#ECEDEF]">{zone.factors.vulnerability}/100</span>
                          </div>
                          <div className="flex justify-between text-[#858A93] text-[11px]">
                            <span>Accessibility risk (10%)</span>
                            <span className="font-mono-numbers text-[#ECEDEF]">{zone.factors.accessibilityRisk}/100</span>
                          </div>
                          <div className="flex justify-between text-[#858A93] text-[11px]">
                            <span>Resource scarcity (10%)</span>
                            <span className="font-mono-numbers text-[#ECEDEF]">{zone.factors.resourceScarcity}/100</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-[#2A2D33]" />

                    {/* Numbered Checklist: Up to 4 imperative steps, max 12 words */}
                    <div className="space-y-2">
                      <div className="text-[12px] font-medium text-[#A1A5AD]">Recommended action checklist</div>
                      <div className="space-y-2">
                        {(zone.checklistSteps || []).map((step, idx) => (
                          <div
                            key={step.id}
                            onClick={() => toggleChecklistStep(zone.id, step.id)}
                            className="flex items-start gap-2.5 p-2 rounded hover:bg-[#1C1F23] cursor-pointer transition-colors text-xs"
                          >
                            <span className="text-[#858A93] font-mono-numbers shrink-0 mt-0.5">
                              {idx + 1}.
                            </span>
                            <div className="mt-0.5 shrink-0 text-[#858A93]">
                              {step.isDone ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#4CB782]" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-[#858A93]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`leading-snug block ${step.isDone ? 'line-through text-[#858A93]' : 'text-[#ECEDEF]'
                                  }`}
                              >
                                {step.action}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 whitespace-nowrap ${step.urgency === 'Do now'
                                  ? 'text-[#F2555A] bg-[#F2555A]/10'
                                  : 'text-[#A1A5AD] bg-[#24272D]'
                                }`}
                            >
                              {step.urgency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-[#2A2D33]" />

                    {/* Nearest unit and route status */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="text-[11px] text-[#858A93]">Nearest response asset</div>
                        <div className="text-xs font-medium text-[#ECEDEF] mt-0.5">
                          {nearestAvailableUnit.name} · <span className="font-mono-numbers text-[#ECEDEF]">ETA 8 min</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-[#858A93]">Corridor clearance</div>
                        <div className="text-xs text-[#A1A5AD] leading-relaxed mt-0.5">
                          Direct route via J.M. Road blocked (0.85 m depth); detour required via Lakdi Pul (+5.0 km, +8 min).
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Off-white primary button (Highest contrast, passes squint test) */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleDispatchNearest(zone)}
                        className="flex-1 py-2 px-3 rounded font-medium text-xs bg-[#ECEDEF] text-[#0E0F11] hover:bg-[#FFFFFF] transition-colors shadow-sm text-center"
                      >
                        Dispatch nearest unit
                      </button>

                      <button
                        onClick={() => setActiveTab('incidents')}
                        className="py-2 px-3 text-xs text-[#A1A5AD] hover:text-[#ECEDEF] transition-colors"
                      >
                        View incident
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Action Confirm Toast with Undo */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
