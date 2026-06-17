'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Search, Phone, Mail, Shield, FileText, CreditCard, FileHeart, Download, UserRound } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Patient, ClinicalNote } from '@/types/database'
import { deletePatient, fullName, listPatientAppointments } from '@/services/patients'
import { listNotes, createNote, deleteNote } from '@/services/clinical-notes'
import { exportToExcel } from '@/lib/excel'
import { PatientFormModal } from './PatientFormModal'

export function PatientsManager({
  organizationId,
  clinicalEnabled,
  initial,
}: {
  organizationId: string
  clinicalEnabled: boolean
  initial: Patient[]
}) {
  const [list, setList] = useState<Patient[]>(initial)
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [detail, setDetail] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) =>
      fullName(p).toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q) ||
      (p.dni ?? '').includes(q)
    )
  }, [list, query])

  const openNew = () => { setEditingPatient(null); setFormOpen(true) }
  const openEdit = (p: Patient) => { setEditingPatient(p); setFormOpen(true); setDetail(null) }

  const onSaved = (saved: Patient) => {
    setList((l) => (l.some((p) => p.id === saved.id) ? l.map((p) => (p.id === saved.id ? saved : p)) : [...l, saved]))
    setFormOpen(false)
  }

  const remove = async (p: Patient) => {
    if (!confirm(`¿Mover a ${fullName(p)} a la papelera? Vas a poder recuperarlo.`)) return
    await deletePatient(p.id)
    setList((l) => l.filter((x) => x.id !== p.id))
    setDetail(null)
  }

  const exportExcel = () => {
    const rows = list.map((p) => ({
      Nombre: p.first_name,
      Apellido: p.last_name ?? '',
      DNI: p.dni ?? '',
      Teléfono: p.phone ?? '',
      WhatsApp: p.whatsapp ?? '',
      Email: p.email ?? '',
      'Fecha nac.': p.date_of_birth ?? '',
      'Obra social': p.health_insurance ?? '',
      'N° afiliado': p.membership_number ?? '',
      Notas: p.notes ?? '',
    }))
    exportToExcel('pacientes.xlsx', 'Pacientes', rows)
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Pacientes</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>{list.length} {list.length === 1 ? 'paciente' : 'pacientes'} registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportExcel} disabled={list.length === 0} style={{ ...btnGhost, padding: '10px 14px', fontSize: 13, opacity: list.length === 0 ? 0.4 : 1 }} title="Descargar la lista de pacientes en Excel">
            <Download size={15} /> Exportar
          </button>
          <button onClick={openNew} style={btnPrimary}><Plus size={16} /> Nuevo paciente</button>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono o DNI…"
          style={{ ...input, paddingLeft: 34 }} />
      </div>

      {filtered.length === 0 ? (
        query ? (
          <div style={emptyBox}>Sin resultados para “{query}”.</div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="Todavía no cargaste pacientes"
            description="Acá vas a tener la ficha de cada cliente: contacto, historial de turnos y notas. Empezá cargando el primero."
            actionLabel="+ Nuevo paciente"
            onAction={openNew}
          />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 760 }}>
          {filtered.map((p) => (
            <div key={p.id} style={row} onClick={() => setDetail(p)}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(37,99,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {p.first_name[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 15 }}>{fullName(p)}</p>
                <div style={{ display: 'flex', gap: 14, marginTop: 3, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', flexWrap: 'wrap' }}>
                  {p.dni && <span>DNI {p.dni}</span>}
                  {p.phone && <span>{p.phone}</span>}
                  {p.health_insurance && <span>{p.health_insurance}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(p)} style={btnGhost}><Pencil size={13} /></button>
                <button onClick={() => remove(p)} style={{ ...btnGhost, color: '#f87171' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <PatientFormModal
          organizationId={organizationId}
          editing={editingPatient}
          onClose={() => setFormOpen(false)}
          onSaved={onSaved}
        />
      )}

      {detail && (
        <PatientDetail patient={detail} organizationId={organizationId} clinicalEnabled={clinicalEnabled} onClose={() => setDetail(null)} onEdit={() => openEdit(detail)} />
      )}
    </div>
  )
}

// ─── Ficha del paciente con historial ────────────────────────────
function PatientDetail({ patient, organizationId, clinicalEnabled, onClose, onEdit }: { patient: Patient; organizationId: string; clinicalEnabled: boolean; onClose: () => void; onEdit: () => void }) {
  const [appts, setAppts] = useState<any[] | null>(null)
  useEffect(() => { listPatientAppointments(patient.id).then(setAppts).catch(() => setAppts([])) }, [patient.id])

  // Historia clínica (solo si está activada)
  const [notes, setNotes] = useState<ClinicalNote[] | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  useEffect(() => {
    if (clinicalEnabled) listNotes(patient.id).then(setNotes).catch(() => setNotes([]))
  }, [patient.id, clinicalEnabled])

  const addNote = async () => {
    if (!noteText.trim()) return
    setSavingNote(true)
    try {
      const n = await createNote(organizationId, { patient_id: patient.id, appointment_id: null, content: noteText.trim() })
      setNotes((l) => [n, ...(l ?? [])])
      setNoteText('')
    } finally { setSavingNote(false) }
  }
  const removeNote = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return
    await deleteNote(id)
    setNotes((l) => (l ?? []).filter((x) => x.id !== id))
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modal, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ color: 'white', fontSize: 19, fontWeight: 700, margin: 0 }}>{fullName(patient)}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>Ficha del paciente</p>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          {patient.dni && <InfoRow icon={<CreditCard size={14} />} text={`DNI ${patient.dni}`} />}
          {patient.phone && <InfoRow icon={<Phone size={14} />} text={patient.phone} />}
          {patient.email && <InfoRow icon={<Mail size={14} />} text={patient.email} />}
          {patient.health_insurance && <InfoRow icon={<Shield size={14} />} text={`${patient.health_insurance}${patient.membership_number ? ` · ${patient.membership_number}` : ''}`} />}
          {patient.notes && <InfoRow icon={<FileText size={14} />} text={patient.notes} />}
        </div>

        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Historial de turnos</h3>
        {appts === null ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Cargando…</p>
        ) : appts.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sin turnos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {appts.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 11px' }}>
                <span style={{ fontSize: 13, color: 'white' }}>{new Date(a.start_time).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{new Date(a.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}

        {clinicalEnabled && (
          <div style={{ marginTop: 22, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileHeart size={14} color="#f472b6" /> Historia clínica
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Escribí una nota de evolución, diagnóstico, indicaciones…"
                style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
              <button onClick={addNote} disabled={savingNote || !noteText.trim()} style={{ ...btnPrimary, justifyContent: 'center', opacity: savingNote || !noteText.trim() ? 0.5 : 1 }}>
                {savingNote ? 'Guardando…' : 'Agregar nota'}
              </button>
            </div>

            {notes === null ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Cargando…</p>
            ) : notes.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sin notas todavía.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                        {new Date(n.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button onClick={() => removeNote(n.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'white', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={onEdit} style={{ ...btnPrimary, justifyContent: 'center', marginTop: 18 }}>
          <Pencil size={14} /> Editar paciente
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{icon}</span>{text}
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '11px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
  padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 13, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
}
const emptyBox: React.CSSProperties = {
  padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14, maxWidth: 760,
}
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
