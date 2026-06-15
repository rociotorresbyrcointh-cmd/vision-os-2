'use client'

import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, UserRound, Tag, Users, Calendar } from 'lucide-react'
import type { Patient, Service, Professional, Appointment } from '@/types/database'
import { listDeletedPatients, restorePatient, hardDeletePatient, fullName } from '@/services/patients'
import { listDeletedServices, restoreService, hardDeleteService } from '@/services/services'
import { listDeletedProfessionals, restoreProfessional, hardDeleteProfessional } from '@/services/professionals'
import { listDeletedAppointments, restoreAppointment, hardDeleteAppointment } from '@/services/appointments'

type Row = { id: string; title: string; sub: string }

export function TrashManager() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [pros, setPros] = useState<Professional[]>([])
  const [appts, setAppts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)
    Promise.all([
      listDeletedPatients().catch(() => []),
      listDeletedServices().catch(() => []),
      listDeletedProfessionals().catch(() => []),
      listDeletedAppointments().catch(() => []),
    ]).then(([p, s, pr, a]) => { setPatients(p); setServices(s); setPros(pr); setAppts(a) })
      .finally(() => setLoading(false))
  }
  useEffect(reload, [])

  const total = patients.length + services.length + pros.length + appts.length

  const apptRow = (a: Appointment): Row => ({
    id: a.id,
    title: a.client_name,
    sub: new Date(a.start_time).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Trash2 size={20} color="rgba(255,255,255,0.6)" /> Papelera
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 24 }}>
        Todo lo borrado queda acá. Podés recuperarlo o eliminarlo para siempre.
      </p>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando…</p>
      ) : total === 0 ? (
        <div style={{ padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
          La papelera está vacía. ✨
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Section
            icon={<UserRound size={16} color="#60a5fa" />} title="Pacientes" count={patients.length}
            rows={patients.map((p) => ({ id: p.id, title: fullName(p), sub: [p.dni && `DNI ${p.dni}`, p.phone].filter(Boolean).join(' · ') || 'sin datos extra' }))}
            onRestore={async (id) => { await restorePatient(id); reload() }}
            onDelete={async (id) => { await hardDeletePatient(id); reload() }}
          />
          <Section
            icon={<Calendar size={16} color="#a78bfa" />} title="Turnos" count={appts.length}
            rows={appts.map(apptRow)}
            onRestore={async (id) => { try { await restoreAppointment(id); reload() } catch (e: any) { alert(e.message ?? 'No se pudo recuperar (quizás el horario ya está ocupado).') } }}
            onDelete={async (id) => { await hardDeleteAppointment(id); reload() }}
          />
          <Section
            icon={<Tag size={16} color="#34d399" />} title="Servicios" count={services.length}
            rows={services.map((s) => ({ id: s.id, title: s.name, sub: `${s.duration_minutes} min` }))}
            onRestore={async (id) => { await restoreService(id); reload() }}
            onDelete={async (id) => { await hardDeleteService(id); reload() }}
          />
          <Section
            icon={<Users size={16} color="#fbbf24" />} title="Profesionales" count={pros.length}
            rows={pros.map((p) => ({ id: p.id, title: p.name, sub: '' }))}
            onRestore={async (id) => { await restoreProfessional(id); reload() }}
            onDelete={async (id) => { await hardDeleteProfessional(id); reload() }}
          />
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, count, rows, onRestore, onDelete }: {
  icon: React.ReactNode; title: string; count: number; rows: Row[]
  onRestore: (id: string) => void; onDelete: (id: string) => void
}) {
  if (count === 0) return null
  const del = (r: Row) => { if (confirm(`¿Eliminar "${r.title}" DEFINITIVAMENTE? No se puede deshacer.`)) onDelete(r.id) }
  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
        {icon} {title} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>({count})</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '11px 14px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14 }}>{r.title}</p>
              {r.sub && <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{r.sub}</p>}
            </div>
            <button onClick={() => onRestore(r.id)} style={{ ...btn, color: '#34d399', borderColor: 'rgba(52,211,153,0.35)' }}><RotateCcw size={13} /> Recuperar</button>
            <button onClick={() => del(r)} style={{ ...btn, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '8px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
}
