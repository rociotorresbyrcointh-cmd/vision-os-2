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

// Activar/desactivar una feature booleana del negocio (ej: historia clínica)
export async function setOrgFlag(
  organizationId: string,
  field: 'clinical_history_enabled',
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
