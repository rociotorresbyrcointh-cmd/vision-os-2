import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database'

export type ServiceInput = {
  name: string
  duration_minutes: number
  price: number
  description: string | null
  color: string | null
}

export async function createService(
  organizationId: string,
  input: ServiceInput
): Promise<Service> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('services')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateService(
  id: string,
  input: Partial<ServiceInput>
): Promise<Service> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('services')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteService(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}
