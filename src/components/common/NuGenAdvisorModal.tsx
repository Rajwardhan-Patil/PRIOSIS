import React, { useState } from 'react'
import { X, Sparkles, Send, Copy, Check, Loader2 } from 'lucide-react'
import { askNuGenAdvisor } from '../../services/nugenService'
import { useIncidentContext } from '../../context/IncidentContext'

interface NuGenAdvisorModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_PROMPTS = [
  'Generate immediate SitRep for PMC Commissioner',
  'Safety precautions for Lakdi Pul detour route',
  'Evacuation procedure for low-lying Kasba Peth lanes',
  'Staging recommendations for NDRF and SDRF teams',
]

export const NuGenAdvisorModal: React.FC<NuGenAdvisorModalProps> = ({ isOpen, onClose }) => {
  const { rankedZones, hydrology, incidents, resources, roadSegments } = useIncidentContext()

  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const worstWard = rankedZones[0]
  const blockedRoads = roadSegments.filter(r => r.isBlocked).map(r => r.name)

  const basinSummary = `Worst ward: ${worstWard?.name || 'Kasba Peth'} (Score: ${worstWard?.riskScore || 84.1}, ${worstWard?.priority || 'Critical'}). Discharge: ${hydrology.outflowDischargeCusecs} cusecs. Active incidents: ${incidents.filter(i => i.status !== 'resolved').length}. Ready units: ${resources.filter(r => r.status === 'available').length} of ${resources.length}. Blocked roads: ${blockedRoads.join(', ') || 'J.M. Road'}.`

  const handleAsk = async (promptToUse?: string) => {
    const q = (promptToUse || question).trim()
    if (!q) return

    setIsLoading(true)
    setError(null)
    setQuestion(q)

    try {
      const res = await askNuGenAdvisor(q, basinSummary)
      setResponse(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to NuGen inference endpoint.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-[#15171A] border border-[#2A2D33] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#ECEDEF]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2A2D33] flex items-center justify-between bg-[#15171A]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#1C1F23] border border-[#2A2D33]">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B923]" />
            </span>
            <div>
              <h3 className="text-xs font-semibold text-[#ECEDEF] leading-tight flex items-center gap-2">
                NuGen Tactical Advisor
                <span className="text-[10px] font-mono text-[#858A93] font-normal">Qwen2.5-0.5B</span>
              </h3>
              <p className="text-[11px] text-[#858A93]">Context-aware emergency decision advisory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] hover:bg-[#1C1F23] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Basin Context Chip */}
        <div className="px-4 py-2 bg-[#1C1F23]/60 border-b border-[#2A2D33] text-[11px] text-[#A1A5AD] flex items-center justify-between">
          <span>Active context: <strong className="text-[#ECEDEF] font-medium">{worstWard?.name || 'Kasba Peth'}</strong> · {hydrology.outflowDischargeCusecs.toLocaleString()} cusecs</span>
          <span className="text-[10px] font-mono text-[#4CB782]">CONNECTED</span>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Quick Prompts */}
          <div>
            <div className="text-[11px] text-[#858A93] mb-1.5 font-medium">Quick operational queries</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(p)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded text-[11px] border border-[#2A2D33] bg-[#1C1F23] text-[#A1A5AD] hover:text-[#ECEDEF] hover:border-[#3B4048] transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          {response && (
            <div className="p-3 rounded border border-[#2A2D33] bg-[#0E0F11] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#858A93]">NuGen Advisory Synthesis</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] text-[#A1A5AD] hover:text-[#ECEDEF]"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#4CB782]" />
                      <span className="text-[#4CB782]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#ECEDEF] leading-relaxed whitespace-pre-line font-sans">
                {response}
              </p>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded border border-[#F2555A]/30 bg-[#F2555A]/10 text-xs text-[#F2555A]">
              {error}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#2A2D33] bg-[#15171A]">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleAsk()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask NuGen for tactical advisory or evacuation protocol..."
              disabled={isLoading}
              className="flex-1 bg-[#0E0F11] border border-[#2A2D33] rounded px-3 py-1.5 text-xs text-[#ECEDEF] placeholder:text-[#858A93] focus:outline-hidden focus:border-[#ECEDEF]"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-3 py-1.5 rounded text-xs font-medium bg-[#ECEDEF] text-[#0E0F11] hover:bg-[#FFFFFF] disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Querying...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask NuGen</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
