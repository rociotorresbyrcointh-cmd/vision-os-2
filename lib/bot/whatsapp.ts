// Hablar con la API de WhatsApp (Cloud API), multi-tenant: cada mensaje sale
// con el token del negocio dueño del número, no de una variable global.

const GRAPH = 'https://graph.facebook.com/v21.0'

export type MensajeEntrante = {
  phoneNumberId: string  // el número que RECIBIÓ el mensaje → identifica al negocio
  telefono: string       // el de la clienta que escribe
  nombre: string
  texto: string
  idMensaje: string
  tieneTexto: boolean
}

// Saca el mensaje de la estructura (muy anidada) de Meta. Devuelve null cuando
// no es un mensaje de una persona (Meta manda por acá los "entregado"/"leído").
export function leerMensaje(cuerpo: unknown): MensajeEntrante | null {
  const entrada = cuerpo as Record<string, any>
  const value = entrada?.entry?.[0]?.changes?.[0]?.value
  const mensaje = value?.messages?.[0]
  const phoneNumberId = value?.metadata?.phone_number_id
  if (!mensaje?.from || !phoneNumberId) return null

  const texto =
    mensaje.text?.body ??
    mensaje.interactive?.button_reply?.title ??
    mensaje.interactive?.list_reply?.title ??
    mensaje.button?.text ??
    null

  return {
    phoneNumberId: String(phoneNumberId),
    telefono: String(mensaje.from),
    nombre: value?.contacts?.[0]?.profile?.name ?? 'alguien',
    texto: typeof texto === 'string' ? texto.trim() : '',
    idMensaje: String(mensaje.id ?? ''),
    tieneTexto: typeof texto === 'string' && texto.trim().length > 0,
  }
}

// Variantes de un número argentino para el envío. En producción el wa_id
// (549…) funciona directo; algunos números de PRUEBA de Meta quedan
// autorizados en el formato viejo (54 + área + 15 + número). Probamos
// variantes solo si Meta rechaza por "no está en la lista" (131030).
function variantesArgentina(to: string): string[] {
  const v: string[] = [to]
  const d = to.replace(/\D/g, '')
  if (d.startsWith('549') && d.length === 13) {
    const nac = d.slice(3) // 10 dígitos: área + número (sin el 9)
    v.push('54' + nac) // sin el 9
    for (const areaLen of [2, 3, 4]) {
      const area = nac.slice(0, areaLen)
      const num = nac.slice(areaLen)
      if (num.length >= 6) v.push('54' + area + '15' + num) // con "15"
    }
  }
  return [...new Set(v)]
}

async function intentarEnvio(
  cx: { phoneNumberId: string; token: string },
  to: string,
  texto: string,
): Promise<{ ok: boolean; code?: number }> {
  const res = await fetch(`${GRAPH}/${cx.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cx.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: texto, preview_url: true },
    }),
  })
  if (res.ok) return { ok: true }
  const cuerpo = await res.text().catch(() => '')
  let code: number | undefined
  try { code = JSON.parse(cuerpo)?.error?.code } catch { /* */ }
  console.error('[bot] No se pudo enviar:', res.status, cuerpo)
  return { ok: false, code }
}

// Manda un texto con el token y número del negocio. Devuelve si salió bien
// (no lanza: un fallo al escribir no debe tumbar el webhook).
export async function enviarTexto(
  cx: { phoneNumberId: string; token: string },
  telefono: string,
  texto: string,
): Promise<boolean> {
  const variantes = variantesArgentina(telefono)
  for (const [i, to] of variantes.entries()) {
    const r = await intentarEnvio(cx, to, texto)
    if (r.ok) return true
    // Solo seguimos probando otras variantes si fue "no está en la lista".
    if (r.code !== 131030 || i === variantes.length - 1) return false
  }
  return false
}

const MAX_TROZOS = 3
const LARGO_MAXIMO = 4000

// Parte la respuesta en varios mensajes cuando la IA separó ideas con líneas
// en blanco: se parece más a cómo escribe una persona que un ladrillo.
export function partir(texto: string): string[] {
  const limpio = texto.trim()
  if (!limpio) return []
  const parrafos = limpio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  if (parrafos.length > 1 && parrafos.length <= MAX_TROZOS) {
    return parrafos.map((p) => p.slice(0, LARGO_MAXIMO))
  }
  return [limpio.slice(0, LARGO_MAXIMO)]
}

export async function enviarRespuesta(
  cx: { phoneNumberId: string; token: string },
  telefono: string,
  respuesta: string,
) {
  const trozos = partir(respuesta)
  for (const [i, trozo] of trozos.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 900))
    const bien = await enviarTexto(cx, telefono, trozo)
    if (!bien) break
  }
}
