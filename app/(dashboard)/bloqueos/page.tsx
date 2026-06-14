import { createClient } from '@/lib/supabase/server'
import { BlocksManager } from '@/components/blocks/BlocksManager'
import type { Professional, BlockedTime } from '@/types/database'

export default async function BloqueosPage() {
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id').single()
  const [{ data: professionals }, { data: blocks }] = await Promise.all([
    supabase.from('professionals').select('*').eq('is_active', true).order('created_at'),
    supabase.from('blocked_times').select('*').order('start_time', { ascending: true }),
  ])

  return (
    <BlocksManager
      organizationId={org?.id ?? ''}
      professionals={(professionals as Professional[]) ?? []}
      initial={(blocks as BlockedTime[]) ?? []}
    />
  )
}
