// Datos del sitio/empresa (fácil de actualizar en un solo lugar)
export const COMPANY = 'Byrcointh LLC'
export const PRODUCT = 'Vision OS'
export const SUPPORT_EMAIL = 'rociotorres@byrcointh.online'
// Si tenés un WhatsApp de soporte, poné el número (con código país, sin +) acá. Vacío = oculto.
export const SUPPORT_WHATSAPP = ''
// Remitente de los emails automáticos (el dominio tiene que estar verificado en Resend).
export const FROM_EMAIL = process.env.RESEND_FROM || 'Vision OS <hola@visionturnos.online>'
