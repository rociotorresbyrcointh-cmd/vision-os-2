import { createClient } from '@/lib/supabase/server'
import { ProfessionalsManager } from '@/components/professionals/ProfessionalsManager'
import type { Professional } from '@/types/database'

export default async function ProfesionalesPage() {
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id, plan').single()
  const { data: professionals } = await supabase
    .from('professionals')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return (
    <ProfessionalsManager
      organizationId={org?.id ?? ''}
      initial={(professionals as Professional[]) ?? []}
      plan={org?.plan ?? 'trial'}
    />
  )
}
