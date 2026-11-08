import React, { useState } from 'react'
import { FactorContributions, RiskFactors } from '../../types'

interface FactorBarProps {
  factors: RiskFactors
  contributions: FactorContributions
  totalScore: number
}

export const FactorBar: React.FC<FactorBarProps> = ({ factors, contributions, totalScore }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const segments = [
    {
      key: 'hazard',
      label: 'Hazard',
      weight: '35%',
      raw: factors.hazard,
      pts: contributions.hazard,
      color: '#dc2626',
      desc: 'River inundation & rainfall severity',
    },
    {
      key: 'exposure',
      label: 'Exposure',
      weight: '25%',
      raw: factors.exposure,
      pts: contributions.exposure,
      color: '#d97706',
      desc: 'Population density & riverbank proximity',
    },
    {
      key: 'vulnerability',
      label: 'Vulnerability',
      weight: '20%',
      raw: factors.vulnerability,
      pts: contributions.vulnerability,
      color: '#ca8a04',
      desc: 'Elderly/child ratio & informal housing',
    },
    {
      key: 'access',
      label: 'Access Risk',
      weight: '10%',
      raw: factors.accessibilityRisk,
      pts: contributions.accessibilityRisk,
      color: '#0284c7',
      desc: 'Severed causeways & road isolation',
    },
    {
      key: 'scarcity',
      label: 'Scarcity',
      weight: '10%',
      raw: factors.resourceScarcity,
      pts: contributions.resourceScarcity,
      color: '#7c3aed',
      desc: 'Unallocated rescue units deficit',
    },
  ]

  // Safe percentage widths based on points out of 100
  return (
    <div className="space-y-1 relative">
      <div className="flex h-2 w-full rounded-sm overflow-hidden bg-[#222631]">
        {segments.map(seg => {
          const widthPct = Math.max(2, (seg.pts / Math.max(1, totalScore)) * 100)
          return (
            <div
              key={seg.key}
              onMouseEnter={() => setActiveTooltip(seg.key)}
              onMouseLeave={() => setActiveTooltip(null)}
              className="h-full cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                width: `${widthPct}%`,
                backgroundColor: seg.color,
              }}
            />
          )
        })}
      </div>

      {/* Interactive Tooltip on hover */}
      {activeTooltip && (
        <div className="absolute top-3 left-0 z-20 bg-[#1e222b] border border-[#2e3442] text-zinc-200 text-xs rounded p-2 shadow-lg min-w-[200px]">
          {(() => {
            const active = segments.find(s => s.key === activeTooltip)
            if (!active) return null
            return (
              <div className="space-y-0.5">
                <div className="flex justify-between font-medium">
                  <span className="text-white">{active.label} ({active.weight})</span>
                  <span className="font-mono-numbers text-zinc-100 font-semibold">+{active.pts} pts</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Raw factor: {active.raw}/100 · {active.desc}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

