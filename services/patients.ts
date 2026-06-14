import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/types/database'

export type PatientInput = {
  first_name: string
  last_name: string | null
  dni: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  date_of_birth: string | null
  health_insurance: string | null
  membership_number: string | null
  notes: string | null
}

export function fullName(p: Patient): string {
  return [p.first_name, p.last_name].filter(Boolean).join(' ')
}

export async function listPatients(): Promise<Patient[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('first_name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Búsqueda por nombre/apellido para el autocompletado del turno
export async function searchPatients(query: string): Promise<Patient[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,dni.ilike.%${q}%`)
    .limit(6)
  if (error) throw error
  return data ?? []
}

export async function createPatient(
  organizationId: string,
  input: PatientInput
): Promise<Patient> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(
  id: string,
  input: Partial<PatientInput>
): Promise<Patient> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePatient(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
}

// Turnos de un paciente (para su ficha / historial)
export async function listPatientAppointments(patientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('start_time', { ascending: false })
  if (error) throw error
  return data ?? []
}
