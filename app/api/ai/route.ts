import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { Brand } from '@/services/org-settings'

export const runtime = 'nodejs'
export const maxDuration = 60

// Modelo: Haiku 4.5 — económico y rápido, ideal para generar contenido.
// Para más calidad se puede cambiar a 'claude-sonnet-4-6' o 'claude-opus-4-8'.
const MODEL = 'claude-haiku-4-5'

const SYSTEM = `Sos un experto en marketing de redes sociales (Instagram) para pequeños negocios de servicios en Argentina.
Escribís en español rioplatense (vos), claro, cálido y accionable. Nada de relleno ni explicaciones largas.
Tu objetivo es ayudar al dueño del negocio a publicar contenido que atraiga clientes y los lleve a reservar turnos.
Devolvés todo listo para copiar y pegar. Usás emojis con moderación y buen gusto.`

function brandBlock(b: Brand): string {
  const lines = [
    `- Nombre: ${b.name || 'sin especificar'}`,
    `- Rubro: ${b.rubro || 'sin especificar'}`,
    `- Qué ofrece: ${b.description || 'sin especificar'}`,
    b.services && `- Servicios/productos principales: ${b.services}`,
    `- Público objetivo: ${b.audience || 'sin especificar'}`,
    b.city && `- Ciudad/zona: ${b.city}`,
    b.differentiator && `- Lo que lo hace diferente: ${b.differentiator}`,
    b.goal && `- Objetivo en redes: ${b.goal}`,
    `- Tono: ${b.tone}`,
    b.extra && `- Info adicional importante: ${b.extra}`,
  ].filter(Boolean)
  return 'DATOS DE LA MARCA:\n' + lines.join('\n')
}

function buildPrompt(kind: string, b: Brand, input: string): string {
  const base = brandBlock(b)
  if (kind === 'ideas') {
    return `${base}

Generá 6 ideas de publicaciones para Instagram, originales y específicas para este negocio (no genéricas).
Para CADA idea usá exactamente este formato:

**[número]. [Título corto con un emoji]**
📝 Caption: [el texto completo listo para publicar, en el tono de la marca, terminando con un llamado a la acción para reservar]
💡 Tip: [un consejo breve y concreto para esa publicación]

Separá cada idea con una línea en blanco.`
  }
  if (kind === 'calendario') {
    return `${base}

Armá un calendario de contenido para una semana (Lunes a Domingo) para Instagram.
Para cada día indicá: el tipo de contenido y un título/tema concreto y específico para este negocio.
Variá los formatos (educativo, promoción, testimonio, detrás de escena, interacción, etc.).
Formato:

**Lunes** — [tipo]: [tema concreto]
**Martes** — ...
(y así hasta el Domingo)

Al final agregá una línea con: "🎯 Recordá: poné siempre el link de reservas en la bio."`
  }
  // analisis
  return `${base}

El dueño describe así su perfil de Instagram actual:
"""
${input || '(no describió nada)'}
"""

Hacé un análisis profesional y devolvé:
1. **Lo que está bien** (2-3 puntos)
2. **Lo que hay que mejorar** (3-5 puntos concretos y accionables)
3. **3 acciones para esta semana** (pasos simples y específicos)

Sé directo y práctico. Enfocá todo en conseguir más clientes/reservas.`
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Falta configurar la clave de IA (ANTHROPIC_API_KEY).' },
      { status: 503 }
    )
  }

  let body: { kind?: string; brand?: Brand; input?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }) }

  const { kind, brand, input } = body
  if (!kind || !brand) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(kind, brand, input ?? '') }],
    })
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error al generar el contenido.' }, { status: 500 })
  }
}
