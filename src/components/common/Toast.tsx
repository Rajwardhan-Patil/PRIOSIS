import React from 'react'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  undoAction?: () => void
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 bg-[#15171A] border border-[#2A2D33] text-[#ECEDEF] px-3.5 py-2.5 rounded shadow-lg text-xs max-w-md">
      <CheckCircle2 className="w-4 h-4 text-[#4CB782] shrink-0" />
      <div className="flex-1 space-y-0.5">
        <div className="font-medium text-[#ECEDEF]">{toast.title}</div>
        {toast.description && (
          <div className="text-[11px] text-[#A1A5AD]">{toast.description}</div>
        )}
      </div>

      {toast.undoAction && (
        <button
          onClick={() => {
            toast.undoAction!()
            onDismiss()
          }}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C1F23] hover:bg-[#24272D] text-[#ECEDEF] text-xs font-medium border border-[#2A2D33] transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-[#A1A5AD]" />
          <span>Undo</span>
        </button>
      )}

      <button
        onClick={onDismiss}
        className="p-1 rounded text-[#858A93] hover:text-[#ECEDEF] hover:bg-[#1C1F23]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
