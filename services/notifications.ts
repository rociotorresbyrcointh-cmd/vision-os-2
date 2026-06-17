import { createClient } from '@/lib/supabase/client'
import { getInactivePatients } from './patients'
import { listWaitlist } from './waitlist'
import { canSee, type Role } from '@/lib/auth/role'

export type NotifTone = 'info' | 'warn' | 'money'
export type Notif = { key: string; text: string; href: string; tone: NotifTone }

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setHours(23, 59, 59, 999)
  return { startISO: start.toISOString(), endISO: end.toISOString(), now: new Date().toISOString() }
}

const plural = (n: number, s = 's') => (n > 1 ? s : '')

// Calcula los avisos del día a partir de los datos existentes. Respeta el rol.
export async function getNotifications(role: Role): Promise<Notif[]> {
  const supabase = createClient()
  const { startISO, endISO, now } = todayRange()
  const out: Notif[] = []

  // Turnos de hoy
  const { data: today } = await supabase
    .from('appointments')
    .select('id, status, source, start_time')
    .gte('start_time', startISO)
    .lte('start_time', endISO)
  const list = today ?? []

  const activos = list.filter((a) => a.status !== 'cancelled')
  if (activos.length) out.push({ key: 'hoy', text: `${activos.length} turno${plural(activos.length)} hoy`, href: '/agenda', tone: 'info' })

  const pend = list.filter((a) => a.status === 'pending')
  if (pend.length) out.push({ key: 'pend', text: `${pend.length} turno${plural(pend.length)} sin confirmar hoy`, href: '/agenda', tone: 'warn' })

  const canc = list.filter((a) => a.status === 'cancelled')
  if (canc.length) out.push({ key: 'canc', text: `${canc.length} cancelación${canc.length > 1 ? 'es' : ''} hoy`, href: '/agenda', tone: 'warn' })

  // Reservas online nuevas por confirmar (próximas)
  if (canSee('/reservas', role)) {
    const { data: online } = await supabase
      .from('appointments')
      .select('id')
      .eq('source', 'public')
      .eq('status', 'pending')
      .gte('start_time', now)
    if (online?.length) out.push({ key: 'online', text: `${online.length} reserva${plural(online.length)} online por confirmar`, href: '/reservas', tone: 'info' })
  }

  // Turnos atendidos hoy sin cobrar
  if (canSee('/pagos', role)) {
    const completed = list.filter((a) => a.status === 'completed')
    if (completed.length) {
      const ids = completed.map((a) => a.id)
      const { data: pays } = await supabase.from('payments').select('appointment_id').in('appointment_id', ids)
      const paid = new Set((pays ?? []).map((p) => p.appointment_id))
      const sinCobrar = completed.filter((a) => !paid.has(a.id))
      if (sinCobrar.length) out.push({ key: 'cobro', text: `${sinCobrar.length} turno${plural(sinCobrar.length)} atendido${plural(sinCobrar.length)} sin cobrar`, href: '/pagos', tone: 'money' })
    }
  }

  // Lista de espera con gente esperando
  if (canSee('/espera', role)) {
    try {
      const wl = await listWaitlist()
      const waiting = wl.filter((w) => w.status === 'esperando')
      if (waiting.length) out.push({ key: 'espera', text: `${waiting.length} en lista de espera`, href: '/espera', tone: 'info' })
    } catch { /* ignorar */ }
  }

  // Pacientes inactivos para reactivar
  if (canSee('/crecimiento', role)) {
    try {
      const inact = await getInactivePatients(60)
      if (inact.length) out.push({ key: 'inact', text: `${inact.length} paciente${plural(inact.length)} sin venir hace +60 días`, href: '/crecimiento', tone: 'info' })
    } catch { /* ignorar */ }
  }

  return out
}
