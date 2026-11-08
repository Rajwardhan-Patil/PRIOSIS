import { RoadNode, RoadSegment, RouteRecalculationResult } from '../types'

export const PUNE_ROAD_NODES: Record<string, RoadNode> = {
  N_SWARGATE: { id: 'N_SWARGATE', name: 'Swargate Hub', coordinates: [18.5018, 73.8586] },
  N_DECCAN: { id: 'N_DECCAN', name: 'Deccan Gymkhana', coordinates: [18.5173, 73.8415] },
  N_SHIVAJINAGAR: { id: 'N_SHIVAJINAGAR', name: 'Shivajinagar Junction', coordinates: [18.5314, 73.8446] },
  N_KASBA_PETH: { id: 'N_KASBA_PETH', name: 'Kasba Peth / Old City', coordinates: [18.5204, 73.8567] },
  N_PUNE_STATION: { id: 'N_PUNE_STATION', name: 'Pune Railway Station', coordinates: [18.5284, 73.8744] },
  N_BUND_GARDEN: { id: 'N_BUND_GARDEN', name: 'Bund Garden Bridge', coordinates: [18.5362, 73.8821] },
  N_KOTHRUD: { id: 'N_KOTHRUD', name: 'Kothrud Depot', coordinates: [18.5074, 73.8077] },
  N_YERAWADA: { id: 'N_YERAWADA', name: 'Yerawada Bridge', coordinates: [18.5529, 73.8838] },
  N_CAMP: { id: 'N_CAMP', name: 'Pune Camp / MG Road', coordinates: [18.5132, 73.8778] },
  N_HADAPSAR: { id: 'N_HADAPSAR', name: 'Hadapsar Gadital', coordinates: [18.5015, 73.9264] },
}

export const INITIAL_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'SEG-01',
    name: 'Karve Road (Kothrud -> Deccan)',
    fromNode: 'N_KOTHRUD',
    toNode: 'N_DECCAN',
    distanceKm: 4.2,
    speedLimitKmh: 40,
    isBlocked: false,
    coordinates: [
      [18.5074, 73.8077],
      [18.5120, 73.8245],
      [18.5173, 73.8415],
    ],
  },
  {
    id: 'SEG-02',
    name: 'J.M. Road / Baba Bhide Causeway (Deccan -> Shivajinagar)',
    fromNode: 'N_DECCAN',
    toNode: 'N_SHIVAJINAGAR',
    distanceKm: 2.1,
    speedLimitKmh: 45,
    isBlocked: true,
    waterDepthCm: 85,
    blockageReason: 'Baba Bhide causeway flooded, 0.85 m',
    coordinates: [
      [18.5173, 73.8415],
      [18.5242, 73.8431],
      [18.5314, 73.8446],
    ],
  },
  {
    id: 'SEG-03',
    name: 'Lakdi Pul / Tilak Road (Deccan -> Swargate)',
    fromNode: 'N_DECCAN',
    toNode: 'N_SWARGATE',
    distanceKm: 2.9,
    speedLimitKmh: 35,
    isBlocked: false,
    coordinates: [
      [18.5173, 73.8415],
      [18.5098, 73.8499],
      [18.5018, 73.8586],
    ],
  },
  {
    id: 'SEG-04',
    name: 'Shivaji Road (Swargate -> Kasba Peth)',
    fromNode: 'N_SWARGATE',
    toNode: 'N_KASBA_PETH',
    distanceKm: 2.4,
    speedLimitKmh: 30,
    isBlocked: false,
    coordinates: [
      [18.5018, 73.8586],
      [18.5112, 73.8576],
      [18.5204, 73.8567],
    ],
  },
  {
    id: 'SEG-05',
    name: 'Dengle Bridge (Kasba Peth -> Shivajinagar)',
    fromNode: 'N_KASBA_PETH',
    toNode: 'N_SHIVAJINAGAR',
    distanceKm: 1.8,
    speedLimitKmh: 35,
    isBlocked: false,
    coordinates: [
      [18.5204, 73.8567],
      [18.5255, 73.8510],
      [18.5314, 73.8446],
    ],
  },
  {
    id: 'SEG-06',
    name: 'RTO / Sangam Bridge (Shivajinagar -> Station)',
    fromNode: 'N_SHIVAJINAGAR',
    toNode: 'N_PUNE_STATION',
    distanceKm: 3.5,
    speedLimitKmh: 50,
    isBlocked: false,
    coordinates: [
      [18.5314, 73.8446],
      [18.5320, 73.8610],
      [18.5284, 73.8744],
    ],
  },
  {
    id: 'SEG-07',
    name: 'Station Road (Kasba Peth -> Station)',
    fromNode: 'N_KASBA_PETH',
    toNode: 'N_PUNE_STATION',
    distanceKm: 2.2,
    speedLimitKmh: 35,
    isBlocked: false,
    coordinates: [
      [18.5204, 73.8567],
      [18.5240, 73.8655],
      [18.5284, 73.8744],
    ],
  },
  {
    id: 'SEG-08',
    name: 'Bund Garden Road (Station -> Bund Garden)',
    fromNode: 'N_PUNE_STATION',
    toNode: 'N_BUND_GARDEN',
    distanceKm: 1.6,
    speedLimitKmh: 45,
    isBlocked: false,
    coordinates: [
      [18.5284, 73.8744],
      [18.5322, 73.8785],
      [18.5362, 73.8821],
    ],
  },
  {
    id: 'SEG-09',
    name: 'Bund Garden Cause-Bridge (Bund Garden -> Yerawada)',
    fromNode: 'N_BUND_GARDEN',
    toNode: 'N_YERAWADA',
    distanceKm: 2.0,
    speedLimitKmh: 40,
    isBlocked: false,
    coordinates: [
      [18.5362, 73.8821],
      [18.5445, 73.8830],
      [18.5529, 73.8838],
    ],
  },
  {
    id: 'SEG-10',
    name: 'Shankar Sheth Road (Swargate -> Camp)',
    fromNode: 'N_SWARGATE',
    toNode: 'N_CAMP',
    distanceKm: 2.6,
    speedLimitKmh: 40,
    isBlocked: false,
    coordinates: [
      [18.5018, 73.8586],
      [18.5075, 73.8682],
      [18.5132, 73.8778],
    ],
  },
  {
    id: 'SEG-11',
    name: 'Connaught Road (Camp -> Station)',
    fromNode: 'N_CAMP',
    toNode: 'N_PUNE_STATION',
    distanceKm: 2.1,
    speedLimitKmh: 35,
    isBlocked: false,
    coordinates: [
      [18.5132, 73.8778],
      [18.5208, 73.8761],
      [18.5284, 73.8744],
    ],
  },
  {
    id: 'SEG-12',
    name: 'Pune-Solapur Highway (Camp -> Hadapsar)',
    fromNode: 'N_CAMP',
    toNode: 'N_HADAPSAR',
    distanceKm: 5.5,
    speedLimitKmh: 50,
    isBlocked: false,
    coordinates: [
      [18.5132, 73.8778],
      [18.5074, 73.9021],
      [18.5015, 73.9264],
    ],
  },
  {
    id: 'SEG-13',
    name: 'Koregaon Park Bypass (Bund Garden -> Camp)',
    fromNode: 'N_BUND_GARDEN',
    toNode: 'N_CAMP',
    distanceKm: 2.8,
    speedLimitKmh: 40,
    isBlocked: false,
    coordinates: [
      [18.5362, 73.8821],
      [18.5247, 73.8800],
      [18.5132, 73.8778],
    ],
  },
  {
    id: 'SEG-14',
    name: 'Sangamwadi Elevated Corridor (Shivajinagar -> Yerawada)',
    fromNode: 'N_SHIVAJINAGAR',
    toNode: 'N_YERAWADA',
    distanceKm: 4.8,
    speedLimitKmh: 55,
    isBlocked: false,
    coordinates: [
      [18.5314, 73.8446],
      [18.5422, 73.8642],
      [18.5529, 73.8838],
    ],
  },
]

