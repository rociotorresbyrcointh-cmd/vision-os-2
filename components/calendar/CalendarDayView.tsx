'use client'

import { useMemo } from 'react'
import { Globe } from 'lucide-react'
import type { Professional, Service, Appointment } from '@/types/database'
import type { BlockInstance } from '@/services/blocked-times'
import { minutesToTime } from '@/lib/date-utils'
import { payStatus } from '@/lib/pay-status'

const PX_PER_MIN = 1.5          // 30 min = 45px (bloques más legibles)
const SLOT = 30                 // líneas cada 30 min
const GUTTER = 48               // ancho de la columna de horas
const HEADER_H = 52             // alto del encabezado de columnas
const COL_MIN = 168             // ancho mínimo de cada columna (se estira si sobra lugar)
const LANE_MIN = 120            // ancho mínimo legible por carril (turnos simultáneos)

function localMinutes(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

// Asigna carriles a turnos solapados de un mismo profesional.
// `minLanes` fuerza un mínimo de carriles (= capacidad del profesional),
// dejando espacios libres clickeables para apilar turnos en la misma hora.
function assignLanes(appts: Appointment[], minLanes = 1) {
  const sorted = [...appts].sort((a, b) => localMinutes(a.start_time) - localMinutes(b.start_time))
  const laneEnds: number[] = []
  const result = new Map<string, { lane: number; lanes: number }>()
  const clusters: Appointment[][] = []
  let current: Appointment[] = []
  let clusterEnd = -1

  for (const a of sorted) {
    const s = localMinutes(a.start_time)
    if (s >= clusterEnd && current.length) { clusters.push(current); current = []; laneEnds.length = 0 }
    let lane = laneEnds.findIndex((end) => end <= s)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = localMinutes(a.end_time)
    result.set(a.id, { lane, lanes: 0 })
    current.push(a)
    clusterEnd = Math.max(clusterEnd, localMinutes(a.end_time))
  }
  if (current.length) clusters.push(current)

  for (const cluster of clusters) {
    const used = Math.max(...cluster.map((a) => result.get(a.id)!.lane)) + 1
    const lanes = Math.max(used, minLanes)
    for (const a of cluster) result.get(a.id)!.lanes = lanes
  }
  return result
}

export function CalendarDayView({
  professionals,
  services,
  appointments,
  blocks,
  paidByAppt,
  openMin,
  closeMin,
  onEmptyClick,
  onApptClick,
  onBlockClick,
}: {
  professionals: Professional[]
  services: Service[]
  appointments: Appointment[]
  blocks: BlockInstance[]
  paidByAppt: Map<string, number>
  openMin: number
  closeMin: number
  onEmptyClick: (professionalId: string, startMin: number) => void
  onApptClick: (appt: Appointment) => void
  onBlockClick: (block: BlockInstance) => void
}) {
  const totalMin = closeMin - openMin
  const bodyH = totalMin * PX_PER_MIN

  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? ''

  // Líneas de hora
  const hourLines = useMemo(() => {
    const lines: number[] = []
    for (let m = openMin; m <= closeMin; m += SLOT) lines.push(m)
    return lines
  }, [openMin, closeMin])

  // Línea de "ahora"
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const showNow = nowMin >= openMin && nowMin <= closeMin

  // Por cada profesional: sus turnos, carriles, y el ancho que necesita su
  // columna para que los turnos simultáneos se lean (se ensancha con scroll).
  const profMeta = useMemo(() => {
    const byProf = new Map<string, Appointment[]>()
    for (const p of professionals) byProf.set(p.id, [])
    for (const a of appointments) byProf.get(a.professional_id)?.push(a)
    return professionals.map((p) => {
      const appts = byProf.get(p.id) ?? []
      const lanes = assignLanes(appts, 1)
      const maxLanes = appts.length
        ? Math.max(...Array.from(lanes.values()).map((l) => l.lanes))
        : 1
      const width = Math.max(COL_MIN, maxLanes * LANE_MIN)
      return { p, appts, lanes, width }
    })
  }, [professionals, appointments])

  const totalWidth = GUTTER + profMeta.reduce((sum, m) => sum + m.width, 0)

  const handleColumnClick = (e: React.MouseEvent, professionalId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const raw = openMin + y / PX_PER_MIN
    const snapped = Math.round(raw / 15) * 15
    onEmptyClick(professionalId, Math.max(openMin, Math.min(snapped, closeMin - 15)))
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', minWidth: totalWidth }}>
        {/* Columna de horas */}
        <div style={{ width: GUTTER, minWidth: GUTTER, position: 'sticky', left: 0, zIndex: 3, background: '#07070F' }}>
          <div style={{ height: HEADER_H }} />
          <div style={{ position: 'relative', height: bodyH }}>
            {hourLines.map((m) => (
              <div key={m} style={{ position: 'absolute', top: (m - openMin) * PX_PER_MIN, right: 8, transform: 'translateY(-50%)', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}>
                {m % 60 === 0 ? minutesToTime(m) : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Columnas de profesionales */}
        {profMeta.map(({ p, appts, lanes, width }) => {
          return (
            <div key={p.id} style={{ flex: `1 0 ${width}px`, minWidth: width, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Encabezado */}
              <div style={{ height: HEADER_H, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', position: 'sticky', top: 0, zIndex: 2, background: '#0a0a14', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                <span style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </div>

              {/* Cuerpo */}
              <div onClick={(e) => handleColumnClick(e, p.id)} style={{ position: 'relative', height: bodyH, cursor: 'pointer' }}>
                {/* líneas */}
                {hourLines.map((m) => (
                  <div key={m} style={{ position: 'absolute', top: (m - openMin) * PX_PER_MIN, left: 0, right: 0, borderTop: m % 60 === 0 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.03)' }} />
                ))}

                {/* bloqueos (almuerzo, vacaciones…) */}
                {blocks
                  .filter((b) => b.professional_id === p.id || b.professional_id === null)
                  .map((b) => {
                    const bs = localMinutes(b.start_time)
                    const be = localMinutes(b.end_time)
                    return (
                      <div
                        key={b.sourceId + bs}
                        onClick={(ev) => { ev.stopPropagation(); onBlockClick(b) }}
                        title={`${b.title} · ${minutesToTime(bs)}–${minutesToTime(be)} (click para eliminar)`}
                        style={{
                          position: 'absolute',
                          top: (bs - openMin) * PX_PER_MIN + 1,
                          height: Math.max((be - bs) * PX_PER_MIN - 2, 16),
                          left: 2, right: 2,
                          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 6, padding: '3px 8px', overflow: 'hidden', zIndex: 3, cursor: 'pointer',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</p>
                      </div>
                    )
                  })}

                {/* línea de ahora */}
                {showNow && (
                  <div style={{ position: 'absolute', top: (nowMin - openMin) * PX_PER_MIN, left: 0, right: 0, height: 2, background: '#ef4444', zIndex: 5, boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
                )}

                {/* turnos */}
                {appts.map((a) => {
                  const s = localMinutes(a.start_time)
                  const e = localMinutes(a.end_time)
                  const { lane, lanes: nLanes } = lanes.get(a.id)!
                  const widthPct = 100 / nLanes
                  const blockH = Math.max((e - s) * PX_PER_MIN - 2, 20)
                  const showService = blockH >= 40
                  const showTime = blockH >= 56
                  const paid = paidByAppt.get(a.id) ?? 0
                  const price = services.find((sv) => sv.id === a.service_id)?.price ?? 0
                  const ps = payStatus(paid, price)
                  return (
                    <div
                      key={a.id}
                      onClick={(ev) => { ev.stopPropagation(); onApptClick(a) }}
                      title={`${a.client_name} · ${serviceName(a.service_id)} · ${minutesToTime(s)}–${minutesToTime(e)}`}
                      style={{
                        position: 'absolute',
                        top: (s - openMin) * PX_PER_MIN + 1,
                        height: blockH,
                        left: `calc(${lane * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        background: `linear-gradient(135deg, ${p.color}33, ${p.color}1f)`,
                        borderLeft: `3px solid ${p.color}`,
                        borderRadius: 7,
                        padding: '5px 9px',
                        overflow: 'hidden',
                        zIndex: 4,
                        opacity: a.status === 'cancelled' ? 0.4 : 1,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                      }}
                    >
                      {ps !== 'none' && (
                        <span title={ps === 'paid' ? 'Pagado' : 'Seña / parcial'} style={{ position: 'absolute', top: 4, right: 5, width: 16, height: 16, borderRadius: '50%', background: ps === 'paid' ? '#34d399' : '#fbbf24', color: '#07241a', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                          {ps === 'paid' ? '$' : '½'}
                        </span>
                      )}
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.25, paddingRight: ps !== 'none' ? 18 : 0 }}>
                        {a.source === 'public' && <Globe size={11} color="#22d3ee" style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                        {a.client_name}
                      </p>
                      {showService && (
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{serviceName(a.service_id)}</p>
                      )}
                      {showTime && (
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>{minutesToTime(s)}–{minutesToTime(e)}</p>
                      )}
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
