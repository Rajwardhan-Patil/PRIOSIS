import {
  calculateRiskScore,
  normalizeFactor,
  identifyTopDrivers,
  generateRecommendations,
  computeDynamicHazard,
  computeDynamicScarcity,
  RISK_WEIGHTS,
} from './riskEngine'
import { runDijkstra, recalculateRoute, INITIAL_ROAD_SEGMENTS } from './routingEngine'
import { calculateDistanceKm, rankResourcesForZone } from './resourceEngine'
import { generateZoneComparison } from './aiExplanationEngine'
import { INITIAL_ZONES, INITIAL_RESOURCES } from '../data/initialData'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`)
    throw new Error(`TEST FAILED: ${msg}`)
  } else {
    console.log(`✓ PASS: ${msg}`)
  }
}

console.log('=== RUNNING PRIORIS TEST SUITE ===\n')

// 1. Normalization Tests
console.log('--- 1. Risk Normalization ---')
assert(normalizeFactor(120) === 100, 'Clamps values > 100 to 100')
assert(normalizeFactor(-15) === 0, 'Clamps negative values to 0')
assert(normalizeFactor(55.45) === 55.5, 'Rounds to single decimal precision')

// 2. Weights & Formula Precision
console.log('\n--- 2. Mathematical Scoring Formula ---')
const testFactors = {
  hazard: 80,
  exposure: 70,
  vulnerability: 60,
  accessibilityRisk: 50,
  resourceScarcity: 40,
}
// Expected: (80*0.35) + (70*0.25) + (60*0.20) + (50*0.10) + (40*0.10)
// = 28 + 17.5 + 12 + 5 + 4 = 66.5 (High)
const result = calculateRiskScore(testFactors)
assert(result.riskScore === 66.5, `Risk score matches formula exactly: got ${result.riskScore}, expected 66.5`)
assert(result.priority === 'High', `Classified correctly as High priority (got ${result.priority})`)
assert(result.contributions.hazard === 28, `Hazard contribution matches (got ${result.contributions.hazard})`)
assert(result.contributions.exposure === 17.5, `Exposure contribution matches (got ${result.contributions.exposure})`)
assert(result.contributions.vulnerability === 12, `Vulnerability contribution matches (got ${result.contributions.vulnerability})`)
assert(result.contributions.accessibilityRisk === 5, `Accessibility contribution matches (got ${result.contributions.accessibilityRisk})`)
assert(result.contributions.resourceScarcity === 4, `Resource scarcity contribution matches (got ${result.contributions.resourceScarcity})`)

// 3. Threshold Classifications
console.log('\n--- 3. Priority Threshold Boundaries ---')
assert(calculateRiskScore({ hazard: 90, exposure: 90, vulnerability: 90, accessibilityRisk: 90, resourceScarcity: 90 }).priority === 'Critical', 'Score 90 is Critical')
assert(calculateRiskScore({ hazard: 75, exposure: 75, vulnerability: 75, accessibilityRisk: 75, resourceScarcity: 75 }).priority === 'Critical', 'Boundary 75.0 is Critical')
assert(calculateRiskScore({ hazard: 74, exposure: 74, vulnerability: 74, accessibilityRisk: 74, resourceScarcity: 74 }).priority === 'High', 'Score 74.0 is High')
assert(calculateRiskScore({ hazard: 55, exposure: 55, vulnerability: 55, accessibilityRisk: 55, resourceScarcity: 55 }).priority === 'High', 'Boundary 55.0 is High')
assert(calculateRiskScore({ hazard: 54, exposure: 54, vulnerability: 54, accessibilityRisk: 54, resourceScarcity: 54 }).priority === 'Moderate', 'Score 54.0 is Moderate')
assert(calculateRiskScore({ hazard: 35, exposure: 35, vulnerability: 35, accessibilityRisk: 35, resourceScarcity: 35 }).priority === 'Moderate', 'Boundary 35.0 is Moderate')
assert(calculateRiskScore({ hazard: 20, exposure: 20, vulnerability: 20, accessibilityRisk: 20, resourceScarcity: 20 }).priority === 'Low', 'Score 20 is Low')

// 4. Dynamic Recalculation
console.log('\n--- 4. Dynamic Hazard & Scarcity Calculations ---')
const dynamicHazardScore = computeDynamicHazard(40, [
  {
    id: 't-1',
    zoneId: 'z1',
    zoneName: 'Test Zone',
    title: 'Cloudburst',
    hazardType: 'extreme_rainfall',
    severity: 'critical',
    severityScore: 90,
    status: 'active',
    locationName: 'Test',
    coordinates: [18.5, 73.8],
    reportedAt: 'Now',
    reporterType: 'field_officer',
    description: 'Test',
    impactDeltaRisk: 20,
  },
])
assert(dynamicHazardScore > 50, `Dynamic hazard increases when active incidents exist (got ${dynamicHazardScore})`)

const scarcityUnassigned = computeDynamicScarcity('Critical', 0)
const scarcityAssigned = computeDynamicScarcity('Critical', 4)
assert(scarcityUnassigned > scarcityAssigned, `Resource scarcity decreases as units are assigned (${scarcityUnassigned} -> ${scarcityAssigned})`)

// 5. Graph Routing Engine (Dijkstra & Replanning)
console.log('\n--- 5. Dijkstra Graph Pathfinding & Blockage Rerouting ---')
const directRoute = runDijkstra('N_SHIVAJINAGAR', 'N_DECCAN', INITIAL_ROAD_SEGMENTS, false)
assert(directRoute !== null, 'Dijkstra finds direct path from Shivajinagar to Deccan')
assert(directRoute?.path.length === 2, `Direct path has 2 nodes: ${directRoute?.path.join(' -> ')}`)

// Now block J.M. Road (SEG-02)
const blockedSegments = INITIAL_ROAD_SEGMENTS.map(s => s.id === 'SEG-02' ? { ...s, isBlocked: true } : s)
const reroutedResult = recalculateRoute('N_SHIVAJINAGAR', 'N_DECCAN', blockedSegments)
assert(reroutedResult.isDirectRouteBlocked === true, 'Detected direct route blockage correctly')
assert(reroutedResult.currentDistanceKm > reroutedResult.originalDistanceKm, `Alternative route has detour penalty (+${reroutedResult.detourDistanceKm} km)`)
assert(reroutedResult.currentPath.length > 2, `Detour path traverses alternative nodes: ${reroutedResult.currentPath.join(' -> ')}`)

// 6. Explainable AI Comparison
console.log('\n--- 6. Explainable AI Zone Comparison ---')
const zoneKasba = INITIAL_ZONES[0]
const zoneKothrud = INITIAL_ZONES[4]
const comp = generateZoneComparison(zoneKasba, zoneKothrud)
assert(comp.scoreDelta > 0, `Kasba Peth correctly identified as higher risk than Kothrud (delta: +${comp.scoreDelta})`)
assert(comp.factorDeltas.length === 5, 'Provides breakdown for all 5 factors')
assert(comp.primaryDifferentiator.length > 0, 'Identifies primary mathematical differentiator')

console.log('\n🎉 ALL 18 UNIT & INTEGRATION TESTS PASSED CLEANLY!')

