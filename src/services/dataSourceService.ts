import { DataSourceStatus } from '../types'

export interface OpenMeteoWeather {
  temperatureC: number
  relativeHumidity: number
  precipitationMm: number
  windSpeedKmh: number
  weatherCode: number
  time: string
  isLive: boolean
}

export interface UsgsEarthquake {
  id: string
  place: string
  mag: number
  time: string
  url: string
}

export interface HydrologyData {
  damName: string
  reservoirCapacityPercent: number
  inflowCusecs: number
  outflowDischargeCusecs: number
  muthaRiverLevelMeters: number
  warningLevelMeters: number
  dangerLevelMeters: number
  status: 'Normal' | 'Alert' | 'Danger'
  isLive: boolean
}

/**
 * Fetch live weather from Open-Meteo for Pune coordinates
 */
export async function fetchLiveWeather(): Promise<{ data: OpenMeteoWeather; latencyMs: number }> {
  const start = performance.now()
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation_probability,rain&timezone=Asia%2FKolkata',
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const json = await res.json()
    const latency = Math.round(performance.now() - start)

    const current = json.current || {}
    return {
      data: {
        temperatureC: current.temperature_2m ?? 27.4,
        relativeHumidity: current.relative_humidity_2m ?? 82,
        precipitationMm: current.precipitation ?? 14.5,
        windSpeedKmh: current.wind_speed_10m ?? 24.8,
        weatherCode: current.weather_code ?? 61,
        time: current.time || new Date().toISOString(),
        isLive: true,
      },
      latencyMs: latency,
    }
  } catch (err) {
    console.warn('Open-Meteo live API fallback active:', err)
    return {
      data: {
        temperatureC: 26.8,
        relativeHumidity: 88,
        precipitationMm: 18.2,
        windSpeedKmh: 28.5,
        weatherCode: 65, // Heavy rain
        time: new Date().toISOString(),
        isLive: false,
      },
      latencyMs: 15,
    }
  }
}

/**
 * Fetch live recent USGS seismic events for multi-hazard secondary layer
 */
export async function fetchLiveUsgsEarthquakes(): Promise<{ data: UsgsEarthquake[]; latencyMs: number; isLive: boolean }> {
  const start = performance.now()
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const latency = Math.round(performance.now() - start)

    const list: UsgsEarthquake[] = (json.features || []).slice(0, 5).map((f: any) => ({
      id: f.id,
      place: f.properties?.place || 'Regional epicentre',
      mag: f.properties?.mag || 0,
      time: new Date(f.properties?.time || Date.now()).toLocaleTimeString(),
      url: f.properties?.url || '#',
    }))

    return { data: list, latencyMs: latency, isLive: true }
  } catch (err) {
    console.warn('USGS live feed fallback:', err)
    return {
      data: [
        { id: 'sim-eq-1', place: 'Koyna-Warna Fault Zone (SW Maharashtra)', mag: 3.1, time: '2 hrs ago', url: '#' },
        { id: 'sim-eq-2', place: 'Northern Western Ghats Ridge', mag: 2.8, time: '6 hrs ago', url: '#' },
      ],
      latencyMs: 12,
      isLive: false,
    }
  }
}

/**
 * Get hydrology data for Khadakwasla Dam / Mutha River
 */
export function getHydrologyData(): HydrologyData {
  return {
    damName: 'Khadakwasla Dam (Mutha Basin)',
    reservoirCapacityPercent: 94.6,
    inflowCusecs: 14200,
    outflowDischargeCusecs: 18500, // River discharge causes low-bridge submergence
    muthaRiverLevelMeters: 546.8,
    warningLevelMeters: 545.0,
    dangerLevelMeters: 548.0,
    status: 'Alert',
    isLive: false, // Transparently labeled as simulated telemetry
  }
}

/**
 * Initial registry of data sources
 */
export const INITIAL_DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'src-open-meteo',
    name: 'Open-Meteo Weather API',
    category: 'Weather',
    provider: 'Open-Meteo GmbH (ECMWF & GFS Models)',
    endpoint: 'https://api.open-meteo.com/v1/forecast (Pune 18.52N, 73.85E)',
    status: 'LIVE',
    lastPolled: new Date().toLocaleTimeString(),
    latencyMs: 145,
    notes: 'Live precipitation, wind velocity, and radar precipitation probability.',
    isFallbackActive: false,
  },
  {
    id: 'src-osm',
    name: 'OpenStreetMap Carto Tiles',
    category: 'Basemap',
    provider: 'OpenStreetMap Contributors',
    endpoint: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    status: 'LIVE',
    lastPolled: new Date().toLocaleTimeString(),
    latencyMs: 42,
    notes: 'Open standard street network, terrain, and building footprints.',
    isFallbackActive: false,
  },
  {
    id: 'src-sachet',
    name: 'SACHET NDMA Disaster Alert Network',
    category: 'Disaster Alerts',
    provider: 'National Disaster Management Authority (NDMA)',
    endpoint: 'https://sachet.ndma.gov.in/cap_feed/pune_district',
    status: 'SIMULATED',
    lastPolled: new Date().toLocaleTimeString(),
    latencyMs: 28,
    notes: 'CAP 1.2 protocol feed. Simulated for hackathon demo to ensure deterministic flood scenario.',
    isFallbackActive: true,
  },
  {
    id: 'src-cwc',
    name: 'Central Water Commission (CWC) Hydrology',
    category: 'Hydrology',
    provider: 'Ministry of Jal Shakti, Pune Basin Division',
    endpoint: 'https://ffs.india-water.gov.in/stations/pune_mutha',
    status: 'SIMULATED',
    lastPolled: new Date().toLocaleTimeString(),
    latencyMs: 19,
    notes: 'Mutha river gauge and Khadakwasla spillway discharge rates (Simulated demo telemetry).',
    isFallbackActive: true,
  },
  {
    id: 'src-usgs',
    name: 'USGS Earthquake Hazards Feed',
    category: 'Seismic',
    provider: 'United States Geological Survey',
    endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
    status: 'LIVE',
    lastPolled: new Date().toLocaleTimeString(),
    latencyMs: 230,
    notes: 'Live secondary multi-hazard seismic feed providing real-time tectonic fault monitoring.',
    isFallbackActive: false,
  },
]
