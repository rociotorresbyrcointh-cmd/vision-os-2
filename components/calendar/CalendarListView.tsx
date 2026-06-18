'use client'

import { useMemo } from 'react'
import { Clock, User, Ban, Globe } from 'lucide-react'
import type { Professional, Service, Appointment, AppointmentStatus } from '@/types/database'
import type { BlockInstance } from '@/services/blocked-times'
import { payStatus, money } from '@/lib/pay-status'

function localTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function localMinutes(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

const STATUS_STYLE: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  confirmed: { label: 'Confirmado', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  completed: { label: 'Completado', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  cancelled: { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  no_show:   { label: 'No asistió', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
}

export function CalendarListView({
  professionals,
  services,
  appointments,
  blocks,
  paidByAppt,
  obraByPatient,
  onApptClick,
  onBlockClick,
  onStatusChange,
}: {
  professionals: Professional[]
  services: Service[]
  appointments: Appointment[]
  blocks: BlockInstance[]
  paidByAppt: Map<string, number>
  obraByPatient?: Map<string, string>
  onApptClick: (appt: Appointment) => void
  onBlockClick: (block: BlockInstance) => void
  onStatusChange: (appt: Appointment, status: AppointmentStatus) => void
}) {
  const prof = (id: string) => professionals.find((p) => p.id === id)
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? ''

  // Agrupados por hora de inicio
  const groups = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => localMinutes(a.start_time) - localMinutes(b.start_time))
    const map = new Map<string, Appointment[]>()
    for (const a of sorted) {
      const t = localTime(a.start_time)
      if (!map.has(t)) map.set(t, [])
      map.get(t)!.push(a)
    }
    return Array.from(map.entries())
  }, [appointments])

  if (!appointments.length && !blocks.length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>
        No hay turnos este día.
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 40px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 18px' }}>
        {appointments.length} {appointments.length === 1 ? 'turno' : 'turnos'} en total
      </p>

      {blocks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22, maxWidth: 760 }}>
          {blocks.map((b) => (
            <button key={b.sourceId + b.start_time} onClick={() => onBlockClick(b)}
              title="Click para eliminar el bloqueo"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Ban size={13} color="rgba(255,255,255,0.45)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{b.title}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
                {localTime(b.start_time)}–{localTime(b.end_time)}
              </span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760 }}>
        {groups.map(([time, appts]) => (
          <div key={time} style={{ display: 'flex', gap: 16 }}>
            {/* Columna de hora */}
            <div style={{ width: 56, flexShrink: 0, textAlign: 'right', paddingTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
            </div>

            {/* Turnos de esa hora */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 16 }}>
              {appts.map((a) => {
                const p = prof(a.professional_id)
                const st = STATUS_STYLE[a.status]
                const paid = paidByAppt.get(a.id) ?? 0
                const price = services.find((sv) => sv.id === a.service_id)?.price ?? 0
                const ps = payStatus(paid, price)
                return (
                  <button
                    key={a.id}
                    onClick={() => onApptClick(a)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: `3px solid ${p?.color ?? '#888'}`, borderRadius: 11, padding: '12px 16px',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.client_name}
                        {a.patient_id && obraByPatient?.get(a.patient_id) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#c084fc', background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.35)', borderRadius: 6, padding: '2px 8px' }}>
                            {obraByPatient.get(a.patient_id)}
                          </span>
                        )}
                        {a.source === 'public' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#22d3ee', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 6, padding: '2px 8px' }}>
                            <Globe size={11} /> Reserva online
                          </span>
                        )}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{serviceName(a.service_id)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                          <Clock size={12} /> {localTime(a.start_time)}–{localTime(a.end_time)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p?.color ?? '#888' }} />
                          {p?.name ?? '—'}
                        </span>
                        {(p?.max_capacity_per_hour ?? 1) > 1 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                            <User size={12} /> {a.capacity_consumed}/{p?.max_capacity_per_hour}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cobrado + Estado / acciones rápidas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      {ps === 'paid' && (
                        <span title="Pagado" style={{ fontSize: 11.5, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 7, padding: '5px 9px' }}>
                          ✓ Pagado
                        </span>
                      )}
                      {ps === 'partial' && (
                        <span title={`Cobrado ${money(paid)}${price > 0 ? ` · falta ${money(price - paid)}` : ''}`} style={{ fontSize: 11.5, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 7, padding: '5px 9px' }}>
                          Seña · falta {money(Math.max(0, price - paid))}
                        </span>
                      )}
                      {(a.status === 'pending' || a.status === 'confirmed') ? (
                        <>
                          <button onClick={() => onStatusChange(a, 'completed')} title="Marcar que asistió"
                            style={{ fontSize: 12, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 7, padding: '6px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✓ Vino
                          </button>
                          <button onClick={() => onStatusChange(a, 'no_show')} title="Marcar que no asistió"
                            style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 7, padding: '6px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✗ No
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: st.color, background: st.bg, border: `1px solid ${st.color}44`, borderRadius: 7, padding: '5px 10px' }}>
                          {st.label}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
