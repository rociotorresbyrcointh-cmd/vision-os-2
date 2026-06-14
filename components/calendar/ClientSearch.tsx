'use client'

import { useState, useEffect } from 'react'
import { Search, X, Clock } from 'lucide-react'
import type { Professional, Service, Appointment, AppointmentStatus } from '@/types/database'
import { searchAppointmentsByClient } from '@/services/appointments'
import { payStatus } from '@/lib/pay-status'

const STATUS: Record<AppointmentStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: '#fbbf24' },
  confirmed: { label: 'Confirmado', color: '#34d399' },
  completed: { label: 'Atendido', color: '#60a5fa' },
  cancelled: { label: 'Cancelado', color: '#f87171' },
  no_show: { label: 'No vino', color: '#9ca3af' },
}

export function ClientSearch({
  professionals,
  services,
  paidByAppt,
  onClose,
  onPick,
}: {
  professionals: Professional[]
  services: Service[]
  paidByAppt: Map<string, number>
  onClose: () => void
  onPick: (appt: Appointment) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const profName = (id: string) => professionals.find((p) => p.id === id)?.name ?? '—'
  const profColor = (id: string) => professionals.find((p) => p.id === id)?.color ?? '#888'
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? ''
  const svcPrice = (id: string) => services.find((s) => s.id === id)?.price ?? 0

  // Búsqueda con pequeño retraso (debounce)
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    const t = setTimeout(() => {
      searchAppointmentsByClient(query)
        .then((r) => { setResults(r); setSearched(true) })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono o DNI…"
            autoFocus style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }} />
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 2 }}><X size={18} /></button>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: 12 }}>
          {query.trim().length < 2 ? (
            <p style={msg}>Escribí al menos 2 letras para buscar.</p>
          ) : loading ? (
            <p style={msg}>Buscando…</p>
          ) : results.length === 0 && searched ? (
            <p style={msg}>No se encontraron turnos para “{query}”.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {results.map((a) => {
                const st = STATUS[a.status]
                const d = new Date(a.start_time)
                const ps = payStatus(paidByAppt.get(a.id) ?? 0, svcPrice(a.service_id))
                return (
                  <button key={a.id} onClick={() => onPick(a)} style={row}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                    <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: profColor(a.professional_id) }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.client_name}</p>
                      <div style={{ display: 'flex', gap: 10, marginTop: 3, fontSize: 12, color: 'rgba(255,255,255,0.45)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })} · {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{svcName(a.service_id)} · {profName(a.professional_id)}</span>
                      </div>
                    </div>
                    {ps !== 'none' && (
                      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 800, color: ps === 'paid' ? '#34d399' : '#fbbf24' }}>{ps === 'paid' ? '$' : '½'}</span>
                    )}
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: st.color, background: `${st.color}1f`, border: `1px solid ${st.color}44`, borderRadius: 6, padding: '3px 8px' }}>
                      {st.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, padding: '60px 20px 20px',
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 16,
  width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.6)', overflow: 'hidden',
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
  padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
}
const msg: React.CSSProperties = { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: '24px 0', margin: 0 }
