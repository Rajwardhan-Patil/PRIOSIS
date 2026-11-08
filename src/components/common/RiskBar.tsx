import React from 'react'
import { PrioritySeverity, getSeverityColors } from '../../tokens'

interface RiskBarProps {
  score: number
  priority: PrioritySeverity
  compact?: boolean
}

export const RiskBar: React.FC<RiskBarProps> = ({ score, priority, compact = false }) => {
  const colors = getSeverityColors(priority)

  return (
    <div className="flex items-center gap-2">
      <div className={`w-16 bg-[#232732] rounded-full h-1.5 overflow-hidden ${compact ? 'w-12' : 'w-20'}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${score}%`, backgroundColor: colors.solid }}
        />
      </div>
      <span className="font-mono-numbers text-xs font-semibold text-zinc-100 min-w-[28px]">
        {score}
      </span>
    </div>
  )
}

