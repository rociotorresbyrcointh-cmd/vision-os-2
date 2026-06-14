import { createClient } from '@/lib/supabase/client'
import type { BlockedTime } from '@/types/database'
import { getDateKey } from '@/lib/date-utils'

export type RecurringRule =
  | { freq: 'daily' }
  | { freq: 'weekly'; days: number[] }
  | null

export type BlockInput = {
  title: string
  professional_id: string | null // null = todo el negocio
  start_time: string // ISO (primera ocurrencia)
  end_time: string   // ISO
  recurring_rule: RecurringRule
}

// Instancia concreta de un bloqueo en un día específico
export type BlockInstance = {
  sourceId: string
  title: string
  professional_id: string | null
  start_time: string
  end_time: string
  recurring: boolean
}

// Bloqueos de una sola vez que caen en el rango + todos los recurrentes.
// Dos queries separadas para evitar problemas de parseo del filtro .or().
export async function fetchBlocks(fromISO: string, toISO: string): Promise<BlockedTime[]> {
  const supabase = createClient()
  const [oneTime, recurring] = await Promise.all([
    supabase
      .from('blocked_times')
      .select('*')
      .is('recurring_rule', null)
      .gte('start_time', fromISO)
      .lt('start_time', toISO),
    supabase
      .from('blocked_times')
      .select('*')
      .not('recurring_rule', 'is', null),
  ])
  if (oneTime.error) throw oneTime.error
  if (recurring.error) throw recurring.error
  return [...(oneTime.data ?? []), ...(recurring.data ?? [])]
}

export async function createBlock(
  organizationId: string,
  input: BlockInput
): Promise<BlockedTime> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blocked_times')
    .insert([{ ...input, organization_id: organizationId }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBlock(id: string, input: BlockInput): Promise<BlockedTime> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blocked_times')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBlock(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('blocked_times').delete().eq('id', id)
  if (error) throw error
}

// Todos los bloqueos de la organización (para la página de gestión)
export async function listAllBlocks(): Promise<BlockedTime[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blocked_times')
    .select('*')
    .order('start_time', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Expande los bloqueos (únicos + recurrentes) a instancias concretas de un día
export function expandBlocksForDay(blocks: BlockedTime[], day: Date): BlockInstance[] {
  const dayKey = getDateKey(day)
  const weekday = day.getDay()
  const out: BlockInstance[] = []

  for (const b of blocks) {
    const start = new Date(b.start_time)
    const end = new Date(b.end_time)
    const rule = b.recurring_rule as RecurringRule

    let applies = false
    if (!rule) {
      applies = getDateKey(start) === dayKey
    } else if (rule.freq === 'daily') {
      applies = true
    } else if (rule.freq === 'weekly') {
      applies = rule.days.includes(weekday)
    }
    if (!applies) continue

    // Construir la instancia con la hora del bloqueo sobre el día pedido
    const s = new Date(day); s.setHours(start.getHours(), start.getMinutes(), 0, 0)
    const e = new Date(day); e.setHours(end.getHours(), end.getMinutes(), 0, 0)
    out.push({
      sourceId: b.id,
      title: b.title,
      professional_id: b.professional_id,
      start_time: s.toISOString(),
      end_time: e.toISOString(),
      recurring: !!rule,
    })
  }
  return out
}
