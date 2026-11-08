import React from 'react'
import { AlertCircle, ChevronRight, Play } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const DemoBanner: React.FC = () => {
  const { isTourActive, setIsTourActive, demoTourStep } = useIncidentContext()

  return (
    <div className="bg-[#0b101c] border-b border-[#1b253b] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 text-zinc-300">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
          RESEARCH PROTOTYPE:
        </span>
        <span className="text-[11px] text-zinc-400">
          Synthetic flood scenario active for Pune Metropolitan Basin. Deterministic 5-factor scoring engine and Dijkstra routing online.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isTourActive ? (
          <button
            onClick={() => setIsTourActive(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#131d2e] hover:bg-[#1a273e] text-teal-300 border border-[#233554] text-[10px] font-mono font-medium transition-colors"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>START EVALUATION WALKTHROUGH</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <span className="text-teal-400">●</span>
            <span>WALKTHROUGH ACTIVE: STEP {demoTourStep}/8</span>
          </div>
        )}
      </div>
    </div>
  )
}
