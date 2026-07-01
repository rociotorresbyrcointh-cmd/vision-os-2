import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, planByPrice } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { planById, type PlanId } from '@/lib/plans'
import { sendSubscriptionActiveEmail, sendPaymentFailedEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Stripe necesita el cuerpo crudo para verificar la firma.
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event
  try {
    if (!sig || !secret) throw new Error('Falta firma o secret')
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    return NextResponse.json({ error: `Firma inválida: ${err instanceof Error ? err.message : ''}` }, { status: 400 })
  }

  const admin = createAdminClient()

  // Asigna un plan a la organización dueña de un customer de Stripe
  async function setPlanForCustomer(customerId: string, plan: string, subId: string | null, status: string) {
    await admin
      .from('organizations')
      .update({ plan, stripe_subscription_id: subId, plan_status: status })
      .eq('stripe_customer_id', customerId)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const plan = (s.metadata?.plan as PlanId) ?? null
        if (s.customer && plan) {
          await setPlanForCustomer(String(s.customer), plan, s.subscription ? String(s.subscription) : null, 'active')
          const email = s.customer_details?.email
          if (email) await sendSubscriptionActiveEmail(email, planById(plan)?.name ?? plan)
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price?.id
        const plan = (sub.metadata?.plan as PlanId) ?? planByPrice(priceId)
        // Damos período de gracia si el pago falla (past_due): no bajamos el plan,
        // solo marcamos el estado para avisar. Se baja recién si se cancela/vence.
        const keepAccess = ['active', 'trialing', 'past_due'].includes(sub.status)
        if (sub.customer && plan) {
          await setPlanForCustomer(String(sub.customer), keepAccess ? plan : 'trial', sub.id, sub.status)
        }
        // Aviso de pago fallido
        if (sub.status === 'past_due' && sub.customer) {
          try {
            const cust = await getStripe().customers.retrieve(String(sub.customer))
            const email = (cust as { email?: string }).email
            if (email) await sendPaymentFailedEmail(email)
          } catch { /* ignorar */ }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        if (sub.customer) {
          // Suscripción cancelada → vuelve a prueba (sin plan pago)
          await setPlanForCustomer(String(sub.customer), 'trial', null, 'canceled')
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
