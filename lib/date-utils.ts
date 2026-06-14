// ─── Helpers de fecha y hora ─────────────────────────────────────
// Lógica pura, probada en el proyecto legacy. Sin dependencias de React.

export const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

export const getDayName = (dayNumber: number): string =>
  DAY_NAMES[dayNumber] ?? 'Inválido'

// "09:30" → 570 (minutos desde medianoche)
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 570 → "09:30"
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Date → "2026-06-12" (clave de día en hora local, no UTC)
export const getDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Extrae "HH:MM" en hora LOCAL desde un Date (no UTC)
export const getLocalTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Devuelve los 7 Date de la semana (domingo a sábado) que contiene `date`
export const getWeekDates = (date: Date): Date[] => {
  const d = new Date(date)
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(sunday)
    wd.setDate(sunday.getDate() + i)
    return wd
  })
}

// Suma minutos a un ISO string y devuelve otro ISO string
export const addMinutesToISO = (iso: string, minutes: number): string => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + minutes)
  return d.toISOString()
}
