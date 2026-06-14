import { createClient } from '@/lib/supabase/server'
import { PatientsManager } from '@/components/patients/PatientsManager'
import type { Patient } from '@/types/database'

export default async function PacientesPage() {
  const supabase = await createClient()

  const { data: org } = await supabase.from('organizations').select('id, clinical_history_enabled').single()
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('first_name', { ascending: true })

  return (
    <PatientsManager
      organizationId={org?.id ?? ''}
      clinicalEnabled={org?.clinical_history_enabled ?? false}
      initial={(patients as Patient[]) ?? []}
    />
  )
}
