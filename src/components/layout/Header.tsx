import React from 'react'
import {
  Shield,
  RotateCcw,
  Compass,
  Radio,
  FileText,
  Activity,
  Layers,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const Header: React.FC = () => {
  const {
    isSimulatedDataActive,
    liveWeather,
    resetToDemoDefaults,
    setIsDisclaimerOpen,
    isTourActive,
    setIsTourActive,
    rankedZones,
    incidents,
  } = useIncidentContext()

  const criticalCount = rankedZones.filter(z => z.priority === 'Critical').length
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'reported').length

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/95 backdrop-blur-sm border-b border-[#1b2333] text-zinc-200 px-4 py-2 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Product Mark & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#10192a] border border-[#23324f] flex items-center justify-center text-teal-400">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="text-sm font-bold tracking-tight text-white uppercase">
                  PRIORIS
                </span>
                <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#141d30] text-teal-400 border border-[#243455]">
                  OP-INTEL
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium tracking-tight">
                Predictive Response & Operational Intelligence
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-4 w-[1px] bg-[#1e293b]" />

          {/* Operational Context Bar */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-[11px] font-medium text-zinc-300">Pune Urban Basin</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-[#0c1220] px-2 py-0.5 rounded border border-[#1b253b]">
              <span>CRIT WARDS: <strong className="text-red-400 font-bold">{criticalCount}</strong></span>
              <span className="text-zinc-600">|</span>
              <span>UNITS DEPLOYED: <strong className="text-teal-400 font-bold">2</strong></span>
              <span className="text-zinc-600">|</span>
              <span>ACTIVE INC: <strong className="text-amber-400 font-bold">{activeIncidents}</strong></span>
            </div>
          </div>
        </div>

        {/* Center / Right: Live Weather Telemetry + Controls */}
        <div className="flex items-center gap-2">
          {liveWeather && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d1422] border border-[#1d273c] text-[11px] font-mono text-zinc-400">
              <Radio className="w-3 h-3 text-teal-400" />
              <span>PUNE: {liveWeather.temperatureC}°C</span>
              <span className="text-zinc-600">/</span>
              <span>PRECIP: {liveWeather.precipitationMm}mm</span>
            </div>
          )}

          {isSimulatedDataActive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#201508] border border-[#4a2e0e] text-amber-300 text-[10px] font-mono font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 beacon-pulse" />
              <span>SIMULATED SCENARIO</span>
            </div>
          )}

          {/* Guided Tour Trigger */}
          <button
            onClick={() => setIsTourActive(!isTourActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              isTourActive
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/40'
                : 'bg-[#0f172a] text-zinc-300 hover:text-white border-[#243048] hover:bg-[#162035]'
            }`}
            title="Toggle Step-by-Step Evaluator Tour"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Evaluation Tour</span>
          </button>

          {/* Reset Action */}
          <button
            onClick={resetToDemoDefaults}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-[#0d1422] hover:bg-[#162035] border border-[#1e293b]"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Governance / Disclaimer */}
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-[#0d1422] hover:bg-[#162035] border border-[#1e293b]"
            title="System governance, ethical constraints, and limitations"
          >
            <FileText className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Scope</span>
          </button>
        </div>
      </div>
    </header>
  )
}
