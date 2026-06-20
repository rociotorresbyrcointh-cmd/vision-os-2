// Planes de venta de Vision OS (suscripción mensual, USD). El límite es por
// cantidad de profesionales. 'trial' / sin plan = sin límite (para no romper pruebas).

export type PlanId = 'inicial' | 'equipo' | 'clinica'

export type Plan = {
  id: PlanId
  name: string
  maxProf: number
  price: number        // USD/mes (Stripe)
  priceARS: number     // pesos/mes (Mercado Pago) — actualizar cuando se mueve el dólar
  blurb: string
  popular?: boolean
  features: string[]
}

export const EXTRA_PRICE = 15 // USD por profesional extra (más de 10)

export const PLANS: Plan[] = [
  {
    id: 'inicial',
    name: 'Inicial',
    maxProf: 1,
    price: 39,
    priceARS: 58000,
    blurb: '1 profesional',
    features: ['Agenda y turnos', 'Pacientes y caja', 'Reservas online', 'Recordatorios'],
  },
  {
    id: 'equipo',
    name: 'Equipo',
    maxProf: 4,
    price: 79,
    priceARS: 117000,
    blurb: '2 a 4 profesionales',
    popular: true,
    features: ['Todo lo de Inicial', 'Roles y permisos por empleado', 'Redes sociales con IA', 'Crecimiento y reportes'],
  },
  {
    id: 'clinica',
    name: 'Clínica',
    maxProf: 10,
    price: 149,
    priceARS: 221000,
    blurb: '5 a 10 profesionales',
    features: ['Todo lo de Equipo', 'Hasta 10 profesionales', 'Soporte prioritario', `Profesional extra +$${EXTRA_PRICE} c/u`],
  },
]

export function planById(id: string | null | undefined): Plan | null {
  return PLANS.find((p) => p.id === id) ?? null
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
