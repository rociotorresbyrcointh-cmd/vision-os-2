import { createClient } from '@/lib/supabase/client'
import type { ClinicalNote } from '@/types/database'

export async function listNotes(patientId: string): Promise<ClinicalNote[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createNote(
  organizationId: string,
  input: { patient_id: string; appointment_id: string | null; content: string }
): Promise<ClinicalNote> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clinical_notes')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('clinical_notes').delete().eq('id', id)
  if (error) throw error
}
