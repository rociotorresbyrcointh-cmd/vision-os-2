import { after } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { leerMensaje, enviarTexto, enviarRespuesta } from '@/lib/bot/whatsapp'
import { conexionPorPhoneId } from '@/lib/bot/conexiones'
import { leerConversacion, guardarConversacion, type Turno } from '@/lib/bot/conversaciones'
import { construirContexto } from '@/lib/bot/instrucciones'
import { asistenteConfigurado, responder } from '@/lib/bot/asistente'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PEDIR_TEXTO = '¡Hola! 💛 Por acá no me llegan los audios ni las fotos. ¿Me lo escribís? Aunque sea cortito.'
const DISCULPA = 'Uy, se me trabó algo de este lado 🙈 ¿Me lo escribís de nuevo en un minutito?'

// Fecha local del negocio (Argentina), formato AAAA-MM-DD.
function hoyKey(): string {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba', year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return f.format(new Date())
}

// Verificación de Meta al conectar el webhook.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const modo = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const desafio = url.searchParams.get('hub.challenge')
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN
  if (!esperado) return new Response('Sin configurar', { status: 503 })
  if (modo === 'subscribe' && token === esperado && desafio) {
    return new Response(desafio, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('No autorizado', { status: 403 })
}

// DIAGNÓSTICO temporal: registra lo crudo que llega, para depurar la entrega.
async function registrarWebhook(cuerpo: unknown) {
  try {
    const supabase = createAdminClient()
    await supabase.from('bot_webhook_log').insert({ cuerpo })
  } catch (e) { console.error('[bot] No se pudo registrar el webhook:', e) }
}

export async function POST(request: Request) {
  let cuerpo: unknown
  try { cuerpo = await request.json() } catch { return Response.json({ recibido: true }) }

  // Responder 200 ya y trabajar en segundo plano (Meta reintenta si tardás >5s).
  after(async () => {
    await registrarWebhook(cuerpo) // DIAGNÓSTICO temporal
    const mensaje = leerMensaje(cuerpo)
    if (!mensaje) return // avisos "entregado"/"leído"
    try { await atender(mensaje) }
    catch (e) { console.error('[bot] Falló al atender:', e) }
  })
  return Response.json({ recibido: true })
}

async function atender(mensaje: NonNullable<ReturnType<typeof leerMensaje>>) {
  const cx = await conexionPorPhoneId(mensaje.phoneNumberId)
  if (!cx) { console.warn('[bot] Número sin conexión:', mensaje.phoneNumberId); return }

  // ¿El negocio tiene el bot prendido?
  const supabase = createAdminClient()
  const { data: org } = await supabase
    .from('organizations').select('whatsapp_bot_enabled').eq('id', cx.organizationId).single()
  if (!org?.whatsapp_bot_enabled) return

  if (!mensaje.tieneTexto) { await enviarTexto(cx, mensaje.telefono, PEDIR_TEXTO); return }

  const { turnos, ultimoMensajeId } = await leerConversacion(cx.organizationId, mensaje.telefono)
  if (mensaje.idMensaje && ultimoMensajeId === mensaje.idMensaje) return // Meta reintentó

  if (!asistenteConfigurado()) { await enviarTexto(cx, mensaje.telefono, DISCULPA); return }

  const ctx = await construirContexto(cx.organizationId)
  if (!ctx) { await enviarTexto(cx, mensaje.telefono, DISCULPA); return }

  const conElNuevo: Turno[] = [...turnos, { papel: 'usuario', texto: mensaje.texto }]
  const respuesta = await responder(cx.organizationId, mensaje.telefono, conElNuevo, ctx, hoyKey())

  if (!respuesta) {
    await enviarTexto(cx, mensaje.telefono, DISCULPA)
    await guardarConversacion(cx.organizationId, mensaje.telefono, conElNuevo, mensaje.idMensaje)
    return
  }
  await guardarConversacion(
    cx.organizationId, mensaje.telefono,
    [...conElNuevo, { papel: 'asistente', texto: respuesta }], mensaje.idMensaje,
  )
  await enviarRespuesta(cx, mensaje.telefono, respuesta)
}
