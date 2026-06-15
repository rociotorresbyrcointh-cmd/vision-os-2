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
  switch (kind) {
    case 'ideas':
      return `${base}

Generá 6 ideas de publicaciones para Instagram, originales y específicas para este negocio (no genéricas).
Para CADA idea usá exactamente este formato:

**[número]. [Título corto con un emoji]**
📝 Caption: [el texto completo listo para publicar, en el tono de la marca, terminando con un llamado a la acción para reservar]
💡 Tip: [un consejo breve y concreto para esa publicación]

Separá cada idea con una línea en blanco.`
    case 'calendario':
      return `${base}

Armá un calendario de contenido para una semana (Lunes a Domingo) para Instagram.
Para cada día indicá: el tipo de contenido y un título/tema concreto y específico para este negocio.
Variá los formatos (educativo, promoción, testimonio, detrás de escena, interacción, etc.).
Formato:

**Lunes** — [tipo]: [tema concreto]
**Martes** — ...
(y así hasta el Domingo)

Al final agregá: "🎯 Recordá: poné siempre el link de reservas en la bio."`
    case 'reel':
      return `${base}

Escribí un guión para un Reel de Instagram (15 a 30 segundos) para este negocio.
Estructura:
🎬 **Gancho** (primeros 3 segundos, para que no sigan de largo)
🎥 **Escenas** (paso a paso: qué se muestra en pantalla + qué texto o voz en off)
✅ **Cierre** (llamado a la acción para reservar)
🎵 Sugerencia de tipo de música o audio en tendencia.
Que sea fácil de grabar con un celular.`
    case 'historias':
      return `${base}

Dame 5 ideas de Historias (stories) de Instagram para este negocio, fáciles de hacer y que generen interacción.
Incluí al menos: una encuesta, una caja de preguntas, una cuenta regresiva, un "antes/después" y una con link de reservas.
Para cada una: **[Título]** y una explicación breve de cómo hacerla.`
    case 'bio':
      return `${base}

Escribí 3 opciones de biografía para el perfil de Instagram de este negocio.
Cada una: máximo 150 caracteres, clara, que diga qué ofrece y la ciudad, con un llamado a la acción y emojis con buen gusto.
Numerá las opciones (1, 2, 3) y debajo de cada una poné entre paréntesis la cantidad de caracteres.`
    case 'resena':
      return `${base}

Un cliente escribió este comentario o reseña:
"""
${input || '(vacío)'}
"""

Escribí una respuesta en nombre del negocio: profesional, cálida y breve (2-4 líneas).
Si es positiva, agradecé con calidez. Si es negativa, mostrá empatía, hacete cargo y ofrecé solucionarlo por privado, sin sonar a la defensiva.`
    case 'mejorar':
      return `${base}

Mejorá este texto para redes sociales, manteniendo la idea pero haciéndolo más atractivo y en el tono de la marca:
"""
${input || '(vacío)'}
"""

Devolvé SOLO el texto mejorado, listo para publicar (sin explicaciones).`
    default: // analisis
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
