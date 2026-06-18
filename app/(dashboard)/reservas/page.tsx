import { createClient } from '@/lib/supabase/server'
import { BookingSettings } from '@/components/booking/BookingSettings'
import { PendingDeposits } from '@/components/booking/PendingDeposits'
import type { Professional, Service } from '@/types/database'

export default async function ReservasPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, public_booking_enabled, deposit_enabled, deposit_amount, deposit_currency')
    .single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').order('created_at'),
    supabase.from('services').select('*').order('created_at'),
  ])

  const deposit = org?.deposit_enabled && org?.deposit_amount != null
    ? { amount: Number(org.deposit_amount), currency: org.deposit_currency ?? 'ARS' }
    : null

  return (
    <div>
      <BookingSettings
        organizationId={org?.id ?? ''}
        initialEnabled={org?.public_booking_enabled ?? false}
      />
      <div style={{ padding: '0 32px 32px' }}>
        <PendingDeposits
          organizationId={org?.id ?? ''}
          deposit={deposit}
          professionals={(professionals as Professional[]) ?? []}
          services={(services as Service[]) ?? []}
        />
      </div>
    </div>
  )
}
