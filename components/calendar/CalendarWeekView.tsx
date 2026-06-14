'use client'

import { useMemo } from 'react'
import type { Professional, Service, Appointment } from '@/types/database'
import { minutesToTime, getDateKey } from '@/lib/date-utils'

const PX_PER_MIN = 1.0
const SLOT = 60
const GUTTER = 52
const HEADER_H = 52

function localMinutes(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

type Cluster = { appts: Appointment[]; start: number; end: number }

// Agrupa turnos que se solapan en el tiempo (sin importar el profesional).
function clusterize(appts: Appointment[]): Cluster[] {
  const sorted = [...appts].sort((a, b) => localMinutes(a.start_time) - localMinutes(b.start_time))
  const clusters: Cluster[] = []
  for (const a of sorted) {
    const s = localMinutes(a.start_time)
    const e = localMinutes(a.end_time)
    const last = clusters[clusters.length - 1]
    if (last && s < last.end) {
      last.appts.push(a)
      last.end = Math.max(last.end, e)
    } else {
      clusters.push({ appts: [a], start: s, end: e })
    }
  }
  return clusters
}

export function CalendarWeekView({
  professionals,
  services,
  appointments,
  weekStart,
  openMin,
  closeMin,
  onEmptyClick,
  onApptClick,
  onShowDay,
}: {
  professionals: Professional[]
  services: Service[]
  appointments: Appointment[]
  weekStart: Date
  openMin: number
  closeMin: number
  onEmptyClick: (day: Date, startMin: number) => void
  onApptClick: (appt: Appointment) => void
  onShowDay: (day: Date) => void
}) {
  const totalMin = closeMin - openMin
  const bodyH = totalMin * PX_PER_MIN
  const profColor = (id: string) => professionals.find((p) => p.id === id)?.color ?? '#888'
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? ''

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d }),
    [weekStart]
  )
  const hourLines = useMemo(() => {
    const lines: number[] = []
    for (let m = openMin; m <= closeMin; m += SLOT) lines.push(m)
    return lines
  }, [openMin, closeMin])

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of appointments) {
      const k = getDateKey(new Date(a.start_time))
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(a)
    }
    return map
  }, [appointments])

  const todayKey = getDateKey(new Date())

  const handleClick = (e: React.MouseEvent, day: Date) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const snapped = Math.round((openMin + y / PX_PER_MIN) / 15) * 15
    onEmptyClick(day, Math.max(openMin, Math.min(snapped, closeMin - 15)))
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', minWidth: GUTTER + 7 * 120 }}>
        {/* Gutter horas */}
        <div style={{ width: GUTTER, minWidth: GUTTER, position: 'sticky', left: 0, zIndex: 3, background: '#07070F' }}>
          <div style={{ height: HEADER_H }} />
          <div style={{ position: 'relative', height: bodyH }}>
            {hourLines.map((m) => (
              <div key={m} style={{ position: 'absolute', top: (m - openMin) * PX_PER_MIN, right: 6, transform: 'translateY(-50%)', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>
                {minutesToTime(m)}
              </div>
            ))}
          </div>
        </div>

        {/* Columnas de días */}
        {days.map((day) => {
          const k = getDateKey(day)
          const appts = byDay.get(k) ?? []
          const clusters = clusterize(appts)
          const isToday = k === todayKey
          return (
            <div key={k} style={{ flex: 1, minWidth: 120, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ height: HEADER_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 2, background: '#0a0a14', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{day.toLocaleDateString('es-AR', { weekday: 'short' })}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: isToday ? '#60a5fa' : 'white', fontVariantNumeric: 'tabular-nums' }}>{day.getDate()}</span>
              </div>

              <div onClick={(e) => handleClick(e, day)} style={{ position: 'relative', height: bodyH, cursor: 'pointer' }}>
                {hourLines.map((m) => (
                  <div key={m} style={{ position: 'absolute', top: (m - openMin) * PX_PER_MIN, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                ))}
                {clusters.map((cl, i) => {
                  const top = (cl.start - openMin) * PX_PER_MIN + 1
                  const height = Math.max((cl.end - cl.start) * PX_PER_MIN - 2, 16)
                  // Un solo turno → bloque normal con nombre y servicio
                  if (cl.appts.length === 1) {
                    const a = cl.appts[0]
                    const c = profColor(a.professional_id)
                    return (
                      <div key={a.id} onClick={(ev) => { ev.stopPropagation(); onApptClick(a) }}
                        title={`${a.client_name} · ${serviceName(a.service_id)}`}
                        style={{ position: 'absolute', top, height, left: 2, right: 2, background: c + '26', borderLeft: `3px solid ${c}`,
                          borderRadius: 5, padding: '2px 6px', overflow: 'hidden', zIndex: 4 }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.client_name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{serviceName(a.service_id)}</p>
                      </div>
                    )
                  }
                  // Varios turnos solapados → bloque resumen, click abre el día
                  const colors = Array.from(new Set(cl.appts.map((a) => profColor(a.professional_id)))).slice(0, 6)
                  return (
                    <div key={i} onClick={(ev) => { ev.stopPropagation(); onShowDay(day) }}
                      title={`${cl.appts.length} turnos · click para ver el día`}
                      style={{ position: 'absolute', top, height, left: 2, right: 2, background: 'rgba(37,99,255,0.14)', border: '1px solid rgba(37,99,255,0.35)',
                        borderRadius: 6, padding: '3px 7px', overflow: 'hidden', zIndex: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{cl.appts.length} turnos</span>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {colors.map((c, j) => <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
