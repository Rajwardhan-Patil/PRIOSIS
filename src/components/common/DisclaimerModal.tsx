import React from 'react'
import { AlertTriangle, X, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useIncidentContext } from '../../context/IncidentContext'

export const DisclaimerModal: React.FC = () => {
  const { isDisclaimerOpen, setIsDisclaimerOpen } = useIncidentContext()

  if (!isDisclaimerOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={() => setIsDisclaimerOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              PRIORIS Operational Prototype Disclaimer
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              Important Governance, Ethics & Responsible-Use Notice
            </p>
          </div>
        </div>

        {/* Key Governance Declarations */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200">
            <strong>Prototype Decision-Support Notice:</strong> PRIORIS is an engineering prototype designed for the PRIOSIS Round 2 Hackathon (Theme: AI for Climate Change). It is NOT an official disaster management platform or emergency dispatch tool.
          </div>

          <ul className="space-y-2 list-none pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Human-in-the-Loop Authority:</strong> PRIORIS is strictly advisory. It generates risk insights and suggested routing to assist human incident coordinators; it never autonomously commands or dispatches real emergency units.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Official Channels First:</strong> Citizens in distress must use India's national emergency service <strong>112</strong> or refer to official bulletins issued by the <strong>National Disaster Management Authority (NDMA)</strong>, <strong>SACHET</strong>, and the <strong>India Meteorological Department (IMD)</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Prototype Weights & Heuristics:</strong> The normalized 5-factor risk scoring formula (Hazard 35%, Exposure 25%, Vulnerability 20%, Accessibility 10%, Scarcity 10%) represents initial demonstrative parameters and has not been certified by civil defense standards.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong>Simulated Telemetry Safeguard:</strong> Incidents, dam release rates, field reports, and response assets portrayed around Pune are synthetic scenarios for testing deterministic system behavior.
              </span>
            </li>
          </ul>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            AI for Climate Change Hackathon Round 2
          </span>
          <button
            onClick={() => setIsDisclaimerOpen(false)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-teal-900/40 transition"
          >
            I Acknowledge & Agree
          </button>
        </div>
      </div>
    </div>
  )
}
