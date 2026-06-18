'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Calendar, AlertTriangle, Wallet, Clock, UserRound, CheckCircle2 } from 'lucide-react'
import { getNotifications, type Notif } from '@/services/notifications'
import type { Role } from '@/lib/auth/role'

const TONE: Record<string, { color: string; bg: string }> = {
  info: { color: '#60a5fa', bg: 'rgba(37,99,255,0.12)' },
  warn: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  money: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
}

function iconFor(key: string) {
  if (key === 'pend' || key === 'canc') return AlertTriangle
  if (key === 'cobro') return Wallet
  if (key === 'espera') return Clock
  if (key === 'inact') return UserRound
  return Calendar
}

export function NotificationBell({ role = 'owner', align = 'right' }: { role?: Role; align?: 'left' | 'right' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    getNotifications(role)
      .then((n) => { if (alive) { setNotifs(n); setLoaded(true) } })
      .catch(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [role])

  // Cerrar al hacer click afuera
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const count = notifs.length

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <Bell size={18} />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, padding: '0 5px',
            borderRadius: 9, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #07070F',
          }}>{count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', [align]: 0, top: 46, width: 'min(340px, 86vw)', zIndex: 150,
          background: '#10101c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 14, fontWeight: 700, color: 'white' }}>
            Notificaciones
          </div>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {!loaded ? (
              <p style={msg}>Cargando…</p>
            ) : count === 0 ? (
              <div style={{ padding: '26px 18px', textAlign: 'center' }}>
                <CheckCircle2 size={26} color="#34d399" style={{ marginBottom: 8 }} />
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, margin: 0 }}>Todo al día 🎉</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>No hay nada pendiente por ahora.</p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = iconFor(n.key)
                const t = TONE[n.tone] ?? TONE.info
                return (
                  <button
                    key={n.key}
                    onClick={() => { setOpen(false); router.push(n.href) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                      textAlign: 'left', background: 'transparent',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: t.bg, flexShrink: 0 }}>
                      <Icon size={16} color={t.color} />
                    </span>
                    <span style={{ flex: 1, color: 'white', fontSize: 13.5, fontWeight: 500 }}>{n.text}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const msg: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', fontSize: 13.5, textAlign: 'center', padding: '22px 0' }
