import { createClient } from '@/lib/supabase/server'
import { ReportsManager } from '@/components/reports/ReportsManager'
import type { Professional, Service } from '@/types/database'
import { requireRole } from '@/lib/auth/role-server'

export default async function ReportesPage() {
  await requireRole(['owner'])
  const supabase = await createClient()
  const [{ data: professionals }, { data: services }] = await Promise.all([
    supabase.from('professionals').select('*').order('created_at'),
    supabase.from('services').select('*').order('created_at'),
  ])

  return (
    <ReportsManager
      professionals={(professionals as Professional[]) ?? []}
      services={(services as Service[]) ?? []}
    />
  )
}
