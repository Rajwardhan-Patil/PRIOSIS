import React, { useState } from 'react'
import {
  Activity,
  Sliders,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Shield,
  RotateCcw,
} from 'lucide-react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { useIncidentContext } from '../../context/IncidentContext'
import { RISK_WEIGHTS, PRIORITY_THRESHOLDS } from '../../services/riskEngine'
import { generateZoneComparison } from '../../services/aiExplanationEngine'

export const RiskAnalysis: React.FC = () => {
  const {
    zones,
    rankedZones,
    selectedZoneId,
    setSelectedZoneId,
    updateZoneFactors,
  } = useIncidentContext()

  const selectedZone = zones.find(z => z.id === selectedZoneId) || rankedZones[0]

  // Comparative AI Assistant State
  const [compZoneAId, setCompZoneAId] = useState<string>(rankedZones[0]?.id || '')
  const [compZoneBId, setCompZoneBId] = useState<string>(rankedZones[1]?.id || '')

  const zoneA = zones.find(z => z.id === compZoneAId) || rankedZones[0]
  const zoneB = zones.find(z => z.id === compZoneBId) || rankedZones[1]

  const comparison = generateZoneComparison(zoneA, zoneB)

  // Chart data for Radar
  const radarData = [
    { factor: 'Hazard (35%)', value: selectedZone.factors.hazard, fullMark: 100 },
    { factor: 'Exposure (25%)', value: selectedZone.factors.exposure, fullMark: 100 },
    { factor: 'Vulnerability (20%)', value: selectedZone.factors.vulnerability, fullMark: 100 },
    { factor: 'Access Risk (10%)', value: selectedZone.factors.accessibilityRisk, fullMark: 100 },
    { factor: 'Resource Scarcity (10%)', value: selectedZone.factors.resourceScarcity, fullMark: 100 },
  ]

  // Chart data for Contributions
  const barData = [
    {
      name: 'Hazard',
      weight: '35%',
      factorScore: selectedZone.factors.hazard,
      contribution: selectedZone.factorContributions.hazard,
      color: '#ef4444',
    },
    {
      name: 'Exposure',
      weight: '25%',
      factorScore: selectedZone.factors.exposure,
      contribution: selectedZone.factorContributions.exposure,
      color: '#f97316',
    },
    {
      name: 'Vulnerability',
      weight: '20%',
      factorScore: selectedZone.factors.vulnerability,
      contribution: selectedZone.factorContributions.vulnerability,
      color: '#eab308',
    },
    {
      name: 'Access Risk',
      weight: '10%',
      factorScore: selectedZone.factors.accessibilityRisk,
      contribution: selectedZone.factorContributions.accessibilityRisk,
      color: '#06b6d4',
    },
    {
      name: 'Scarcity',
      weight: '10%',
      factorScore: selectedZone.factors.resourceScarcity,
      contribution: selectedZone.factorContributions.resourceScarcity,
      color: '#a855f7',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Zone Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Explainable AI Risk Engine & Sensitivity Lab</span>
          </h2>
          <p className="text-xs text-slate-400">
            Transparent deterministic 5-factor scoring model. No black-box hallucinations.
          </p>
        </div>

        {/* Sector Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Inspecting Sector:</span>
          <select
            value={selectedZone.id}
            onChange={e => setSelectedZoneId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-teal-500/50 text-teal-300 font-bold text-xs focus:outline-none"
          >
            {rankedZones.map((z, idx) => (
              <option key={z.id} value={z.id}>
                #{idx + 1} {z.name} ({z.riskScore}/100 · {z.priority})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula & Method Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Deterministic Prioritization Formula
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              0–100 Normalized Scale
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium hidden sm:inline">
            Prototype Heuristic · Needs Civil Defense Calibration
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800">
          <span className="text-teal-400 font-bold">Risk Score</span> = (
          <span className="text-red-400">Hazard</span> × 0.35) + (
          <span className="text-amber-400">Exposure</span> × 0.25) + (
          <span className="text-yellow-400">Vulnerability</span> × 0.20) + (
          <span className="text-cyan-400">Accessibility</span> × 0.10) + (
          <span className="text-purple-400">Resource Scarcity</span> × 0.10)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-400">
          <div>Critical Tier: <strong className="text-red-400">75.0 – 100.0</strong></div>
          <div>High Tier: <strong className="text-amber-400">55.0 – 74.99</strong></div>
          <div>Moderate Tier: <strong className="text-yellow-400">35.0 – 54.99</strong></div>
          <div>Low Tier: <strong className="text-emerald-400">&lt; 35.0</strong></div>
        </div>
      </div>

      {/* Main Grid: Factor Charts & Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Radar & Bar Charts */}
        <div className="lg:col-span-6 space-y-6">
          {/* Radar Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                Factor Geometry: {selectedZone.name}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedZone.priority === 'Critical'
                  ? 'bg-red-950 text-red-300 border border-red-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {selectedZone.priority} · {selectedZone.riskScore}/100
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="factor" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Radar
                    name={selectedZone.name}
                    dataKey="value"
                    stroke="#14b8a6"
                    fill="#0d9488"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weighted Contribution Bar Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100">
              Weighted Points Contribution to Total Score
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 35]} stroke="#64748b" tick={{ fontSize: 10 }} unit=" pts" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: any, _name: any, item: any) => [
                      `+${val} pts (Raw Factor: ${item.payload.factorScore}/100 × ${item.payload.weight})`,
                      'Score Impact',
                    ]}
                  />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Sensitivity Simulator (What-If Sliders) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Interactive Sensitivity Simulator
                </h3>
              </div>
              <span className="text-[10px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                Live Recalculation
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Drag factor sliders below to simulate changing conditions (e.g. cloudburst rainfall or road clearance) and observe how the risk score immediately shifts.
            </p>

            {/* Slider 1: Hazard */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Hazard Severity (Weight 35%)
                </span>
                <span className="font-mono text-red-400 font-bold">
                  {selectedZone.factors.hazard}/100 (+{selectedZone.factorContributions.hazard} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.hazard}
                onChange={e => updateZoneFactors(selectedZone.id, { hazard: Number(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Slider 2: Exposure */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Population Exposure (Weight 25%)
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {selectedZone.factors.exposure}/100 (+{selectedZone.factorContributions.exposure} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.exposure}
                onChange={e => updateZoneFactors(selectedZone.id, { exposure: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Slider 3: Vulnerability */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Socio-Demographic Vulnerability (Weight 20%)
                </span>
                <span className="font-mono text-yellow-400 font-bold">
                  {selectedZone.factors.vulnerability}/100 (+{selectedZone.factorContributions.vulnerability} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.vulnerability}
                onChange={e => updateZoneFactors(selectedZone.id, { vulnerability: Number(e.target.value) })}
                className="w-full accent-yellow-500 cursor-pointer"
              />
            </div>

            {/* Slider 4: Accessibility */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Accessibility & Isolation Risk (Weight 10%)
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {selectedZone.factors.accessibilityRisk}/100 (+{selectedZone.factorContributions.accessibilityRisk} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.accessibilityRisk}
                onChange={e => updateZoneFactors(selectedZone.id, { accessibilityRisk: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Slider 5: Resource Scarcity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Resource Scarcity Index (Weight 10%)
                </span>
                <span className="font-mono text-purple-400 font-bold">
                  {selectedZone.factors.resourceScarcity}/100 (+{selectedZone.factorContributions.resourceScarcity} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.resourceScarcity}
                onChange={e => updateZoneFactors(selectedZone.id, { resourceScarcity: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Live Recalculated Total Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Simulated Total Risk Score
                </span>
                <span className="text-2xl font-black text-slate-100">
                  {selectedZone.riskScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Priority Classification
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider inline-block mt-0.5 ${
                  selectedZone.priority === 'Critical'
                    ? 'bg-red-950 text-red-300 border border-red-700'
                    : selectedZone.priority === 'High'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-yellow-950 text-yellow-300 border border-yellow-700'
                }`}>
                  {selectedZone.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Assistant: Comparative Inquiry ("Why is Zone A > Zone B?") */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Explainable AI Assistant: Comparative Prioritization
              </h3>
              <p className="text-xs text-slate-400">
                Audit rationale for why emergency operations prioritize one sector over another.
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-bold self-start sm:self-auto">
            Deterministic Engine
          </span>
        </div>

        {/* Comparison Selector Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sector A (Primary)
            </label>
            <select
              value={compZoneAId}
              onChange={e => setCompZoneAId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.riskScore}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-black text-sm pt-4">vs</div>

          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sector B (Comparison)
            </label>
            <select
              value={compZoneBId}
              onChange={e => setCompZoneBId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.riskScore}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Natural Language Explanation Output */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-teal-300">
              {comparison.headline}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Delta: {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {comparison.strategicSummary}
          </p>

          {/* Factor Breakdown Table */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Factor Variance Breakdown
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {comparison.factorDeltas.map(fd => (
                <div
                  key={fd.factor}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{fd.factor}</span>
                    <span
                      className={`font-mono font-bold ${
                        fd.deltaPoints > 0
                          ? 'text-red-400'
                          : fd.deltaPoints < 0
                          ? 'text-teal-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {fd.deltaPoints > 0 ? `+${fd.deltaPoints}` : fd.deltaPoints} pts
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{fd.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Shift Advice */}
          <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/40 text-xs text-teal-200 flex items-start gap-2">
            <strong className="shrink-0 text-teal-400">Tactical Recommendation:</strong>
            <span>{comparison.recommendedShift}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
