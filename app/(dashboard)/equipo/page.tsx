import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/role-server'
import { TeamManager } from '@/components/team/TeamManager'

export default async function EquipoPage() {
  await requireRole(['owner'])
  const supabase = await createClient()
  const [{ data: org }, { data: { user } }] = await Promise.all([
    supabase.from('organizations').select('id').single(),
    supabase.auth.getUser(),
  ])
  return <TeamManager organizationId={org!.id} currentUserId={user!.id} />
}
