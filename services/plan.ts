import { createClient } from '@/lib/supabase/client'
import type { PlanId } from '@/lib/plans'

// Asigna un plan a la organización. (En el futuro lo hará el webhook de cobro.)
export async function setPlan(organizationId: string, planId: PlanId): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ plan: planId })
    .eq('id', organizationId)
  if (error) throw error
}
