import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types/database'

// Reservas hechas desde el portal público que todavía están sin confirmar (próximas).
export async function listPendingPublicBookings(): Promise<Appointment[]> {
  const supabase = createClient()
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('source', 'public')
    .eq('status', 'pending')
    .is('deleted_at', null)
    .gte('start_time', start.toISOString())
    .order('start_time', { ascending: true })
  if (error) throw error
  return data ?? []
}
