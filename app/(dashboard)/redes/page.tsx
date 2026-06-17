import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RedesManager } from '@/components/social/RedesManager'
import { resolveBrand } from '@/services/org-settings'
import { requireRole } from '@/lib/auth/role-server'

export default async function RedesPage() {
  await requireRole(['owner'])
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, social_enabled, brand, logo_url')
    .single()

  // Si la función no está activada, no se entra
  if (!org?.social_enabled) redirect('/configuracion')

  return (
    <RedesManager
      organizationId={org.id}
      businessName={org.name}
      initialBrand={resolveBrand(org.brand)}
      logoUrl={org.logo_url ?? null}
    />
  )
}
