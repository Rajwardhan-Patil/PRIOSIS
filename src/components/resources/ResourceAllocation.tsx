import React, { useState } from 'react'
import {
  LifeBuoy,
  MapPin,
  Clock,
  Sparkles,
  Building,
  Anchor,
  Shield,
  Ambulance,
  Flame,
  Truck,
  Stethoscope,
  CheckCircle,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { rankResourcesForZone } from '../../services/resourceEngine'
import { ResourceType } from '../../types'

export const ResourceAllocation: React.FC = () => {
  const {
    resources,
    zones,
    shelters,
    selectedZoneId,
    setSelectedZoneId,
    assignResource,
    unassignResource,
  } = useIncidentContext()

  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const targetZone = zones.find(z => z.id === selectedZoneId) || zones[0]

  // Rank resources specifically for the selected target zone
  const rankedResources = rankResourcesForZone(resources, targetZone)

  const filteredResources = rankedResources.filter(res => {
    const matchesType = filterType === 'all' || res.type === filterType
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus
    return matchesType && matchesStatus
  })

  const availableCount = resources.filter(r => r.status === 'available').length
  const assignedCount = resources.filter(r => r.status === 'assigned').length

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'rescue_boat':
        return Anchor
      case 'sdrf_team':
      case 'ndrf_battalion':
        return Shield
      case 'ambulance':
        return Ambulance
      case 'fire_rescue':
        return Flame
      case 'relief_truck':
        return Truck
      case 'mobile_clinic':
        return Stethoscope
      default:
        return LifeBuoy
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Target Sector Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b253b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              Emergency Resource Matching & Allocation
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101726] text-teal-400 border border-[#1e2a42]">
              {resources.length} UNITS TRACKED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Multi-criteria matching: Equipment specialization, transit distance, and road viability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">DISPATCH TARGET:</span>
          <select
            value={targetZone.id}
            onChange={e => setSelectedZoneId(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-[#0a0f1b] border border-[#202b42] text-teal-300 font-mono text-xs font-semibold focus:outline-none"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.priority} · Scarcity: {z.factors.resourceScarcity}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Sector Logistics Tape */}
      <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-teal-400">
              SECTOR LOGISTICS PROFILE
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300 font-bold">{targetZone.name}</span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-3">
            <span>ASSIGNED: <strong className="text-teal-400 font-semibold">{targetZone.assignedResourceIds.length}</strong></span>
            <span className="text-zinc-600">|</span>
            <span>INCIDENTS: <strong className="text-amber-400 font-semibold">{targetZone.activeIncidentCount}</strong></span>
            <span className="text-zinc-600">|</span>
            <span>RIVER OFFSET: <strong className="text-zinc-200 font-semibold">{targetZone.riverProximityMeters}m</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#1a2438] pt-2 md:pt-0 md:pl-3 text-center">
          <div>
            <span className="text-lg font-bold text-emerald-400">{availableCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Available</span>
          </div>
          <div>
            <span className="text-lg font-bold text-teal-400">{assignedCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Deployed</span>
          </div>
          <div>
            <span className="text-lg font-bold text-purple-400">{targetZone.factors.resourceScarcity}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Deficit Index</span>
          </div>
        </div>
      </div>

      {/* Resource Inventory List / Table */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
            Ranked Response Assets for {targetZone.name}
          </span>

          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2 py-1 rounded bg-[#0a0f1b] border border-[#1b263c] text-zinc-300 focus:outline-none"
            >
              <option value="all">ALL TYPES</option>
              <option value="rescue_boat">INFLATABLE BOATS</option>
              <option value="sdrf_team">SDRF SQUADS</option>
              <option value="ndrf_battalion">NDRF BATTALIONS</option>
              <option value="ambulance">ALS AMBULANCES</option>
              <option value="fire_rescue">HEAVY FIRE TENDERS</option>
              <option value="relief_truck">RELIEF CONVOYS</option>
              <option value="mobile_clinic">MOBILE CLINICS</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2 py-1 rounded bg-[#0a0f1b] border border-[#1b263c] text-zinc-300 focus:outline-none"
            >
              <option value="all">ALL STATUSES</option>
              <option value="available">AVAILABLE ONLY</option>
              <option value="assigned">ASSIGNED</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResources.map(res => {
            const isAvailable = res.status === 'available'
            const isAssignedToThisZone = res.assignedZoneId === targetZone.id
            const suitability = res.suitabilityScore || 70
            const IconComponent = getResourceIcon(res.type)

            return (
              <div
                key={res.id}
                className={`p-3 rounded border transition-colors flex flex-col justify-between space-y-2.5 ${
                  isAssignedToThisZone
                    ? 'bg-[#0f1d2b] border-teal-500/70'
                    : isAvailable
                    ? 'bg-[#0a0f1b] border-[#1b253b] hover:border-[#283957]'
                    : 'bg-[#080d18] border-[#162033] opacity-75'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-teal-400">
                      <IconComponent className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        {res.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        isAvailable
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/70'
                          : 'bg-[#151f33] text-zinc-400 border border-[#22314e]'
                      }`}
                    >
                      {res.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-white leading-tight">{res.name}</h4>
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                      <span className="truncate">{res.stationName}</span>
                    </div>
                  </div>

                  {/* Suitability Metric */}
                  <div className="p-2 rounded bg-[#070b13] border border-[#162033] space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 uppercase">SUITABILITY SCORE</span>
                      <span className="font-bold text-teal-300">{suitability}%</span>
                    </div>
                    <div className="w-full bg-[#182337] h-1 rounded-sm overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-sm" style={{ width: `${suitability}%` }} />
                    </div>
                    <p className="text-[9px] text-zinc-400 leading-normal pt-0.5">
                      {res.selectionReason}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#172134] flex items-center justify-between gap-2 font-mono text-[10px]">
                  <div className="text-zinc-400">
                    DIST: <strong className="text-zinc-200">{res.distanceKm} km</strong> (~{res.etaMinutes}m ETA)
                  </div>

                  {isAssignedToThisZone ? (
                    <button
                      onClick={() => unassignResource(res.id)}
                      className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[10px] font-semibold transition-colors"
                    >
                      Release Asset
                    </button>
                  ) : isAvailable ? (
                    <button
                      onClick={() => assignResource(res.id, targetZone.id)}
                      className="px-2.5 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-semibold transition-colors"
                    >
                      Dispatch Asset
                    </button>
                  ) : (
                    <button
                      onClick={() => unassignResource(res.id)}
                      className="px-2 py-0.5 rounded bg-[#131d30] text-zinc-400 hover:text-white border border-[#202f4a] text-[9px] transition-colors"
                      title="Recall from current assignment"
                    >
                      Reassign
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Designated Shelters Capacity Console */}
      <div className="p-3 bg-[#0a0f1b] border border-[#1b253b] rounded space-y-2">
        <div className="flex items-center justify-between border-b border-[#172134] pb-1.5">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">
              Designated Emergency Shelters & Relief Camps
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            TOTAL CENSUS CAPACITY: {shelters.reduce((a, b) => a + b.capacityTotal, 0).toLocaleString()} EVACUEES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {shelters.map(shl => {
            const pct = Math.round((shl.capacityOccupied / shl.capacityTotal) * 100)
            return (
              <div
                key={shl.id}
                className="p-2.5 rounded bg-[#070b13] border border-[#162033] space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-[11px] truncate">{shl.name}</span>
                  <span className="text-[8px] font-bold px-1 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                    {shl.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  CENSUS: <strong className="text-zinc-200">{shl.capacityOccupied}</strong> / {shl.capacityTotal} ({pct}%)
                </div>
                <div className="w-full bg-[#162136] h-1 rounded-sm overflow-hidden">
                  <div
                    className={`h-full rounded-sm ${pct > 80 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-zinc-500 text-[9px] flex items-center justify-between pt-0.5">
                  <span>{shl.hasMedicalPost ? '✓ Med Staging' : 'No Med Post'}</span>
                  <span>{shl.hasPowerBackup ? '✓ Generator' : 'No Gen'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
