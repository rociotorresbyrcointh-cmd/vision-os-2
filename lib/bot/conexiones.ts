import { createAdminClient } from '@/lib/supabase/admin'

export type Conexion = {
  phoneNumberId: string
  organizationId: string
  token: string
  displayNumber: string | null
}

// Busca a qué negocio pertenece un número (por el phone_number_id que manda
// Meta en cada webhook) y trae su token para poder responder.
export async function conexionPorPhoneId(phoneNumberId: string): Promise<Conexion | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('whatsapp_conexiones')
    .select('phone_number_id, organization_id, access_token, display_number')
    .eq('phone_number_id', phoneNumberId)
    .maybeSingle<{
      phone_number_id: string
      organization_id: string
      access_token: string
      display_number: string | null
    }>()

  if (error) { console.error('[bot] No se pudo leer la conexión:', error.message); return null }
  if (!data) return null
  return {
    phoneNumberId: data.phone_number_id,
    organizationId: data.organization_id,
    token: data.access_token,
    displayNumber: data.display_number,
  }
}
