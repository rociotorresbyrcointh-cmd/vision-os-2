'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet, X, Search, Download } from 'lucide-react'
import type { Payment, PaymentMethod, PaymentKind, Patient } from '@/types/database'
import { createPayment, deletePayment, listPaymentsBetween, METHOD_LABELS, type PaymentInput } from '@/services/payments'
import { searchPatients, fullName } from '@/services/patients'
import { getDateKey } from '@/lib/date-utils'
import { exportToExcel } from '@/lib/excel'

const money = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })

function dayRange(d: Date) {
  const from = new Date(d); from.setHours(0, 0, 0, 0)
  const to = new Date(from); to.setDate(to.getDate() + 1)
  return { from: from.toISOString(), to: to.toISOString() }
}

const METHODS: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'mercadopago', 'otro']

export function PaymentsManager({ organizationId }: { organizationId: string }) {
  const [date, setDate] = useState(() => new Date())
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const refetch = useCallback(async (d: Date) => {
    setLoading(true)
    const { from, to } = dayRange(d)
    try { setPayments(await listPaymentsBetween(from, to)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refetch(date) }, [date, refetch])

  const total = useMemo(() => payments.reduce((s, p) => s + Number(p.amount), 0), [payments])
  const byMethod = useMemo(() => {
    const m = new Map<PaymentMethod, number>()
    for (const p of payments) m.set(p.method, (m.get(p.method) ?? 0) + Number(p.amount))
    return m
  }, [payments])

  const shift = (n: number) => setDate((d) => { const x = new Date(d); x.setDate(d.getDate() + n); return x })
  const isToday = getDateKey(date) === getDateKey(new Date())

  const remove = async (p: Payment) => {
    if (!confirm(`¿Eliminar este pago de ${money(Number(p.amount))}?`)) return
    await deletePayment(p.id)
    setPayments((l) => l.filter((x) => x.id !== p.id))
  }

  const exportExcel = () => {
    const rows = payments.map((p) => ({
      Fecha: new Date(p.paid_at).toLocaleDateString('es-AR'),
      Hora: new Date(p.paid_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      Monto: Number(p.amount),
      Método: METHOD_LABELS[p.method],
      Tipo: p.kind === 'seña' ? 'Seña' : 'Pago',
      Detalle: p.notes ?? '',
    }))
    rows.push({ Fecha: '', Hora: '', Monto: total, Método: '', Tipo: 'TOTAL', Detalle: '' })
    exportToExcel(`caja-${getDateKey(date)}.xlsx`, 'Caja', rows)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 880 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
            <Wallet size={20} color="#34d399" /> Caja
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 }}>Pagos y señas del día.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportExcel} disabled={payments.length === 0} style={{ ...btnGhost, opacity: payments.length === 0 ? 0.4 : 1 }} title="Descargar los pagos del día en Excel">
            <Download size={15} /> Exportar
          </button>
          <button onClick={() => setOpen(true)} style={btnPrimary}><Plus size={16} /> Registrar pago</button>
        </div>
      </div>

      {/* Navegación de día */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <button onClick={() => shift(-1)} style={navBtn}><ChevronLeft size={17} /></button>
        <button onClick={() => shift(1)} style={navBtn}><ChevronRight size={17} /></button>
        <button onClick={() => setDate(new Date())} style={{ ...navBtn, width: 'auto', padding: '0 13px', fontSize: 13, fontWeight: 600, opacity: isToday ? 0.5 : 1 }}>Hoy</button>
        <span style={{ color: 'white', fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>
          {date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        {loading && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>actualizando…</span>}
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ ...summaryCard, borderColor: 'rgba(52,211,153,0.3)' }}>
          <span style={summaryLabel}>Total del día</span>
          <span style={{ ...summaryValue, color: '#34d399' }}>{money(total)}</span>
        </div>
        {METHODS.filter((m) => byMethod.has(m)).map((m) => (
          <div key={m} style={summaryCard}>
            <span style={summaryLabel}>{METHOD_LABELS[m]}</span>
            <span style={summaryValue}>{money(byMethod.get(m)!)}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      {payments.length === 0 ? (
        <div style={emptyBox}>No hay pagos registrados este día.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {payments.map((p) => (
            <div key={p.id} style={row}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <Wallet size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{money(Number(p.amount))}</span>
                  {p.kind === 'seña' && <span style={tag}>Seña</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', flexWrap: 'wrap' }}>
                  <span>{METHOD_LABELS[p.method]}</span>
                  <span>{new Date(p.paid_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {p.notes && <span>{p.notes}</span>}
                </div>
              </div>
              <button onClick={() => remove(p)} style={{ ...iconDanger }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <PaymentForm
          organizationId={organizationId}
          date={date}
          onClose={() => setOpen(false)}
          onSaved={(p) => { setOpen(false); if (getDateKey(new Date(p.paid_at)) === getDateKey(date)) setPayments((l) => [p, ...l]) }}
        />
      )}
    </div>
  )
}

// ─── Formulario de pago ──────────────────────────────────────────
function PaymentForm({ organizationId, date, onClose, onSaved }: {
  organizationId: string; date: Date; onClose: () => void; onSaved: (p: Payment) => void
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('efectivo')
  const [kind, setKind] = useState<PaymentKind>('pago')
  const [notes, setNotes] = useState('')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [pQuery, setPQuery] = useState('')
  const [sug, setSug] = useState<Patient[]>([])
  const [showSug, setShowSug] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSearch = (v: string) => {
    setPQuery(v); setPatient(null)
    if (v.trim().length >= 2) searchPatients(v).then((r) => { setSug(r); setShowSug(true) }).catch(() => {})
    else { setSug([]); setShowSug(false) }
  }

  const save = async () => {
    const value = Number(amount)
    if (!value || value <= 0) { setError('Ingresá un monto válido.'); return }
    setSaving(true); setError('')
    // Mantener el día seleccionado pero con la hora actual
    const paidAt = new Date(); const d = new Date(date)
    paidAt.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    const input: PaymentInput = {
      appointment_id: null,
      patient_id: patient?.id ?? null,
      amount: value,
      method, kind,
      notes: notes.trim() || (patient ? fullName(patient) : null),
      paid_at: paidAt.toISOString(),
    }
    try { onSaved(await createPayment(organizationId, input)) }
    catch (e: any) { setError(e.message ?? 'Error al registrar el pago.'); setSaving(false) }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>Registrar pago</h2>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Field label="Monto">
            <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ ...input, fontSize: 18, fontWeight: 700 }} autoFocus />
          </Field>

          <Field label="Tipo">
            <div style={{ display: 'flex', gap: 6 }}>
              {([['pago', 'Pago'], ['seña', 'Seña']] as [PaymentKind, string][]).map(([v, lbl]) => {
                const on = kind === v
                return (
                  <button key={v} onClick={() => setKind(v)}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      background: on ? 'rgba(37,99,255,0.2)' : 'rgba(0,0,0,0.3)',
                      border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: on ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                    {lbl}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Método de pago">
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} style={input}>
              {METHODS.map((m) => <option key={m} value={m} style={opt}>{METHOD_LABELS[m]}</option>)}
            </select>
          </Field>

          <Field label="Paciente (opcional)">
            <div style={{ position: 'relative' }}>
              <input value={patient ? fullName(patient) : pQuery} onChange={(e) => onSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                placeholder="Buscar por nombre o DNI" style={input} autoComplete="off" />
              {showSug && sug.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#11111f', border: '1px solid rgba(37,99,255,0.3)', borderRadius: 9, overflow: 'hidden', zIndex: 20 }}>
                  {sug.map((p) => (
                    <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); setPatient(p); setShowSug(false) }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {fullName(p)}{p.dni ? ` · DNI ${p.dni}` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="Nota (opcional)">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: seña sesión, servicio…" style={input} />
          </Field>

          {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Registrar pago'}
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
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '10px 15px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const navBtn: React.CSSProperties = {
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
}
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const iconDanger: React.CSSProperties = {
  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171',
  borderRadius: 8, padding: 8, cursor: 'pointer', flexShrink: 0,
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 13, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px',
}
const summaryCard: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4, minWidth: 150,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 13, padding: '14px 18px',
}
const summaryLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }
const summaryValue: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }
const tag: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', borderRadius: 5, padding: '2px 7px' }
const emptyBox: React.CSSProperties = {
  padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14,
}
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 420, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
