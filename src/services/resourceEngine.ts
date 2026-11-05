import { Resource, Zone, ResourceType } from '../types'

/**
 * Calculates straight line distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2

  const R = 6371 // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Checks type suitability match based on zone conditions
 */
export function getTypeSuitability(type: ResourceType, zone: Zone): { score: number; rationale: string } {
  // If zone has high hazard or flood river proximity
  if (zone.factors.hazard >= 70 || zone.riverProximityMeters < 300) {
    if (type === 'rescue_boat') {
      return { score: 98, rationale: 'Essential for deep water rescue & Mutha river overflow evacuation.' }
    }
    if (type === 'sdrf_team' || type === 'ndrf_battalion') {
      return { score: 95, rationale: 'Trained swift-water specialists required for high hazard urban flood operations.' }
    }
    if (type === 'ambulance') {
      return { score: 70, rationale: 'Required for casualty stabilization, but requires passable staging terrain.' }
    }
  }

  // High vulnerability or elderly population
  if (zone.factors.vulnerability >= 65 || zone.elderlyChildRatio > 35) {
    if (type === 'mobile_clinic' || type === 'ambulance') {
      return { score: 92, rationale: 'High priority due to elderly and pediatric medical vulnerability.' }
    }
    if (type === 'relief_truck') {
      return { score: 85, rationale: 'Critical for dry rations, clean drinking water, and blankets distribution.' }
    }
  }

  // General defaults
  const scores: Record<ResourceType, { score: number; rationale: string }> = {
    rescue_boat: { score: 75, rationale: 'Amphibious asset suitable for inundated sectors.' },
    sdrf_team: { score: 85, rationale: 'Versatile search and rescue personnel.' },
    ndrf_battalion: { score: 90, rationale: 'Heavy disaster response team with specialized equipment.' },
    ambulance: { score: 80, rationale: 'Emergency medical response and transport.' },
    fire_rescue: { score: 82, rationale: 'Equipped with dewatering pumps and cutting gear.' },
    relief_truck: { score: 72, rationale: 'Logistics and emergency shelter provisions.' },
    mobile_clinic: { score: 78, rationale: 'On-site medical triage and preventative prophylaxis.' },
  }

  return scores[type] || { score: 70, rationale: 'Standard emergency response capability.' }
}

/**
 * Evaluates and ranks all resources for a target zone
 */
export function rankResourcesForZone(
  resources: Resource[],
  targetZone: Zone,
  accessibilityPenalty: number = 0
): Resource[] {
  return resources.map(resource => {
    const isAvailable = resource.status === 'available'
    const distKm = calculateDistanceKm(resource.coordinates, targetZone.center)
    // Assume average speed 30 km/h in urban monsoon conditions
    const etaMin = Math.max(4, Math.round((distKm / 30) * 60))

    const { score: typeScore, rationale: typeRationale } = getTypeSuitability(resource.type, targetZone)

    // Distance score: 100 for < 2km, dropping to 30 for > 15km
    const distScore = Math.max(20, Math.round(100 - distKm * 5))

    // Availability multiplier
    const availabilityScore = isAvailable ? 100 : resource.status === 'assigned' ? 40 : 10

    // Overall suitability = 40% Type match + 35% Proximity + 25% Availability - Accessibility penalty
    const combinedSuitability = Math.max(
      10,
      Math.min(
        100,
        Math.round(
          typeScore * 0.40 +
          distScore * 0.35 +
          availabilityScore * 0.25 -
          accessibilityPenalty
        )
      )
    )

    let selectionReason = `${typeRationale} Proximity: ${distKm}km (${etaMin} min ETA).`
    if (!isAvailable) {
      selectionReason += ` [Currently ${resource.status.toUpperCase()} to ${resource.assignedZoneId || 'another sector'}]`
    }

    return {
      ...resource,
      distanceKm: distKm,
      etaMinutes: etaMin,
      suitabilityScore: combinedSuitability,
      selectionReason,
    }
  }).sort((a, b) => (b.suitabilityScore || 0) - (a.suitabilityScore || 0))
}
