import { createClient } from '@/lib/supabase/client'
import type { Payment, PaymentMethod, PaymentKind } from '@/types/database'

export type PaymentInput = {
  appointment_id: string | null
  patient_id: string | null
  amount: number
  method: PaymentMethod
  kind: PaymentKind
  notes: string | null
  paid_at: string // ISO
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mercadopago: 'Mercado Pago',
  otro: 'Otro',
}

export async function createPayment(
  organizationId: string,
  input: PaymentInput
): Promise<Payment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePayment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
}

// Pagos de un turno puntual (para la sección "Cobrar" del turno)
export async function listPaymentsByAppointment(appointmentId: string): Promise<Payment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('paid_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Pagos vinculados a un conjunto de turnos (para marcar "pagado" en la agenda)
export async function listPaymentsForAppointments(ids: string[]): Promise<Payment[]> {
  if (!ids.length) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .in('appointment_id', ids)
  if (error) throw error
  return data ?? []
}

// Pagos en un rango [from, to) — para la caja diaria y reportes
export async function listPaymentsBetween(fromISO: string, toISO: string): Promise<Payment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .gte('paid_at', fromISO)
    .lt('paid_at', toISO)
    .order('paid_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
