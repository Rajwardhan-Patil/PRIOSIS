import React, { useState } from 'react'
import { LifeBuoy, MapPin, CheckCircle, RotateCcw } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { CommandMap } from '../map/CommandMap'
import { Toast, ToastMessage } from '../common/Toast'
import { Resource } from '../../types'

export const UnitsView: React.FC = () => {
  const {
    resources,
    zones,
    roadSegments,
    incidents,
    activeRouteResult,
    selectedZoneId,
    setSelectedZoneId,
    assignResource,
    unassignResource,
    rankedZones,
  } = useIncidentContext()

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const filteredUnits = resources.filter(u => {
    if (filterStatus === 'all') return true
    return u.status === filterStatus
  })

  const worstWard = rankedZones[0]

  const handleSingleClickDispatch = (unit: Resource) => {
    if (unit.status === 'assigned') {
      unassignResource(unit.id)
      setToast({
        id: `toast-${Date.now()}`,
        title: `Recalled ${unit.name}`,
        description: 'Unit returned to available pool.',
      })
      return
    }

    assignResource(unit.id, worstWard.id)
    setToast({
      id: `toast-${Date.now()}`,
      title: `Dispatched ${unit.name}`,
      description: `Assigned to ${worstWard.name}.`,
      undoAction: () => {
        unassignResource(unit.id)
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-48px)] overflow-hidden bg-[#0E0F11] text-[#ECEDEF]">
      {/* Left: Unit Roster (~60% width) */}
      <div className="flex-1 lg:w-[60%] flex flex-col h-full border-r border-[#2A2D33] bg-[#15171A] overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 bg-[#15171A] border-b border-[#2A2D33] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#ECEDEF]">Emergency response fleet</span>
            <span className="text-[#858A93] font-mono-numbers">({resources.length} total units)</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#0E0F11] border border-[#2A2D33] rounded px-2.5 py-1 text-xs text-[#A1A5AD] focus:outline-none"
            >
              <option value="all">All fleet statuses</option>
              <option value="available">Ready only</option>
              <option value="assigned">Deployed only</option>
            </select>
          </div>
        </div>

        {/* Units List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2A2D33]">
          {filteredUnits.map(unit => {
            const isReady = unit.status === 'available'

            return (
              <div
                key={unit.id}
                className="p-3.5 hover:bg-[#1C1F23]/60 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#ECEDEF] truncate">{unit.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        isReady
                          ? 'text-[#4CB782] bg-[#4CB782]/10 border border-[#4CB782]/20'
                          : 'text-[#ECEDEF] bg-[#24272D] border border-[#2A2D33]'
                      }`}
                    >
                      {isReady ? 'Ready' : `Deployed (${unit.assignedZoneId})`}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#858A93] flex items-center gap-2">
                    <span className="font-mono-numbers">{unit.unitCode}</span>
                    <span>·</span>
                    <span className="truncate">{unit.stationName}</span>
                    <span>·</span>
                    <span>Capacity: {unit.capacity} personnel</span>
                  </div>

                  <div className="text-[11px] text-[#A1A5AD]">
                    Specialization: {unit.specialization.slice(0, 2).join(', ')}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleSingleClickDispatch(unit)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm ${
                      isReady
                        ? 'bg-[#ECEDEF] hover:bg-[#FFFFFF] text-[#0E0F11]'
                        : 'bg-[#1C1F23] hover:bg-[#24272D] text-[#ECEDEF] border border-[#2A2D33]'
                    }`}
                  >
                    {isReady ? `Dispatch to ${worstWard.name.split(' ')[0]}` : 'Recall unit'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Map Positioning (~40% width) */}
      <div className="w-full lg:w-[40%] h-full bg-[#0E0F11]">
        <CommandMap
          zones={zones}
          incidents={incidents}
          resources={resources}
          roadSegments={roadSegments}
          activeRoute={activeRouteResult}
          selectedZoneId={selectedZoneId}
          onSelectZone={id => setSelectedZoneId(id)}
        />
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

