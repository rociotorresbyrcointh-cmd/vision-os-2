import { createAdminClient } from '@/lib/supabase/admin'
import { computeSlots, type Interval } from '@/lib/slots'
import { timeToMinutes, getDateKey } from '@/lib/date-utils'

export type Servicio = { id: string; name: string; duration_minutes: number; price: number }
export type Profesional = { id: string; name: string; days_of_week: number[]; hours_start: string; hours_end: string }

export async function getServicios(orgId: string): Promise<Servicio[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('organization_id', orgId).eq('is_active', true).order('created_at')
  return (data as Servicio[]) ?? []
}

export async function getProfesionales(orgId: string): Promise<Profesional[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('professionals')
    .select('id, name, days_of_week, hours_start, hours_end')
    .eq('organization_id', orgId).eq('is_active', true).order('created_at')
  return (data as Profesional[]) ?? []
}

// Horarios de inicio disponibles para un servicio con un profesional un día dado.
export async function horariosLibres(
  orgId: string, servicio: Servicio, prof: Profesional, fechaKey: string,
): Promise<string[]> {
  const supabase = createAdminClient()
  const [y, m, d] = fechaKey.split('-').map(Number)
  const dayStart = new Date(y, m - 1, d, 0, 0, 0)
  const dayEnd = new Date(y, m - 1, d + 1, 0, 0, 0)
  const weekday = dayStart.getDay()

  // Turnos ya ocupados de ese profesional ese día.
  const { data: appts } = await supabase
    .from('appointments')
    .select('start_time, end_time, status')
    .eq('professional_id', prof.id)
    .neq('status', 'cancelled')
    .gte('start_time', dayStart.toISOString())
    .lt('start_time', dayEnd.toISOString())

  const busy: Interval[] = (appts ?? []).map((a: { start_time: string; end_time: string }) => {
    const s = new Date(a.start_time), e = new Date(a.end_time)
    return { start: s.getHours() * 60 + s.getMinutes(), end: e.getHours() * 60 + e.getMinutes() }
  })

  const esHoy = getDateKey(new Date()) === fechaKey
  const now = new Date()
  return computeSlots({
    weekday,
    daysOfWeek: prof.days_of_week ?? [],
    openMin: timeToMinutes(prof.hours_start.slice(0, 5)),
    closeMin: timeToMinutes(prof.hours_end.slice(0, 5)),
    durationMin: servicio.duration_minutes,
    busy,
    nowMinIfToday: esHoy ? now.getHours() * 60 + now.getMinutes() : null,
  })
}

// Agenda el turno usando la RPC public_book (valida solapamientos y capacidad).
export async function agendar(args: {
  orgId: string; servicio: Servicio; profId: string
  fechaKey: string; hora: string; nombre: string; telefono: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()
  const [y, m, d] = args.fechaKey.split('-').map(Number)
  const [hh, mm] = args.hora.split(':').map(Number)
  const start = new Date(y, m - 1, d, hh, mm, 0)
  const end = new Date(start.getTime() + args.servicio.duration_minutes * 60_000)

  const { error } = await supabase.rpc('public_book', {
    p_org: args.orgId, p_prof: args.profId, p_service: args.servicio.id,
    p_name: args.nombre, p_phone: args.telefono,
    p_start: start.toISOString(), p_end: end.toISOString(),
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
