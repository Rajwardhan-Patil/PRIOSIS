export type PriorityLevel = 'Critical' | 'High' | 'Moderate' | 'Low'

export type HazardType = 'flood' | 'extreme_rainfall' | 'road_blockage' | 'infrastructure_disruption'

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

export type IncidentStatus = 'reported' | 'investigating' | 'active' | 'contained' | 'resolved'

export type ResourceType = 
  | 'rescue_boat'
  | 'sdrf_team'
  | 'ndrf_battalion'
  | 'ambulance'
  | 'fire_rescue'
  | 'relief_truck'
  | 'mobile_clinic'

export type ResourceStatus = 'available' | 'assigned' | 'en_route' | 'on_scene' | 'maintenance'

export interface RiskFactors {
  hazard: number          // 0-100 (Weight: 35%)
  exposure: number        // 0-100 (Weight: 25%)
  vulnerability: number   // 0-100 (Weight: 20%)
  accessibilityRisk: number // 0-100 (Weight: 10%)
  resourceScarcity: number // 0-100 (Weight: 10%)
}

export interface FactorContributions {
  hazard: number
  exposure: number
  vulnerability: number
  accessibilityRisk: number
  resourceScarcity: number
}

export interface Zone {
  id: string
  name: string
  wardNumber: number
  areaKm2: number
  center: [number, number] // [lat, lng]
  boundary: [number, number][]
  population: number
  populationDensity: number // per km2
  elderlyChildRatio: number // % vulnerable age
  slumHousingPercentage: number // % informal housing
  riverProximityMeters: number
  drainageCapacityMmPerHour: number
  factors: RiskFactors
  riskScore: number
  priority: PriorityLevel
  factorContributions: FactorContributions
  topDrivers: string[]
  recommendedActions: string[]
  activeIncidentCount: number
  assignedResourceIds: string[]
  dataFreshnessMinutes: number
  dataQualityWarning?: string
  lastUpdated: string
}

export interface Incident {
  id: string
  zoneId: string
  zoneName: string
  title: string
  hazardType: HazardType
  severity: IncidentSeverity
  severityScore: number // 0-100
  status: IncidentStatus
  locationName: string
  coordinates: [number, number]
  waterDepthCm?: number
  reportedAt: string
  reporterType: 'field_officer' | 'citizen_report' | 'sensor_iot' | 'satellite_sar'
  description: string
  imageUrl?: string
  affectedEstimatePeople?: number
  impactDeltaRisk: number // Calculated risk delta
}

export interface Resource {
  id: string
  name: string
  type: ResourceType
  unitCode: string
  stationName: string
  coordinates: [number, number]
  status: ResourceStatus
  capacity: number // Personnel or capacity count
  assignedZoneId?: string
  assignedIncidentId?: string
  specialization: string[]
  contactCallSign: string
  suitabilityScore?: number
  distanceKm?: number
  etaMinutes?: number
  selectionReason?: string
}

export interface Shelter {
  id: string
  name: string
  zoneId: string
  coordinates: [number, number]
  capacityTotal: number
  capacityOccupied: number
  contactPhone: string
  hasMedicalPost: boolean
  hasPowerBackup: boolean
  status: 'open' | 'near_capacity' | 'full' | 'closed'
}

export interface RoadSegment {
  id: string
  name: string
  fromNode: string
  toNode: string
  distanceKm: number
  speedLimitKmh: number
  isBlocked: boolean
  waterDepthCm?: number
  blockageReason?: string
  coordinates: [number, number][]
}

export interface RoadNode {
  id: string
  name: string
  coordinates: [number, number]
}

export interface RouteRecalculationResult {
  fromNode: string
  toNode: string
  isDirectRouteBlocked: boolean
  blockedSegmentId?: string
  originalPath: string[]
  originalCoordinates: [number, number][]
  originalDistanceKm: number
  originalTimeMin: number
  currentPath: string[]
  currentCoordinates: [number, number][]
  currentDistanceKm: number
  currentTimeMin: number
  detourDistanceKm: number
  detourTimeMin: number
  rerouteReason: string
  safetyNotes: string[]
}

export interface AuditEvent {
  id: string
  timestamp: string
  category: 'incident_created' | 'resource_assigned' | 'resource_released' | 'route_blocked' | 'route_cleared' | 'rerouted' | 'risk_recalculated' | 'status_changed'
  title: string
  details: string
  actor: string
  severity: 'info' | 'warning' | 'critical' | 'success'
}

export interface DataSourceStatus {
  id: string
  name: string
  category: 'Weather' | 'Basemap' | 'Disaster Alerts' | 'Hydrology' | 'Seismic'
  provider: string
  endpoint: string
  status: 'LIVE' | 'SIMULATED' | 'CACHED' | 'UNAVAILABLE'
  lastPolled: string
  latencyMs: number
  notes: string
  isFallbackActive: boolean
}
