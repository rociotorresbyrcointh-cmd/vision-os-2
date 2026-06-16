import { createClient } from '@/lib/supabase/server'
import { CrecimientoManager } from '@/components/growth/CrecimientoManager'
import { resolveBrand } from '@/services/org-settings'
import type { Professional, Service } from '@/types/database'

export default async function CrecimientoPage() {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id, name, brand').single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').eq('is_active', true).order('created_at'),
    supabase.from('services').select('*').eq('is_active', true).order('created_at'),
  ])

  return (
    <CrecimientoManager
      businessName={org?.name ?? 'tu negocio'}
      brand={resolveBrand(org?.brand)}
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
