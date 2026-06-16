import { createProfessional } from './professionals'
import { createService } from './services'
import { createPatient } from './patients'
import { createAppointment } from './appointments'

// Carga datos de ejemplo para que el dueño explore la app ya funcionando.
export async function seedExampleData(orgId: string): Promise<void> {
  const prof = await createProfessional(orgId, {
    name: 'Profesional de ejemplo', specialty: null, color: '#2563FF',
    hours_start: '09:00', hours_end: '18:00', days_of_week: [1, 2, 3, 4, 5],
    max_capacity_per_hour: 1, is_resource: false,
  })

  const consulta = await createService(orgId, { name: 'Consulta', duration_minutes: 30, price: 5000, description: null, color: '#34d399' })
  const tratamiento = await createService(orgId, { name: 'Tratamiento', duration_minutes: 60, price: 12000, description: null, color: '#a78bfa' })
  await createService(orgId, { name: 'Control', duration_minutes: 20, price: 3000, description: null, color: '#fbbf24' })

  const patient = await createPatient(orgId, {
    first_name: 'María', last_name: 'Ejemplo', dni: '30111222', phone: '1122334455',
    whatsapp: null, email: null, date_of_birth: null, health_insurance: 'OSDE', membership_number: null, notes: 'Paciente de ejemplo — podés borrarla.',
  })

  const mk = (hour: number, svc: { id: string; duration_minutes: number }, name: string, patientId: string | null) => {
    const s = new Date(); s.setHours(hour, 0, 0, 0)
    const e = new Date(s); e.setMinutes(e.getMinutes() + svc.duration_minutes)
    return createAppointment(orgId, {
      professional_id: prof.id, service_id: svc.id, patient_id: patientId,
      client_name: name, client_phone: '1122334455',
      start_time: s.toISOString(), end_time: e.toISOString(),
      status: 'confirmed', notes: null, capacity_consumed: 1, blocks_overlap: true,
    }).catch(() => {})
  }
  await mk(10, consulta, 'María Ejemplo', patient.id)
  await mk(15, tratamiento, 'Juan Prueba', null)
}
