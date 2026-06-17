import { createClient } from '@/lib/supabase/client'

export type Member = { user_id: string; email: string; role: string; created_at: string }
export type Invite = { id: string; email: string; role: string; created_at: string }

export async function listMembers(): Promise<Member[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_org_members')
  if (error) throw error
  return (data ?? []) as Member[]
}

export async function listInvites(): Promise<Invite[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invitations')
    .select('id, email, role, created_at')
    .order('created_at')
  if (error) throw error
  return (data ?? []) as Invite[]
}

export async function inviteMember(orgId: string, email: string, role: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('invitations')
    .insert({ organization_id: orgId, email: email.toLowerCase().trim(), role })
  if (error) throw error
}

export async function cancelInvite(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('invitations').delete().eq('id', id)
  if (error) throw error
}

export async function changeMemberRole(userId: string, role: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('user_id', userId)
  if (error) throw error
}

export async function removeMember(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('organization_members').delete().eq('user_id', userId)
  if (error) throw error
}
