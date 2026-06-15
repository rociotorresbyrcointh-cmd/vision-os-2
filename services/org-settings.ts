import { createClient } from '@/lib/supabase/client'
import { DEFAULT_TEMPLATES, type WhatsAppTemplate } from '@/lib/whatsapp'

// Devuelve las plantillas guardadas o las por defecto si no hay ninguna
export function resolveTemplates(raw: unknown): WhatsAppTemplate[] {
  if (Array.isArray(raw) && raw.length) return raw as WhatsAppTemplate[]
  return DEFAULT_TEMPLATES
}

export type OrgData = {
  name: string
  phone: string | null
  address: string | null
  hours_note: string | null
}

// Guardar los datos editables del negocio
export async function saveOrgData(organizationId: string, data: OrgData): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', organizationId)
  if (error) throw error
}

// ─── Marca (Brand Kit) ───────────────────────────────────────────
export type Brand = {
  name: string
  description: string
  rubro: string
  tone: 'cercano' | 'profesional' | 'divertido'
  audience: string
  color: string
  instagram: string
  facebook: string
}

export const EMPTY_BRAND: Brand = {
  name: '', description: '', rubro: '', tone: 'cercano',
  audience: '', color: '#2563FF', instagram: '', facebook: '',
}

export function resolveBrand(raw: unknown): Brand {
  if (raw && typeof raw === 'object') return { ...EMPTY_BRAND, ...(raw as Partial<Brand>) }
  return EMPTY_BRAND
}

export async function saveBrand(organizationId: string, brand: Brand): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('organizations').update({ brand }).eq('id', organizationId)
  if (error) throw error
}

// Activar/desactivar una feature booleana del negocio (ej: historia clínica, redes)
export async function setOrgFlag(
  organizationId: string,
  field: 'clinical_history_enabled' | 'social_enabled',
  value: boolean
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ [field]: value })
    .eq('id', organizationId)
  if (error) throw error
}

export async function saveTemplates(
  organizationId: string,
  templates: WhatsAppTemplate[]
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('organizations')
    .update({ whatsapp_templates: templates })
    .eq('id', organizationId)
  if (error) throw error
}
