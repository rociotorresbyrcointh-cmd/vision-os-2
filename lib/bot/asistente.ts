import Anthropic from '@anthropic-ai/sdk'
import type { Turno } from '@/lib/bot/conversaciones'
import type { ContextoBot } from '@/lib/bot/instrucciones'
import { horariosLibres, agendar } from '@/lib/bot/reservas'

const MODELO = 'claude-sonnet-5'
const MAX_TOKENS = 700
const MAX_VUELTAS = 4

export function asistenteConfigurado(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

function herramientas(ctx: ContextoBot): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [
    {
      name: 'verHorarios',
      description: 'Devuelve los horarios de inicio disponibles para un servicio con un profesional en una fecha. Usala SIEMPRE antes de afirmar disponibilidad.',
      input_schema: {
        type: 'object',
        properties: {
          servicioId: { type: 'string', description: 'id interno del servicio' },
          profesionalId: { type: 'string', description: 'id interno del profesional' },
          fecha: { type: 'string', description: 'fecha en formato AAAA-MM-DD' },
        },
        required: ['servicioId', 'profesionalId', 'fecha'],
      },
    },
  ]
  if (ctx.bookingMode === 'agendar') {
    tools.push({
      name: 'agendarTurno',
      description: 'Agenda un turno confirmado. Usala solo después de acordar servicio, profesional, día, hora y el nombre de la persona, y de verificar el horario con verHorarios.',
      input_schema: {
        type: 'object',
        properties: {
          servicioId: { type: 'string' },
          profesionalId: { type: 'string' },
          fecha: { type: 'string', description: 'AAAA-MM-DD' },
          hora: { type: 'string', description: 'HH:MM' },
          nombre: { type: 'string', description: 'nombre de la persona' },
        },
        required: ['servicioId', 'profesionalId', 'fecha', 'hora', 'nombre'],
      },
    })
  }
  return tools
}

async function ejecutar(
  nombre: string, entrada: any, ctx: ContextoBot, orgId: string, telefono: string,
): Promise<string> {
  const servicio = ctx.servicios.find((s) => s.id === entrada?.servicioId)
  const prof = ctx.profesionales.find((p) => p.id === entrada?.profesionalId)
  if (!servicio) return JSON.stringify({ error: 'Servicio no encontrado. Elegí uno de la lista.' })
  if (!prof) return JSON.stringify({ error: 'Profesional no encontrado. Elegí uno de la lista.' })
  const fecha = String(entrada?.fecha ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return JSON.stringify({ error: 'Fecha inválida. Pedila en formato AAAA-MM-DD.' })

  try {
    if (nombre === 'verHorarios') {
      const slots = await horariosLibres(orgId, servicio, prof, fecha)
      return JSON.stringify(slots.length
        ? { disponibles: slots }
        : { disponibles: [], nota: `No hay horarios para ${prof.name} ese día. Ofrecé otra fecha u otro profesional.` })
    }
    if (nombre === 'agendarTurno') {
      const hora = String(entrada?.hora ?? '')
      const nom = String(entrada?.nombre ?? '').trim()
      if (!/^\d{2}:\d{2}$/.test(hora)) return JSON.stringify({ error: 'Hora inválida (HH:MM).' })
      if (!nom) return JSON.stringify({ error: 'Falta el nombre de la persona.' })
      const libres = await horariosLibres(orgId, servicio, prof, fecha)
      if (!libres.includes(hora)) return JSON.stringify({ error: `Ese horario ya no está libre. Disponibles: ${libres.join(', ') || 'ninguno ese día'}.` })
      const r = await agendar({ orgId, servicio, profId: prof.id, fechaKey: fecha, hora, nombre: nom, telefono })
      return JSON.stringify(r.ok
        ? { agendado: true, resumen: `Turno agendado: ${servicio.name} con ${prof.name}, ${fecha} ${hora}. Confirmáselo con calidez.` }
        : { agendado: false, error: 'No se pudo agendar (quizás se ocupó recién). Ofrecé otro horario.' })
    }
  } catch (e) {
    console.error('[bot] Falló herramienta', nombre, e)
    return JSON.stringify({ error: 'No se pudo consultar ahora. No prometas nada y ofrecé reintentar.' })
  }
  return JSON.stringify({ error: 'Herramienta desconocida.' })
}

// Devuelve el texto a enviar, o null si no se pudo generar. Nunca lanza.
export async function responder(
  orgId: string,
  telefono: string,
  turnos: Turno[],
  ctx: ContextoBot,
  hoyKey: string,
): Promise<string | null> {
  const clave = process.env.ANTHROPIC_API_KEY
  if (!clave) { console.error('[bot] Falta ANTHROPIC_API_KEY'); return null }
  const anthropic = new Anthropic({ apiKey: clave })

  const mensajes: Anthropic.MessageParam[] = turnos.map((t) => ({
    role: t.papel === 'usuario' ? 'user' : 'assistant',
    content: t.texto,
  }))
  // La conversación debe terminar en la persona (Sonnet rechaza prefill del asistente).
  while (mensajes.length && mensajes[mensajes.length - 1].role === 'assistant') mensajes.pop()
  if (!mensajes.length) return null

  const sistema: Anthropic.TextBlockParam[] = [
    { type: 'text', text: ctx.instrucciones, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: `Hoy es ${hoyKey} (fecha local del negocio, formato AAAA-MM-DD). Usala para interpretar "hoy", "mañana", etc.` },
  ]
  const tools = herramientas(ctx)

  try {
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const respuesta = await anthropic.messages.create({
        model: MODELO, max_tokens: MAX_TOKENS, system: sistema, tools, messages: mensajes,
      })
      if (respuesta.stop_reason === 'tool_use') {
        const pedidos = respuesta.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
        mensajes.push({ role: 'assistant', content: respuesta.content })
        mensajes.push({
          role: 'user',
          content: await Promise.all(pedidos.map(async (p) => ({
            type: 'tool_result' as const,
            tool_use_id: p.id,
            content: await ejecutar(p.name, p.input, ctx, orgId, telefono),
          }))),
        })
        continue
      }
      const texto = respuesta.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text).join('\n').trim()
      return texto || null
    }
    console.error('[bot] Se agotaron las vueltas de herramientas')
    return null
  } catch (e) {
    console.error('[bot] Claude falló:', e)
    return null
  }
}
