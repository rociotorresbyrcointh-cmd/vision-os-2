import { createClient } from '@/lib/supabase/client'
import type { Appointment, AppointmentStatus } from '@/types/database'

export type AppointmentInput = {
  professional_id: string
  service_id: string
  patient_id: string | null
  client_name: string
  client_phone: string | null
  start_time: string // ISO
  end_time: string   // ISO
  status: AppointmentStatus
  notes: string | null
  capacity_consumed: number
  blocks_overlap: boolean
  recurrence_group_id?: string | null
  recurrence_rule?: { freq: 'weekly' | 'monthly'; count: number } | null
}

export type RecurFreq = 'weekly' | 'biweekly' | 'monthly'

// Devuelve un motivo (string) si esa fecha/hora hay que saltarla, o false si está OK.
export type SkipCheck = (start: Date, end: Date) => string | false

const fmtDay = (d: Date) => d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

// Repetición por días de la semana: ej "Lun, Mié, Vie durante 4 semanas".
// weekdays: 0=domingo … 6=sábado. Genera todas las ocurrencias desde la fecha base.
export async function createWeekdayRecurringAppointments(
  organizationId: string,
  base: AppointmentInput,
  weekdays: number[],
  weeks: number,
  shouldSkip?: SkipCheck
): Promise<{ created: Appointment[]; failed: string[]; skipped: string[] }> {
  const groupId = crypto.randomUUID()
  const rule = { freq: 'weekly' as const, count: weeks }
  const start0 = new Date(base.start_time)
  const durationMs = new Date(base.end_time).getTime() - start0.getTime()
  // Domingo de la semana de la fecha base
  const sow = new Date(start0.getFullYear(), start0.getMonth(), start0.getDate())
  sow.setDate(sow.getDate() - sow.getDay())

  const occ: Date[] = []
  for (let w = 0; w < weeks; w++) {
    for (const wd of weekdays) {
      const d = new Date(sow)
      d.setDate(sow.getDate() + w * 7 + wd)
      d.setHours(start0.getHours(), start0.getMinutes(), 0, 0)
      if (d.getTime() >= start0.getTime()) occ.push(d)
    }
  }
  occ.sort((a, b) => a.getTime() - b.getTime())
  return runSeries(organizationId, base, occ, durationMs, groupId, rule, shouldSkip)
}

// Crea cada ocurrencia, saltando las bloqueadas e informando las que chocan.
async function runSeries(
  organizationId: string,
  base: AppointmentInput,
  occ: Date[],
  durationMs: number,
  groupId: string,
  rule: { freq: 'weekly' | 'monthly'; count: number },
  shouldSkip?: SkipCheck
): Promise<{ created: Appointment[]; failed: string[]; skipped: string[] }> {
  const created: Appointment[] = []
  const failed: string[] = []
  const skipped: string[] = []
  for (const s of occ) {
    const e = new Date(s.getTime() + durationMs)
    if (shouldSkip && shouldSkip(s, e)) { skipped.push(fmtDay(s)); continue }
    try {
      const appt = await createAppointment(organizationId, {
        ...base, start_time: s.toISOString(), end_time: e.toISOString(),
        recurrence_group_id: groupId, recurrence_rule: rule,
      })
      created.push(appt)
    } catch {
      failed.push(fmtDay(s))
    }
  }
  return { created, failed, skipped }
}

// Crea una serie de turnos repetidos (semanal / quincenal / mensual).
// Cada ocurrencia se intenta por separado; las que choquen con otro turno se informan.
export async function createRecurringAppointments(
  organizationId: string,
  base: AppointmentInput,
  freq: RecurFreq,
  count: number,
  shouldSkip?: SkipCheck
): Promise<{ created: Appointment[]; failed: string[]; skipped: string[] }> {
  const groupId = crypto.randomUUID()
  const rule = { freq: (freq === 'monthly' ? 'monthly' : 'weekly') as 'weekly' | 'monthly', count }
  const start0 = new Date(base.start_time)
  const durationMs = new Date(base.end_time).getTime() - start0.getTime()
  const occ: Date[] = []
  for (let i = 0; i < count; i++) {
    const s = new Date(start0)
    if (freq === 'weekly') s.setDate(s.getDate() + 7 * i)
    else if (freq === 'biweekly') s.setDate(s.getDate() + 14 * i)
    else s.setMonth(s.getMonth() + i)
    occ.push(s)
  }
  return runSeries(organizationId, base, occ, durationMs, groupId, rule, shouldSkip)
}

// Turnos de un día concreto (rango [desde, hasta)) de toda la organización.
export async function listAppointmentsBetween(
  fromISO: string,
  toISO: string
): Promise<Appointment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .is('deleted_at', null)
    .gte('start_time', fromISO)
    .lt('start_time', toISO)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createAppointment(
  organizationId: string,
  input: AppointmentInput
): Promise<Appointment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...input, organization_id: organizationId, source: 'admin' }])
    .select()
    .single()
  if (error) throw mapError(error)
  return data
}

export async function updateAppointment(
  id: string,
  input: Partial<AppointmentInput>
): Promise<Appointment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw mapError(error)
  return data
}

// Borrado SUAVE: va a la papelera (libera el horario, se puede recuperar)
export async function deleteAppointment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function restoreAppointment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) throw mapError(error)
}

export async function hardDeleteAppointment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

export async function listDeletedAppointments(): Promise<Appointment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Busca turnos por nombre/teléfono del turno, o por DNI/nombre del paciente.
export async function searchAppointmentsByClient(query: string): Promise<Appointment[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const supabase = createClient()

  // 1) Coincidencias directas en el turno (nombre o teléfono escritos a mano)
  const directReq = supabase
    .from('appointments')
    .select('*')
    .is('deleted_at', null)
    .or(`client_name.ilike.%${q}%,client_phone.ilike.%${q}%`)
    .order('start_time', { ascending: false })
    .limit(50)

  // 2) Pacientes que coinciden por DNI, nombre o apellido → sus turnos
  const pats = await supabase
    .from('patients')
    .select('id')
    .is('deleted_at', null)
    .or(`dni.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
    .limit(20)

  let byPatient: Appointment[] = []
  const ids = (pats.data ?? []).map((p) => p.id)
  if (ids.length) {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .is('deleted_at', null)
      .in('patient_id', ids)
      .order('start_time', { ascending: false })
      .limit(50)
    byPatient = data ?? []
  }

  const { data: direct, error } = await directReq
  if (error) throw error

  // Unir y quitar duplicados
  const map = new Map<string, Appointment>()
  for (const a of [...(direct ?? []), ...byPatient]) map.set(a.id, a)
  return Array.from(map.values())
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 50)
}

// Marca que ya se envió el recordatorio de un turno
export async function markReminderSent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// Traduce el error de la constraint de solapamiento a algo legible.
function mapError(error: { message?: string; code?: string }): Error {
  if (
    error.code === '23P01' ||
    error.message?.includes('no_overlap_per_professional')
  ) {
    return new Error('Ese profesional ya tiene un turno en ese horario.')
  }
  return new Error(error.message ?? 'Error al guardar el turno.')
}
