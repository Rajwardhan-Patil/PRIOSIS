import React from 'react'
import { Compass, ChevronRight, ChevronLeft, X, Play, RotateCcw } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

interface TourPopoverProps {
  isOpen: boolean
  onClose: () => void
}

export const TourPopover: React.FC<TourPopoverProps> = ({ isOpen, onClose }) => {
  const {
    demoTourStep,
    setDemoTourStep,
    setActiveTab,
    setSelectedZoneId,
    createIncident,
    assignResource,
    toggleRoadBlockage,
    resetToDemoDefaults,
    roadSegments,
    resources,
  } = useIncidentContext()

  if (!isOpen) return null

  const tourSteps = [
    {
      step: 1,
      title: '1. Inspect the Worst Ward',
      instruction: 'Observe the ward queue on the right. Kasba Peth (Old City) is prioritized as Critical (#1) due to river proximity and high demographic exposure.',
      actionText: 'Select Kasba Peth',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 2,
      title: '2. Review the Decision Recommendation',
      instruction: 'Click Kasba Peth to expand its full recommendation: targeted evacuation siren and swift-water boat staging.',
      actionText: 'Expand & Review',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-01')
      },
    },
    {
      step: 3,
      title: '3. Simulate Heavy Cloudburst in Kothrud',
      instruction: 'Inject an extreme rainfall and flash flood incident (115 mm/hr) in Kothrud, currently ranked at Moderate (#5).',
      actionText: 'Inject Cloudburst',
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
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-05')
      },
    },
    {
      step: 4,
      title: '4. Verify Instant Dynamic Re-Ranking',
      instruction: 'Notice Kothrud’s hazard score immediately spike from 44 to 88+, jumping Kothrud up into the Critical tier.',
      actionText: 'Inspect Kothrud Rank',
      onExecute: () => {
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-05')
      },
    },
    {
      step: 5,
      title: '5. Dispatch Nearest Available Unit',
      instruction: 'Click "Dispatch nearest unit" or press "D". NDRF Boat Team 1 is assigned, reducing the ward’s resource scarcity deficit.',
      actionText: 'Dispatch NDRF Unit',
      onExecute: () => {
        const boat = resources.find(r => r.type === 'rescue_boat' && r.status === 'available')
        if (boat) {
          assignResource(boat.id, 'Z-PUNE-05')
        }
        setActiveTab('dashboard')
        setSelectedZoneId('Z-PUNE-05')
      },
    },
    {
      step: 6,
      title: '6. Simulate Arterial Causeway Flooding',
      instruction: 'In Routes, toggle Karve Road as flooded (0.85 m water depth), severing direct responder transit.',
      actionText: 'Flood Karve Road',
      onExecute: () => {
        const seg = roadSegments.find(s => s.id === 'SEG-01')
        if (seg && !seg.isBlocked) {
          toggleRoadBlockage('SEG-01', true, 'Deep causeway waterlogging (0.85 m) near Karve Statue')
        }
        setActiveTab('routing')
      },
    },
    {
      step: 7,
      title: '7. Graph Rerouting Around Floodwater',
      instruction: 'The routing engine marks the flooded corridor as unsafe (dashed red) and calculates the fastest clear detour (+1.8 km, +4 mins).',
      actionText: 'View Bypass Route',
      onExecute: () => {
        setActiveTab('routing')
      },
    },
    {
      step: 8,
      title: '8. Check Data Provenance & Feeds',
      instruction: 'Open Data sources to review live feeds (Open-Meteo weather, USGS earthquakes) versus simulated scenario baselines.',
      actionText: 'View Data Sources',
      onExecute: () => {
        setActiveTab('datasources')
      },
    },
  ]

  const current = tourSteps[demoTourStep - 1]

  return (
    <div className="fixed top-14 right-4 z-[9998] bg-[#15171A] border border-[#2A2D33] rounded p-4 shadow-xl max-w-sm w-full text-[#ECEDEF] space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A2D33] pb-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#A1A5AD]" />
          <span className="font-medium text-xs text-[#ECEDEF]">Evaluator Tour · Step {demoTourStep} of {tourSteps.length}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] hover:bg-[#1C1F23]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="font-medium text-xs text-[#ECEDEF]">{current.title}</h4>
        <p className="text-xs text-[#A1A5AD] leading-relaxed">{current.instruction}</p>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2">
        <button
          onClick={current.onExecute}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ECEDEF] hover:bg-[#FFFFFF] text-[#0E0F11] text-xs font-medium transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{current.actionText}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            disabled={demoTourStep <= 1}
            onClick={() => setDemoTourStep(demoTourStep - 1)}
            className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] disabled:opacity-30 transition-colors"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#858A93] font-mono-numbers px-1">{demoTourStep}/{tourSteps.length}</span>
          <button
            disabled={demoTourStep >= tourSteps.length}
            onClick={() => setDemoTourStep(demoTourStep + 1)}
            className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] disabled:opacity-30 transition-colors"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={resetToDemoDefaults}
            className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] transition-colors ml-1"
            title="Reset tour"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

