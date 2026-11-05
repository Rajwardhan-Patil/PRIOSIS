import React from 'react'
import {
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const AboutView: React.FC = () => {
  const { setDemoTourStep, setIsTourActive, setActiveTab } = useIncidentContext()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 border border-teal-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
            PRIOSIS Hackathon Round 2 · AI for Climate Change
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100">
          PRIORIS: Predictive Response & Operational Intelligence for Resilient Incident Systems
        </h1>
        <p className="text-sm font-semibold text-teal-400">
          Smarter priorities. Safer communities.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          PRIORIS is an AI-assisted disaster-response decision-support platform designed for emergency incident coordinators during climate-induced extreme events. By deterministically fusing hazard severity, population exposure, social vulnerability, road network accessibility, and resource scarcity, PRIORIS helps emergency operations centers rapidly prioritize urban sectors, allocate specialized rescue assets, and recalculate safe transit corridors around inundated roads.
        </p>
      </div>

      {/* Governance & Responsible-Use Commitments */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-600/40 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Mandatory Governance & Operational Scope Declarations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Decision-Support, Not Autonomous Command</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              PRIORIS strictly supports authorized human incident commanders and municipal commissioners. The system does not autonomously dispatch real emergency vehicles or trigger sirens.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Does Not Replace 112 / NDMA / IMD</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              PRIORIS does not supersede national emergency services (112), National Disaster Management Authority (NDMA), SACHET CAP network, or the India Meteorological Department (IMD).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Prototype Scoring Heuristics</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The 5-factor risk scoring formula (Hazard 35%, Exposure 25%, Vulnerability 20%, Accessibility 10%, Scarcity 10%) is an exploratory prototype framework that requires empirical validation and localized calibration by civil defense authorities.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <strong className="text-amber-300 block">Simulated Scenario Telemetry</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The portrayed flood incidents, water levels, shelter counts, and response units around Pune, Maharashtra are synthetic scenarios constructed to evaluate deterministic system stability during multi-sector flooding.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture & Live vs Simulated Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Modular Technical Architecture</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-teal-400 font-bold">•</span>
              <div>
                <strong>Deterministic Risk Engine:</strong> Pure mathematical functions in <code className="text-teal-300">riskEngine.ts</code> that compute scores and factor contributions without black-box drift.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 font-bold">•</span>
              <div>
                <strong>Graph Routing Engine:</strong> Custom bidirectional Dijkstra algorithm in <code className="text-teal-300">routingEngine.ts</code> supporting dynamic edge severance and bypass synthesis.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 font-bold">•</span>
              <div>
                <strong>Explainable AI Assistant:</strong> Natural language explanation generator in <code className="text-teal-300">aiExplanationEngine.ts</code> providing factor delta audits.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-400 font-bold">•</span>
              <div>
                <strong>Geospatial Layer:</strong> Leaflet + OpenStreetMap engine rendering SVG vectors, pulsing incident nodes, and multi-tier route corridors.
              </div>
            </li>
          </ul>
        </div>

        {/* Live vs Simulated Component Matrix */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Data Provenance: Live vs Simulated</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Open-Meteo Weather API</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                LIVE API
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">OpenStreetMap Cartography</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                LIVE API
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">USGS Global Earthquake Feed</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                LIVE API
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Pune Flood Incidents & Reports</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                SIMULATED SCENARIO
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">CWC Khadakwasla Dam Spillway</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                SIMULATED TELEMETRY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Judge Walkthrough Quick-Start */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Judge Evaluation Walkthrough Guide
            </h3>
          </div>
          <button
            onClick={() => {
              setDemoTourStep(1)
              setIsTourActive(true)
              setActiveTab('dashboard')
            }}
            className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
          >
            Launch Guided Tour
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-teal-400 block mb-0.5">Step 1–2: Inspect</span>
            <span className="text-slate-400 text-[11px]">
              Open Operations Dashboard; inspect Kasba Peth #1 critical score breakdown.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-teal-400 block mb-0.5">Step 3–4: Inundate</span>
            <span className="text-slate-400 text-[11px]">
              Create cloudburst incident in Kothrud; watch its score spike and rank shift immediately.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-teal-400 block mb-0.5">Step 5–6: Allocate & Block</span>
            <span className="text-slate-400 text-[11px]">
              Assign NDRF Boat Unit. Block Karve Road in Route Replanning.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-teal-400 block mb-0.5">Step 7–8: Reroute & Audit</span>
            <span className="text-slate-400 text-[11px]">
              Inspect Dijkstra bypass route and review chronological audit log.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
