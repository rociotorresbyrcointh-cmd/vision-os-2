'use client'

import { useMemo } from 'react'
import type { Professional, Appointment } from '@/types/database'
import { getDateKey } from '@/lib/date-utils'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function CalendarMonthView({
  professionals,
  appointments,
  monthDate,
  onDayClick,
}: {
  professionals: Professional[]
  appointments: Appointment[]
  monthDate: Date
  onDayClick: (day: Date) => void
}) {
  const profColor = (id: string) => professionals.find((p) => p.id === id)?.color ?? '#888'

  // Celdas del mes: arranca el domingo de la semana del día 1
  const cells = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [monthDate])

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
  const month = monthDate.getMonth()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 28px 28px' }}>
      {/* Cabecera de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{w}</div>
        ))}
      </div>

      {/* Grilla */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: 8 }}>
        {cells.map((d) => {
          const k = getDateKey(d)
          const appts = byDay.get(k) ?? []
          const inMonth = d.getMonth() === month
          const isToday = k === todayKey
          // colores únicos de profesionales con turno ese día
          const colors = Array.from(new Set(appts.map((a) => profColor(a.professional_id)))).slice(0, 5)
          return (
            <button
              key={k}
              onClick={() => onDayClick(d)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                padding: 10, borderRadius: 11, cursor: 'pointer', textAlign: 'left',
                background: inMonth ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: isToday ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.06)',
                opacity: inMonth ? 1 : 0.35, fontFamily: 'inherit', minHeight: 70,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? '#60a5fa' : 'white', fontVariantNumeric: 'tabular-nums' }}>{d.getDate()}</span>
              {appts.length > 0 && (
                <>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {colors.map((c, i) => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 'auto' }}>
                    {appts.length} {appts.length === 1 ? 'turno' : 'turnos'}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
