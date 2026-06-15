'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, MessageCircle, Wallet, UserPlus, Globe } from 'lucide-react'
import type { Professional, Service, Appointment, AppointmentStatus, BlockedTime, Payment, PaymentMethod, PaymentKind } from '@/types/database'
import { minutesToTime, timeToMinutes, getDateKey } from '@/lib/date-utils'
import { buildWhatsAppLink, renderTemplate, type WhatsAppTemplate } from '@/lib/whatsapp'
import { createAppointment, updateAppointment, deleteAppointment } from '@/services/appointments'
import { expandBlocksForDay } from '@/services/blocked-times'
import { searchPatients, fullName } from '@/services/patients'
import { createPayment, listPaymentsByAppointment, deletePayment, METHOD_LABELS } from '@/services/payments'
import { payStatus } from '@/lib/pay-status'
import { PatientFormModal } from '@/components/patients/PatientFormModal'
import type { Patient } from '@/types/database'

const money = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
const PAY_METHODS: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'mercadopago', 'otro']

export type ModalSeed =
  | { professionalId: string; date: Date; startMin: number }
  | { edit: Appointment }

// "2026-06-13" → Date local (evita el corrimiento de día por UTC)
function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Completado' },
  { value: 'no_show', label: 'No asistió' },
]

function buildISO(date: Date, minutes: number): string {
  const d = new Date(date)
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return d.toISOString()
}