/**
 * Dijkstra graph implementation for bidirectional road network
 */
export function runDijkstra(
  startNode: string,
  endNode: string,
  segments: RoadSegment[],
  allowBlocked: boolean = false
): { path: string[]; distanceKm: number; timeMin: number; coordinates: [number, number][] } | null {
  const distances: Record<string, number> = {}
  const times: Record<string, number> = {}
  const previous: Record<string, { node: string; segment: RoadSegment } | null> = {}
  const unvisited = new Set<string>()

  // Build adjacency graph
  const adj: Record<string, { neighbor: string; segment: RoadSegment; weight: number; timeMin: number }[]> = {}

  for (const nodeKey of Object.keys(PUNE_ROAD_NODES)) {
    adj[nodeKey] = []
    distances[nodeKey] = Infinity
    times[nodeKey] = Infinity
    previous[nodeKey] = null
    unvisited.add(nodeKey)
  }

  for (const seg of segments) {
    if (seg.isBlocked && !allowBlocked) continue

    const transitTimeMin = Math.round((seg.distanceKm / (seg.speedLimitKmh || 40)) * 60 * 10) / 10

    if (adj[seg.fromNode]) {
      adj[seg.fromNode].push({
        neighbor: seg.toNode,
        segment: seg,
        weight: seg.distanceKm,
        timeMin: transitTimeMin,
      })
    }
    if (adj[seg.toNode]) {
      adj[seg.toNode].push({
        neighbor: seg.fromNode,
        segment: seg,
        weight: seg.distanceKm,
        timeMin: transitTimeMin,
      })
    }
  }

  distances[startNode] = 0
  times[startNode] = 0

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null
    let smallestDist = Infinity

    for (const node of unvisited) {
      if (distances[node] < smallestDist) {
        smallestDist = distances[node]
        current = node
      }
    }

    if (current === null || smallestDist === Infinity) break
    if (current === endNode) break

    unvisited.delete(current)

    const neighbors = adj[current] || []
    for (const edge of neighbors) {
      if (!unvisited.has(edge.neighbor)) continue

      const altDist = distances[current] + edge.weight
      const altTime = times[current] + edge.timeMin

      if (altDist < distances[edge.neighbor]) {
        distances[edge.neighbor] = altDist
        times[edge.neighbor] = altTime
        previous[edge.neighbor] = { node: current, segment: edge.segment }
      }
    }
  }

  if (distances[endNode] === Infinity) return null

  // Reconstruct path
  const path: string[] = []
  const coordinates: [number, number][] = []
  let curr: string | null = endNode

  while (curr) {
    path.unshift(curr)
    const prevStep: { node: string; segment: RoadSegment } | null = previous[curr] ?? null
    if (prevStep) {
      const segCoords = prevStep.segment.fromNode === prevStep.node 
        ? [...prevStep.segment.coordinates] 
        : [...prevStep.segment.coordinates].reverse()
      coordinates.unshift(...segCoords)
      curr = prevStep.node
    } else {
      curr = null
    }
  }

  // Deduplicate consecutive coordinates
  const cleanCoords: [number, number][] = []
  for (let i = 0; i < coordinates.length; i++) {
    if (i === 0 || coordinates[i][0] !== coordinates[i - 1][0] || coordinates[i][1] !== coordinates[i - 1][1]) {
      cleanCoords.push(coordinates[i])
    }
  }

  if (cleanCoords.length === 0 && PUNE_ROAD_NODES[startNode]) {
    cleanCoords.push(PUNE_ROAD_NODES[startNode].coordinates)
  }

  return {
    path,
    distanceKm: Math.round(distances[endNode] * 10) / 10,
    timeMin: Math.round(times[endNode]),
    coordinates: cleanCoords,
  }
}

