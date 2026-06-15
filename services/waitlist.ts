import { createClient } from '@/lib/supabase/client'

export type WaitStatus = 'esperando' | 'contactado' | 'resuelto'

export type WaitlistEntry = {
  id: string
  organization_id: string
  patient_id: string | null
  client_name: string
  client_phone: string | null
  professional_id: string | null
  service_id: string | null
  note: string | null
  status: WaitStatus
  created_at: string
}

export type WaitlistInput = {
  patient_id: string | null
  client_name: string
  client_phone: string | null
  professional_id: string | null
  service_id: string | null
  note: string | null
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .neq('status', 'resuelto')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addToWaitlist(organizationId: string, input: WaitlistInput): Promise<WaitlistEntry> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setWaitlistStatus(id: string, status: WaitStatus): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('waitlist').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteWaitlistEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('waitlist').delete().eq('id', id)
  if (error) throw error
}
