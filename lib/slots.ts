import { minutesToTime, timeToMinutes } from '@/lib/date-utils'

export type Interval = { start: number; end: number } // minutos del día

// Calcula los horarios de inicio disponibles para un servicio en un día.
export function computeSlots(opts: {
  weekday: number
  daysOfWeek: number[]
  openMin: number
  closeMin: number
  durationMin: number
  busy: Interval[]
  nowMinIfToday: number | null
}): string[] {
  const { weekday, daysOfWeek, openMin, closeMin, durationMin, busy, nowMinIfToday } = opts
  if (!daysOfWeek.includes(weekday)) return []

  const step = Math.max(15, Math.min(durationMin, 60))
  const slots: string[] = []
  for (let start = openMin; start + durationMin <= closeMin; start += step) {
    const end = start + durationMin
    if (nowMinIfToday !== null && start <= nowMinIfToday) continue
    const clashes = busy.some((b) => start < b.end && end > b.start)
    if (!clashes) slots.push(minutesToTime(start))
  }
  return slots
}

export { minutesToTime, timeToMinutes }