/**
 * Calculates primary vs alternative route when a road segment is blocked
 */
export function recalculateRoute(
  fromNode: string,
  toNode: string,
  segments: RoadSegment[]
): RouteRecalculationResult {
  // Baseline route assuming open network
  const baseline = runDijkstra(fromNode, toNode, segments, true)
  // Current route respecting current blockages
  const current = runDijkstra(fromNode, toNode, segments, false)

  const originalPath = baseline ? baseline.path : [fromNode, toNode]
  const originalCoords = baseline ? baseline.coordinates : []
  const originalDist = baseline ? baseline.distanceKm : 0
  const originalTime = baseline ? baseline.timeMin : 0

  // Check if original route traverses any currently blocked segment
  let isDirectBlocked = false
  let blockedSeg: RoadSegment | undefined

  for (let i = 0; i < originalPath.length - 1; i++) {
    const u = originalPath[i]
    const v = originalPath[i + 1]
    const seg = segments.find(
      s => (s.fromNode === u && s.toNode === v) || (s.fromNode === v && s.toNode === u)
    )
    if (seg && seg.isBlocked) {
      isDirectBlocked = true
      blockedSeg = seg
      break
    }
  }

  const currentPath = current ? current.path : []
  const currentCoords = current ? current.coordinates : []
  const currentDist = current ? current.distanceKm : 0
  const currentTime = current ? current.timeMin : 0

  const detourExtraKm = current ? Math.max(0, Math.round((currentDist - originalDist) * 10) / 10) : 0
  const detourExtraMin = current ? Math.max(0, currentTime - originalTime) : 0

  let rerouteReason = 'Direct route is clear and unobstructed.'
  if (isDirectBlocked && blockedSeg) {
    rerouteReason = `Direct corridor via ${blockedSeg.name} is BLOCKED (${blockedSeg.blockageReason || 'Waterlogging / Debris'}). Autonomous graph rerouting selected safest bypass corridor.`
  } else if (!current) {
    rerouteReason = 'CRITICAL: No viable alternate route exists due to multiple concurrent arterial blockages.'
  }

  const safetyNotes: string[] = []
  if (isDirectBlocked) {
    safetyNotes.push(`Original route marked UNSAFE due to water inundation (${blockedSeg?.waterDepthCm || 65}cm).`)
    safetyNotes.push(`Detour requires +${detourExtraKm} km and approx +${detourExtraMin} mins transit delay.`)
    safetyNotes.push(`Field dispatch should verify clearance under flyover bottlenecks before entering corridor.`)
  } else {
    safetyNotes.push(`Standard high-capacity response corridor active.`)
  }

  return {
    fromNode,
    toNode,
    isDirectRouteBlocked: isDirectBlocked,
    blockedSegmentId: blockedSeg?.id,
    originalPath,
    originalCoordinates: originalCoords,
    originalDistanceKm: originalDist,
    originalTimeMin: originalTime,
    currentPath,
    currentCoordinates: currentCoords,
    currentDistanceKm: currentDist,
    currentTimeMin: currentTime,
    detourDistanceKm: detourExtraKm,
    detourTimeMin: detourExtraMin,
    rerouteReason,
    safetyNotes,
  }
}
