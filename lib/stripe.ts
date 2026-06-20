import Stripe from 'stripe'
import type { PlanId } from '@/lib/plans'

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

// Mapa inverso Price ID → Plan (para el webhook)
export function planByPrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null
  const entry = (Object.entries(PRICE_BY_PLAN) as [PlanId, string | undefined][])
    .find(([, pid]) => pid === priceId)
  return entry ? entry[0] : null
}
