import React, { useState } from 'react'
import {
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  X,
  Plus,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'
import { CommandMap } from '../map/CommandMap'
import { Incident, HazardType, IncidentSeverity, IncidentStatus } from '../../types'
import { getSeverityColors } from '../../tokens'

export const IncidentsView: React.FC = () => {
  const {
    incidents,
    zones,
    resources,
    roadSegments,
    activeRouteResult,
    selectedZoneId,
    setSelectedZoneId,
    createIncident,
    updateIncidentStatus,
    setActiveTab,
  } = useIncidentContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterHazard, setFilterHazard] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [inspectedIncidentId, setInspectedIncidentId] = useState<string | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Report Modal form state
  const [formZoneId, setFormZoneId] = useState(zones[0]?.id || '')
  const [formTitle, setFormTitle] = useState('')
  const [formHazardType, setFormHazardType] = useState<HazardType>('flood')
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('high')
  const [formLocation, setFormLocation] = useState('')
  const [formWaterDepth, setFormWaterDepth] = useState<number>(60)
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesHazard = filterHazard === 'all' || inc.hazardType === filterHazard
    const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || inc.status === filterStatus

    return matchesSearch && matchesHazard && matchesSeverity && matchesStatus
  })

  const inspectedIncident = incidents.find(i => i.id === inspectedIncidentId) || null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formTitle.trim()) {
      setFormError('Incident title is required.')
      return
    }
    if (!formLocation.trim()) {
      setFormError('Location is required.')
      return
    }

    const targetZone = zones.find(z => z.id === formZoneId)
    const coords: [number, number] = targetZone
      ? [
          targetZone.center[0] + (Math.random() - 0.5) * 0.006,
          targetZone.center[1] + (Math.random() - 0.5) * 0.006,
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
      reporterType: 'field_officer',
      description: formDescription || 'Field officer observation reported to operations center.',
    })

    setIsReportModalOpen(false)
    setFormTitle('')
    setFormLocation('')
    setFormDescription('')
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-48px)] overflow-hidden bg-[#0E0F11] text-[#ECEDEF]">
      {/* Left: Incidents Table & Toolbar (~60% width) */}
      <div className="flex-1 lg:w-[60%] flex flex-col h-full border-r border-[#2A2D33] bg-[#15171A] overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 bg-[#15171A] border-b border-[#2A2D33] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#858A93] shrink-0" />
            <input
              type="text"
              placeholder="Search by ward or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0E0F11] border border-[#2A2D33] rounded px-2.5 py-1 text-xs text-[#ECEDEF] placeholder-[#858A93] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-[#0E0F11] border border-[#2A2D33] rounded px-2 py-1 text-xs text-[#A1A5AD] focus:outline-none"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#0E0F11] border border-[#2A2D33] rounded px-2 py-1 text-xs text-[#A1A5AD] focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#ECEDEF] hover:bg-[#FFFFFF] text-[#0E0F11] text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report incident</span>
            </button>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No incidents match the selected filters. Last checked 14:32 IST.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#242833] bg-[#14171d] text-zinc-400 font-medium">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Ward</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Water</th>
                  <th className="py-2.5 px-3">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222631]">
                {filteredIncidents.map(inc => {
                  const isSelected = inspectedIncidentId === inc.id
                  const isCritical = inc.severity === 'critical'

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => {
                        setInspectedIncidentId(inc.id)
                        setSelectedZoneId(inc.zoneId)
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#222733]' : 'hover:bg-[#1c2028]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono-numbers text-zinc-400">{inc.id}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{inc.zoneName.split(' ')[0]}</td>
                      <td className="py-2.5 px-3 text-zinc-300 capitalize">{inc.hazardType.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[11px] font-medium border ${
                            isCritical
                              ? 'bg-[#450a0a] text-red-300 border-red-900'
                              : 'bg-[#451a03] text-amber-300 border-amber-900'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-zinc-300 font-medium capitalize">{inc.status}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono-numbers text-zinc-200">
                        {inc.waterDepthCm ? `${inc.waterDepthCm} cm` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 font-mono-numbers">{inc.reportedAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: Map & Detail Drawer (~40% width) */}
      <div className="w-full lg:w-[40%] flex flex-col h-full bg-[#14171d] relative">
        <div className="flex-1 h-full">
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

        {/* Side Drawer on Row Click */}
        {inspectedIncident && (
          <div className="absolute inset-y-0 right-0 w-80 bg-[#181b22] border-l border-[#282e3c] p-4 shadow-2xl flex flex-col justify-between z-20 overflow-y-auto animate-in slide-in-from-right-4 duration-150 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#242833] pb-2">
                <span className="font-mono-numbers text-xs text-zinc-400">{inspectedIncident.id}</span>
                <button
                  onClick={() => setInspectedIncidentId(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-white leading-snug">{inspectedIncident.title}</h3>
                <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{inspectedIncident.locationName}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#14171d] rounded border border-[#242833] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ward</span>
                  <span className="font-medium text-white">{inspectedIncident.zoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Water depth</span>
                  <span className="font-mono-numbers text-white">{inspectedIncident.waterDepthCm || 0} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <select
                    value={inspectedIncident.status}
                    onChange={e => updateIncidentStatus(inspectedIncident.id, e.target.value as IncidentStatus)}
                    className="bg-[#1e222b] border border-[#2a303d] rounded px-1.5 py-0.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="active">Active</option>
                    <option value="contained">Contained</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-zinc-400 font-medium">Field description</span>
                <p className="text-zinc-300 leading-relaxed bg-[#14171d] p-2.5 rounded border border-[#242833]">
                  {inspectedIncident.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedZoneId(inspectedIncident.zoneId)
                setActiveTab('dashboard')
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              <span>Focus on Command map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* New Incident Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#181b22] border border-[#2a303d] rounded-lg max-w-md w-full p-5 shadow-2xl space-y-3.5 text-zinc-200">
            <div className="flex items-center justify-between border-b border-[#242833] pb-2.5">
              <h3 className="font-semibold text-sm text-white">Report field incident</h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2 rounded bg-[#450a0a] border border-red-900 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Ward</label>
                <select
                  value={formZoneId}
                  onChange={e => setFormZoneId(e.target.value)}
                  className="w-full bg-[#14171d] border border-[#2a303d] rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} (Risk: {z.riskScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ramnadi Culvert Overflow"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-[#14171d] border border-[#2a303d] rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Location / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Paud Road Bridge"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full bg-[#14171d] border border-[#2a303d] rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Water depth (cm)</label>
                  <input
                    type="number"
                    value={formWaterDepth}
                    onChange={e => setFormWaterDepth(Number(e.target.value))}
                    className="w-full bg-[#14171d] border border-[#2a303d] rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of water velocity and trapped vehicles..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-[#14171d] border border-[#2a303d] rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#242833]">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

