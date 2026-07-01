import { Resend } from 'resend'
import { SUPPORT_EMAIL, FROM_EMAIL, PRODUCT } from '@/lib/site'

let _resend: Resend | null = null
function client(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

// Envía un email. Si Resend no está configurado, no hace nada (no rompe).
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || !to) return
  try {
    await client().emails.send({ from: FROM_EMAIL, to, replyTo: SUPPORT_EMAIL, subject, html })
  } catch (err) {
    console.error('[email] error enviando:', err)
  }
}

// Plantilla base (email claro, prolijo, con la marca)
function layout(heading: string, bodyHtml: string, ctaText?: string, ctaUrl?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:22px;font-weight:800;letter-spacing:2px;color:#2563FF;">VISION OS</span>
      </div>
      <div style="background:#ffffff;border-radius:14px;padding:32px 28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <h1 style="margin:0 0 14px;font-size:21px;color:#111;">${heading}</h1>
        <div style="font-size:15px;line-height:1.6;color:#444;">${bodyHtml}</div>
        ${ctaText && ctaUrl ? `<div style="text-align:center;margin-top:26px;"><a href="${ctaUrl}" style="display:inline-block;background:#2563FF;color:#fff;text-decoration:none;border-radius:10px;padding:13px 26px;font-size:15px;font-weight:700;">${ctaText}</a></div>` : ''}
      </div>
      <p style="text-align:center;color:#9aa0aa;font-size:12px;margin-top:20px;">
        ¿Necesitás ayuda? Escribinos a <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563FF;">${SUPPORT_EMAIL}</a><br/>
        © ${PRODUCT} · Byrcointh LLC
      </p>
    </div>
  </body></html>`
}

const APP_URL = 'https://visionturnos.online'

export async function sendWelcomeEmail(to: string, businessName: string): Promise<void> {
  await send(
    to,
    `¡Bienvenido a ${PRODUCT}! 🎉`,
    layout(
      `¡Hola${businessName ? `, ${businessName}` : ''}! 👋`,
      `Tu cuenta en <b>${PRODUCT}</b> ya está lista. Tenés <b>14 días gratis</b> para probar todo.<br/><br/>
       Para arrancar, te recomendamos cargar tus <b>profesionales</b> y <b>servicios</b>, y activar tu <b>link de reservas online</b>. La app te guía paso a paso.`,
      'Ir a mi negocio', `${APP_URL}/inicio`,
    ),
  )
}

export async function sendSubscriptionActiveEmail(to: string, planName: string): Promise<void> {
  await send(
    to,
    `Tu suscripción a ${PRODUCT} está activa ✅`,
    layout(
      '¡Gracias por suscribirte! 🎉',
      `Tu plan <b>${planName}</b> ya está activo. Vas a poder seguir usando ${PRODUCT} sin límites.<br/><br/>
       Podés ver o gestionar tu suscripción cuando quieras desde <b>"Mi plan"</b>.`,
      'Ir a mi negocio', `${APP_URL}/inicio`,
    ),
  )
}

export async function sendPaymentFailedEmail(to: string): Promise<void> {
  await send(
    to,
    `Problema con el pago de tu suscripción`,
    layout(
      'No pudimos cobrar tu suscripción ⚠️',
      `Hubo un inconveniente al procesar el pago de tu plan en <b>${PRODUCT}</b>. Para no perder el acceso, actualizá tu método de pago.`,
      'Actualizar pago', `${APP_URL}/plan`,
    ),
  )
}
