import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, PRICE_BY_PLAN } from '@/lib/stripe'
import { planById, type PlanId } from '@/lib/plans'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan: PlanId }
  if (!planById(plan)) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

  const priceId = PRICE_BY_PLAN[plan]
  if (!priceId) return NextResponse.json({ error: 'Falta configurar el precio de este plan en Stripe.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Solo el dueño puede suscribir el negocio
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, owner_id, stripe_customer_id')
    .single()
  if (!org || org.owner_id !== user.id) {
    return NextResponse.json({ error: 'Solo el dueño puede gestionar el plan.' }, { status: 403 })
  }

  try {
    const stripe = getStripe()

    // Cliente de Stripe (reutiliza el existente o crea uno nuevo).
    // Si el guardado no existe en este modo (ej. quedó uno de prueba), se regenera.
    let customerId = org.stripe_customer_id as string | null
    if (customerId) {
      try {
        const c = await stripe.customers.retrieve(customerId)
        if ((c as { deleted?: boolean }).deleted) customerId = null
      } catch {
        customerId = null // no existe en este modo (test↔live) → crear uno nuevo
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: org.name ?? undefined,
        metadata: { orgId: org.id },
      })
      customerId = customer.id
      await supabase.from('organizations').update({ stripe_customer_id: customerId }).eq('id', org.id)
    }

    const origin = new URL(request.url).origin
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: org.id,
      metadata: { orgId: org.id, plan },
      subscription_data: { metadata: { orgId: org.id, plan } },
      success_url: `${origin}/plan?success=1`,
      cancel_url: `${origin}/plan?canceled=1`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de Stripe'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
