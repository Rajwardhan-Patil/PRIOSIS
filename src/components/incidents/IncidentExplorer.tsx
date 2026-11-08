import React, { useState } from 'react'
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Check,
  Clock,
  MapPin,
  Waves,
  ArrowRight,
  X,
  Activity,
  Layers,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { Incident, HazardType, IncidentSeverity, IncidentStatus } from '../../types'

export const IncidentExplorer: React.FC = () => {
  const {
    incidents,
    zones,
    createIncident,
    updateIncidentStatus,
    setSelectedZoneId,
    setActiveTab,
  } = useIncidentContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterHazard, setFilterHazard] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [inspectedIncidentId, setInspectedIncidentId] = useState<string | null>(null)

  // Form State
  const [formZoneId, setFormZoneId] = useState(zones[0]?.id || '')
  const [formTitle, setFormTitle] = useState('')
  const [formHazardType, setFormHazardType] = useState<HazardType>('flood')
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('high')
  const [formLocation, setFormLocation] = useState('')
  const [formWaterDepth, setFormWaterDepth] = useState<number>(60)
  const [formReporterType, setFormReporterType] = useState<Incident['reporterType']>('field_officer')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Filtered Incidents
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesHazard = filterHazard === 'all' || inc.hazardType === filterHazard
    const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || inc.status === filterStatus

    return matchesSearch && matchesHazard && matchesSeverity && matchesStatus
  })

  const inspectedIncident = incidents.find(i => i.id === inspectedIncidentId) || filteredIncidents[0]

  // Submit Handler
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!formTitle.trim()) {
      setFormError('Incident title is required.')
      return
    }
    if (!formLocation.trim()) {
      setFormError('Specific junction or landmark location is required.')
      return
    }
    if (!formDescription.trim()) {
      setFormError('Field description and humanitarian impact notes are required.')
      return
    }

    const targetZone = zones.find(z => z.id === formZoneId)
    const coords: [number, number] = targetZone
      ? [
          targetZone.center[0] + (Math.random() - 0.5) * 0.008,
          targetZone.center[1] + (Math.random() - 0.5) * 0.008,
        ]
      : [18.5204, 73.8567]

    createIncident({
      zoneId: formZoneId,
      title: formTitle,
      hazardType: formHazardType,
      severity: formSeverity,
      locationName: formLocation,
      coordinates: coords,
      waterDepthCm: Number(formWaterDepth),
      reporterType: formReporterType,
      description: formDescription,
    })

    setFormSuccess(`Incident logged. Zone hazard score for ${targetZone?.name || 'ward'} updated.`)
    setTimeout(() => {
      setIsCreateModalOpen(false)
      setFormTitle('')
      setFormLocation('')
      setFormDescription('')
      setFormSuccess(null)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {/* Header & New Incident Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b253b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              Incident Explorer & Field Telemetry
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101726] text-teal-400 border border-[#1e2a42]">
              {incidents.length} RECORDS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified flood incidents, causeway overtopping, and infrastructure disruptions across Pune wards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Report New Field Incident</span>
        </button>
      </div>

      {/* Structured Filter Bar */}
      <div className="p-2.5 bg-[#0a0f1b] border border-[#1b253b] rounded flex flex-col md:flex-row items-stretch md:items-center gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ward, location, or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#070b13] border border-[#1b263c] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <select
            value={filterHazard}
            onChange={e => setFilterHazard(e.target.value)}
            className="px-2 py-1.5 rounded bg-[#070b13] border border-[#1b263c] text-zinc-300 focus:outline-none"
          >
            <option value="all">ALL HAZARDS</option>
            <option value="flood">RIVER FLOOD</option>
            <option value="extreme_rainfall">RAINFALL/CLOUDBURST</option>
            <option value="road_blockage">ROAD BLOCKAGE</option>
            <option value="infrastructure_disruption">INFRASTRUCTURE</option>
          </select>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-2 py-1.5 rounded bg-[#070b13] border border-[#1b263c] text-zinc-300 focus:outline-none"
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="critical">CRITICAL</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2 py-1.5 rounded bg-[#070b13] border border-[#1b263c] text-zinc-300 focus:outline-none"
          >
            <option value="all">ALL STATUSES</option>
            <option value="active">ACTIVE</option>
            <option value="investigating">INVESTIGATING</option>
            <option value="contained">CONTAINED</option>
            <option value="resolved">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Incident Data Table */}
        <div className="lg:col-span-8 bg-[#0a0f1b] border border-[#1b253b] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1b253b] bg-[#070b13] text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Incident & Sector</th>
                  <th className="py-2 px-3">Water Depth</th>
                  <th className="py-2 px-3">Reported</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151f33] text-zinc-300">
                {filteredIncidents.map(inc => {
                  const isSelected = inspectedIncident?.id === inc.id
                  const severityStyle =
                    inc.severity === 'critical'
                      ? 'bg-red-950/70 text-red-300 border-red-800'
                      : inc.severity === 'high'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                      : 'bg-yellow-950/70 text-yellow-300 border-yellow-800'

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setInspectedIncidentId(inc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#101828]' : 'hover:bg-[#0c1220]'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <select
                          value={inc.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                          className="px-1.5 py-0.5 rounded bg-[#070b13] border border-[#1d2940] text-[10px] font-mono font-bold text-teal-400 focus:outline-none"
                        >
                          <option value="reported">REPORTED</option>
                          <option value="investigating">INVESTIGATING</option>
                          <option value="active">ACTIVE</option>
                          <option value="contained">CONTAINED</option>
                          <option value="resolved">RESOLVED</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${severityStyle}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white text-xs leading-tight">{inc.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                          <span className="truncate">{inc.locationName} ({inc.zoneName.split(' ')[0]})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-200">
                        {inc.waterDepthCm ? `${inc.waterDepthCm} cm` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-500">
                        {inc.reportedAt}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedZoneId(inc.zoneId)
                            setActiveTab('dashboard')
                          }}
                          className="text-[10px] font-mono font-semibold text-teal-400 hover:text-teal-300"
                        >
                          MAP →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Detailed Inspector Panel */}
        <div className="lg:col-span-4 bg-[#0a0f1b] border border-[#1b253b] rounded p-3 space-y-3">
          {inspectedIncident ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b253b] pb-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-teal-400">
                  Incident Telemetry Record
                </span>
                <span className="text-[9px] font-mono text-zinc-500">{inspectedIncident.id}</span>
              </div>

              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">TITLE & LOCATION</span>
                <h3 className="text-sm font-bold text-white leading-snug">{inspectedIncident.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-mono text-[11px]">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{inspectedIncident.locationName}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-zinc-500 block">HAZARD TYPE</span>
                  <span className="text-zinc-200 font-bold uppercase">{inspectedIncident.hazardType.replace('_', ' ')}</span>
                </div>
                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-zinc-500 block">SEVERITY IMPACT</span>
                  <span className="text-amber-400 font-bold uppercase">+{inspectedIncident.impactDeltaRisk} PTS</span>
                </div>
                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-zinc-500 block">WATER INUNDATION</span>
                  <span className="text-zinc-200 font-bold">{inspectedIncident.waterDepthCm || 0} CM</span>
                </div>
                <div className="p-2 rounded bg-[#070b13] border border-[#162033]">
                  <span className="text-zinc-500 block">TELEMETRY SOURCE</span>
                  <span className="text-teal-400 font-bold uppercase">{inspectedIncident.reporterType.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">FIELD OBSERVATIONS</span>
                <p className="text-xs text-zinc-300 bg-[#070b13] p-2.5 rounded border border-[#162033] leading-relaxed">
                  {inspectedIncident.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1b253b] flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">
                  WARD: {inspectedIncident.zoneName}
                </span>
                <button
                  onClick={() => {
                    setSelectedZoneId(inspectedIncident.zoneId)
                    setActiveTab('dashboard')
                  }}
                  className="px-2.5 py-1 rounded bg-[#131d2e] hover:bg-[#1a273e] text-teal-300 border border-[#233554] text-[11px] font-mono font-medium transition-colors"
                >
                  Locate on Command Map →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 font-mono text-xs">
              Select an incident from the table to view telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Log Field Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b101c] border border-[#202b40] rounded-lg max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1 rounded hover:bg-[#162136] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-[#1b253a] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Log New Incident Observation</h3>
              <p className="text-[11px] font-mono text-zinc-500">
                Injected incident immediately triggers deterministic zone re-scoring.
              </p>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Target Flood Sector (Ward)
                </label>
                <select
                  value={formZoneId}
                  onChange={e => setFormZoneId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 font-mono focus:outline-none focus:border-teal-500"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} (Risk: {z.riskScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramnadi Culvert Overflow & Car Submergence"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Hazard Classification
                  </label>
                  <select
                    value={formHazardType}
                    onChange={e => setFormHazardType(e.target.value as HazardType)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 font-mono focus:outline-none focus:border-teal-500"
                  >
                    <option value="flood">RIVER FLOOD</option>
                    <option value="extreme_rainfall">RAINFALL/CLOUDBURST</option>
                    <option value="road_blockage">ROAD BLOCKAGE</option>
                    <option value="infrastructure_disruption">WALL/DRAIN COLLAPSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={formSeverity}
                    onChange={e => setFormSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 font-mono focus:outline-none focus:border-teal-500"
                  >
                    <option value="critical">CRITICAL (LIFE THREAT)</option>
                    <option value="high">HIGH (INUNDATION)</option>
                    <option value="medium">MEDIUM (RESTRICTED)</option>
                    <option value="low">LOW (MONITOR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paud Road Flyover"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                    Water Depth (cm)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formWaterDepth}
                    onChange={e => setFormWaterDepth(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Report Provenance
                </label>
                <select
                  value={formReporterType}
                  onChange={e => setFormReporterType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 font-mono focus:outline-none focus:border-teal-500"
                >
                  <option value="field_officer">EMERGENCY FIELD OFFICER</option>
                  <option value="citizen_report">VERIFIED CITIZEN REPORT</option>
                  <option value="sensor_iot">IOT TELEMETRY GAUGE</option>
                  <option value="satellite_sar">SATELLITE SAR ESTIMATE</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Field Observations & Evacuation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail water velocity, stranded vehicles, vulnerable populations..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#070b13] border border-[#1e293c] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                />
              </div>

              <div className="border-t border-[#1b253a] pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition-colors"
                >
                  Log & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
