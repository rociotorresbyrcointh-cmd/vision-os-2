import { createClient } from '@/lib/supabase/server'
import { ConfigManager } from '@/components/config/ConfigManager'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, phone, address, hours_note, clinical_history_enabled')
    .single()

  return (
    <ConfigManager
      organizationId={org?.id ?? ''}
      clinicalEnabled={org?.clinical_history_enabled ?? false}
      orgData={{
        name: org?.name ?? '',
        phone: org?.phone ?? null,
        address: org?.address ?? null,
        hours_note: org?.hours_note ?? null,
      }}
    />
  )
}
