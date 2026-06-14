import { createClient } from '@/lib/supabase/server'
import { PaymentsManager } from '@/components/payments/PaymentsManager'

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id').single()

  return <PaymentsManager organizationId={org?.id ?? ''} />
}