export function AppointmentModal({
  seed,
  organizationId,
  businessName,
  whatsappTemplates,
  professionals,
  services,
  blocks,
  onClose,
  onSaved,
  onDeleted,
  onPaid,
}: {
  seed: ModalSeed
  organizationId: string
  businessName: string
  whatsappTemplates: WhatsAppTemplate[]
  professionals: Professional[]
  services: Service[]
  blocks: BlockedTime[]
  onClose: () => void
  onSaved: (a: Appointment) => void
  onDeleted: (id: string) => void
  onPaid: () => void
}) {
  const editing = 'edit' in seed ? seed.edit : null
  const baseDate = 'edit' in seed ? new Date(seed.edit.start_time) : seed.date
  const initialStartMin = 'edit' in seed
    ? new Date(seed.edit.start_time).getHours() * 60 + new Date(seed.edit.start_time).getMinutes()
    : seed.startMin

  const [dateKey, setDateKey] = useState(getDateKey(baseDate))
  const selectedDate = parseDateKey(dateKey)
  const [clientName, setClientName] = useState(editing?.client_name ?? '')
  const [clientPhone, setClientPhone] = useState(editing?.client_phone ?? '')
  const [patientId, setPatientId] = useState<string | null>(editing?.patient_id ?? null)
  const [suggestions, setSuggestions] = useState<Patient[]>([])
  const [showSug, setShowSug] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)

  const onNameChange = (value: string) => {
    setClientName(value)
    setPatientId(null) // si reescribe, se desvincula hasta elegir de nuevo
    if (value.trim().length >= 2) {
      searchPatients(value).then((r) => { setSuggestions(r); setShowSug(true) }).catch(() => {})
    } else {
      setSuggestions([]); setShowSug(false)
    }
  }
  const pickPatient = (p: Patient) => {
    setClientName(fullName(p))
    setClientPhone(p.phone ?? p.whatsapp ?? '')
    setPatientId(p.id)
    setShowSug(false)
  }
  const [professionalId, setProfessionalId] = useState(
    editing?.professional_id ?? ('professionalId' in seed ? seed.professionalId : professionals[0]?.id ?? '')
  )
  const [serviceId, setServiceId] = useState(editing?.service_id ?? services[0]?.id ?? '')
  const [startTime, setStartTime] = useState(minutesToTime(initialStartMin))
  const [status, setStatus] = useState<AppointmentStatus>(editing?.status ?? 'pending')
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [capacity, setCapacity] = useState(editing?.capacity_consumed ?? 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const service = services.find((s) => s.id === serviceId)
  const professional = professionals.find((p) => p.id === professionalId)
  const maxCapacity = professional?.max_capacity_per_hour ?? 1
  const startMin = timeToMinutes(startTime)
  const endMin = startMin + (service?.duration_minutes ?? 60)

  // ─── Cobro vinculado al turno ──────────────────────────────────
  const [payments, setPayments] = useState<Payment[]>([])
  const [cobrarOpen, setCobrarOpen] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('efectivo')
  const [payKind, setPayKind] = useState<PaymentKind>('pago')
  const [paySaving, setPaySaving] = useState(false)
  const [payError, setPayError] = useState('')
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)

  useEffect(() => {
    if (editing) listPaymentsByAppointment(editing.id)
      .then(setPayments)
      .catch((e) => setPayError(`No se pudieron cargar los cobros: ${e.message}`))
  }, [editing])

  const openCobrar = () => {
    setPayAmount(service?.price ? String(service.price) : '')
    setPayKind('pago')
    setCobrarOpen(true)
  }
  const confirmCobro = async () => {
    const value = Number(payAmount)
    if (!editing || !value || value <= 0) return
    setPaySaving(true); setPayError('')
    try {
      const p = await createPayment(organizationId, {
        appointment_id: editing.id,
        patient_id: patientId,
        amount: value,
        method: payMethod,
        kind: payKind,
        notes: clientName.trim() || null,
        paid_at: new Date().toISOString(),
      })
      setPayments((l) => [...l, p])
      setCobrarOpen(false)
      onPaid()
    } catch (e: any) {
      setPayError(`No se pudo guardar el cobro: ${e.message ?? e}`)
    } finally {
      setPaySaving(false)
    }
  }
  const removePayment = async (id: string) => {
    if (!confirm('¿Eliminar este cobro?')) return
    await deletePayment(id)
    setPayments((l) => l.filter((x) => x.id !== id))
    onPaid()
  }

  const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

  const save = async () => {
    if (!clientName.trim()) { setError('El nombre del cliente es obligatorio.'); return }
    if (!serviceId) { setError('Elegí un servicio.'); return }
    if (!professionalId) { setError('Elegí un profesional.'); return }

    // Validar que el profesional trabaje ese día y a esa hora
    if (professional) {
      const weekday = selectedDate.getDay()
      if (!professional.days_of_week.includes(weekday)) {
        setError(`${professional.name} no atiende los ${DAY_NAMES[weekday]}.`)
        return
      }
      const profStart = timeToMinutes(professional.hours_start.slice(0, 5))
      const profEnd = timeToMinutes(professional.hours_end.slice(0, 5))
      if (startMin < profStart || endMin > profEnd) {
        setError(`${professional.name} atiende de ${professional.hours_start.slice(0, 5)} a ${professional.hours_end.slice(0, 5)}.`)
        return
      }
    }

    // Validar que no caiga sobre un bloqueo (almuerzo, vacaciones…)
    const dayBlocks = expandBlocksForDay(blocks, selectedDate)
    const clash = dayBlocks.find((b) => {
      if (b.professional_id && b.professional_id !== professionalId) return false
      const bs = new Date(b.start_time).getHours() * 60 + new Date(b.start_time).getMinutes()
      const be = new Date(b.end_time).getHours() * 60 + new Date(b.end_time).getMinutes()
      return startMin < be && endMin > bs // hay solapamiento
    })
    if (clash) {
      setError(`Hay un bloqueo ("${clash.title}") en ese horario.`)
      return
    }

    setSaving(true); setError('')
    const payload = {
      professional_id: professionalId,
      service_id: serviceId,
      patient_id: patientId,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim() || null,
      start_time: buildISO(selectedDate, startMin),
      end_time: buildISO(selectedDate, endMin),
      status,
      notes: notes.trim() || null,
      capacity_consumed: maxCapacity > 1 ? capacity : 1,
      // Solo las personas (capacidad 1) bloquean solapamientos;
      // los recursos/cabinas permiten turnos simultáneos hasta su capacidad.
      blocks_overlap: maxCapacity === 1,
    }
    try {
      const saved = editing
        ? await updateAppointment(editing.id, payload)
        : await createAppointment(organizationId, payload)
      onSaved(saved)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar.')
      setSaving(false)
    }
  }

  const [showTemplates, setShowTemplates] = useState(false)

  const sendWhatsApp = (tpl: WhatsAppTemplate) => {
    if (!clientPhone.trim()) return
    const msg = renderTemplate(tpl.body, {
      clientName: clientName.trim() || 'cliente',
      businessName,
      dateLabel: selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
      timeLabel: startTime,
      serviceName: service?.name ?? '',
      professionalName: professional?.name ?? '',
    })
    window.open(buildWhatsAppLink(clientPhone, msg), '_blank')
    setShowTemplates(false)
  }

  const remove = async () => {
    if (!editing || !confirm('¿Eliminar este turno?')) return
    await deleteAppointment(editing.id)
    onDeleted(editing.id)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>
            {editing ? 'Editar turno' : 'Nuevo turno'}
          </h2>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {editing?.source === 'public' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, color: '#22d3ee', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 9, padding: '9px 12px' }}>
              <Globe size={15} /> Este turno lo reservó el cliente desde el link online
            </div>
          )}
          <Field label="Cliente">
            <div style={{ position: 'relative' }}>
              <input
                value={clientName}
                onChange={(e) => onNameChange(e.target.value)}
                onFocus={() => { if (suggestions.length) setShowSug(true) }}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                placeholder="Nombre del cliente"
                style={input}
                autoFocus
                autoComplete="off"
              />
              {patientId && (
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', borderRadius: 5, padding: '2px 7px' }}>
                  ✓ paciente
                </span>
              )}
              {showSug && clientName.trim().length >= 2 && !patientId && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#11111f', border: '1px solid rgba(37,99,255,0.3)', borderRadius: 9, overflow: 'hidden', zIndex: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                  {suggestions.map((p) => (
                    <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); pickPatient(p) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                      <span style={{ color: 'white', fontSize: 13.5, fontWeight: 600 }}>{fullName(p)}</span>
                      {(p.phone || p.health_insurance) && (
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5 }}>
                          {[p.phone, p.health_insurance].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </button>
                  ))}
                  {/* Crear paciente nuevo con lo tipeado */}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowSug(false); setQuickOpen(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', background: 'rgba(37,99,255,0.1)', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>
                    <UserPlus size={15} /> Crear paciente “{clientName.trim()}”
                  </button>
                </div>
              )}
            </div>
          </Field>

          <Field label="Teléfono (opcional)">
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="WhatsApp / teléfono" style={input} />
          </Field>

          <Field label="Profesional">
            <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} style={input}>
              {professionals.map((p) => <option key={p.id} value={p.id} style={opt}>{p.name}</option>)}
            </select>
          </Field>

          <Field label="Servicio">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={input}>
              {services.map((s) => <option key={s.id} value={s.id} style={opt}>{s.name} · {s.duration_minutes}m</option>)}
            </select>
          </Field>

          <Field label="Día">
            <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={input} />
          </Field>

          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Hora inicio">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={input} />
            </Field>
            <Field label="Termina">
              <div style={{ ...input, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>{minutesToTime(endMin)}</div>
            </Field>
          </div>

          <Field label="Estado">
            <select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)} style={input}>
              {STATUSES.map((s) => <option key={s.value} value={s.value} style={opt}>{s.label}</option>)}
            </select>
          </Field>

          {maxCapacity > 1 && (
            <Field label={`Capacidad que ocupa (de ${maxCapacity})`}>
              <select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} style={input}>
                {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} style={opt}>{n} {n === 1 ? 'lugar' : 'lugares'}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Cobro — solo en turnos ya creados */}
          {editing && (
            <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 11, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'white', fontWeight: 700, fontSize: 14 }}>
                  <Wallet size={16} color="#34d399" />
                  {(() => {
                    const price = service?.price ?? 0
                    const ps = payStatus(totalPaid, price)
                    if (ps === 'paid') return 'Pagado ✓'
                    if (ps === 'partial') return `Seña: ${money(totalPaid)} · falta ${money(Math.max(0, price - totalPaid))}`
                    return 'Sin cobrar'
                  })()}
                </span>
                {!cobrarOpen && (
                  <button onClick={openCobrar} style={btnCobrar}>+ Cobrar</button>
                )}
              </div>
              {service?.price ? (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  Precio del servicio: {money(service.price)}
                </p>
              ) : null}
              {payError && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#f87171' }}>{payError}</p>}

              {payments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                  {payments.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
                      <span>{money(Number(p.amount))} · {METHOD_LABELS[p.method]}{p.kind === 'seña' ? ' · seña' : ''}</span>
                      <button onClick={() => removePayment(p.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11 }}>Quitar</button>
                    </div>
                  ))}
                </div>
              )}

              {cobrarOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
                  <input type="number" inputMode="decimal" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Monto" style={{ ...input, fontWeight: 700 }} autoFocus />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)} style={{ ...input, flex: 1 }}>
                      {PAY_METHODS.map((m) => <option key={m} value={m} style={opt}>{METHOD_LABELS[m]}</option>)}
                    </select>
                    <select value={payKind} onChange={(e) => setPayKind(e.target.value as PaymentKind)} style={{ ...input, flex: 1 }}>
                      <option value="pago" style={opt}>Pago</option>
                      <option value="seña" style={opt}>Seña</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setCobrarOpen(false)} style={{ ...btnGhost, flex: 1, justifyContent: 'center' }}>Cancelar</button>
                    <button onClick={confirmCobro} disabled={paySaving} style={{ ...btnCobrar, flex: 1, justifyContent: 'center', opacity: paySaving ? 0.6 : 1 }}>
                      {paySaving ? 'Cobrando…' : 'Confirmar cobro'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}

          {clientPhone.trim() && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowTemplates((s) => !s)} style={btnWhats}>
                <MessageCircle size={16} /> Enviar por WhatsApp
              </button>
              {showTemplates && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6, background: '#11111f', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 10, overflow: 'hidden', zIndex: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                  {whatsappTemplates.map((t) => (
                    <button key={t.id} onClick={() => sendWhatsApp(t)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {editing && (
              <button onClick={remove} style={{ ...btnGhost, color: '#f87171', padding: '11px 14px' }}><Trash2 size={15} /></button>
            )}
            <button onClick={save} disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear turno'}
            </button>
          </div>
        </div>
      </div>

      {quickOpen && (
        <PatientFormModal
          organizationId={organizationId}
          initialName={clientName}
          onClose={() => setQuickOpen(false)}
          onSaved={(p) => { pickPatient(p); setQuickOpen(false) }}
        />
      )}
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
const btnCobrar: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.15)', color: '#34d399',
  border: '1px solid rgba(52,211,153,0.4)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnWhats: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
  background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.4)',
  borderRadius: 9, padding: '11px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  cursor: 'pointer', fontFamily: 'inherit', justifyContent: 'center',
}
const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 420, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
