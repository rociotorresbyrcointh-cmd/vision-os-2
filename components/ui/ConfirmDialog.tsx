'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

type ConfirmOptions = {
  title: string
  description?: string
  actionLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(async () => false)

// Reemplaza a window.confirm() con un modal propio, con el estilo de la app.
// Uso:  const confirm = useConfirm();  if (!(await confirm({ title: '…' }))) return
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  const close = (result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOpts(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div
          onClick={() => close(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(420px, 94vw)', background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', padding: 22 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: opts.destructive ? 'rgba(248,113,113,0.12)' : 'rgba(37,99,255,0.14)' }}>
                <AlertTriangle size={19} color={opts.destructive ? '#f87171' : '#60a5fa'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: 0 }}>{opts.title}</h2>
                {opts.description && (
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.5, margin: '7px 0 0' }}>{opts.description}</p>
                )}
              </div>
              <button onClick={() => close(false)} aria-label="Cerrar" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 9, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={() => close(false)}
                style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.7)' }}
              >
                {opts.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', color: 'white', background: opts.destructive ? '#dc2626' : '#2563FF' }}
              >
                {opts.actionLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
