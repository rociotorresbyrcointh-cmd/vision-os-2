'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Patient } from '@/types/database'
import { createPatient, updatePatient, type PatientInput } from '@/services/patients'

const empty: PatientInput = {
  first_name: '', last_name: '', dni: '', phone: '', whatsapp: '', email: '',
  date_of_birth: '', health_insurance: '', membership_number: '', notes: '',
}

function fromPatient(p: Patient): PatientInput {
  return {
    first_name: p.first_name, last_name: p.last_name ?? '', dni: p.dni ?? '', phone: p.phone ?? '',
    whatsapp: p.whatsapp ?? '', email: p.email ?? '', date_of_birth: p.date_of_birth ?? '',
    health_insurance: p.health_insurance ?? '', membership_number: p.membership_number ?? '', notes: p.notes ?? '',
  }
}

// Ficha completa de paciente — usada en la sección Pacientes y al crear desde un turno
export function PatientFormModal({
  organizationId,
  editing,
  initialName,
  onClose,
  onSaved,
}: {
  organizationId: string
  editing?: Patient | null
  initialName?: string
  onClose: () => void
  onSaved: (p: Patient) => void
}) {
  const [form, setForm] = useState<PatientInput>(() => {
    if (editing) return fromPatient(editing)
    if (initialName?.trim()) {
      const parts = initialName.trim().split(' ')
      return { ...empty, first_name: parts[0], last_name: parts.slice(1).join(' ') }
    }
    return empty
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof PatientInput, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.first_name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true); setError('')
    const clean: PatientInput = {
      ...form,
      last_name: form.last_name?.trim() || null,
      dni: form.dni?.trim() || null,
      phone: form.phone?.trim() || null,
      whatsapp: form.whatsapp?.trim() || null,
      email: form.email?.trim() || null,
      date_of_birth: form.date_of_birth || null,
      health_insurance: form.health_insurance?.trim() || null,
      membership_number: form.membership_number?.trim() || null,
      notes: form.notes?.trim() || null,
    }
    try {
      const saved = editing
        ? await updatePatient(editing.id, clean)
        : await createPatient(organizationId, clean)
      onSaved(saved)
    } catch (e: any) {
      setError(e.message?.includes('duplicate') ? 'Ya existe un paciente con ese email o teléfono.' : (e.message ?? 'Error al guardar.'))
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>{editing ? 'Editar paciente' : 'Nuevo paciente'}</h2>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Nombre"><input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} style={input} autoFocus /></Field>
            <Field label="Apellido"><input value={form.last_name ?? ''} onChange={(e) => set('last_name', e.target.value)} style={input} /></Field>
          </div>
          <Field label="DNI (opcional)"><input value={form.dni ?? ''} onChange={(e) => set('dni', e.target.value)} placeholder="Sirve para buscar al paciente" style={input} /></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Teléfono"><input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} style={input} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} style={input} /></Field>
          </div>
          <Field label="Email"><input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} style={input} /></Field>
          <Field label="Fecha de nacimiento"><input type="date" value={form.date_of_birth ?? ''} onChange={(e) => set('date_of_birth', e.target.value)} style={input} /></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Obra social / Seguro"><input value={form.health_insurance ?? ''} onChange={(e) => set('health_insurance', e.target.value)} placeholder="Ej: OSDE" style={input} /></Field>
            <Field label="N° afiliado"><input value={form.membership_number ?? ''} onChange={(e) => set('membership_number', e.target.value)} style={input} /></Field>
          </div>
          <Field label="Notas"><textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} style={{ ...input, resize: 'vertical' }} /></Field>
          {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear paciente'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Orbitron', sans-serif" }}>{label}</label>
      {children}
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
  cursor: 'pointer', fontFamily: 'inherit',
}
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
