import { NextResponse } from 'next/server'
import { preApproval } from '@/lib/mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { planById } from '@/lib/plans'
import { sendSubscriptionActiveEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Mercado Pago avisa por acá cuando cambia una suscripción (preapproval).
// Verificamos consultando el estado real a MP con nuestro token (no confiamos en el body).
export async function POST(request: Request) {
  let id: string | null = null
  let topic: string | null = null
  try {
    const url = new URL(request.url)
    topic = url.searchParams.get('type') ?? url.searchParams.get('topic')
    id = url.searchParams.get('data.id') ?? url.searchParams.get('id')
    if (!id) {
      const body = await request.json().catch(() => null) as { type?: string; data?: { id?: string } } | null
      topic = topic ?? body?.type ?? null
      id = body?.data?.id ?? null
    }
  } catch { /* ignore */ }

  // Solo nos interesan las notificaciones de suscripción
  if (!id || (topic && topic !== 'preapproval' && topic !== 'subscription_preapproval')) {
    return NextResponse.json({ received: true })
  }

  try {
    const pre = await preApproval().get({ id })
    const ref = pre.external_reference ?? ''
    const [orgId, planRaw] = ref.split('|')
    if (!orgId) return NextResponse.json({ received: true })

    const planObj = planById(planRaw)
    const plan = planObj?.id
    const authorized = pre.status === 'authorized'
    const admin = createAdminClient()
    await admin
      .from('organizations')
      .update({
        plan: authorized && plan ? plan : 'trial',
        plan_status: `mp_${pre.status}`,
        mp_preapproval_id: pre.id ?? null,
      })
      .eq('id', orgId)

    // Email de suscripción activa
    if (authorized && planObj) {
      const email = (pre as { payer_email?: string }).payer_email
      if (email) await sendSubscriptionActiveEmail(email, planObj.name)
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
