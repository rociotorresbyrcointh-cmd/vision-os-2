// ─── Tipos del dominio Vision OS 2.0 ─────────────────────────────
// Alineados a las columnas de Supabase (snake_case) para evitar
// bugs de mapeo entre la base de datos y la aplicación.

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type MemberRole = 'owner' | 'admin' | 'staff' | 'readonly'

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string
  plan: string
  timezone: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  organization_id: string
  name: string
  address: string | null
  phone: string | null
  hours_start: string
  hours_end: string
  days_of_week: number[]
  is_active: boolean
  created_at: string
}

export interface Professional {
  id: string
  organization_id: string
  branch_id: string | null
  name: string
  specialty: string | null
  color: string
  hours_start: string
  hours_end: string
  days_of_week: number[]
  max_capacity_per_hour: number
  is_resource: boolean
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  organization_id: string
  name: string
  duration_minutes: number
  price: number
  description: string | null
  color: string | null
  is_active: boolean
  created_at: string
}

export interface Patient {
  id: string
  organization_id: string
  first_name: string
  last_name: string | null
  dni: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  date_of_birth: string | null
  gender: string | null
  health_insurance: string | null
  membership_number: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  organization_id: string
  branch_id: string | null
  professional_id: string
  service_id: string
  patient_id: string | null
  client_name: string
  client_phone: string | null
  client_email: string | null
  start_time: string // ISO 8601 con zona
  end_time: string
  status: AppointmentStatus
  capacity_consumed: number
  recurrence_group_id: string | null
  recurrence_rule: RecurrenceRule | null
  notes: string | null
  source: 'admin' | 'public' | 'whatsapp'
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface RecurrenceRule {
  freq: 'weekly' | 'monthly'
  count: number
}

export interface ClinicalNote {
  id: string
  organization_id: string
  patient_id: string
  appointment_id: string | null
  content: string
  created_at: string
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago' | 'otro'
export type PaymentKind = 'pago' | 'seña'

export interface Payment {
  id: string
  organization_id: string
  appointment_id: string | null
  patient_id: string | null
  amount: number
  method: PaymentMethod
  kind: PaymentKind
  notes: string | null
  paid_at: string // ISO
  created_at: string
}

export interface BlockedTime {
  id: string
  organization_id: string
  branch_id: string | null
  professional_id: string | null
  title: string
  start_time: string
  end_time: string
  recurring_rule: { freq: 'daily' | 'weekly' | 'monthly'; days?: number[] } | null
  created_at: string
}

// ─── Payloads de creación (lo que la UI envía antes de tener id) ──
export type AppointmentCreate = Omit<
  Appointment,
  'id' | 'organization_id' | 'created_at' | 'updated_at'
>
export type ProfessionalCreate = Omit<
  Professional,
  'id' | 'organization_id' | 'created_at'
>
export type ServiceCreate = Omit<Service, 'id' | 'organization_id' | 'created_at'>

// ─── Paleta de colores para profesionales (reutilizada del legacy) ─
export const PROFESSIONAL_COLORS = [
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#a78bfa', // violet
  '#14b8a6', // teal
]
