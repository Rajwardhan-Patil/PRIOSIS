import React, { useState } from 'react'
import {
  LifeBuoy,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  AlertTriangle,
  Building,
  UserCheck,
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
    setActiveTab,
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-teal-400" />
            <span>Emergency Resource Matching & Allocation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-criteria suitability matching: Equipment suitability, distance, and road transit viability.
          </p>
        </div>

        {/* Target Zone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Allocating For:</span>
          <select
            value={targetZone.id}
            onChange={e => setSelectedZoneId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-teal-500/50 text-teal-300 font-bold text-xs focus:outline-none"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.priority} · Scarcity: {z.factors.resourceScarcity}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Sector Requirement Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
              Sector Logistics Assessment
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              targetZone.priority === 'Critical'
                ? 'bg-red-950 text-red-300 border border-red-700'
                : 'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {targetZone.priority} Priority
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100">{targetZone.name}</h3>
          <p className="text-xs text-slate-300">
            Assigned Units: <strong className="text-teal-400">{targetZone.assignedResourceIds.length}</strong> · Active Incidents:{' '}
            <strong className="text-amber-400">{targetZone.activeIncidentCount}</strong> · River Proximity:{' '}
            <strong className="text-slate-200">{targetZone.riverProximityMeters}m</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <div className="text-center">
            <span className="text-2xl font-black text-emerald-400">{availableCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Available</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-teal-400">{assignedCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Deployed</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-purple-400">{targetZone.factors.resourceScarcity}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Scarcity Index</span>
          </div>
        </div>
      </div>

      {/* Resource Inventory & Suitability Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI Ranked Unit Suitability for {targetZone.name}</span>
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
            >
              <option value="all">All Resource Types</option>
              <option value="rescue_boat">Inflatable Boats</option>
              <option value="sdrf_team">SDRF Teams</option>
              <option value="ndrf_battalion">NDRF Battalions</option>
              <option value="ambulance">ALS Ambulances</option>
              <option value="fire_rescue">Fire Brigade Tenders</option>
              <option value="relief_truck">Relief Logistics</option>
              <option value="mobile_clinic">Mobile Clinics</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(res => {
            const isAvailable = res.status === 'available'
            const isAssignedToThisZone = res.assignedZoneId === targetZone.id
            const suitability = res.suitabilityScore || 70

            return (
              <div
                key={res.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  isAssignedToThisZone
                    ? 'bg-teal-950/20 border-teal-500/70 shadow-lg shadow-teal-950/30'
                    : isAvailable
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {res.type.replace('_', ' ')} · {res.unitCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAvailable
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {res.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100">{res.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{res.stationName}</span>
                  </div>

                  {/* AI Suitability Score & Rationale */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold text-[11px]">
                        AI Suitability Match
                      </span>
                      <span className="font-mono font-bold text-teal-300">
                        {suitability}% Match
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${suitability}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal pt-1">
                      {res.selectionReason}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    Dist: <strong className="text-slate-200">{res.distanceKm} km</strong> (~{res.etaMinutes}m ETA)
                  </div>

                  {isAssignedToThisZone ? (
                    <button
                      onClick={() => unassignResource(res.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold transition"
                    >
                      Release Unit
                    </button>
                  ) : isAvailable ? (
                    <button
                      onClick={() => assignResource(res.id, targetZone.id)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-md shadow-teal-950"
                    >
                      Dispatch to Sector
                    </button>
                  ) : (
                    <button
                      onClick={() => unassignResource(res.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
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

      {/* Emergency Shelters Capacity Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Designated Emergency Shelters & Relief Camps
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Total Capacity: {shelters.reduce((a, b) => a + b.capacityTotal, 0).toLocaleString()} Evacuees
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shelters.map(shl => {
            const pct = Math.round((shl.capacityOccupied / shl.capacityTotal) * 100)
            return (
              <div
                key={shl.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 truncate">{shl.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    {shl.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Occupancy: <strong className="text-slate-100">{shl.capacityOccupied}</strong> / {shl.capacityTotal} ({pct}%)
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct > 80 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{shl.hasMedicalPost ? '✓ Medical Post' : 'No Med Post'}</span>
                  <span>{shl.hasPowerBackup ? '✓ Generator' : 'No Generator'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
