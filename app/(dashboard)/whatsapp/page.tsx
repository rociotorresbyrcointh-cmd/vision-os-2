import { createClient } from '@/lib/supabase/server'
import { WhatsAppManager } from '@/components/whatsapp/WhatsAppManager'
import { resolveTemplates } from '@/services/org-settings'

export default async function WhatsAppPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, whatsapp_templates')
    .single()

  return (
    <WhatsAppManager
      organizationId={org?.id ?? ''}
      initial={resolveTemplates(org?.whatsapp_templates)}
    />
  )
}
