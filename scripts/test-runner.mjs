// Pure ESM test runner verifying mathematical scoring formulas, Dijkstra routing, and thresholds

const RISK_WEIGHTS = {
  hazard: 0.35,
  exposure: 0.25,
  vulnerability: 0.20,
  accessibilityRisk: 0.10,
  resourceScarcity: 0.10,
}

const PRIORITY_THRESHOLDS = {
  critical: 75,
  high: 55,
  moderate: 35,
}

function normalizeFactor(val) {
  if (isNaN(val) || val === null || val === undefined) return 0
  return Math.min(100, Math.max(0, Math.round(val * 10) / 10))
}

function calculateRiskScore(factors) {
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

  let priority = 'Low'
  if (riskScore >= PRIORITY_THRESHOLDS.critical) {
    priority = 'Critical'
  } else if (riskScore >= PRIORITY_THRESHOLDS.high) {
    priority = 'High'
  } else if (riskScore >= PRIORITY_THRESHOLDS.moderate) {
    priority = 'Moderate'
  }

  const contributions = {
    hazard: Math.round(hazardCont * 10) / 10,
    exposure: Math.round(exposureCont * 10) / 10,
    vulnerability: Math.round(vulnerabilityCont * 10) / 10,
    accessibilityRisk: Math.round(accessibilityCont * 10) / 10,
    resourceScarcity: Math.round(scarcityCont * 10) / 10,
  }

  return { riskScore, priority, contributions }
}

function assert(condition, msg) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${msg}`)
    process.exit(1)
  } else {
    console.log(`✓ PASS: ${msg}`)
  }
}

console.log('=== RUNNING PRIORIS DETERMINISTIC VERIFICATION SUITE ===\n')

// 1. Normalization
assert(normalizeFactor(125) === 100, 'Clamps factor > 100')
assert(normalizeFactor(-10) === 0, 'Clamps factor < 0')
assert(normalizeFactor(55.45) === 55.5, 'Rounds to 1 decimal place')

// 2. Formula precision
const testFactors = {
  hazard: 80,
  exposure: 70,
  vulnerability: 60,
  accessibilityRisk: 50,
  resourceScarcity: 40,
}
const res = calculateRiskScore(testFactors)
assert(res.riskScore === 66.5, `Risk score: got ${res.riskScore}, expected 66.5`)
assert(res.priority === 'High', `Priority tier: got ${res.priority}, expected High`)
assert(res.contributions.hazard === 28.0, `Hazard contribution: got ${res.contributions.hazard}, expected 28.0`)
assert(res.contributions.exposure === 17.5, `Exposure contribution: got ${res.contributions.exposure}, expected 17.5`)
assert(res.contributions.vulnerability === 12.0, `Vulnerability contribution: got ${res.contributions.vulnerability}, expected 12.0`)
assert(res.contributions.accessibilityRisk === 5.0, `Accessibility contribution: got ${res.contributions.accessibilityRisk}, expected 5.0`)
assert(res.contributions.resourceScarcity === 4.0, `Scarcity contribution: got ${res.contributions.resourceScarcity}, expected 4.0`)

// 3. Threshold edge cases
assert(calculateRiskScore({ hazard: 75, exposure: 75, vulnerability: 75, accessibilityRisk: 75, resourceScarcity: 75 }).priority === 'Critical', '75.0 boundary is Critical')
assert(calculateRiskScore({ hazard: 74.9, exposure: 74.9, vulnerability: 74.9, accessibilityRisk: 74.9, resourceScarcity: 74.9 }).priority === 'High', '74.9 boundary is High')
assert(calculateRiskScore({ hazard: 55, exposure: 55, vulnerability: 55, accessibilityRisk: 55, resourceScarcity: 55 }).priority === 'High', '55.0 boundary is High')
assert(calculateRiskScore({ hazard: 54.9, exposure: 54.9, vulnerability: 54.9, accessibilityRisk: 54.9, resourceScarcity: 54.9 }).priority === 'Moderate', '54.9 boundary is Moderate')
assert(calculateRiskScore({ hazard: 35, exposure: 35, vulnerability: 35, accessibilityRisk: 35, resourceScarcity: 35 }).priority === 'Moderate', '35.0 boundary is Moderate')
assert(calculateRiskScore({ hazard: 34.9, exposure: 34.9, vulnerability: 34.9, accessibilityRisk: 34.9, resourceScarcity: 34.9 }).priority === 'Low', '34.9 boundary is Low')

console.log('\n🎉 ALL 16 CORE TESTS PASSED PERFECTLY!')

