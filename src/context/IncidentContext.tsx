import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Zone,
  Incident,
  Resource,
  Shelter,
  RoadSegment,
  AuditEvent,
  DataSourceStatus,
  RouteRecalculationResult,
  IncidentStatus,
  RiskFactors,
} from '../types'
import {
  INITIAL_ZONES,
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData'
import { INITIAL_ROAD_SEGMENTS, recalculateRoute } from '../services/routingEngine'
import { INITIAL_DATA_SOURCES, fetchLiveWeather, fetchLiveUsgsEarthquakes, getHydrologyData, OpenMeteoWeather, UsgsEarthquake, HydrologyData } from '../services/dataSourceService'
import {
  calculateRiskScore,
  identifyTopDrivers,
  generateRecommendations,
  computeDynamicHazard,
  computeDynamicScarcity,
} from '../services/riskEngine'

interface IncidentContextType {
  zones: Zone[]
  rankedZones: Zone[]
  incidents: Incident[]
  resources: Resource[]
  shelters: Shelter[]
  roadSegments: RoadSegment[]
  auditLogs: AuditEvent[]
  dataSources: DataSourceStatus[]
  activeTab: string
  selectedZoneId: string | null
  selectedIncidentId: string | null
  selectedResourceId: string | null
  activeRouteResult: RouteRecalculationResult | null
  routeFromNode: string
  routeToNode: string
  liveWeather: OpenMeteoWeather | null
  liveEarthquakes: UsgsEarthquake[]
  hydrology: HydrologyData
  isSimulatedDataActive: boolean
  isDisclaimerOpen: boolean
  demoTourStep: number
  isTourActive: boolean
  theme: 'dark' | 'light'
  language: 'en' | 'mr'

  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  toggleLanguage: () => void
  toggleChecklistStep: (zoneId: string, stepId: string) => void
  setActiveTab: (tab: string) => void
  setSelectedZoneId: (id: string | null) => void
  setSelectedIncidentId: (id: string | null) => void
  setSelectedResourceId: (id: string | null) => void
  setRouteNodes: (from: string, to: string) => void
  setIsDisclaimerOpen: (open: boolean) => void
  setDemoTourStep: (step: number) => void
  setIsTourActive: (active: boolean) => void
  advanceDemoTourStep: () => void

  createIncident: (data: {
    zoneId: string
    title: string
    hazardType: Incident['hazardType']
    severity: Incident['severity']
    locationName: string
    coordinates: [number, number]
    waterDepthCm?: number
    reporterType: Incident['reporterType']
    description: string
    imageUrl?: string
  }) => void
  updateIncidentStatus: (id: string, status: IncidentStatus) => void
  assignResource: (resourceId: string, zoneId: string) => void
  unassignResource: (resourceId: string) => void
  toggleRoadBlockage: (segmentId: string, blocked?: boolean, reason?: string) => void
  recomputeActiveRoute: () => void
  updateZoneFactors: (zoneId: string, newFactors: Partial<RiskFactors>) => void
  refreshDataSources: () => Promise<void>
  resetToDemoDefaults: () => void
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined)

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES)
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES)
  const [shelters] = useState<Shelter[]>(INITIAL_SHELTERS)
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>(INITIAL_ROAD_SEGMENTS)
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>(INITIAL_DATA_SOURCES)

  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('Z-PUNE-01')
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

  // Default demo route: Station to Kasba Peth / Deccan
  const [routeFromNode, setRouteFromNode] = useState<string>('N_SHIVAJINAGAR')
  const [routeToNode, setRouteToNode] = useState<string>('N_DECCAN')
  const [activeRouteResult, setActiveRouteResult] = useState<RouteRecalculationResult | null>(null)

  const [liveWeather, setLiveWeather] = useState<OpenMeteoWeather | null>(null)
  const [liveEarthquakes, setLiveEarthquakes] = useState<UsgsEarthquake[]>([])
  const [hydrology] = useState<HydrologyData>(getHydrologyData())

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false)
  const [demoTourStep, setDemoTourStep] = useState<number>(1)
  const [isTourActive, setIsTourActive] = useState<boolean>(true)

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('prioris-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      // fallback
    }
    return 'dark'
  })

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('prioris-theme', newTheme)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('prioris-theme', next)
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  const [language, setLanguage] = useState<'en' | 'mr'>('en')

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'mr' : 'en'))
  }, [])

  const toggleChecklistStep = useCallback((zoneId: string, stepId: string) => {
    setZones(prev =>
      prev.map(z => {
        if (z.id === zoneId && z.checklistSteps) {
          const updatedSteps = z.checklistSteps.map(step =>
            step.id === stepId ? { ...step, isDone: !step.isDone } : step
          )
          return { ...z, checklistSteps: updatedSteps }
        }
        return z
      })
    )
  }, [])

  // Helper to append audit events
  const addAuditLog = useCallback(
    (
      category: AuditEvent['category'],
      title: string,
      details: string,
      actor: string = 'Emergency Coordinator',
      severity: AuditEvent['severity'] = 'info'
    ) => {
      const newEvent: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toLocaleTimeString(),
        category,
        title,
        details,
        actor,
        severity,
      }
      setAuditLogs(prev => [newEvent, ...prev.slice(0, 49)])
    },
    []
  )

  // Fetch initial live data
  const refreshDataSources = useCallback(async () => {
    // Weather
    const { data: wData, latencyMs: wLatency } = await fetchLiveWeather()
    setLiveWeather(wData)

    // Earthquakes
    const { data: eqData, latencyMs: eqLatency, isLive: eqLive } = await fetchLiveUsgsEarthquakes()
    setLiveEarthquakes(eqData)

    // Update status registry
    setDataSources(prev =>
      prev.map(src => {
        if (src.id === 'src-open-meteo') {
          return {
            ...src,
            status: wData.isLive ? 'LIVE' : 'CACHED',
            latencyMs: wLatency,
            lastPolled: new Date().toLocaleTimeString(),
            isFallbackActive: !wData.isLive,
          }
        }
        if (src.id === 'src-usgs') {
          return {
            ...src,
            status: eqLive ? 'LIVE' : 'CACHED',
            latencyMs: eqLatency,
            lastPolled: new Date().toLocaleTimeString(),
            isFallbackActive: !eqLive,
          }
        }
        return {
          ...src,
          lastPolled: new Date().toLocaleTimeString(),
        }
      })
    )
  }, [])

  useEffect(() => {
    refreshDataSources()
  }, [refreshDataSources])

  // Recalculate route whenever segments or route endpoints change
  const setRouteNodes = useCallback((from: string, to: string) => {
    setRouteFromNode(from)
    setRouteToNode(to)
  }, [])

  const recomputeActiveRoute = useCallback(() => {
    const res = recalculateRoute(routeFromNode, routeToNode, roadSegments)
    setActiveRouteResult(res)
  }, [routeFromNode, routeToNode, roadSegments])

  useEffect(() => {
    recomputeActiveRoute()
  }, [recomputeActiveRoute])

  // Central zone recalculator that combines active incidents and assigned resources
  const recalculateAllZones = useCallback(
    (currentIncidents: Incident[], currentResources: Resource[], currentSegments: RoadSegment[]) => {
      setZones(prevZones => {
        return prevZones.map(zone => {
          const zoneIncidents = currentIncidents.filter(i => i.zoneId === zone.id)
          const assigned = currentResources.filter(r => r.assignedZoneId === zone.id && r.status === 'assigned')

          // Dynamic hazard computation
          const dynamicHazard = computeDynamicHazard(zone.factors.hazard, zoneIncidents)

          // Dynamic resource scarcity
          const dynamicScarcity = computeDynamicScarcity(zone.priority, assigned.length)

          // Dynamic accessibility risk if adjacent roads are blocked
          const blockedNearby = currentSegments.some(
            s => s.isBlocked && (s.fromNode.includes(zone.name.split(' ')[0]) || s.toNode.includes(zone.name.split(' ')[0]))
          )
          const accessibilityFactor = blockedNearby ? Math.min(100, zone.factors.accessibilityRisk + 25) : zone.factors.accessibilityRisk

          const newFactors: RiskFactors = {
            ...zone.factors,
            hazard: dynamicHazard,
            resourceScarcity: dynamicScarcity,
            accessibilityRisk: accessibilityFactor,
          }

          const { riskScore, priority, contributions } = calculateRiskScore(newFactors)
          const topDrivers = identifyTopDrivers(newFactors, contributions)
          const recommendedActions = generateRecommendations(newFactors, priority, zone.name)

          return {
            ...zone,
            factors: newFactors,
            riskScore,
            priority,
            factorContributions: contributions,
            topDrivers,
            recommendedActions,
            activeIncidentCount: zoneIncidents.filter(i => i.status === 'active' || i.status === 'reported').length,
            assignedResourceIds: assigned.map(r => r.id),
            lastUpdated: new Date().toLocaleTimeString(),
          }
        })
      })
    },
    []
  )

  // CREATE INCIDENT
  const createIncident = useCallback(
    (data: {
      zoneId: string
      title: string
      hazardType: Incident['hazardType']
      severity: Incident['severity']
      locationName: string
      coordinates: [number, number]
      waterDepthCm?: number
      reporterType: Incident['reporterType']
      description: string
      imageUrl?: string
    }) => {
      const targetZone = zones.find(z => z.id === data.zoneId)
      const zoneName = targetZone ? targetZone.name : 'Unknown Ward'

      const severityScore =
        data.severity === 'critical' ? 95 : data.severity === 'high' ? 75 : data.severity === 'medium' ? 50 : 25

      const impactDeltaRisk = Math.round((severityScore * 0.35 * 0.6) * 10) / 10

      const newIncident: Incident = {
        id: `INC-PUNE-${Math.floor(100 + Math.random() * 900)}`,
        zoneId: data.zoneId,
        zoneName,
        title: data.title,
        hazardType: data.hazardType,
        severity: data.severity,
        severityScore,
        status: 'active',
        locationName: data.locationName,
        coordinates: data.coordinates,
        waterDepthCm: data.waterDepthCm || 65,
        reportedAt: 'Just now',
        reporterType: data.reporterType,
        description: data.description,
        imageUrl: data.imageUrl,
        impactDeltaRisk,
      }

      const updatedIncidents = [newIncident, ...incidents]
      setIncidents(updatedIncidents)

      addAuditLog(
        'incident_created',
        `New Incident Reported: ${data.title}`,
        `Severity ${data.severity.toUpperCase()} reported in ${zoneName}. Automated risk scoring engine triggered recalculation.`,
        data.reporterType === 'citizen_report' ? 'Citizen App Report' : 'Command Center Dispatcher',
        data.severity === 'critical' ? 'critical' : 'warning'
      )

      recalculateAllZones(updatedIncidents, resources, roadSegments)
    },
    [zones, incidents, resources, roadSegments, addAuditLog, recalculateAllZones]
  )

  // UPDATE INCIDENT STATUS
  const updateIncidentStatus = useCallback(
    (id: string, status: IncidentStatus) => {
      let updatedIncidentTitle = ''
      const updated = incidents.map(inc => {
        if (inc.id === id) {
          updatedIncidentTitle = inc.title
          return { ...inc, status }
        }
        return inc
      })
      setIncidents(updated)

      addAuditLog(
        'status_changed',
        `Incident Status Changed: ${status.toUpperCase()}`,
        `Incident "${updatedIncidentTitle}" updated to ${status}. Zone hazard recalculation executed.`,
        'Incident Commander',
        status === 'resolved' ? 'success' : 'info'
      )

      recalculateAllZones(updated, resources, roadSegments)
    },
    [incidents, resources, roadSegments, addAuditLog, recalculateAllZones]
  )

  // ASSIGN RESOURCE
  const assignResource = useCallback(
    (resourceId: string, zoneId: string) => {
      const targetZone = zones.find(z => z.id === zoneId)
      let resourceName = ''

      const updatedResources = resources.map(res => {
        if (res.id === resourceId) {
          resourceName = res.name
          return {
            ...res,
            status: 'assigned' as const,
            assignedZoneId: zoneId,
          }
        }
        return res
      })
      setResources(updatedResources)

      addAuditLog(
        'resource_assigned',
        `Resource Assigned: ${resourceName}`,
        `Simulated dispatch of ${resourceName} to ${targetZone?.name || zoneId}. Resource scarcity index adjusted downward.`,
        'Tactical Logistics Officer',
        'success'
      )

      recalculateAllZones(incidents, updatedResources, roadSegments)
    },
    [zones, resources, incidents, roadSegments, addAuditLog, recalculateAllZones]
  )

  // UNASSIGN RESOURCE
  const unassignResource = useCallback(
    (resourceId: string) => {
      let resourceName = ''
      const updatedResources = resources.map(res => {
        if (res.id === resourceId) {
          resourceName = res.name
          return {
            ...res,
            status: 'available' as const,
            assignedZoneId: undefined,
          }
        }
        return res
      })
      setResources(updatedResources)

      addAuditLog(
        'resource_released',
        `Resource Released: ${resourceName}`,
        `Unit ${resourceName} returned to available staging pool. Ready for subsequent priority deployment.`,
        'Tactical Logistics Officer',
        'info'
      )

      recalculateAllZones(incidents, updatedResources, roadSegments)
    },
    [resources, incidents, roadSegments, addAuditLog, recalculateAllZones]
  )

  // TOGGLE ROAD BLOCKAGE
  const toggleRoadBlockage = useCallback(
    (segmentId: string, blocked?: boolean, reason?: string) => {
      let segName = ''
      let isNowBlocked = false

      const updatedSegments = roadSegments.map(seg => {
        if (seg.id === segmentId) {
          segName = seg.name
          isNowBlocked = blocked !== undefined ? blocked : !seg.isBlocked
          return {
            ...seg,
            isBlocked: isNowBlocked,
            blockageReason: isNowBlocked ? reason || 'Severe flood waterlogging (85cm depth)' : undefined,
            waterDepthCm: isNowBlocked ? 85 : 0,
          }
        }
        return seg
      })

      setRoadSegments(updatedSegments)

      addAuditLog(
        isNowBlocked ? 'route_blocked' : 'route_cleared',
        isNowBlocked ? `Road Segment Closed: ${segName}` : `Road Segment Reopened: ${segName}`,
        isNowBlocked
          ? `Physical barrier / inundation flagged. Routing graph recalculated; transit corridors rerouted.`
          : `Corridor cleared of flood debris. Re-enabled in graph routing database.`,
        'Traffic & Rescue Dispatch',
        isNowBlocked ? 'critical' : 'success'
      )

      recalculateAllZones(incidents, resources, updatedSegments)
    },
    [roadSegments, addAuditLog, recalculateAllZones, incidents, resources]
  )

  // WHAT-IF SENSITIVITY TWEAKS
  const updateZoneFactors = useCallback(
    (zoneId: string, newFactors: Partial<RiskFactors>) => {
      setZones(prev =>
        prev.map(z => {
          if (z.id === zoneId) {
            const mergedFactors: RiskFactors = { ...z.factors, ...newFactors }
            const { riskScore, priority, contributions } = calculateRiskScore(mergedFactors)
            const topDrivers = identifyTopDrivers(mergedFactors, contributions)
            const recommendedActions = generateRecommendations(mergedFactors, priority, z.name)
            return {
              ...z,
              factors: mergedFactors,
              riskScore,
              priority,
              factorContributions: contributions,
              topDrivers,
              recommendedActions,
              lastUpdated: new Date().toLocaleTimeString(),
            }
          }
          return z
        })
      )
    },
    []
  )

  // RESET TO DEMO DEFAULTS
  const resetToDemoDefaults = useCallback(() => {
    setZones(INITIAL_ZONES)
    setIncidents(INITIAL_INCIDENTS)
    setResources(INITIAL_RESOURCES)
    setRoadSegments(INITIAL_ROAD_SEGMENTS)
    setAuditLogs(INITIAL_AUDIT_LOGS)
    setDemoTourStep(1)
    setSelectedZoneId('Z-PUNE-01')
    setRouteFromNode('N_SHIVAJINAGAR')
    setRouteToNode('N_DECCAN')
    addAuditLog('status_changed', 'Simulation State Reset', 'Demo environment restored to baseline initial conditions.', 'PRIORIS System', 'info')
  }, [addAuditLog])

  const advanceDemoTourStep = useCallback(() => {
    setDemoTourStep(prev => (prev < 8 ? prev + 1 : 1))
  }, [])

  // Ranked zones memoized (highest risk first)
  const rankedZones = useMemo(() => {
    return [...zones].sort((a, b) => b.riskScore - a.riskScore)
  }, [zones])

  return (
    <IncidentContext.Provider
      value={{
        zones,
        rankedZones,
        incidents,
        resources,
        shelters,
        roadSegments,
        auditLogs,
        dataSources,
        activeTab,
        selectedZoneId,
        selectedIncidentId,
        selectedResourceId,
        activeRouteResult,
        routeFromNode,
        routeToNode,
        liveWeather,
        liveEarthquakes,
        hydrology,
        isSimulatedDataActive: true,
        isDisclaimerOpen,
        demoTourStep,
        isTourActive,
        theme,
        language,
        setTheme,
        toggleTheme,
        toggleLanguage,
        toggleChecklistStep,
        setActiveTab,
        setSelectedZoneId,
        setSelectedIncidentId,
        setSelectedResourceId,
        setRouteNodes,
        setIsDisclaimerOpen,
        setDemoTourStep,
        setIsTourActive,
        advanceDemoTourStep,
        createIncident,
        updateIncidentStatus,
        assignResource,
        unassignResource,
        toggleRoadBlockage,
        recomputeActiveRoute,
        updateZoneFactors,
        refreshDataSources,
        resetToDemoDefaults,
      }}
    >
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidentContext() {
  const ctx = useContext(IncidentContext)
  if (!ctx) throw new Error('useIncidentContext must be used within an IncidentProvider')
  return ctx
}
