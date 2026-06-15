import { createClient } from '@/lib/supabase/client'
import type { Professional } from '@/types/database'

// Capa de datos de profesionales. Usa el cliente de navegador;
// RLS garantiza que solo se accede a la organización del usuario.

export type ProfessionalInput = {
  name: string
  specialty: string | null
  color: string
  hours_start: string
  hours_end: string
  days_of_week: number[]
  max_capacity_per_hour: number
  is_resource: boolean
}

export async function listProfessionals(): Promise<Professional[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createProfessional(
  organizationId: string,
  input: ProfessionalInput
): Promise<Professional> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('professionals')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfessional(
  id: string,
  input: Partial<ProfessionalInput>
): Promise<Professional> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('professionals')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProfessional(id: string): Promise<void> {
  const supabase = createClient()
  // Borrado lógico: marcamos inactivo para no romper turnos históricos.
  const { error } = await supabase
    .from('professionals')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

export async function listDeletedProfessionals(): Promise<Professional[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('is_active', false)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function restoreProfessional(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('professionals').update({ is_active: true }).eq('id', id)
  if (error) throw error
}

export async function hardDeleteProfessional(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('professionals').delete().eq('id', id)
  if (error) throw error
}
