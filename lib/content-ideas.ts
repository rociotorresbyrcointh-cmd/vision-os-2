import type { Brand } from '@/services/org-settings'

export type ContentIdea = { title: string; caption: string; tip: string }

const TONE_OPEN: Record<Brand['tone'], string> = {
  cercano: '¡Hola! 😊',
  profesional: 'En {name} sabemos que',
  divertido: '¿Listos para esto? 🙌',
}

function fill(text: string, b: Brand): string {
  const name = b.name.trim() || 'tu negocio'
  const rubro = b.rubro.trim() || 'lo que hacemos'
  const audience = b.audience.trim() || 'vos'
  return text.replaceAll('{name}', name).replaceAll('{rubro}', rubro).replaceAll('{audience}', audience)
}

// Ideas base que sirven a cualquier negocio de servicios, personalizadas con la marca
export function generateIdeas(b: Brand): ContentIdea[] {
  const open = TONE_OPEN[b.tone]
  const ideas: { title: string; caption: string; tip: string }[] = [
    {
      title: '✨ Antes y después',
      caption: `${open} Mirá este antes y después en {name}. Resultados reales que hablan por sí solos. 💪 ¿Querés el tuyo? Reservá por el link de la bio.`,
      tip: 'Las transformaciones son lo que más se comparte. Sacá fotos con buena luz y mismo ángulo.',
    },
    {
      title: '👋 Presentá a tu equipo',
      caption: `Detrás de {name} hay personas que aman lo que hacen. Te presentamos a quien te va a atender. 💙`,
      tip: 'La gente reserva con personas, no con logos. Mostrar las caras genera confianza.',
    },
    {
      title: '⭐ Testimonio de cliente',
      caption: `Nada nos hace más felices que esto 🥹 Gracias por confiar en {name}. Tu opinión es nuestro mejor premio.`,
      tip: 'Pedí a tus clientes una frase corta y subila con una foto (con su permiso) o como texto lindo.',
    },
    {
      title: '💡 Tip útil de {rubro}',
      caption: `${open} Un consejo de {rubro} que te va a servir: [escribí tu tip]. Guardá este post para no olvidarlo. 📌`,
      tip: 'Enseñar algo gratis posiciona a {name} como experto y suma seguidores que después reservan.',
    },
    {
      title: '📅 Invitá a reservar',
      caption: `¿Sabías que podés reservar tu turno en {name} en 1 minuto y sin llamar? 📲 El link está en la bio. ¡Te esperamos!`,
      tip: 'Recordales seguido que pueden reservar online. Poné el link en la bio y en los stories destacados.',
    },
    {
      title: '🎬 Detrás de escena',
      caption: `Así es un día en {name} 🎬 Te mostramos cómo preparamos todo para que tu experiencia sea perfecta.`,
      tip: 'Los videos cortos (reels) de "detrás de escena" funcionan muy bien y son fáciles de hacer.',
    },
    {
      title: '❓ Preguntá a tu comunidad',
      caption: `Queremos saber: ¿qué es lo que más te gusta de venir a {name}? 👇 Contanos en los comentarios.`,
      tip: 'Las preguntas disparan comentarios, y eso hace que el algoritmo muestre más tu cuenta.',
    },
    {
      title: '🚫 Mito vs. realidad de {rubro}',
      caption: `MITO: [escribí un mito común de {rubro}] ❌\nREALIDAD: [la verdad] ✅\nEn {name} te asesoramos bien.`,
      tip: 'Derribar mitos demuestra conocimiento y suele generar mucho guardado y compartido.',
    },
    {
      title: '🎁 Promo o beneficio',
      caption: `${open} Tenemos algo para {audience} 🎁 [escribí tu promo]. Válido hasta [fecha]. Reservá por el link de la bio.`,
      tip: 'Poné siempre una fecha límite: la urgencia hace que la gente reserve ahora y no "después".',
    },
    {
      title: '🌟 Servicio destacado',
      caption: `Hoy te contamos sobre uno de nuestros servicios estrella en {name} ⭐ [nombre del servicio]: [para qué sirve / beneficios].`,
      tip: 'Dedicá un post a cada servicio. Explicá el beneficio para el cliente, no solo qué es.',
    },
  ]
  return ideas.map((i) => ({ title: i.title, caption: fill(i.caption, b), tip: fill(i.tip, b) }))
}

// Sugerencia simple de hashtags según el rubro y la ciudad/zona (texto libre)
export function suggestHashtags(b: Brand): string {
  const base = (b.rubro || 'servicios').toLowerCase().replace(/[^a-záéíóúñ ]/gi, '').split(' ').filter(Boolean)
  const tags = new Set<string>()
  base.forEach((w) => tags.add('#' + w))
  ;['#turnos', '#reservaonline', '#emprendimiento', '#' + (b.name || 'minegocio').toLowerCase().replace(/\s+/g, '')]
    .forEach((t) => tags.add(t))
  return Array.from(tags).slice(0, 8).join(' ')
}
