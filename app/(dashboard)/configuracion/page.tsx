import { createClient } from '@/lib/supabase/server'
import { ConfigManager } from '@/components/config/ConfigManager'
import { requireRole } from '@/lib/auth/role-server'

export default async function ConfiguracionPage() {
  await requireRole(['owner'])
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, phone, address, hours_note, review_link, logo_url, clinical_history_enabled, social_enabled')
    .single()

  return (
    <ConfigManager
      organizationId={org?.id ?? ''}
      clinicalEnabled={org?.clinical_history_enabled ?? false}
      socialEnabled={org?.social_enabled ?? false}
      logoUrl={org?.logo_url ?? null}
      orgData={{
        name: org?.name ?? '',
        phone: org?.phone ?? null,
        address: org?.address ?? null,
        hours_note: org?.hours_note ?? null,
        review_link: org?.review_link ?? null,
      }}
    />
  )
}
