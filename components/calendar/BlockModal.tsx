'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Professional, BlockedTime } from '@/types/database'
import { timeToMinutes, getDateKey } from '@/lib/date-utils'
import { createBlock, updateBlock, type RecurringRule } from '@/services/blocked-times'

type Repeat = 'once' | 'daily' | 'weekdays'

function buildISO(date: Date, hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function ruleToRepeat(rule: any): Repeat {
  if (!rule) return 'once'
  if (rule.freq === 'daily') return 'daily'
  return 'weekdays'
}

export function BlockModal({
  date,
  editing,
  organizationId,
  professionals,
  onClose,
  onSaved,
}: {
  date: Date
  editing?: BlockedTime | null
  organizationId: string
  professionals: Professional[]
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(editing?.title ?? '')
  const [professionalId, setProfessionalId] = useState<string>(editing?.professional_id ?? '') // '' = todos
  const [startTime, setStartTime] = useState(editing ? hhmm(editing.start_time) : '13:00')
  const [endTime, setEndTime] = useState(editing ? hhmm(editing.end_time) : '14:00')
  const [dateKey, setDateKey] = useState(getDateKey(editing ? new Date(editing.start_time) : date))
  const [repeat, setRepeat] = useState<Repeat>(ruleToRepeat(editing?.recurring_rule))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!title.trim()) { setError('Poné un título (ej: Almuerzo).'); return }
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) { setError('La hora de fin debe ser posterior al inicio.'); return }
    setSaving(true); setError('')

    const recurring_rule: RecurringRule =
      repeat === 'daily' ? { freq: 'daily' }
      : repeat === 'weekdays' ? { freq: 'weekly', days: [1, 2, 3, 4, 5] }
      : null

    // La fecha del bloqueo: la elegida (para "solo este día"). En recurrentes es solo referencia.
    const baseDate = parseDateKey(dateKey)
    const payload = {
      title: title.trim(),
      professional_id: professionalId || null,
      start_time: buildISO(baseDate, startTime),
      end_time: buildISO(baseDate, endTime),
      recurring_rule,
    }

    try {
      if (editing) await updateBlock(editing.id, payload)
      else await createBlock(organizationId, payload)
      onSaved()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar el bloqueo.')
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>{editing ? 'Editar bloqueo' : 'Nuevo bloqueo'}</h2>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Almuerzo, Vacaciones, Capacitación" style={input} autoFocus />
          </Field>

          <Field label="Aplica a">
            <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} style={input}>
              <option value="" style={opt}>Todo el negocio</option>
              {professionals.map((p) => <option key={p.id} value={p.id} style={opt}>{p.name}</option>)}
            </select>
          </Field>

          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Desde"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={input} /></Field>
            <Field label="Hasta"><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={input} /></Field>
          </div>

          <Field label="Repetición">
            <div style={{ display: 'flex', gap: 6 }}>
              {([['once', 'Solo este día'], ['daily', 'Todos los días'], ['weekdays', 'Lun a Vie']] as [Repeat, string][]).map(([v, lbl]) => {
                const on = repeat === v
                return (
                  <button key={v} onClick={() => setRepeat(v)}
                    style={{ flex: 1, padding: '9px 6px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      background: on ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)',
                      border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: on ? '#60a5fa' : 'rgba(255,255,255,0.5)', fontFamily: 'inherit' }}>
                    {lbl}
                  </button>
                )
              })}
            </div>
          </Field>

          {repeat === 'once' && (
            <Field label="¿Qué día?">
              <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={input} />
            </Field>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}

          <button onClick={save} disabled={saving} style={{ ...btnPrimary, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear bloqueo'}
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

const opt: React.CSSProperties = { background: '#0d0d1a', color: 'white' }
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '11px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
