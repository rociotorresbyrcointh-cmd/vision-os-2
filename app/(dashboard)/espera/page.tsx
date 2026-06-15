import { createClient } from '@/lib/supabase/server'
import { WaitlistManager } from '@/components/waitlist/WaitlistManager'
import type { Professional, Service } from '@/types/database'

export default async function EsperaPage() {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').single()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').eq('is_active', true).order('created_at'),
    supabase.from('services').select('*').eq('is_active', true).order('created_at'),
  ])

  return (
    <WaitlistManager
      organizationId={org?.id ?? ''}
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
