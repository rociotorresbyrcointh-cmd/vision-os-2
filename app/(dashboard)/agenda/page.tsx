import { createClient } from '@/lib/supabase/server'
import { CalendarContainer } from '@/components/calendar/CalendarContainer'
import { resolveTemplates } from '@/services/org-settings'
import type { Professional, Service } from '@/types/database'

export default async function AgendaPage() {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, whatsapp_templates')
    .single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').eq('is_active', true).order('created_at'),
    supabase.from('services').select('*').eq('is_active', true).order('created_at'),
  ])

  return (
    <CalendarContainer
      organizationId={org?.id ?? ''}
      businessName={org?.name ?? 'nuestro centro'}
      whatsappTemplates={resolveTemplates(org?.whatsapp_templates)}
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
