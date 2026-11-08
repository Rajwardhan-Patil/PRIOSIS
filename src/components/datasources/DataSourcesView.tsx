import React, { useState } from 'react'
import {
  Radio,
  RefreshCw,
  Database,
  CloudRain,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
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
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-5 bg-[#0E0F11] overflow-y-auto max-w-5xl mx-auto text-[#ECEDEF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2D33] pb-4">
        <div>
          <h1 className="text-sm font-medium text-[#ECEDEF]">Data sources & ingestion telemetry</h1>
          <p className="text-xs text-[#A1A5AD] mt-0.5">
            Real-time feed provenance, health status, and live vs. simulated classification.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#ECEDEF] hover:bg-[#FFFFFF] disabled:opacity-50 text-[#0E0F11] font-medium text-xs transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh all feeds</span>
        </button>
      </div>

      {/* Real-time Feeds Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Open-Meteo Weather Card */}
        <div className="p-3.5 bg-[#15171A] border border-[#2A2D33] rounded space-y-3">
          <div className="flex items-center justify-between border-b border-[#242833] pb-2">
            <div className="flex items-center gap-2 text-white font-medium text-xs">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>Open-Meteo ECMWF</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                liveWeather?.isLive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {liveWeather?.isLive ? 'Live API' : 'Cached fallback'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Temperature</span>
              <span className="text-sm font-semibold text-white font-mono-numbers">{liveWeather?.temperatureC ?? 27.2}°C</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Precipitation</span>
              <span className="text-sm font-semibold text-blue-400 font-mono-numbers">{liveWeather?.precipitationMm ?? 14.5} mm</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Relative humidity</span>
              <span className="text-sm font-semibold text-white font-mono-numbers">{liveWeather?.relativeHumidity ?? 85}%</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Wind velocity</span>
              <span className="text-sm font-semibold text-white font-mono-numbers">{liveWeather?.windSpeedKmh ?? 24} km/h</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Coordinates: Pune (18.52° N, 73.85° E). Direct browser fetch without server proxy or API key exposure.
          </p>
        </div>

        {/* CWC Mutha Hydrology */}
        <div className="p-3.5 bg-[#181b22] border border-[#242833] rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#242833] pb-2">
            <div className="flex items-center gap-2 text-white font-medium text-xs">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Mutha Hydrology (CWC)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-800">
              Simulated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Spillway discharge</span>
              <span className="text-sm font-semibold text-amber-300 font-mono-numbers">{hydrology.outflowDischargeCusecs.toLocaleString()} cfs</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Reservoir level</span>
              <span className="text-sm font-semibold text-white font-mono-numbers">{hydrology.reservoirCapacityPercent}%</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">River gauge level</span>
              <span className="text-sm font-semibold text-white font-mono-numbers">{hydrology.muthaRiverLevelMeters} m</span>
            </div>
            <div className="p-2 rounded bg-[#111317] border border-[#242833]">
              <span className="text-[11px] text-zinc-400 block">Danger mark</span>
              <span className="text-sm font-semibold text-red-400 font-mono-numbers">{hydrology.dangerLevelMeters} m</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Khadakwasla Dam discharge feeds the Mutha corridor, causing low causeway inundations when over 15,000 cfs.
          </p>
        </div>

        {/* USGS Real-Time Seismic Feed */}
        <div className="p-3.5 bg-[#181b22] border border-[#242833] rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#242833] pb-2">
            <div className="flex items-center gap-2 text-white font-medium text-xs">
              <Database className="w-4 h-4 text-purple-400" />
              <span>USGS Global Seismic</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live API
            </span>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
            {liveEarthquakes.map(eq => (
              <div
                key={eq.id}
                className="p-1.5 rounded bg-[#111317] border border-[#242833] flex items-center justify-between"
              >
                <span className="text-zinc-300 truncate max-w-[150px] text-[11px]">{eq.place}</span>
                <span className="font-semibold text-purple-400 font-mono-numbers">M {eq.mag}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Compound risk telemetry monitoring for seismic activity impacting dam structures and flood embankments.
          </p>
        </div>
      </div>

      {/* Master Service Ingestion Registry Table */}
      <div className="bg-[#181b22] border border-[#242833] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#242833] flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            Ingestion Registry & Provenance Logs
          </span>
          <span className="text-[11px] text-zinc-400">
            {dataSources.length} registered feeds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242833] bg-[#14171d] text-zinc-400 text-[11px]">
                <th className="py-2.5 px-4 font-medium">Service name</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Provider</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Latency</th>
                <th className="py-2.5 px-4 font-medium">Last checked</th>
                <th className="py-2.5 px-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242833] text-zinc-300">
              {dataSources.map(src => {
                const isLive = src.status === 'LIVE'
                const isSimulated = src.status === 'SIMULATED'

                return (
                  <tr key={src.id} className="hover:bg-[#1f232c] transition-colors">
                    <td className="py-2.5 px-4 font-medium text-white flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLive ? 'bg-emerald-400' : isSimulated ? 'bg-amber-400' : 'bg-zinc-500'
                        }`}
                      />
                      <span>{src.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">{src.category}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{src.provider}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          isLive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isSimulated
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {src.status === 'LIVE' ? 'Live' : src.status === 'SIMULATED' ? 'Simulated' : src.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400 font-mono-numbers">{src.latencyMs} ms</td>
                    <td className="py-2.5 px-4 text-zinc-500 font-mono-numbers">{src.lastPolled}</td>
                    <td className="py-2.5 px-4 text-zinc-400 max-w-xs leading-normal">{src.notes}</td>
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
