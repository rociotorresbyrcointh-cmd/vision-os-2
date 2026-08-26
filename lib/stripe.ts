import Stripe from 'stripe'
import type { PlanId, BillingCycle } from '@/lib/plans'

// Lazy: se crea recién al usarse (en build la key no existe todavía).
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return _stripe
}

// Mapa Plan ↔ Price ID de Stripe (se cargan como variables de entorno en Vercel)
export const PRICE_BY_PLAN: Record<PlanId, string | undefined> = {
  inicial: process.env.STRIPE_PRICE_INICIAL,
  equipo: process.env.STRIPE_PRICE_EQUIPO,
  clinica: process.env.STRIPE_PRICE_CLINICA,
}

// Precios ANUALES (un solo cobro por 10 meses). Requieren crear en Stripe un
// precio anual por plan y cargar estas envs. Si faltan, el checkout anual avisa.
export const PRICE_BY_PLAN_ANNUAL: Record<PlanId, string | undefined> = {
  inicial: process.env.STRIPE_PRICE_INICIAL_ANUAL,
  equipo: process.env.STRIPE_PRICE_EQUIPO_ANUAL,
  clinica: process.env.STRIPE_PRICE_CLINICA_ANUAL,
}

export function stripePriceFor(plan: PlanId, cycle: BillingCycle): string | undefined {
  return cycle === 'annual' ? PRICE_BY_PLAN_ANNUAL[plan] : PRICE_BY_PLAN[plan]
}

// Mapa inverso Price ID → Plan (para el webhook; cubre mensual y anual)
export function planByPrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null
  const all = { ...PRICE_BY_PLAN, ...PRICE_BY_PLAN_ANNUAL }
  const entry = (Object.entries(all) as [PlanId, string | undefined][])
    .find(([, pid]) => pid === priceId)
  return entry ? entry[0] : null
}
