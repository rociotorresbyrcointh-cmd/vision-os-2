import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from './role'

export async function getCurrentRole(): Promise<Role> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'staff'
  const { data } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()
  return ((data?.role as Role) ?? 'owner')
}

// Para usar al tope de páginas sensibles: redirige a /inicio si no tiene permiso.
export async function requireRole(allowed: Role[]): Promise<Role> {
  const role = await getCurrentRole()
  if (!allowed.includes(role)) redirect('/inicio')
  return role
}
