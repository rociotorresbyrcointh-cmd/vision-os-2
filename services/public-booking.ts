import { createClient } from '@/lib/supabase/client'

export type PublicService = { id: string; name: string; duration_minutes: number; price: number }
export type PublicProfessional = {
  id: string; name: string; color: string
  days_of_week: number[]; hours_start: string; hours_end: string
}
export type PublicDeposit = { amount: number; currency: string; link: string | null; note: string | null }
export type PublicInfo =
  | { enabled: false }
  | { enabled: true; name: string; logo?: string | null; deposit?: PublicDeposit | null; services: PublicService[]; professionals: PublicProfessional[] }

export type BusyInterval = { start_time: string; end_time: string }
export type PublicBlock = {
  id: string; professional_id: string | null; title: string
  start_time: string; end_time: string; recurring_rule: unknown
}

export async function getPublicInfo(orgId: string): Promise<PublicInfo> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('public_booking_info', { p_org: orgId })
  if (error) throw error
  return (data ?? { enabled: false }) as PublicInfo
}

export async function getBusy(orgId: string, profId: string, fromISO: string, toISO: string): Promise<BusyInterval[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('public_busy', {
    p_org: orgId, p_prof: profId, p_from: fromISO, p_to: toISO,
  })
  if (error) throw error
  return (data ?? []) as BusyInterval[]
}

export async function getPublicBlocks(orgId: string): Promise<PublicBlock[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('public_blocks', { p_org: orgId })
  if (error) throw error
  return (data ?? []) as PublicBlock[]
}

export async function bookPublic(args: {
  orgId: string; profId: string; serviceId: string
  name: string; phone: string; startISO: string; endISO: string
}): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('public_book', {
    p_org: args.orgId, p_prof: args.profId, p_service: args.serviceId,
    p_name: args.name, p_phone: args.phone, p_start: args.startISO, p_end: args.endISO,
  })
  if (error) throw error
  return data as string
}

// Habilitar/deshabilitar reservas (lo usa el dueño desde el dashboard)
export async function setPublicBooking(orgId: string, enabled: boolean): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ public_booking_enabled: enabled })
    .eq('id', orgId)
  if (error) throw error
}
