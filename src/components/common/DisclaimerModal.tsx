import React from 'react'
import { X, ShieldAlert, Check } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const DisclaimerModal: React.FC = () => {
  const { isDisclaimerOpen, setIsDisclaimerOpen } = useIncidentContext()

  if (!isDisclaimerOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#0b101c] border border-[#202b40] rounded-lg max-w-xl w-full p-6 shadow-2xl relative space-y-4 text-zinc-200">
        {/* Close Button */}
        <button
          onClick={() => setIsDisclaimerOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-[#162136] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#1b253a] pb-3.5">
          <div className="w-8 h-8 rounded bg-[#162136] border border-[#263756] flex items-center justify-center text-teal-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase">
              Operational Scope & System Governance
            </h3>
            <p className="text-[11px] font-mono text-zinc-500">
              PRIORIS Prototype Directive · PRIOSIS Hackathon
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-3 text-xs text-zinc-300 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded bg-[#101726] border border-[#1f2d47] text-[11px] leading-relaxed text-zinc-300">
            <strong className="text-white block mb-0.5">Decision-Support Framework:</strong>
            PRIORIS is an experimental decision-support prototype built for disaster incident commanders. It provides multi-criteria heuristic scoring and graph pathfinding, but does not autonomously execute civil protection actions.
          </div>

          <div className="space-y-2 pt-1 text-[11px]">
            <div className="flex items-start gap-2.5 p-2 rounded bg-[#070b13] border border-[#172235]">
              <span className="font-mono text-teal-400 font-bold mt-0.5">01</span>
              <div>
                <strong className="text-zinc-200 block">Human Commander Authority</strong>
                <p className="text-zinc-400 mt-0.5 leading-normal">
                  All resource assignments, route approvals, and evacuation orders require verified human-in-the-loop authorization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded bg-[#070b13] border border-[#172235]">
              <span className="font-mono text-teal-400 font-bold mt-0.5">02</span>
              <div>
                <strong className="text-zinc-200 block">Emergency Service Hierarchy</strong>
                <p className="text-zinc-400 mt-0.5 leading-normal">
                  Does not substitute India’s national emergency system (112), NDMA SACHET alert network, or IMD official meteorological warnings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded bg-[#070b13] border border-[#172235]">
              <span className="font-mono text-teal-400 font-bold mt-0.5">03</span>
              <div>
                <strong className="text-zinc-200 block">Exploratory Weight Calibration</strong>
                <p className="text-zinc-400 mt-0.5 leading-normal">
                  Factor weights (Hazard 35%, Exposure 25%, Vulnerability 20%, Access 10%, Scarcity 10%) are prototype baselines subject to municipal hydrology calibration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1b253a] pt-3 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-500">
            SYSTEM STATUS: OPERATIONAL PROTOTYPE
          </span>
          <button
            onClick={() => setIsDisclaimerOpen(false)}
            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded text-xs font-semibold transition-colors"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  )
}
