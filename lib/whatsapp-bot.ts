// Configuración del bot de WhatsApp de cada negocio (multi-tenant).
// Se guarda en organizations.whatsapp_bot_config (jsonb). Con estas respuestas
// + los datos que la app ya tiene (servicios, precios, horarios, link de
// reservas) se arman las instrucciones del bot en la Fase 2.

export type BotTone = 'cercano' | 'neutro' | 'formal'
export type BotBookingMode = 'agendar' | 'link'

export type BotFaq = { q: string; a: string }

export type BotConfig = {
  tone: BotTone
  faqs: BotFaq[]
  avoid: string        // qué NO debe prometer/decir el bot
  address: string      // dirección / cómo llegar
  bookingMode: BotBookingMode  // agenda el turno directo, o solo pasa el link
  extraInfo: string    // cualquier cosa extra que el negocio quiera aclarar
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
  tone: 'cercano',
  faqs: [],
  avoid: '',
  address: '',
  bookingMode: 'agendar',
  extraInfo: '',
}

// Normaliza lo que venga de la DB (jsonb) a un BotConfig completo.
export function resolveBotConfig(raw: unknown): BotConfig {
  const c = (raw ?? {}) as Partial<BotConfig>
  return {
    tone: c.tone === 'formal' || c.tone === 'neutro' ? c.tone : 'cercano',
    faqs: Array.isArray(c.faqs) ? c.faqs.filter((f) => f && typeof f.q === 'string') : [],
    avoid: typeof c.avoid === 'string' ? c.avoid : '',
    address: typeof c.address === 'string' ? c.address : '',
    bookingMode: c.bookingMode === 'link' ? 'link' : 'agendar',
    extraInfo: typeof c.extraInfo === 'string' ? c.extraInfo : '',
  }
}
