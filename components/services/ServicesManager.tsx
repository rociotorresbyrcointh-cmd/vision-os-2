'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Clock, DollarSign } from 'lucide-react'
import type { Service } from '@/types/database'
import {
  createService,
  updateService,
  deleteService,
  type ServiceInput,
} from '@/services/services'

const emptyForm: ServiceInput = {
  name: '', duration_minutes: 60, price: 0, description: '', color: null,
}

const DURATIONS = [15, 30, 45, 60, 90, 120]

export function ServicesManager({
  organizationId,
  initial,
}: {
  organizationId: string
  initial: Service[]
}) {
  const [list, setList] = useState<Service[]>(initial)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openNew = () => {
    setEditingId(null); setForm(emptyForm); setError(''); setOpen(true)
  }
  const openEdit = (s: Service) => {
    setEditingId(s.id)
    setForm({ name: s.name, duration_minutes: s.duration_minutes, price: s.price, description: s.description ?? '', color: s.color })
    setError(''); setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true); setError('')
    try {
      if (editingId) {
        const updated = await updateService(editingId, form)
        setList((l) => l.map((s) => (s.id === editingId ? updated : s)))
      } else {
        const created = await createService(organizationId, form)
        setList((l) => [...l, created])
      }
      setOpen(false)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (s: Service) => {
    if (!confirm(`¿Eliminar el servicio "${s.name}"?`)) return
    await deleteService(s.id)
    setList((l) => l.filter((x) => x.id !== s.id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Servicios</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
            Lo que ofrecés. La duración define cuánto ocupa el turno en el calendario.
          </p>
        </div>
        <button onClick={openNew} style={btnPrimary}><Plus size={16} /> Nuevo servicio</button>
      </div>

      {list.length === 0 ? (
        <div style={emptyBox}>Todavía no cargaste servicios.<br />Creá el primero.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {list.map((s) => (
            <div key={s.id} style={card}>
              <p style={{ color: 'white', fontWeight: 600, fontSize: 15, margin: 0 }}>{s.name}</p>
              {s.description && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>{s.description}</p>}
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {s.duration_minutes} min</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={13} /> {s.price}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                <button onClick={() => openEdit(s)} style={btnGhost}><Pencil size={13} /> Editar</button>
                <button onClick={() => remove(s)} style={{ ...btnGhost, color: '#f87171' }}><Trash2 size={13} /></button>
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
                {editingId ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button onClick={() => setOpen(false)} style={iconBtn}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nombre">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Masaje descontracturante" style={input} />
              </Field>

              <Field label="Duración">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DURATIONS.map((d) => {
                    const on = form.duration_minutes === d
                    return (
                      <button key={d} onClick={() => setForm((f) => ({ ...f, duration_minutes: d }))}
                        style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: on ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)',
                          border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                          color: on ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                        {d}m
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Precio">
                <input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} style={input} />
              </Field>

              <Field label="Descripción (opcional)">
                <input value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detalle breve" style={input} />
              </Field>

              {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}

              <button onClick={save} disabled={saving} style={{ ...btnPrimary, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
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
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 16 }
const emptyBox: React.CSSProperties = { padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.7 }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }
const modal: React.CSSProperties = { background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }
