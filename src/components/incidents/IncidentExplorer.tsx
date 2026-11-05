import React, { useState } from 'react'
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Waves,
  Car,
  Activity,
  Layers,
  ArrowRight,
  Upload,
  X,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { Incident, HazardType, IncidentSeverity, IncidentStatus } from '../../types'

export const IncidentExplorer: React.FC = () => {
  const {
    incidents,
    zones,
    createIncident,
    updateIncidentStatus,
    selectedZoneId,
    setSelectedZoneId,
    setActiveTab,
  } = useIncidentContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterHazard, setFilterHazard] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<Incident | null>(null)

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

  // Submit Handler
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive incident title.')
      return
    }
    if (!formLocation.trim()) {
      setFormError('Please enter a specific geographic location or junction.')
      return
    }
    if (!formDescription.trim()) {
      setFormError('Please describe field observations and water depth.')
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

    setFormSuccess(`Incident logged successfully! Autonomous risk engine updated ${targetZone?.name || 'zone'}.`)
    setTimeout(() => {
      setIsCreateModalOpen(false)
      setFormTitle('')
      setFormLocation('')
      setFormDescription('')
      setFormSuccess(null)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Incident Explorer & Field Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of urban flood incidents, river breaches, and road blockages across Pune wards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Demo Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents by location, description, or ward..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterHazard}
              onChange={e => setFilterHazard(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Hazards</option>
              <option value="flood">River Flooding</option>
              <option value="extreme_rainfall">Cloudburst / Rainfall</option>
              <option value="road_blockage">Road Blockage</option>
              <option value="infrastructure_disruption">Infrastructure</option>
            </select>

            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map(inc => {
          const isCritical = inc.severity === 'critical'
          const badgeClass =
            inc.severity === 'critical'
              ? 'bg-red-950 text-red-300 border-red-700'
              : inc.severity === 'high'
              ? 'bg-amber-950 text-amber-300 border-amber-700'
              : 'bg-yellow-950 text-yellow-300 border-yellow-700'

          return (
            <div
              key={inc.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                    {inc.severity} · {inc.hazardType.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">{inc.reportedAt}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-100">{inc.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{inc.locationName}</span>
                </p>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {inc.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Water Depth: <strong className="text-slate-200">{inc.waterDepthCm || 0} cm</strong></span>
                  <span>Zone: <strong className="text-teal-400">{inc.zoneName.split(' ')[0]}</strong></span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={inc.status}
                    onChange={e => updateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-teal-300 font-semibold focus:outline-none focus:border-teal-500"
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="active">Active</option>
                    <option value="contained">Contained</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    onClick={() => {
                      setSelectedZoneId(inc.zoneId)
                      setActiveTab('dashboard')
                    }}
                    className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Demo Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Log New Field Incident</h3>
                <p className="text-xs text-slate-400">
                  Simulate emergency report. Autonomous scoring engine recalculates immediately.
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Flood Sector (Ward)
                </label>
                <select
                  value={formZoneId}
                  onChange={e => setFormZoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} (Current Score: {z.riskScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramnadi Culvert Overflow & Car Submergence"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hazard Type
                  </label>
                  <select
                    value={formHazardType}
                    onChange={e => setFormHazardType(e.target.value as HazardType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="flood">River Flooding</option>
                    <option value="extreme_rainfall">Cloudburst / Rainfall</option>
                    <option value="road_blockage">Road Blockage</option>
                    <option value="infrastructure_disruption">Wall / Drain Collapse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={formSeverity}
                    onChange={e => setFormSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="critical">Critical (Life Threat)</option>
                    <option value="high">High (Property/Inundation)</option>
                    <option value="medium">Medium (Moderate Water)</option>
                    <option value="low">Low (Passable Puddles)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Specific Landmark / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paud Road Flyover"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Water Depth (cm)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formWaterDepth}
                    onChange={e => setFormWaterDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Report Source
                </label>
                <select
                  value={formReporterType}
                  onChange={e => setFormReporterType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="field_officer">Emergency Field Officer</option>
                  <option value="citizen_report">Verified Citizen Report</option>
                  <option value="sensor_iot">IoT Water Depth Sensor</option>
                  <option value="satellite_sar">Satellite SAR Proxy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Description & Humanitarian Impact
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail water velocity, stranded vehicles, vulnerable populations, and immediate evacuation requirements..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Instant Impact Preview Callout */}
              <div className="p-3 rounded-lg bg-slate-950 border border-teal-500/40 text-teal-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  <Activity className="w-3.5 h-3.5" />
                  Estimated AI Scoring Impact:
                </span>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Logging this {formSeverity.toUpperCase()} incident will increase{' '}
                  <strong>{zones.find(z => z.id === formZoneId)?.name}</strong>'s hazard factor by ~
                  {formSeverity === 'critical' ? '+25 to +40 pts' : '+15 to +20 pts'}, triggering immediate queue re-ranking.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-lg shadow-teal-950"
                >
                  Confirm & Recalculate Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
