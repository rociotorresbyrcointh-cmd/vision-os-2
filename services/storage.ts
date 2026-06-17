import { createClient } from '@/lib/supabase/client'

// Sube el logo del negocio al Storage y devuelve su URL pública.
export async function uploadLogo(orgId: string, file: File): Promise<string> {
  const supabase = createClient()
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${orgId}/logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw error
  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

// Guarda (o quita) la URL del logo en el negocio.
export async function setLogoUrl(orgId: string, url: string | null): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('organizations').update({ logo_url: url }).eq('id', orgId)
  if (error) throw error
}
