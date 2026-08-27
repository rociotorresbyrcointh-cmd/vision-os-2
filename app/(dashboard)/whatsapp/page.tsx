import { createClient } from '@/lib/supabase/server'
import { WhatsAppSection } from '@/components/whatsapp/WhatsAppSection'
import { resolveTemplates } from '@/services/org-settings'
import { resolveBotConfig } from '@/lib/whatsapp-bot'

export default async function WhatsAppPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, whatsapp_templates')
    .single()

  // Flags y config del bot. Se consultan aparte y con tolerancia: si la
  // migración bot_whatsapp.sql aún no se corrió, no rompe la página.
  let confirmationsEnabled = true
  let botEnabled = false
  let botConfigRaw: unknown = {}
  if (org?.id) {
    const { data: extra } = await supabase
      .from('organizations')
      .select('whatsapp_confirmations_enabled, whatsapp_bot_enabled, whatsapp_bot_config')
      .eq('id', org.id)
      .maybeSingle()
    const e = extra as {
      whatsapp_confirmations_enabled?: boolean
      whatsapp_bot_enabled?: boolean
      whatsapp_bot_config?: unknown
    } | null
    if (e) {
      confirmationsEnabled = e.whatsapp_confirmations_enabled ?? true
      botEnabled = e.whatsapp_bot_enabled ?? false
      botConfigRaw = e.whatsapp_bot_config ?? {}
    }
  }

  return (
    <WhatsAppSection
      organizationId={org?.id ?? ''}
      initialTemplates={resolveTemplates(org?.whatsapp_templates)}
      confirmationsEnabled={confirmationsEnabled}
      botEnabled={botEnabled}
      botConfig={resolveBotConfig(botConfigRaw)}
    />
  )
}
