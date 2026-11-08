import React from 'react'
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const JudgeGuidedTour: React.FC = () => {
  const {
    demoTourStep,
    setDemoTourStep,
    isTourActive,
    setIsTourActive,
    setActiveTab,
    setSelectedZoneId,
    createIncident,
    assignResource,
    toggleRoadBlockage,
    resetToDemoDefaults,
    roadSegments,
    resources,
  } = useIncidentContext()

  if (!isTourActive) return null

  const tourSteps = [
    {
      step: 1,
      title: 'Inspect Initial Priority Queue',
      description: 'Observe baseline rankings. Kasba Peth (Old City) is prioritized as Critical (#1) due to river proximity and dense elderly population.',
      actionText: 'Inspect Priority Queue',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 2,
      title: 'Examine 5-Factor Mathematical Model',
      description: 'Inspect factor weights (Hazard 35%, Exposure 25%, Vulnerability 20%, Accessibility 10%, Scarcity 10%) and factor contributions.',
      actionText: 'View Factor Model',
      onExecute: () => {
        setActiveTab('risk')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 3,
      title: 'Simulate Heavy Cloudburst in Kothrud',
      description: 'Trigger a simulated 115mm/hr extreme rainfall and flash flood incident in Kothrud (Ward 18), currently ranked at Moderate (#5).',
      actionText: 'Inject Cloudburst Incident',
      onExecute: () => {
        createIncident({
          zoneId: 'Z-PUNE-05',
          title: 'Ramnadi Flash Flood & Paud Road Breach',
          hazardType: 'extreme_rainfall',
          severity: 'critical',
          locationName: 'Paud Road Flyover & Ramnadi Culvert',
          coordinates: [18.5085, 73.8090],
          waterDepthCm: 90,
          reporterType: 'sensor_iot',
          description: 'Convective cloudburst dropped 115mm in 45 mins. Ramnadi culvert overwhelmed; water logging trapping vehicles on Paud Road.',
        })
        setActiveTab('incidents')
      },
    },
    {
      step: 4,
      title: 'Verify Instant Dynamic Re-Ranking',
      description: 'Observe Kothrud\'s hazard score jump dynamically from 44 to 88+, moving Kothrud into the Critical/High priority tier immediately.',
      actionText: 'Verify Queue Shift',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-05')
      },
    },
    {
      step: 5,
      title: 'Match & Dispatch Emergency Unit',
      description: 'AI recommendation engine calculates suitability based on equipment and proximity to assign NDRF Inflatable Boat Team 1.',
      actionText: 'Dispatch Rescue Unit',
      onExecute: () => {
        const boat = resources.find(r => r.type === 'rescue_boat' && r.status === 'available')
        if (boat) {
          assignResource(boat.id, 'Z-PUNE-05')
        }
        setActiveTab('resources')
      },
    },
    {
      step: 6,
      title: 'Simulate Arterial Road Blockage',
      description: 'Mark Karve Road (Kothrud -> Deccan arterial) as impassable due to 85cm waterlogging, severing direct responder transit.',
      actionText: 'Sever Corridor',
      onExecute: () => {
        const seg = roadSegments.find(s => s.id === 'SEG-01')
        if (seg && !seg.isBlocked) {
          toggleRoadBlockage('SEG-01', true, 'Deep waterlogging (85cm) near Karve Statue')
        }
        setActiveTab('routing')
      },
    },
    {
      step: 7,
      title: 'Dijkstra Graph Rerouting',
      description: 'The graph routing engine flags the flooded path as unsafe and calculates a safe alternative bypass with detour distance and delay telemetry.',
      actionText: 'Inspect Detour Route',
      onExecute: () => {
        setActiveTab('routing')
      },
    },
    {
      step: 8,
      title: 'Audit Log & Provenance Review',
      description: 'Review the chronological, tamper-evident audit trail capturing every incident injection, recalculation, unit dispatch, and route change.',
      actionText: 'View Audit Records',
      onExecute: () => {
        setActiveTab('dashboard')
      },
    },
  ]

  const current = tourSteps[demoTourStep - 1]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] bg-[#090d18]/95 backdrop-blur-md border-t border-[#1e2a42] text-zinc-200 px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Step Info */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#131d30] border border-[#233554] flex items-center justify-center text-teal-400 font-mono text-xs font-bold shrink-0">
            {demoTourStep}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#101827] text-teal-400 border border-[#1d2a44]">
                EVALUATION STEP {demoTourStep} OF {tourSteps.length}
              </span>
              <span className="text-xs font-semibold text-white">{current.title}</span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-2xl leading-normal">
              {current.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={current.onExecute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{current.actionText}</span>
          </button>

          <div className="flex items-center bg-[#101726] rounded border border-[#1f2b42] p-0.5">
            <button
              disabled={demoTourStep <= 1}
              onClick={() => setDemoTourStep(demoTourStep - 1)}
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-2 text-zinc-400">
              {demoTourStep}/{tourSteps.length}
            </span>
            <button
              disabled={demoTourStep >= tourSteps.length}
              onClick={() => setDemoTourStep(demoTourStep + 1)}
              className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={resetToDemoDefaults}
            className="p-1.5 rounded text-zinc-400 hover:text-white bg-[#101726] border border-[#1f2b42] transition-colors"
            title="Reset simulation to default state"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsTourActive(false)}
            className="p-1.5 rounded text-zinc-400 hover:text-white bg-[#101726] border border-[#1f2b42] transition-colors"
            title="Minimize evaluation bar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
