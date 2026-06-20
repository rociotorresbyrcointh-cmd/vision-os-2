// Planes de venta de Vision OS (suscripción mensual, USD). El límite es por
// cantidad de profesionales. 'trial' / sin plan = sin límite (para no romper pruebas).

export type PlanId = 'inicial' | 'equipo' | 'clinica'

export type Plan = {
  id: PlanId
  name: string
  maxProf: number
  price: number
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
    blurb: '1 profesional',
    features: ['Agenda y turnos', 'Pacientes y caja', 'Reservas online', 'Recordatorios'],
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
    id: 'clinica',
    name: 'Clínica',
    maxProf: 10,
    price: 149,
    blurb: '5 a 10 profesionales',
    features: ['Todo lo de Equipo', 'Hasta 10 profesionales', 'Soporte prioritario', `Profesional extra +$${EXTRA_PRICE} c/u`],
  },
]

export function planById(id: string | null | undefined): Plan | null {
  return PLANS.find((p) => p.id === id) ?? null
}

// Límite de profesionales del plan. Sin plan asignado (trial) = sin límite.
export function maxProfessionalsFor(planId: string | null | undefined): number {
  const p = planById(planId)
  return p ? p.maxProf : Infinity
}

export function isTrial(planId: string | null | undefined): boolean {
  return !planById(planId)
}
