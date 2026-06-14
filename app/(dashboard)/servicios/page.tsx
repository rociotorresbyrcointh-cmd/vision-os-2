import { createClient } from '@/lib/supabase/server'
import { ServicesManager } from '@/components/services/ServicesManager'
import type { Service } from '@/types/database'

export default async function ServiciosPage() {
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').single()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return (
    <ServicesManager
      organizationId={org?.id ?? ''}
      initial={(services as Service[]) ?? []}
    />
  )
}
