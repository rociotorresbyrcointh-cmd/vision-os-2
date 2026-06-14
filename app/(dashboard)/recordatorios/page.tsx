import { createClient } from '@/lib/supabase/server'
import { RemindersManager } from '@/components/reminders/RemindersManager'
import { resolveTemplates } from '@/services/org-settings'
import type { Professional, Service } from '@/types/database'

export default async function RecordatoriosPage() {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, whatsapp_templates')
    .single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').order('created_at'),
    supabase.from('services').select('*').order('created_at'),
  ])

  return (
    <RemindersManager
      businessName={org?.name ?? 'nuestro centro'}
      templates={resolveTemplates(org?.whatsapp_templates)}
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
