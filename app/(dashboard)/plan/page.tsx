import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/role-server'
import { PlanManager } from '@/components/plan/PlanManager'

export default async function PlanPage() {
  await requireRole(['owner'])
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id, plan').single()
  const { count } = await supabase
    .from('professionals')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <PlanManager
      organizationId={org?.id ?? ''}
      currentPlan={org?.plan ?? 'trial'}
      professionalCount={count ?? 0}
    />
  )
}
