import React, { useState } from 'react'
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  CloudRain,
  Activity,
  Layers,
  Shield,
  Clock,
} from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const DataSourcesView: React.FC = () => {
  const {
    dataSources,
    refreshDataSources,
    liveWeather,
    liveEarthquakes,
    hydrology,
  } = useIncidentContext()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await refreshDataSources()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-teal-400" />
            <span>Data Sources, Telemetry & Ingestion Health</span>
          </h2>
          <p className="text-xs text-slate-400">
            Transparent provenance tracking. Clear distinction between live external APIs and simulated demo data.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-teal-950 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Ping & Poll All Feeds</span>
        </button>
      </div>

      {/* Live Ingestion Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Open-Meteo Live Weather Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-sm text-slate-100">Open-Meteo Weather</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                liveWeather?.isLive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {liveWeather?.isLive ? 'LIVE FEED' : 'CACHED FALLBACK'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Temperature</span>
              <span className="text-base font-bold text-slate-100">{liveWeather?.temperatureC ?? 27.2}°C</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Precipitation</span>
              <span className="text-base font-bold text-teal-300">{liveWeather?.precipitationMm ?? 14.5} mm</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Humidity</span>
              <span className="text-base font-bold text-slate-100">{liveWeather?.relativeHumidity ?? 85}%</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
              <span className="text-base font-bold text-slate-100">{liveWeather?.windSpeedKmh ?? 24} km/h</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Coordinates: Pune (18.5204° N, 73.8567° E). Free public API without client secret exposure.
          </p>
        </div>

        {/* CWC Hydrology Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-slate-100">CWC Mutha Hydrology</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
              SIMULATED DEMO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Dam Discharge</span>
              <span className="text-base font-bold text-amber-400">{hydrology.outflowDischargeCusecs.toLocaleString()} cfs</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Reservoir Fill</span>
              <span className="text-base font-bold text-slate-100">{hydrology.reservoirCapacityPercent}%</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Gauge Height</span>
              <span className="text-base font-bold text-slate-100">{hydrology.muthaRiverLevelMeters} m</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Danger Level</span>
              <span className="text-base font-bold text-red-400">{hydrology.dangerLevelMeters} m</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Khadakwasla Dam upstream of Deccan Gymkhana causeway. High discharge creates backflow in Kasba Peth.
          </p>
        </div>

        {/* USGS Earthquake Multi-Hazard Feed */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-slate-100">USGS Seismic Monitor</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
              LIVE USGS API
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px]">
            {liveEarthquakes.map(eq => (
              <div
                key={eq.id}
                className="p-1.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-slate-300 truncate max-w-[150px]">{eq.place}</span>
                <span className="font-mono font-bold text-teal-300">M {eq.mag}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Secondary hazard demonstration. Real-time seismic fault tracking for cascading landslides.
          </p>
        </div>
      </div>

      {/* Main Data Registry Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Integrated Services Health & Provenance Registry</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Source Provider</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Last Checked</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {dataSources.map(src => {
                const isLive = src.status === 'LIVE'
                const isSimulated = src.status === 'SIMULATED'

                return (
                  <tr key={src.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-bold text-slate-100 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : isSimulated ? 'bg-amber-400' : 'bg-slate-400'}`} />
                      <span>{src.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{src.category}</td>
                    <td className="py-3 px-3 text-slate-400">{src.provider}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : isSimulated
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {src.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{src.latencyMs} ms</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{src.lastPolled}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs">{src.notes}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
