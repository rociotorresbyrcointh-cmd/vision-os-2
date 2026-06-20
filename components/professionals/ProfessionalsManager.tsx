'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, X, User, Box, Lock } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PROFESSIONAL_COLORS, type Professional } from '@/types/database'
import { maxProfessionalsFor, planById } from '@/lib/plans'
import {
  createProfessional,
  updateProfessional,
  deleteProfessional,
  type ProfessionalInput,
} from '@/services/professionals'

const DAYS = [
  { n: 1, label: 'L' }, { n: 2, label: 'M' }, { n: 3, label: 'M' },
  { n: 4, label: 'J' }, { n: 5, label: 'V' }, { n: 6, label: 'S' }, { n: 0, label: 'D' },
]

const emptyForm: ProfessionalInput = {
  name: '', specialty: '', color: PROFESSIONAL_COLORS[0],
  hours_start: '09:00', hours_end: '18:00',
  days_of_week: [1, 2, 3, 4, 5], max_capacity_per_hour: 1, is_resource: false,
}

export function ProfessionalsManager({
  organizationId,
  initial,
  plan = 'trial',
}: {
  organizationId: string
  initial: Professional[]
  plan?: string
}) {
  const [list, setList] = useState<Professional[]>(initial)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfessionalInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const maxProf = maxProfessionalsFor(plan)
  const atLimit = list.length >= maxProf

  const openNew = () => {
    if (atLimit) return
    setEditingId(null)
    setForm({ ...emptyForm, color: PROFESSIONAL_COLORS[list.length % PROFESSIONAL_COLORS.length] })
    setError('')
    setOpen(true)
  }

  const openEdit = (p: Professional) => {
    setEditingId(p.id)
    setForm({
      name: p.name, specialty: p.specialty ?? '', color: p.color,
      hours_start: p.hours_start.slice(0, 5), hours_end: p.hours_end.slice(0, 5),
      days_of_week: p.days_of_week, max_capacity_per_hour: p.max_capacity_per_hour,
      is_resource: p.is_resource,
    })
    setError('')
    setOpen(true)
  }

  const toggleDay = (n: number) =>
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(n)
        ? f.days_of_week.filter((d) => d !== n)
        : [...f.days_of_week, n].sort(),
    }))

  const save = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    if (!editingId && list.length >= maxProf) {
      setError(`Tu plan permite hasta ${maxProf} profesional${maxProf === 1 ? '' : 'es'}. Pasá a un plan más grande para sumar más.`)
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const updated = await updateProfessional(editingId, form)
        setList((l) => l.map((p) => (p.id === editingId ? updated : p)))
      } else {
        const created = await createProfessional(organizationId, form)
        setList((l) => [...l, created])
      }
      setOpen(false)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Professional) => {
    if (!confirm(`¿Eliminar a ${p.name}?`)) return
    await deleteProfessional(p.id)
    setList((l) => l.filter((x) => x.id !== p.id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Profesionales</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
            Personas y recursos (cabinas, salas) que reciben turnos.
          </p>
        </div>
        <button onClick={openNew} disabled={atLimit} style={{ ...btnPrimary, opacity: atLimit ? 0.5 : 1, cursor: atLimit ? 'not-allowed' : 'pointer' }}
          title={atLimit ? 'Llegaste al límite de tu plan' : ''}>
          {atLimit ? <Lock size={15} /> : <Plus size={16} />} Nuevo profesional
        </button>
      </div>

      {atLimit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '13px 16px', marginBottom: 20, maxWidth: 760 }}>
          <Lock size={18} color="#fbbf24" />
          <span style={{ flex: 1, minWidth: 200, color: 'rgba(255,255,255,0.8)', fontSize: 13.5 }}>
            Tu plan {planById(plan)?.name ? `(${planById(plan)!.name})` : ''} permite hasta <strong>{maxProf}</strong> profesional{maxProf === 1 ? '' : 'es'}. Para sumar más, pasá a un plan más grande.
          </span>
          <Link href="/plan" style={{ background: '#2563FF', color: 'white', textDecoration: 'none', borderRadius: 9, padding: '9px 15px', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Ver planes
          </Link>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={User}
          title="Todavía no cargaste profesionales"
          description="Cada profesional tiene su agenda, color, días y horarios de atención. Cargá al menos uno para empezar a dar turnos."
          actionLabel="+ Nuevo profesional"
          onAction={openNew}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {list.map((p) => (
            <div key={p.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 10px ${p.color}88` }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 15, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {p.is_resource ? <Box size={11} /> : <User size={11} />}
                    {p.specialty || (p.is_resource ? 'Recurso' : 'Profesional')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 12 }}>
                <span>{p.hours_start.slice(0, 5)}–{p.hours_end.slice(0, 5)}</span>
                {p.max_capacity_per_hour > 1 && <span>cap. {p.max_capacity_per_hour}/h</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                <button onClick={() => openEdit(p)} style={btnGhost}><Pencil size={13} /> Editar</button>
                <button onClick={() => remove(p)} style={{ ...btnGhost, color: '#f87171' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div style={overlay} onClick={() => setOpen(false)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>
                {editingId ? 'Editar profesional' : 'Nuevo profesional'}
              </h2>
              <button onClick={() => setOpen(false)} style={iconBtn}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nombre">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Ana Pérez" style={input} />
              </Field>

              <Field label="Especialidad (opcional)">
                <input value={form.specialty ?? ''} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Ej: Masajista" style={input} />
              </Field>

              <Field label="Color">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PROFESSIONAL_COLORS.map((c) => (
                    <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                      style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid white' : '2px solid transparent', boxShadow: form.color === c ? `0 0 10px ${c}` : 'none' }} />
                  ))}
                </div>
              </Field>

              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Desde">
                  <input type="time" value={form.hours_start} onChange={(e) => setForm((f) => ({ ...f, hours_start: e.target.value }))} style={input} />
                </Field>
                <Field label="Hasta">
                  <input type="time" value={form.hours_end} onChange={(e) => setForm((f) => ({ ...f, hours_end: e.target.value }))} style={input} />
                </Field>
              </div>

              <Field label="Días de atención">
                <div style={{ display: 'flex', gap: 6 }}>
                  {DAYS.map(({ n, label }) => {
                    const on = form.days_of_week.includes(n)
                    return (
                      <button key={n} onClick={() => toggleDay(n)}
                        style={{ width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          background: on ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)',
                          border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: on ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="¿Cuántos atiende a la vez?">
                  <input type="number" min={1} max={20} value={form.max_capacity_per_hour}
                    onChange={(e) => setForm((f) => ({ ...f, max_capacity_per_hour: Math.max(1, Number(e.target.value)) }))} style={input} />
                </Field>
                <Field label="Tipo">
                  <button onClick={() => setForm((f) => ({ ...f, is_resource: !f.is_resource }))}
                    style={{ ...input, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {form.is_resource ? <><Box size={14} /> Recurso / cabina</> : <><User size={14} /> Persona</>}
                  </button>
                </Field>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '-4px 0 0', lineHeight: 1.5 }}>
                Cuántos pacientes puede atender <b>al mismo tiempo</b> en una misma franja horaria.
                Poné <b>1</b> si atiende de a uno (lo más común). Poné más si atiende a varios a la vez
                (ej: un kinesiólogo con 3 camillas, o una clase grupal).
              </p>

              {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={save} disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear profesional'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7, fontFamily: "'Orbitron', sans-serif" }}>{label}</label>
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
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
  padding: '7px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const iconBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4,
}
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 16,
}
const emptyBox: React.CSSProperties = {
  padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.7,
}
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
