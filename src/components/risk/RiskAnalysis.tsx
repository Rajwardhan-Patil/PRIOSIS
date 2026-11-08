import React, { useState } from 'react'
import {
  Activity,
  Sliders,
  Sparkles,
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
    { factor: 'Scarcity (10%)', value: selectedZone.factors.resourceScarcity, fullMark: 100 },
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
      color: '#f59e0b',
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
    <div className="space-y-4">
      {/* Header & Sector Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b253b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              Risk Prioritization Engine & Sensitivity Lab
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101726] text-teal-400 border border-[#1e2a42]">
              DETERMINISTIC
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transparent mathematical multi-criteria evaluation with live sensitivity scrubbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">SECTOR FOCUS:</span>
          <select
            value={selectedZone.id}
            onChange={e => setSelectedZoneId(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-[#0a0f1b] border border-[#202b42] text-teal-300 font-mono text-xs font-semibold focus:outline-none"
          >
            {rankedZones.map((z, idx) => (
              <option key={z.id} value={z.id}>
                #{idx + 1} {z.name} ({z.riskScore}/100 · {z.priority})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Specification Spec Strip */}
      <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-teal-400">
            DETERMINISTIC HEURISTIC SPECIFICATION
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            NORMALIZATION: 0–100 SCALE
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#070b13] font-mono text-xs text-zinc-300 border border-[#162033] overflow-x-auto">
          <span className="text-teal-400 font-bold">Risk Score</span> = (
          <span className="text-red-400">Hazard</span> × 0.35) + (
          <span className="text-amber-400">Exposure</span> × 0.25) + (
          <span className="text-yellow-400">Vulnerability</span> × 0.20) + (
          <span className="text-cyan-400">Accessibility</span> × 0.10) + (
          <span className="text-purple-400">Resource Scarcity</span> × 0.10)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400 pt-0.5">
          <div>CRITICAL: <strong className="text-red-400">75.0 – 100.0</strong></div>
          <div>HIGH: <strong className="text-amber-400">55.0 – 74.99</strong></div>
          <div>MODERATE: <strong className="text-yellow-400">35.0 – 54.99</strong></div>
          <div>LOW: <strong className="text-emerald-400">&lt; 35.0</strong></div>
        </div>
      </div>

      {/* Analytics Grid: Visualizations + Sensitivity Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 6 Cols: Factor Geometry & Contribution Spectrum */}
        <div className="lg:col-span-6 space-y-4">
          {/* Radar Geometry */}
          <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2">
            <div className="flex items-center justify-between border-b border-[#162033] pb-1.5">
              <span className="text-xs font-semibold text-white">
                Factor Geometry: {selectedZone.name}
              </span>
              <span className="text-[10px] font-mono text-teal-400">
                SCORE: {selectedZone.riskScore}/100 ({selectedZone.priority})
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="factor" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={{ fontSize: 8 }} />
                  <Radar
                    name={selectedZone.name}
                    dataKey="value"
                    stroke="#14b8a6"
                    fill="#0d9488"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Points Contribution Spectrum */}
          <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2">
            <span className="text-xs font-semibold text-white block border-b border-[#162033] pb-1.5">
              Weighted Factor Impact Contribution to Total Score
            </span>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 15, right: 15 }}>
                  <XAxis type="number" domain={[0, 35]} stroke="#475569" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)' }} unit=" pts" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1f2b42', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                    formatter={(val: any, _name: any, item: any) => [
                      `+${val} pts (${item.payload.factorScore}/100 × ${item.payload.weight})`,
                      'Weight Contribution',
                    ]}
                  />
                  <Bar dataKey="contribution" radius={[0, 2, 2, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Sensitivity Simulator Controls */}
        <div className="lg:col-span-6 bg-[#0a0f1b] border border-[#1b253b] rounded p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#172134] pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-bold text-white uppercase tracking-tight">
                Live Sensitivity Scrubber
              </span>
            </div>
            <span className="text-[9px] font-mono text-teal-400 bg-[#0d1626] px-1.5 py-0.2 rounded border border-[#1a2b47]">
              DYNAMIC RECALCULATION
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-normal">
            Adjust the normalized factor inputs below to test parameter elasticity and observe priority classification shifts.
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Slider: Hazard */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold text-[11px]">
                  Hazard Severity (35%)
                </span>
                <span className="text-red-400 font-bold">
                  {selectedZone.factors.hazard}/100 (+{selectedZone.factorContributions.hazard} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.hazard}
                onChange={e => updateZoneFactors(selectedZone.id, { hazard: Number(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-[#172235] rounded-lg appearance-none"
              />
            </div>

            {/* Slider: Exposure */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold text-[11px]">
                  Population Exposure (25%)
                </span>
                <span className="text-amber-400 font-bold">
                  {selectedZone.factors.exposure}/100 (+{selectedZone.factorContributions.exposure} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.exposure}
                onChange={e => updateZoneFactors(selectedZone.id, { exposure: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-[#172235] rounded-lg appearance-none"
              />
            </div>

            {/* Slider: Vulnerability */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold text-[11px]">
                  Social Vulnerability (20%)
                </span>
                <span className="text-yellow-400 font-bold">
                  {selectedZone.factors.vulnerability}/100 (+{selectedZone.factorContributions.vulnerability} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.vulnerability}
                onChange={e => updateZoneFactors(selectedZone.id, { vulnerability: Number(e.target.value) })}
                className="w-full accent-yellow-500 cursor-pointer h-1.5 bg-[#172235] rounded-lg appearance-none"
              />
            </div>

            {/* Slider: Accessibility */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold text-[11px]">
                  Accessibility / Isolation Risk (10%)
                </span>
                <span className="text-cyan-400 font-bold">
                  {selectedZone.factors.accessibilityRisk}/100 (+{selectedZone.factorContributions.accessibilityRisk} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.accessibilityRisk}
                onChange={e => updateZoneFactors(selectedZone.id, { accessibilityRisk: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-[#172235] rounded-lg appearance-none"
              />
            </div>

            {/* Slider: Scarcity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold text-[11px]">
                  Resource Scarcity Index (10%)
                </span>
                <span className="text-purple-400 font-bold">
                  {selectedZone.factors.resourceScarcity}/100 (+{selectedZone.factorContributions.resourceScarcity} pts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedZone.factors.resourceScarcity}
                onChange={e => updateZoneFactors(selectedZone.id, { resourceScarcity: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#172235] rounded-lg appearance-none"
              />
            </div>

            {/* Total Result Bar */}
            <div className="p-2.5 rounded bg-[#070b13] border border-[#1b273d] flex items-center justify-between mt-3 font-mono">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">
                  SIMULATED TOTAL RISK SCORE
                </span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {selectedZone.riskScore}
                  <span className="text-xs font-normal text-zinc-500">/100</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">
                  PRIORITY CLASSIFICATION
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider inline-block mt-0.5 border ${
                  selectedZone.priority === 'Critical'
                    ? 'bg-red-950/80 text-red-300 border-red-800'
                    : selectedZone.priority === 'High'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                }`}>
                  {selectedZone.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Sector Analysis ("Why is Zone A > Zone B?") */}
      <div className="p-4 rounded bg-[#0a0f1b] border border-[#1b253b] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#172134] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-tight">
              Comparative Prioritization Audit ("Why is Sector A &gt; Sector B?")
            </span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-[#0d1626] text-teal-400 border border-[#1c2d49]">
            FACTOR VARIANCE ANALYSIS
          </span>
        </div>

        {/* Sector Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase mb-1">
              Sector A (Primary Focus)
            </label>
            <select
              value={compZoneAId}
              onChange={e => setCompZoneAId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1d283e] text-zinc-200 focus:outline-none"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} (Risk: {z.riskScore}/100 · {z.priority})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase mb-1">
              Sector B (Comparative Baseline)
            </label>
            <select
              value={compZoneBId}
              onChange={e => setCompZoneBId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1d283e] text-zinc-200 focus:outline-none"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} (Risk: {z.riskScore}/100 · {z.priority})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Narrative & Variance Breakdown */}
        <div className="p-3 rounded bg-[#070b13] border border-[#162033] space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-teal-300">
              {comparison.headline}
            </span>
            <span className="text-zinc-500">
              Variance: {comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-mono text-[11px]">
            {comparison.strategicSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-[#172134]">
            {comparison.factorDeltas.map(fd => (
              <div
                key={fd.factor}
                className="p-2 rounded bg-[#0b101c] border border-[#1b273d] text-[10px] font-mono space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300">{fd.factor}</span>
                  <span
                    className={`font-bold ${
                      fd.deltaPoints > 0
                        ? 'text-red-400'
                        : fd.deltaPoints < 0
                        ? 'text-teal-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {fd.deltaPoints > 0 ? `+${fd.deltaPoints}` : fd.deltaPoints} pts
                  </span>
                </div>
                <p className="text-zinc-500">{fd.explanation}</p>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-[#0d1626] border border-[#1a2d4a] text-xs font-mono text-teal-200 flex items-start gap-2">
            <strong className="text-teal-400 shrink-0">DIRECTIVE:</strong>
            <span className="text-[11px]">{comparison.recommendedShift}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
