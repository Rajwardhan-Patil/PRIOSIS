import React from 'react'
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
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
    rankedZones,
    resources,
  } = useIncidentContext()

  if (!isTourActive) return null

  const tourSteps = [
    {
      step: 1,
      title: 'Inspect Dashboard & Ranked Zones',
      description: 'Observe the initial priority ranking. Kasba Peth (Old City) is prioritized as Critical (#1) due to dense riverbank exposure and elderly population.',
      actionText: 'View Ranked Zones',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 2,
      title: 'Inspect Risk Breakdown in Risk Analysis',
      description: 'Inspect the 5-factor mathematical weighting (Hazard 35%, Exposure 25%, Vulnerability 20%, Accessibility 10%, Scarcity 10%). Notice the deterministic factor contributions.',
      actionText: 'Open Risk Breakdown',
      onExecute: () => {
        setActiveTab('risk')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 3,
      title: 'Simulate Heavy Cloudburst in Kothrud',
      description: 'Create a simulated 115mm/hr extreme rainfall and flash flood incident in Kothrud (Ward 18), currently ranked low/moderate (#5).',
      actionText: 'Trigger Cloudburst Incident',
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
          description: 'Sudden convective cloudburst dropped 115mm in 45 mins. Ramnadi culvert overwhelmed; water logging trapping vehicles on Paud Road.',
        })
        setActiveTab('incidents')
      },
    },
    {
      step: 4,
      title: 'Observe Instant Ranking Recalculation',
      description: 'Check how the real-time scoring engine immediately recalculated Kothrud\'s hazard score from 44 to 88+, causing Kothrud to jump to HIGH / CRITICAL rank!',
      actionText: 'Verify Ranking Shift',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-05')
      },
    },
    {
      step: 5,
      title: 'Recommend & Assign Response Unit',
      description: 'Open Resource Allocation. The AI recommendation engine evaluates suitability, equipment, and travel distance to recommend available NDRF/SDRF assets.',
      actionText: 'Assign NDRF Boat Unit',
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
      title: 'Simulate Road Blockage (Karve Road)',
      description: 'Mark Karve Road (Kothrud -> Deccan arterial) as blocked due to 85cm waterlogging. This cuts off direct transit and threatens responder access.',
      actionText: 'Simulate Road Blockage',
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
      title: 'Inspect Dijkstra Route Replanning',
      description: 'Observe the autonomous graph rerouting. The original flooded route is flagged UNSAFE in red dashed lines; the safe detour is calculated and highlighted.',
      actionText: 'Inspect Safe Detour Route',
      onExecute: () => {
        setActiveTab('routing')
      },
    },
    {
      step: 8,
      title: 'Verify Audit Trail & Summary',
      description: 'Every action (incident creation, score recalculation, resource assignment, route blockage, rerouting) is chronologically recorded in the immutable audit trail.',
      actionText: 'View Completed Audit Log',
      onExecute: () => {
        setActiveTab('dashboard')
      },
    },
  ]

  const current = tourSteps[demoTourStep - 1]

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-68 md:right-8 z-[2000] bg-slate-900/95 backdrop-blur-md border border-teal-500/50 rounded-2xl p-4 shadow-2xl shadow-black/80 text-slate-100 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Step counter & badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-bold shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                Judge Walkthrough · Step {demoTourStep} of {tourSteps.length}
              </span>
              <h4 className="font-bold text-sm text-slate-100">{current.title}</h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {/* Quick Action Button */}
          <button
            onClick={current.onExecute}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-950 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{current.actionText}</span>
          </button>

          {/* Prev / Next controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              disabled={demoTourStep <= 1}
              onClick={() => setDemoTourStep(demoTourStep - 1)}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold px-2 text-slate-400">
              {demoTourStep}/{tourSteps.length}
            </span>
            <button
              disabled={demoTourStep >= tourSteps.length}
              onClick={() => setDemoTourStep(demoTourStep + 1)}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Demo */}
          <button
            onClick={resetToDemoDefaults}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition"
            title="Reset Tour & Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close Tour */}
          <button
            onClick={() => setIsTourActive(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition"
            title="Minimize Tour Bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
