import React from 'react'
import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const shortcuts = [
    { key: '↑ / ↓', desc: 'Navigate up and down the ranked ward queue' },
    { key: 'Enter', desc: 'Expand / inspect selected ward in detail' },
    { key: 'D', desc: 'Dispatch nearest available unit to selected ward' },
    { key: '1 – 6', desc: 'Switch navigation tabs (Command, Incidents, Units...)' },
    { key: 'L', desc: 'Toggle Marathi (मराठी) / English language' },
    { key: 'T', desc: 'Toggle Dark / White mode' },
    { key: 'Esc', desc: 'Close active popover or modal' },
    { key: 'N', desc: 'NuGen Tactical Advisor' },
    { key: '?', desc: 'Toggle this keyboard shortcut helper' },
  ]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#15171A] border border-[#2A2D33] rounded-md max-w-sm w-full p-4 shadow-xl text-[#ECEDEF] space-y-3">
        <div className="flex items-center justify-between border-b border-[#2A2D33] pb-2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#858A93]" />
            <h3 className="font-medium text-xs text-[#ECEDEF]">Keyboard Command Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] hover:bg-[#1C1F23]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between py-1 border-b border-[#2A2D33]/50 last:border-0">
              <span className="text-[#A1A5AD] text-xs">{s.desc}</span>
              <kbd className="font-mono-numbers px-2 py-0.5 rounded bg-[#0E0F11] border border-[#2A2D33] text-[#ECEDEF] text-xs font-medium">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[#858A93] pt-1 text-center">
          Engineered for rapid keyboard-only operations dispatch.
        </div>
      </div>
    </div>
  )
}
