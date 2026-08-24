'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; kind: ToastKind; message: string }

type ToastFn = (message: string, kind?: ToastKind) => void

const ToastContext = createContext<ToastFn>(() => {})

// Reemplaza a window.alert() con avisos con el estilo de la app.
// Uso:  const toast = useToast();  toast('Guardado', 'success')  /  toast('Error…', 'error')
export function useToast(): ToastFn {
  return useContext(ToastContext)
}

const STYLE: Record<ToastKind, { color: string; bg: string; border: string; Icon: typeof Info }> = {
  success: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', Icon: CheckCircle2 },
  error: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', Icon: AlertCircle },
  info: { color: '#60a5fa', bg: 'rgba(37,99,255,0.14)', border: 'rgba(37,99,255,0.35)', Icon: Info },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastFn>((message, kind = 'info') => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, kind, message }])
    // Los errores quedan más tiempo; los demás se van solos.
    setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 400, display: 'flex', flexDirection: 'column', gap: 10, width: 'min(440px, 92vw)', pointerEvents: 'none' }}>
        {toasts.map((t) => {
          const s = STYLE[t.kind]
          return (
            <div key={t.id}
              style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'flex-start', gap: 10, background: '#10101c', border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 14px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ flexShrink: 0, marginTop: 1, color: s.color }}><s.Icon size={18} /></div>
              <p style={{ flex: 1, margin: 0, color: 'white', fontSize: 13.5, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Cerrar" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
