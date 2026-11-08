/**
 * NuGen AI Integration Service
 * Model: Qwen/Qwen2.5-0.5B-Instruct
 * Endpoint: https://api.nugen.in/api/v3/inference/chat/completions
 * Proxy: /api/nugen/api/v3/inference/chat/completions (bypasses browser CORS)
 */

const NUGEN_DEFAULT_KEY = 'nugen-989f70b8ac18b135'
const NUGEN_MODEL = 'Qwen/Qwen2.5-0.5B-Instruct'

export interface NuGenContext {
  worstWardName: string
  worstWardPriority: string
  worstWardScore: number
  dischargeCusecs: number
  activeIncidentsCount: number
  readyUnitsCount: number
  blockedRoads?: string[]
}

/**
 * Returns prioritized endpoints to avoid CORS in browser environments.
 */
function getCandidateEndpoints(): string[] {
  if (typeof window !== 'undefined') {
    return [
      // 1. Vite dev/preview server proxy (configured in vite.config.ts)
      '/api/nugen/api/v3/inference/chat/completions',
      // 2. Direct origin
      'https://api.nugen.in/api/v3/inference/chat/completions',
      // 3. Fallback CORS gateway if deployed on static host without backend proxy
      'https://corsproxy.io/?url=https://api.nugen.in/api/v3/inference/chat/completions',
    ]
  }
  return ['https://api.nugen.in/api/v3/inference/chat/completions']
}

/**
 * Executes chat completion request against candidate endpoints with automatic fallback.
 */
async function callNuGen(body: any, apiKey: string): Promise<string> {
  const endpoints = getCandidateEndpoints()
  let lastError: any = null

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 9000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data?.choices?.[0]?.message?.content?.trim()
        if (text) return text
      } else {
        lastError = new Error(`NuGen endpoint ${endpoint} returned status ${response.status}`)
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError || new Error('NuGen service unreachable across all candidate endpoints.')
}

export async function generateNuGenDirective(ctx: NuGenContext): Promise<string> {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NUGEN_API_KEY) || NUGEN_DEFAULT_KEY

  const prompt = `You are a flood emergency duty officer AI assistant for the Pune Urban Basin (Mutha-Mula rivers).
Current basin status:
- Highest priority ward: ${ctx.worstWardName} (Score: ${ctx.worstWardScore.toFixed(1)}, Tier: ${ctx.worstWardPriority})
- Khadakwasla spillway discharge: ${ctx.dischargeCusecs.toLocaleString()} cusecs
- Active incidents: ${ctx.activeIncidentsCount}
- Emergency units ready: ${ctx.readyUnitsCount}
${ctx.blockedRoads && ctx.blockedRoads.length > 0 ? `- Blocked routes: ${ctx.blockedRoads.join(', ')}` : ''}

Write a concise operational directive for the duty officer.
Strict rules:
1. Max 2 sentences.
2. Put the immediate tactical action first, followed by the hydrological cause.
3. Keep tone calm, clear, and professional. No markdown bolding, no conversational filler.`

  try {
    const text = await callNuGen(
      {
        max_tokens: 150,
        model: NUGEN_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an emergency operations center decision-support assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
        temperature: 0.2,
      },
      apiKey
    )

    if (text) return text
  } catch (err) {
    console.warn('[NuGen AI] Service unavailable, using deterministic fallback:', err)
  }

  // Graceful deterministic fallback
  return `Send rescue units to ${ctx.worstWardName.split(' ')[0]} first, then stage at Deccan Gymkhana. Khadakwasla spillway discharge increased to ${ctx.dischargeCusecs.toLocaleString()} cusecs, overtopping low causeways.`
}

export async function askNuGenAdvisor(userQuestion: string, basinContext?: string): Promise<string> {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NUGEN_API_KEY) || NUGEN_DEFAULT_KEY

  const systemPrompt = `You are the NuGen Tactical Emergency Advisor for the Pune Urban Basin Flood Response Center.
Provide dense, actionable, professional guidance for emergency duty officers.
Keep responses concise, factual, and strictly focused on flood response, safety, detour coordination, and life safety.`

  const promptContent = basinContext
    ? `Basin Context: ${basinContext}\n\nOfficer Question: ${userQuestion}`
    : userQuestion

  try {
    const text = await callNuGen(
      {
        max_tokens: 300,
        model: NUGEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptContent },
        ],
        stream: false,
        temperature: 0.2,
      },
      apiKey
    )

    return text || 'No tactical recommendation available.'
  } catch (err: any) {
    console.error('[NuGen Advisor Error]:', err)
    // Return tactical advisory guidance if network proxy blocks
    return `[Tactical Advisory Fallback]
1. Prioritize immediate life safety in Kasba Peth: Sound alert sirens and move vulnerable elderly to Shaniwar Wada staging grounds.
2. Maintain active roadblock on J.M. Road (0.85m depth); enforce high-clearance reroute via Lakdi Pul (+5.0 km).
3. Monitor Khadakwasla spillway telemetry: if discharge exceeds 20,000 cusecs, trigger Baba Bhide causeway closure protocol.`
  }
}
