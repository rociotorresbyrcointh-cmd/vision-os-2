import { createClient } from '@/lib/supabase/server'
import { InicioDashboard } from '@/components/home/InicioDashboard'
import type { Professional, Service } from '@/types/database'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, logo_url, public_booking_enabled')
    .single()
  const [{ data: professionals }, { data: services }, { count: apptCount }] = await Promise.all([
    supabase.from('professionals').select('*').order('created_at'),
    supabase.from('services').select('*').order('created_at'),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const professionalsList = (professionals as Professional[]) ?? []
  const servicesList = (services as Service[]) ?? []

  return (
    <InicioDashboard
      organizationId={org?.id ?? ''}
      businessName={org?.name ?? 'tu negocio'}
      professionals={professionalsList}
      services={servicesList}
      setup={{
        hasProf: professionalsList.length > 0,
        hasSvc: servicesList.length > 0,
        hasAppt: (apptCount ?? 0) > 0,
        bookingOn: !!org?.public_booking_enabled,
        hasLogo: !!org?.logo_url,
      }}
    />
  )
}
