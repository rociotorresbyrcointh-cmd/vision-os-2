// Helpers para enviar mensajes por WhatsApp con un click (sin API).
// Abre WhatsApp (web o app) con el número y el mensaje ya cargados.

// Normaliza un teléfono a solo dígitos (formato que espera wa.me)
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const num = normalizePhone(phone)
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

// ─── Plantillas de mensaje ───────────────────────────────────────
export type WhatsAppTemplate = { id: string; title: string; body: string }

export type ReminderData = {
  clientName: string
  businessName: string
  dateLabel: string   // ej: "lunes 15 de junio"
  timeLabel: string   // ej: "14:30"
  serviceName: string
  professionalName: string
}

// Variables disponibles en las plantillas
export const TEMPLATE_VARS = [
  { key: '{cliente}', desc: 'Nombre del cliente' },
  { key: '{negocio}', desc: 'Nombre del negocio' },
  { key: '{fecha}', desc: 'Fecha del turno' },
  { key: '{hora}', desc: 'Hora del turno' },
  { key: '{servicio}', desc: 'Servicio' },
  { key: '{profesional}', desc: 'Profesional' },
]

// Plantillas por defecto (si el negocio no personalizó las suyas)
export const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'confirmacion',
    title: 'Confirmación',
    body: '¡Hola {cliente}! 👋\n\nTe confirmamos tu turno en *{negocio}*:\n\n📅 {fecha}\n🕐 {hora} hs\n💆 {servicio}\n👤 {profesional}\n\n¡Te esperamos! Si necesitás reprogramar, avisanos. 🙌',
  },
  {
    id: 'recordatorio',
    title: 'Recordatorio (1 día antes)',
    body: '¡Hola {cliente}! 😊\n\nTe recordamos tu turno de mañana en *{negocio}*:\n\n📅 {fecha}\n🕐 {hora} hs\n💆 {servicio}\n\nSi no podés asistir, avisanos así liberamos el lugar. ¡Gracias! 🙏',
  },
  {
    id: 'reprogramar',
    title: 'Reprogramación',
    body: 'Hola {cliente}, necesitamos reprogramar tu turno del {fecha} a las {hora}. ¿Qué otro día te queda cómodo? Disculpá las molestias. 🙏',
  },
  {
    id: 'agradecimiento',
    title: 'Agradecimiento post-turno',
    body: '¡Gracias por tu visita, {cliente}! 💙 Fue un gusto atenderte en {negocio}. ¡Te esperamos pronto!',
  },
]

// Reemplaza las variables de una plantilla con los datos reales
export function renderTemplate(body: string, d: ReminderData): string {
  return body
    .replaceAll('{cliente}', d.clientName)
    .replaceAll('{negocio}', d.businessName)
    .replaceAll('{fecha}', d.dateLabel)
    .replaceAll('{hora}', d.timeLabel)
    .replaceAll('{servicio}', d.serviceName)
    .replaceAll('{profesional}', d.professionalName)
}

// Compat: confirmación con la plantilla por defecto
export function confirmationMessage(d: ReminderData): string {
  return renderTemplate(DEFAULT_TEMPLATES[0].body, d)
}
