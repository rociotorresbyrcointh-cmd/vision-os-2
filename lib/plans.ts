// Planes de venta de Vision OS (suscripción mensual, USD). El límite es por
// cantidad de profesionales. 'trial' / sin plan = sin límite (para no romper pruebas).

export type PlanId = 'inicial' | 'equipo' | 'clinica'

export type Plan = {
  id: PlanId
  name: string
  maxProf: number
  price: number        // USD/mes (fuente de verdad; Stripe)
  blurb: string
  popular?: boolean
  features: string[]
}

export const EXTRA_PRICE = 15 // USD por profesional extra (más de 10)

// ─── Ciclo de facturación ────────────────────────────────────────
export type BillingCycle = 'monthly' | 'annual'
// El plan anual se paga 10 meses y se usan 12 → 2 meses gratis (~17%).
export const ANNUAL_MONTHS_CHARGED = 10

// Precio en USD según el ciclo (mensual = 1 mes; anual = 10 meses).
export function usdFor(plan: Plan, cycle: BillingCycle): number {
  return cycle === 'annual' ? plan.price * ANNUAL_MONTHS_CHARGED : plan.price
}

// ─── Tipo de cambio USD→ARS (configurable en UN solo lugar) ──────
// Se controla con la env NEXT_PUBLIC_USD_TO_ARS en Vercel. Se cambia un
// número cuando se mueve el dólar y toda la app se actualiza. NO hardcodear
// precios en pesos: se derivan siempre del precio en USD por este tipo de cambio.
export const USD_TO_ARS = Number(process.env.NEXT_PUBLIC_USD_TO_ARS) || 1500

// Convierte USD a ARS y redondea a la centena más cercana (precio "lindo").
export function arsFromUsd(usd: number, rate: number = USD_TO_ARS): number {
  return Math.round((usd * rate) / 100) * 100
}

export const PLANS: Plan[] = [
  {
    id: 'inicial',
    name: 'Inicial',
    maxProf: 1,
    price: 39,
    blurb: '1 profesional',
    features: ['Agenda y turnos', 'Clientes y caja', 'Reservas online', 'Recordatorios'],
  },
  {
    id: 'equipo',
    name: 'Equipo',
    maxProf: 4,
    price: 79,
    blurb: '2 a 4 profesionales',
    popular: true,
    features: ['Todo lo de Inicial', 'Roles y permisos por empleado', 'Redes sociales con IA', 'Crecimiento y reportes'],
  },
  {
    // id interno 'clinica' se mantiene (Stripe/MP/DB); el nombre visible es "Premium".
    id: 'clinica',
    name: 'Premium',
    maxProf: 10,
    price: 149,
    blurb: '5 a 10 profesionales',
    features: ['Todo lo de Equipo', 'Hasta 10 profesionales', 'Soporte prioritario', `Profesional extra +$${EXTRA_PRICE} c/u`],
  },
]

export function planById(id: string | null | undefined): Plan | null {
  return PLANS.find((p) => p.id === id) ?? null
}

// ─── Prueba gratis ───────────────────────────────────────────────
export const TRIAL_DAYS = 14
export type SubState = 'trial' | 'active' | 'cortesia' | 'expired'

// Estado de suscripción de un negocio (a partir de su plan y fecha de alta).
export function subStatus(
  plan: string | null | undefined,
  createdAtISO: string | null | undefined,
  nowMs: number,
): { state: SubState; daysLeft: number } {
  if (isCortesia(plan)) return { state: 'cortesia', daysLeft: 0 }
  if (planById(plan)) return { state: 'active', daysLeft: 0 } // plan pago activo
  // En prueba: 14 días desde el alta. Al cancelar, el plan vuelve a 'trial'.
  const created = createdAtISO ? new Date(createdAtISO).getTime() : nowMs
  const end = created + TRIAL_DAYS * 86400000
  const daysLeft = Math.ceil((end - nowMs) / 86400000)
  return daysLeft > 0 ? { state: 'trial', daysLeft } : { state: 'expired', daysLeft: 0 }
}

// Plan de cortesía: acceso libre y gratuito (se asigna a mano, no se compra).
export function isCortesia(planId: string | null | undefined): boolean {
  return planId === 'cortesia'
}

// Límite de profesionales del plan. Cortesía y trial = sin límite.
export function maxProfessionalsFor(planId: string | null | undefined): number {
  const p = planById(planId)
  return p ? p.maxProf : Infinity
}

// Está en período de prueba (sin plan pago ni cortesía).
export function isTrial(planId: string | null | undefined): boolean {
  return !planById(planId) && !isCortesia(planId)
}

// Etiqueta amigable del plan actual.
export function planLabel(planId: string | null | undefined): string {
  const p = planById(planId)
  if (p) return p.name
  if (isCortesia(planId)) return 'Cortesía'
  return 'Prueba'
}
