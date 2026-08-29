import { createAdminClient } from '@/lib/supabase/admin'
import { resolveBotConfig, type BotConfig } from '@/lib/whatsapp-bot'
import { vocab } from '@/lib/vocab'
import { getServicios, getProfesionales, type Servicio, type Profesional } from '@/lib/bot/reservas'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://visionturnos.online'
const money = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export type ContextoBot = {
  instrucciones: string
  servicios: Servicio[]
  profesionales: Profesional[]
  bookingMode: BotConfig['bookingMode']
  linkReservas: string
}

// Arma las instrucciones del bot de un negocio a partir de sus datos reales
// (servicios, precios, profesionales, horarios) + lo que cargó en el onboarding.
export async function construirContexto(orgId: string): Promise<ContextoBot | null> {
  const supabase = createAdminClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, clinical_history_enabled, whatsapp_bot_config, deposit_enabled, deposit_amount, deposit_currency, deposit_link, deposit_note')
    .eq('id', orgId).single()
  if (!org) return null

  const cfg = resolveBotConfig(org.whatsapp_bot_config)
  const term = vocab(org.clinical_history_enabled ?? false)
  const [servicios, profesionales] = await Promise.all([getServicios(orgId), getProfesionales(orgId)])
  const linkReservas = `${APP_URL}/reservar/${orgId}`

  const tono = cfg.tone === 'formal'
    ? 'Hablás de forma formal y respetuosa (usá "usted").'
    : cfg.tone === 'neutro'
    ? 'Hablás de forma neutra y clara.'
    : 'Hablás de forma cercana y canchera (tuteo argentino), sin exagerar.'

  const listaServicios = servicios.length
    ? servicios.map((s) => `- ${s.name} · ${s.duration_minutes} min${s.price ? ` · ${money(s.price)}` : ''} · id=${s.id}`).join('\n')
    : '(todavía no hay servicios cargados)'
  const listaProfesionales = profesionales.length
    ? profesionales.map((p) => `- ${p.name} · atiende ${(p.days_of_week ?? []).map((d) => DIAS[d]).join(', ') || 'sin días definidos'} de ${p.hours_start.slice(0, 5)} a ${p.hours_end.slice(0, 5)} · id=${p.id}`).join('\n')
    : '(todavía no hay profesionales cargados)'

  const deposito = org.deposit_enabled && org.deposit_amount
    ? `Este negocio pide una seña para confirmar: ${org.deposit_amount} ${org.deposit_currency || 'ARS'}. ${org.deposit_note || ''} ${org.deposit_link ? `Se abona en: ${org.deposit_link}` : ''}`.trim()
    : 'Este negocio no pide seña.'

  const faqs = cfg.faqs.length
    ? cfg.faqs.map((f) => `P: ${f.q}\nR: ${f.a}`).join('\n\n')
    : '(sin preguntas frecuentes cargadas)'

  const comoReserva = cfg.bookingMode === 'agendar'
    ? `Cuando la persona quiera un turno, usá tus herramientas para ver horarios y AGENDARLO vos misma. Pedí: qué servicio, con qué profesional (o "el que haya"), qué día, y su nombre. Confirmá el turno solo después de agendarlo con la herramienta.`
    : `Cuando la persona quiera un turno, NO lo agendes vos: pasale este enlace para que reserve: ${linkReservas}`

  const instrucciones = `Sos la asistente de WhatsApp de "${org.name}". Atendés a las ${term.many} que escriben para consultar y reservar turnos. Tu trabajo es responder dudas con calidez y ayudar a que reserven.

# Cómo hablás
${tono}
Respuestas CORTAS, como en un chat real. Nunca mandes párrafos largos. Un emoji ocasional está bien, sin abusar.

# El negocio
Nombre: ${org.name}

## Servicios (con su duración, precio e id interno)
${listaServicios}

## Profesionales (con sus días, horarios e id interno)
${listaProfesionales}

## Seña
${deposito}

## Cómo se reserva
${comoReserva}

# Preguntas frecuentes de este negocio
${faqs}

${cfg.address ? `# Dirección / cómo llegar\n${cfg.address}\n` : ''}
${cfg.extraInfo ? `# Info extra\n${cfg.extraInfo}\n` : ''}
${cfg.avoid ? `# Qué NO debés hacer nunca\n${cfg.avoid}\n` : ''}

# Reglas que no se rompen
- Nunca inventes precios, servicios, horarios ni disponibilidad: usá solo lo de arriba y tus herramientas.
- Si no sabés algo, decilo con naturalidad y ofrecé que el negocio le confirme.
- No prometas nada que no esté acá.
- Si preguntan por horarios libres, usá la herramienta "verHorarios" antes de responder; no adivines.
- Los "id" internos son para tus herramientas, NUNCA se los muestres a la persona.`

  return { instrucciones, servicios, profesionales, bookingMode: cfg.bookingMode, linkReservas }
}
