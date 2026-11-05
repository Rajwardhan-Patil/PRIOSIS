import { RiskFactors, FactorContributions, PriorityLevel, Zone, Incident } from '../types'

export const RISK_WEIGHTS = {
  hazard: 0.35,
  exposure: 0.25,
  vulnerability: 0.20,
  accessibilityRisk: 0.10,
  resourceScarcity: 0.10,
} as const

export const PRIORITY_THRESHOLDS = {
  critical: 75,
  high: 55,
  moderate: 35,
} as const

/**
 * Clamps and normalizes any numerical value to [0, 100] scale
 */
export function normalizeFactor(val: number): number {
  if (isNaN(val) || val === null || val === undefined) return 0
  return Math.min(100, Math.max(0, Math.round(val * 10) / 10))
}

/**
 * Calculates deterministic risk score and weighted factor contributions
 */
export function calculateRiskScore(factors: RiskFactors): {
  riskScore: number
  priority: PriorityLevel
  contributions: FactorContributions
} {
  const normHazard = normalizeFactor(factors.hazard)
  const normExposure = normalizeFactor(factors.exposure)
  const normVulnerability = normalizeFactor(factors.vulnerability)
  const normAccessibility = normalizeFactor(factors.accessibilityRisk)
  const normResourceScarcity = normalizeFactor(factors.resourceScarcity)

  const hazardCont = normHazard * RISK_WEIGHTS.hazard
  const exposureCont = normExposure * RISK_WEIGHTS.exposure
  const vulnerabilityCont = normVulnerability * RISK_WEIGHTS.vulnerability
  const accessibilityCont = normAccessibility * RISK_WEIGHTS.accessibilityRisk
  const scarcityCont = normResourceScarcity * RISK_WEIGHTS.resourceScarcity

  const rawScore = hazardCont + exposureCont + vulnerabilityCont + accessibilityCont + scarcityCont
  const riskScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10))

  let priority: PriorityLevel = 'Low'
  if (riskScore >= PRIORITY_THRESHOLDS.critical) {
    priority = 'Critical'
  } else if (riskScore >= PRIORITY_THRESHOLDS.high) {
    priority = 'High'
  } else if (riskScore >= PRIORITY_THRESHOLDS.moderate) {
    priority = 'Moderate'
  } else {
    priority = 'Low'
  }

  const contributions: FactorContributions = {
    hazard: Math.round(hazardCont * 10) / 10,
    exposure: Math.round(exposureCont * 10) / 10,
    vulnerability: Math.round(vulnerabilityCont * 10) / 10,
    accessibilityRisk: Math.round(accessibilityCont * 10) / 10,
    resourceScarcity: Math.round(scarcityCont * 10) / 10,
  }

  return { riskScore, priority, contributions }
}

/**
 * Identifies top driving factors behind a zone's priority score
 */
export function identifyTopDrivers(factors: RiskFactors, contributions: FactorContributions): string[] {
  const drivers: { name: string; val: number; text: string }[] = [
    {
      name: 'Hazard',
      val: contributions.hazard,
      text: `Elevated hazard level (${factors.hazard}/100) adds +${contributions.hazard} pts to priority`,
    },
    {
      name: 'Exposure',
      val: contributions.exposure,
      text: `High population concentration in flood zone (${factors.exposure}/100) contributes +${contributions.exposure} pts`,
    },
    {
      name: 'Vulnerability',
      val: contributions.vulnerability,
      text: `Socio-demographic vulnerability & kaccha housing (${factors.vulnerability}/100) contributes +${contributions.vulnerability} pts`,
    },
    {
      name: 'Accessibility Risk',
      val: contributions.accessibilityRisk,
      text: `Arterial route submergence / access restrictions (${factors.accessibilityRisk}/100) contributes +${contributions.accessibilityRisk} pts`,
    },
    {
      name: 'Resource Scarcity',
      val: contributions.resourceScarcity,
      text: `Unfilled emergency asset deficit (${factors.resourceScarcity}/100) contributes +${contributions.resourceScarcity} pts`,
    },
  ]

  return drivers
    .sort((a, b) => b.val - a.val)
    .slice(0, 3)
    .map(d => d.text)
}

/**
 * Generates actionable emergency recommendations based on priority and factor balance
 */
export function generateRecommendations(factors: RiskFactors, priority: PriorityLevel, zoneName: string): string[] {
  const actions: string[] = []

  if (priority === 'Critical') {
    actions.push(`IMMEDIATE: Issue targeted evacuation siren for low-lying sectors in ${zoneName}.`)
    actions.push(`Deploy SDRF/NDRF swift water rescue teams and staging inflatable boats.`)
  } else if (priority === 'High') {
    actions.push(`URGENT: Pre-position medical first-responder units and mobile dewatering pumps.`)
    actions.push(`Establish traffic diversion upstream of inundated causeways in ${zoneName}.`)
  } else if (priority === 'Moderate') {
    actions.push(`MONITOR: Issue SMS alert to ward relief volunteers; verify community shelter stocks.`)
  } else {
    actions.push(`STANDBY: Maintain passive sensor monitoring and automated rainfall gauge telemetry.`)
  }

  if (factors.accessibilityRisk >= 60) {
    actions.push(`ALERT: Road isolation risk is critical. Advise responders to utilize high-clearance all-terrain tenders or aerial recon.`)
  }

  if (factors.resourceScarcity >= 65) {
    actions.push(`DEFICIT: Zone currently lacks required rescue units. Request inter-district mutual aid or mutual ward reassignment.`)
  }

  return actions
}

/**
 * Recomputes dynamic hazard score for a zone based on active incidents
 */
export function computeDynamicHazard(baseHazard: number, incidents: Incident[]): number {
  if (incidents.length === 0) return Math.max(10, baseHazard * 0.7)

  // Accumulate incident severity weights
  let incidentSum = 0
  for (const inc of incidents) {
    if (inc.status === 'resolved') continue
    const weight = inc.status === 'contained' ? 0.4 : 1.0
    incidentSum += inc.severityScore * weight
  }

  // Combined non-linear saturation
  const combined = baseHazard * 0.4 + Math.min(60, incidentSum * 0.5)
  return normalizeFactor(combined)
}

/**
 * Recomputes resource scarcity based on zone priority vs assigned units count
 */
export function computeDynamicScarcity(priority: PriorityLevel, assignedCount: number): number {
  const required = priority === 'Critical' ? 4 : priority === 'High' ? 3 : priority === 'Moderate' ? 2 : 1
  const deficit = Math.max(0, required - assignedCount)
  const ratio = deficit / required
  return normalizeFactor(ratio * 90 + 10)
}

/**
 * Checks for missing or stale data warnings
 */
export function checkDataWarnings(zone: Partial<Zone>): string | undefined {
  if ((zone.dataFreshnessMinutes || 0) > 45) {
    return `Stale Telemetry Warning: Last sensor synchronization was ${zone.dataFreshnessMinutes}m ago.`
  }
  if (!zone.factors?.hazard && zone.factors?.hazard !== 0) {
    return `Missing Hazard Telemetry: Operating on historical baseline proxy.`
  }
  return undefined
}
