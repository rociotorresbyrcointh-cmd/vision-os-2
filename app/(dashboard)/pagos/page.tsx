import { createClient } from '@/lib/supabase/server'
import { PaymentsManager } from '@/components/payments/PaymentsManager'
import { requireRole } from '@/lib/auth/role-server'

export default async function PagosPage() {
  await requireRole(['owner', 'admin'])
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').single()

  return <PaymentsManager organizationId={org?.id ?? ''} />
}
