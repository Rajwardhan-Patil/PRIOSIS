import React from 'react'
import {
  ShieldAlert,
  Cpu,
  Layers,
  Compass,
  Check,
  FileText,
  AlertTriangle,
  GitFork,
  Activity,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const AboutView: React.FC = () => {
  const { setDemoTourStep, setIsTourActive, setActiveTab } = useIncidentContext()

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 bg-[#111317] overflow-y-auto max-w-5xl mx-auto text-zinc-200">
      {/* Product Overview Header */}
      <div className="p-5 rounded-lg bg-[#181b22] border border-[#242833] space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#222631] text-blue-300 border border-[#2e3444]">
            PRIOSIS Round 2 · AI for Climate Change
          </span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white">
          PRIORIS: Predictive Response & Operational Intelligence for Resilient Incident Systems
        </h1>
        <p className="text-xs text-zinc-400 font-medium">
          Smarter priorities. Safer communities.
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
          PRIORIS is a decision-support platform designed for duty officers in emergency operations rooms during urban flood crises. The system deterministically combines hazard severity, population exposure, social vulnerability, road accessibility, and available resources to prioritize affected wards, recommend immediate actions, and compute safe detour corridors around inundated bridges.
        </p>
      </div>

      {/* Operational Scope & Governance */}
      <div className="p-4 rounded-lg bg-[#181b22] border border-[#242833] space-y-3 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Operational Boundaries & Safety Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3 rounded bg-[#111317] border border-[#242833] space-y-1">
            <strong className="text-white block text-xs">Decision support, not autonomous command</strong>
            <p className="text-zinc-400 leading-normal text-xs">
              PRIORIS provides prioritization recommendations to authorized human coordinators. It does not automatically dispatch real vehicles, issue public sirens, or take civil protection actions without human confirmation.
            </p>
          </div>

          <div className="p-3 rounded bg-[#111317] border border-[#242833] space-y-1">
            <strong className="text-white block text-xs">Official channels always supersede</strong>
            <p className="text-zinc-400 leading-normal text-xs">
              This prototype does not replace India’s national emergency number (112), the NDMA SACHET alert network, or official India Meteorological Department (IMD) bulletins.
            </p>
          </div>

          <div className="p-3 rounded bg-[#111317] border border-[#242833] space-y-1">
            <strong className="text-white block text-xs">Deterministic 5-factor scoring model</strong>
            <p className="text-zinc-400 leading-normal text-xs">
              Scores are calculated via a transparent, weighted formula with zero random drift. Weights: Hazard (35%), Exposure (25%), Vulnerability (20%), Accessibility (10%), and Resource Scarcity (10%).
            </p>
          </div>

          <div className="p-3 rounded bg-[#111317] border border-[#242833] space-y-1">
            <strong className="text-white block text-xs">Synthetic scenario data</strong>
            <p className="text-zinc-400 leading-normal text-xs">
              The incidents, water levels, shelter occupancy, and response units in the Pune Mutha-Mula river basin are simulated scenarios constructed for testing and evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Formulation */}
      <div className="p-4 rounded-lg bg-[#181b22] border border-[#242833] space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-[#242833] pb-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Deterministic Risk Scoring Formula</span>
        </div>

        <div className="p-3 rounded bg-[#111317] border border-[#242833] space-y-2 text-xs">
          <div className="font-mono-numbers text-xs text-blue-300 bg-[#161a22] p-2 rounded border border-[#242833]">
            Risk Score = (Hazard × 0.35) + (Exposure × 0.25) + (Vulnerability × 0.20) + (Accessibility Risk × 0.10) + (Resource Scarcity × 0.10)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-zinc-300 pt-1">
            <div className="p-2 rounded bg-[#181b22] border border-[#242833]">
              <span className="text-zinc-400 block text-[11px]">Hazard</span>
              <span className="font-semibold text-white font-mono-numbers">35%</span>
            </div>
            <div className="p-2 rounded bg-[#181b22] border border-[#242833]">
              <span className="text-zinc-400 block text-[11px]">Exposure</span>
              <span className="font-semibold text-white font-mono-numbers">25%</span>
            </div>
            <div className="p-2 rounded bg-[#181b22] border border-[#242833]">
              <span className="text-zinc-400 block text-[11px]">Vulnerability</span>
              <span className="font-semibold text-white font-mono-numbers">20%</span>
            </div>
            <div className="p-2 rounded bg-[#181b22] border border-[#242833]">
              <span className="text-zinc-400 block text-[11px]">Accessibility</span>
              <span className="font-semibold text-white font-mono-numbers">10%</span>
            </div>
            <div className="p-2 rounded bg-[#181b22] border border-[#242833]">
              <span className="text-zinc-400 block text-[11px]">Scarcity</span>
              <span className="font-semibold text-white font-mono-numbers">10%</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-normal pt-1">
            Scores are normalized between 0 and 100. Priority tiers: Critical (≥ 75), High (55–74.9), Moderate (35–54.9), and Low (&lt; 35).
          </p>
        </div>
      </div>

      {/* Architecture & Provenance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Architecture */}
        <div className="p-4 rounded-lg bg-[#181b22] border border-[#242833] space-y-2.5">
          <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-[#242833] pb-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Technical Architecture</span>
          </div>

          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-white">Deterministic scoring engine:</strong> Pure TypeScript functions in <span className="text-zinc-300 bg-[#111317] px-1.5 py-0.5 rounded font-mono-numbers">riskEngine.ts</span> that calculate normalized multi-factor scores and contributions without nondeterminism.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-white">Dijkstra graph router:</strong> Bidirectional graph pathfinder in <span className="text-zinc-300 bg-[#111317] px-1.5 py-0.5 rounded font-mono-numbers">routingEngine.ts</span> supporting dynamic arterial severance and safe bypass calculation.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-white">Explainable natural language logic:</strong> Rule-based synthesis in <span className="text-zinc-300 bg-[#111317] px-1.5 py-0.5 rounded font-mono-numbers">aiExplanationEngine.ts</span> providing plain English factor drivers.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-white">Geospatial vector mapping:</strong> OpenStreetMap raster tiles rendered via Leaflet with SVG ward boundaries, flood level gauges, and road overlays.
              </div>
            </li>
          </ul>
        </div>

        {/* Provenance Matrix */}
        <div className="p-4 rounded-lg bg-[#181b22] border border-[#242833] space-y-2.5">
          <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-[#242833] pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Data Provenance Matrix</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between">
              <span className="text-zinc-300">Open-Meteo Weather API</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live API
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between">
              <span className="text-zinc-300">OpenStreetMap Cartography</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live Tiles
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between">
              <span className="text-zinc-300">USGS Real-Time Earthquakes</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live API
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between">
              <span className="text-zinc-300">Pune Incidents & Reports</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                Simulated
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between">
              <span className="text-zinc-300">Mutha River Dam Discharge</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
                Simulated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
