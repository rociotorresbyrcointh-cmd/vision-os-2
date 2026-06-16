import { createClient } from '@/lib/supabase/server'
import { InicioDashboard } from '@/components/home/InicioDashboard'
import type { Professional, Service } from '@/types/database'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id, name').single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').order('created_at'),
    supabase.from('services').select('*').order('created_at'),
  ])

  return (
    <InicioDashboard
      organizationId={org?.id ?? ''}
      businessName={org?.name ?? 'tu negocio'}
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
