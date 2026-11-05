import React from 'react'
import { AlertTriangle, RotateCcw, Compass, Radio, Shield, HelpCircle } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const Header: React.FC = () => {
  const {
    isSimulatedDataActive,
    liveWeather,
    resetToDemoDefaults,
    setIsDisclaimerOpen,
    isTourActive,
    setIsTourActive,
  } = useIncidentContext()

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/40 text-teal-400 font-black tracking-wider shadow-lg shadow-teal-950">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                PRIORIS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/80">
                AI Climate Defense
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smarter priorities. Safer communities.
            </p>
          </div>
        </div>

        {/* Center Indicators: Scenario + Simulation Badge */}
        <div className="flex items-center gap-2.5">
          {/* Demo Simulation Badge */}
          {isSimulatedDataActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 text-xs font-bold shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="tracking-wide">DEMO SIMULATION</span>
            </div>
          )}

          {/* Scenario Name */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-teal-400 font-medium">Scenario:</span>
            <span>Pune Urban Flood Response (Mutha Basin)</span>
          </div>

          {/* Weather status ticker */}
          {liveWeather && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Pune Weather: {liveWeather.temperatureC}°C · Precip: {liveWeather.precipitationMm}mm</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Judge Guided Tour Toggle */}
          <button
            onClick={() => setIsTourActive(!isTourActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isTourActive
                ? 'bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-900/50'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Toggle Step-by-Step Judge Walkthrough"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Judge Tour</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={resetToDemoDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
            title="Reset All Zones, Incidents, and Routes to Default Demo State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Responsible Use Disclaimer */}
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 transition"
            title="View Prototype Disclaimer & Responsible Use"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Disclaimer</span>
          </button>
        </div>
      </div>
    </header>
  )
}
