import { createClient } from '@/lib/supabase/server'
import { BookingSettings } from '@/components/booking/BookingSettings'

export default async function ReservasPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, public_booking_enabled')
    .single()

  return (
    <BookingSettings
      organizationId={org?.id ?? ''}
      initialEnabled={org?.public_booking_enabled ?? false}
    />
  )
}
