import { Zone, Incident, Resource } from '../types'
import { RISK_WEIGHTS } from './riskEngine'

export interface ComparativeExplanation {
  headline: string
  zoneA: { name: string; score: number; priority: string }
  zoneB: { name: string; score: number; priority: string }
  scoreDelta: number
  primaryDifferentiator: string
  factorDeltas: { factor: string; deltaPoints: number; impact: 'higher' | 'lower' | 'equal'; explanation: string }[]
  strategicSummary: string
  recommendedShift: string
}

/**
 * Deterministically generates an explainable natural language comparison between two zones
 */
export function generateZoneComparison(zoneA: Zone, zoneB: Zone): ComparativeExplanation {
  const delta = Math.round((zoneA.riskScore - zoneB.riskScore) * 10) / 10
  const higherZone = delta >= 0 ? zoneA : zoneB
  const lowerZone = delta >= 0 ? zoneB : zoneA
  const absDelta = Math.abs(delta)

  const factorDeltas = [
    {
      factor: 'Hazard Severity (35%)',
      deltaPoints: Math.round((zoneA.factorContributions.hazard - zoneB.factorContributions.hazard) * 10) / 10,
      impact: zoneA.factorContributions.hazard > zoneB.factorContributions.hazard ? 'higher' as const : zoneA.factorContributions.hazard < zoneB.factorContributions.hazard ? 'lower' as const : 'equal' as const,
      explanation: `${zoneA.name} hazard score is ${zoneA.factors.hazard}/100 (+${zoneA.factorContributions.hazard} pts) vs ${zoneB.name} at ${zoneB.factors.hazard}/100 (+${zoneB.factorContributions.hazard} pts).`,
    },
    {
      factor: 'Population Exposure (25%)',
      deltaPoints: Math.round((zoneA.factorContributions.exposure - zoneB.factorContributions.exposure) * 10) / 10,
      impact: zoneA.factorContributions.exposure > zoneB.factorContributions.exposure ? 'higher' as const : zoneA.factorContributions.exposure < zoneB.factorContributions.exposure ? 'lower' as const : 'equal' as const,
      explanation: `${zoneA.name} exposure score is ${zoneA.factors.exposure}/100 (+${zoneA.factorContributions.exposure} pts) vs ${zoneB.name} at ${zoneB.factors.exposure}/100 (+${zoneB.factorContributions.exposure} pts).`,
    },
    {
      factor: 'Population Vulnerability (20%)',
      deltaPoints: Math.round((zoneA.factorContributions.vulnerability - zoneB.factorContributions.vulnerability) * 10) / 10,
      impact: zoneA.factorContributions.vulnerability > zoneB.factorContributions.vulnerability ? 'higher' as const : zoneA.factorContributions.vulnerability < zoneB.factorContributions.vulnerability ? 'lower' as const : 'equal' as const,
      explanation: `${zoneA.name} vulnerability is ${zoneA.factors.vulnerability}/100 (+${zoneA.factorContributions.vulnerability} pts) vs ${zoneB.name} at ${zoneB.factors.vulnerability}/100 (+${zoneB.factorContributions.vulnerability} pts).`,
    },
    {
      factor: 'Accessibility Risk (10%)',
      deltaPoints: Math.round((zoneA.factorContributions.accessibilityRisk - zoneB.factorContributions.accessibilityRisk) * 10) / 10,
      impact: zoneA.factorContributions.accessibilityRisk > zoneB.factorContributions.accessibilityRisk ? 'higher' as const : zoneA.factorContributions.accessibilityRisk < zoneB.factorContributions.accessibilityRisk ? 'lower' as const : 'equal' as const,
      explanation: `${zoneA.name} road isolation risk is ${zoneA.factors.accessibilityRisk}/100 (+${zoneA.factorContributions.accessibilityRisk} pts) vs ${zoneB.name} at ${zoneB.factors.accessibilityRisk}/100 (+${zoneB.factorContributions.accessibilityRisk} pts).`,
    },
    {
      factor: 'Resource Scarcity (10%)',
      deltaPoints: Math.round((zoneA.factorContributions.resourceScarcity - zoneB.factorContributions.resourceScarcity) * 10) / 10,
      impact: zoneA.factorContributions.resourceScarcity > zoneB.factorContributions.resourceScarcity ? 'higher' as const : zoneA.factorContributions.resourceScarcity < zoneB.factorContributions.resourceScarcity ? 'lower' as const : 'equal' as const,
      explanation: `${zoneA.name} deficit score is ${zoneA.factors.resourceScarcity}/100 (+${zoneA.factorContributions.resourceScarcity} pts) vs ${zoneB.name} at ${zoneB.factors.resourceScarcity}/100 (+${zoneB.factorContributions.resourceScarcity} pts).`,
    },
  ]

  // Find the factor with largest absolute difference
  const sortedByImpact = [...factorDeltas].sort((a, b) => Math.abs(b.deltaPoints) - Math.abs(a.deltaPoints))
  const topDifferentiator = sortedByImpact[0]

  const primaryDifferentiator = `${topDifferentiator.factor} represents the strongest divergence (variance of ${Math.abs(topDifferentiator.deltaPoints)} weighted pts).`

  const headline = delta >= 0
    ? `${zoneA.name} leads ${zoneB.name} by +${absDelta} risk points (${zoneA.priority} vs ${zoneB.priority})`
    : `${zoneB.name} leads ${zoneA.name} by +${absDelta} risk points (${zoneB.priority} vs ${zoneA.priority})`

  const strategicSummary = `${higherZone.name} demands higher operational priority because of ${topDifferentiator.explanation.toLowerCase()} Combined with a total risk score of ${higherZone.riskScore}/100, tactical command should direct incoming swift water rescue and medical staging to ${higherZone.name} before secondary dispatch to ${lowerZone.name}.`

  const recommendedShift = delta > 0
    ? `Prioritize remaining unassigned boat and NDRF assets to ${zoneA.name}. Keep ${zoneB.name} on secondary standby with mobile dewatering pumps.`
    : `Prioritize remaining unassigned boat and NDRF assets to ${zoneB.name}. Keep ${zoneA.name} on secondary standby.`

  return {
    headline,
    zoneA: { name: zoneA.name, score: zoneA.riskScore, priority: zoneA.priority },
    zoneB: { name: zoneB.name, score: zoneB.riskScore, priority: zoneB.priority },
    scoreDelta: delta,
    primaryDifferentiator,
    factorDeltas,
    strategicSummary,
    recommendedShift,
  }
}

/**
 * Generates an executive situational briefing for the coordinator
 */
export function generateSituationalBriefing(zones: Zone[], incidents: Incident[], resources: Resource[]): string {
  const criticalZones = zones.filter(z => z.priority === 'Critical')
  const highZones = zones.filter(z => z.priority === 'High')
  const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'reported')
  const availableResources = resources.filter(r => r.status === 'available')

  const topZone = [...zones].sort((a, b) => b.riskScore - a.riskScore)[0]

  return `OPERATIONAL SITUATION BRIEFING:
Currently monitoring ${zones.length} urban flood sectors in Pune. ${criticalZones.length} sector(s) in CRITICAL state (${criticalZones.map(z => z.name).join(', ') || 'None'}), and ${highZones.length} sector(s) in HIGH alert.
Top prioritized sector is ${topZone?.name} (Risk Score: ${topZone?.riskScore}/100, Driven by Hazard: ${topZone?.factors.hazard}/100 & Exposure: ${topZone?.factors.exposure}/100).
There are ${activeIncidents.length} active or uncontained field incidents. ${availableResources.length} of ${resources.length} emergency response units remain in available status ready for dispatch.
Advisory: Verify bridge clearance along Mutha River causeways due to upstream Khadakwasla spillway discharge.`
}
