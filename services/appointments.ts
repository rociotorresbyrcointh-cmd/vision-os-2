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

export async function deleteAppointment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
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
    .or(`client_name.ilike.%${q}%,client_phone.ilike.%${q}%`)
    .order('start_time', { ascending: false })
    .limit(50)

  // 2) Pacientes que coinciden por DNI, nombre o apellido → sus turnos
  const pats = await supabase
    .from('patients')
    .select('id')
    .or(`dni.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
    .limit(20)

  let byPatient: Appointment[] = []
  const ids = (pats.data ?? []).map((p) => p.id)
  if (ids.length) {
    const { data } = await supabase
      .from('appointments')
      .select('*')
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
