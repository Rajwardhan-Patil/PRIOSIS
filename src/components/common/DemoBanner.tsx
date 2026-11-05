import React from 'react'
import { Info, PlayCircle, ShieldAlert } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const DemoBanner: React.FC = () => {
  const { isTourActive, setIsTourActive, demoTourStep } = useIncidentContext()

  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-teal-950/70 border-b border-amber-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-bold text-amber-300 tracking-wide">
          HACKATHON DEMO ENVIRONMENT:
        </span>
        <span className="text-slate-300">
          Simulated urban flood event in Pune, Maharashtra. Real-time deterministic risk engine + live Open-Meteo telemetry active.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isTourActive ? (
          <button
            onClick={() => setIsTourActive(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/50 font-semibold transition"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Launch Judge Guided Walkthrough</span>
          </button>
        ) : (
          <span className="text-teal-300 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            Judge Tour Active: Step {demoTourStep} of 8
          </span>
        )}
      </div>
    </div>
  )
}
