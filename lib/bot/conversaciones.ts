import { createAdminClient } from '@/lib/supabase/admin'

export type Turno = { papel: 'usuario' | 'asistente'; texto: string }

const TURNOS_RECORDADOS = 16
const HORAS_DE_VIDA = 48

// Lee la charla previa con una clienta, dentro de un negocio (org).
export async function leerConversacion(
  organizationId: string,
  telefono: string,
): Promise<{ turnos: Turno[]; ultimoMensajeId: string | null }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('conversaciones_bot')
    .select('turnos, ultimo_mensaje_id, actualizado_en')
    .eq('organization_id', organizationId)
    .eq('telefono', telefono)
    .maybeSingle<{ turnos: Turno[] | null; ultimo_mensaje_id: string | null; actualizado_en: string | null }>()

  if (error) { console.error('[bot] No se pudo leer la conversación:', error.message); return { turnos: [], ultimoMensajeId: null } }
  if (!data) return { turnos: [], ultimoMensajeId: null }

  if (data.actualizado_en) {
    const horas = (Date.now() - new Date(data.actualizado_en).getTime()) / 3_600_000
    if (horas > HORAS_DE_VIDA) return { turnos: [], ultimoMensajeId: data.ultimo_mensaje_id }
  }
  return { turnos: Array.isArray(data.turnos) ? data.turnos : [], ultimoMensajeId: data.ultimo_mensaje_id }
}

export async function guardarConversacion(
  organizationId: string,
  telefono: string,
  turnos: Turno[],
  ultimoMensajeId: string,
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('conversaciones_bot').upsert(
    {
      organization_id: organizationId,
      telefono,
      turnos: turnos.slice(-TURNOS_RECORDADOS),
      ultimo_mensaje_id: ultimoMensajeId,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'organization_id,telefono' },
  )
  if (error) console.error('[bot] No se pudo guardar la conversación:', error.message)
}
