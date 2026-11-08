import React, { useState } from 'react'
import { Activity, Sliders, ArrowUpDown, ChevronRight } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { RiskBar } from '../common/RiskBar'
import { FactorBar } from '../common/FactorBar'
import { Zone } from '../../types'
import { getSeverityColors } from '../../tokens'

export const RiskModelView: React.FC = () => {
  const { zones, rankedZones, updateZoneFactors, setSelectedZoneId, setActiveTab } = useIncidentContext()

  const [sortField, setSortField] = useState<'riskScore' | 'hazard' | 'exposure' | 'vulnerability' | 'access' | 'scarcity'>('riskScore')
  const [sortAsc, setSortAsc] = useState(false)
  const [activeZoneId, setActiveZoneId] = useState<string>(rankedZones[0]?.id || '')

  const activeZone = zones.find(z => z.id === activeZoneId) || rankedZones[0]

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const sortedZones = [...zones].sort((a, b) => {
    let aVal = a.riskScore
    let bVal = b.riskScore
    if (sortField === 'hazard') {
      aVal = a.factors.hazard
      bVal = b.factors.hazard
    } else if (sortField === 'exposure') {
      aVal = a.factors.exposure
      bVal = b.factors.exposure
    } else if (sortField === 'vulnerability') {
      aVal = a.factors.vulnerability
      bVal = b.factors.vulnerability
    } else if (sortField === 'access') {
      aVal = a.factors.accessibilityRisk
      bVal = b.factors.accessibilityRisk
    } else if (sortField === 'scarcity') {
      aVal = a.factors.resourceScarcity
      bVal = b.factors.resourceScarcity
    }
    return sortAsc ? aVal - bVal : bVal - aVal
  })

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-5 bg-[#0E0F11] overflow-y-auto max-w-6xl mx-auto text-[#ECEDEF]">
      {/* Header & Plain English Explanation */}
      <div className="space-y-1.5 border-b border-[#2A2D33] pb-4">
        <h2 className="text-base font-semibold text-[#ECEDEF] tracking-tight">Risk scoring model</h2>
        <p className="text-xs text-[#A1A5AD] leading-relaxed max-w-3xl">
          The risk score is a deterministic rating from 0 to 100 calculated by weighting five measurable factors: 
          <strong className="text-[#ECEDEF]"> Hazard severity (35%)</strong> measures flood depth and rainfall intensity; 
          <strong className="text-[#ECEDEF]"> Population exposure (25%)</strong> weights census density and distance to the river; 
          <strong className="text-[#ECEDEF]"> Social vulnerability (20%)</strong> accounts for elderly or pediatric residents and informal structures; 
          <strong className="text-[#ECEDEF]"> Accessibility risk (10%)</strong> reflects severed bridges and road blockages; and 
          <strong className="text-[#ECEDEF]"> Resource scarcity (10%)</strong> measures the local deficit of rescue units. 
          A score of 75 or above is classified as Critical, triggering priority siren and evacuation recommendations.
        </p>
      </div>

      {/* Five Factors Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-[#15171A] border border-[#2A2D33] rounded space-y-1">
          <div className="text-[11px] font-medium text-[#F2555A]">Hazard · 35%</div>
          <div className="text-xs text-[#A1A5AD]">River overtopping & rainfall rate</div>
        </div>
        <div className="p-3 bg-[#15171A] border border-[#2A2D33] rounded space-y-1">
          <div className="text-[11px] font-medium text-[#F5832B]">Exposure · 25%</div>
          <div className="text-xs text-[#A1A5AD]">Density & riverbank proximity</div>
        </div>
        <div className="p-3 bg-[#15171A] border border-[#2A2D33] rounded space-y-1">
          <div className="text-[11px] font-medium text-[#E8B923]">Vulnerability · 20%</div>
          <div className="text-xs text-[#A1A5AD]">Elderly ratio & informal housing</div>
        </div>
        <div className="p-3 bg-[#15171A] border border-[#2A2D33] rounded space-y-1">
          <div className="text-[11px] font-medium text-[#ECEDEF]">Access risk · 10%</div>
          <div className="text-xs text-[#A1A5AD]">Flooded causeways & isolation</div>
        </div>
        <div className="p-3 bg-[#15171A] border border-[#2A2D33] rounded space-y-1">
          <div className="text-[11px] font-medium text-[#ECEDEF]">Scarcity · 10%</div>
          <div className="text-xs text-[#A1A5AD]">Unfilled rescue asset deficit</div>
        </div>
      </div>

      {/* Main Grid: Sortable Ward Table + What-If Slider Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sortable Ward Table (7 Cols) */}
        <div className="lg:col-span-7 bg-[#15171A] border border-[#2A2D33] rounded overflow-hidden flex flex-col">
          <div className="p-3 bg-[#0E0F11] border-b border-[#2A2D33] flex items-center justify-between text-xs text-[#A1A5AD] font-medium">
            <span>Ward factor comparison ({zones.length})</span>
            <span className="text-[11px] text-[#858A93]">Click header to sort</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#242833] bg-[#14171d] text-zinc-400 font-medium">
                  <th className="py-2 px-3">Ward</th>
                  <th
                    onClick={() => handleSort('riskScore')}
                    className="py-2 px-3 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('hazard')} className="py-2 px-2 cursor-pointer hover:text-white">Haz</th>
                  <th onClick={() => handleSort('exposure')} className="py-2 px-2 cursor-pointer hover:text-white">Exp</th>
                  <th onClick={() => handleSort('vulnerability')} className="py-2 px-2 cursor-pointer hover:text-white">Vul</th>
                  <th onClick={() => handleSort('access')} className="py-2 px-2 cursor-pointer hover:text-white">Acc</th>
                  <th onClick={() => handleSort('scarcity')} className="py-2 px-2 cursor-pointer hover:text-white">Sca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20242f]">
                {sortedZones.map(zone => {
                  const isSelected = zone.id === activeZone.id
                  const colors = getSeverityColors(zone.priority)

                  return (
                    <tr
                      key={zone.id}
                      onClick={() => setActiveZoneId(zone.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#222733]' : 'hover:bg-[#1c2028]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-white">{zone.name.split(' ')[0]}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono-numbers font-semibold" style={{ color: colors.solid }}>
                          {zone.riskScore}
                        </span>
                        <span className="text-[11px] text-zinc-500 ml-1">({zone.priority})</span>
                      </td>
                      <td className="py-2.5 px-2 font-mono-numbers text-zinc-300">{zone.factors.hazard}</td>
                      <td className="py-2.5 px-2 font-mono-numbers text-zinc-300">{zone.factors.exposure}</td>
                      <td className="py-2.5 px-2 font-mono-numbers text-zinc-300">{zone.factors.vulnerability}</td>
                      <td className="py-2.5 px-2 font-mono-numbers text-zinc-300">{zone.factors.accessibilityRisk}</td>
                      <td className="py-2.5 px-2 font-mono-numbers text-zinc-300">{zone.factors.resourceScarcity}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* What-If Slider Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-[#181b22] border border-[#262c38] rounded-lg p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#242833] pb-2">
            <div>
              <h3 className="font-semibold text-xs text-white">What-if simulation</h3>
              <p className="text-[11px] text-zinc-400">Testing parameters for {activeZone.name}</p>
            </div>
            <span className="text-xs font-mono-numbers font-bold text-white px-2 py-0.5 rounded bg-[#101217] border border-[#242833]">
              Score: {activeZone.riskScore}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Slider 1: Hazard */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Hazard severity (35%)</span>
                <span className="font-mono-numbers text-zinc-200 font-semibold">{activeZone.factors.hazard}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeZone.factors.hazard}
                onChange={e => updateZoneFactors(activeZone.id, { hazard: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-[#252934] rounded"
              />
            </div>

            {/* Slider 2: Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Population exposure (25%)</span>
                <span className="font-mono-numbers text-zinc-200 font-semibold">{activeZone.factors.exposure}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeZone.factors.exposure}
                onChange={e => updateZoneFactors(activeZone.id, { exposure: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-[#252934] rounded"
              />
            </div>

            {/* Slider 3: Vulnerability */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Social vulnerability (20%)</span>
                <span className="font-mono-numbers text-zinc-200 font-semibold">{activeZone.factors.vulnerability}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeZone.factors.vulnerability}
                onChange={e => updateZoneFactors(activeZone.id, { vulnerability: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-[#252934] rounded"
              />
            </div>

            {/* Slider 4: Accessibility */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Accessibility risk (10%)</span>
                <span className="font-mono-numbers text-zinc-200 font-semibold">{activeZone.factors.accessibilityRisk}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeZone.factors.accessibilityRisk}
                onChange={e => updateZoneFactors(activeZone.id, { accessibilityRisk: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-[#252934] rounded"
              />
            </div>

            {/* Slider 5: Resource scarcity */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Resource scarcity (10%)</span>
                <span className="font-mono-numbers text-zinc-200 font-semibold">{activeZone.factors.resourceScarcity}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeZone.factors.resourceScarcity}
                onChange={e => updateZoneFactors(activeZone.id, { resourceScarcity: Number(e.target.value) })}
                className="w-full accent-blue-600 h-1.5 bg-[#252934] rounded"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#242833]">
            <button
              onClick={() => {
                setSelectedZoneId(activeZone.id)
                setActiveTab('dashboard')
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#242833] hover:bg-[#2e3442] text-zinc-200 text-xs font-medium transition-colors"
            >
              <span>View {activeZone.name.split(' ')[0]} on Command Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

