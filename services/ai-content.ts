import { createClient } from '@/lib/supabase/client'

export type SavedContent = {
  id: string
  organization_id: string
  kind: string
  content: string
  created_at: string
}

export async function saveContent(
  organizationId: string,
  kind: string,
  content: string
): Promise<SavedContent> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_content')
    .insert([{ organization_id: organizationId, kind, content }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listSavedContent(): Promise<SavedContent[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_content')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteSavedContent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('ai_content').delete().eq('id', id)
  if (error) throw error
}
