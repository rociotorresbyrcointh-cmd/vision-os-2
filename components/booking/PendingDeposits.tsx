'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, X, Calendar, Clock, Phone } from 'lucide-react'
import type { Appointment, Professional, Service } from '@/types/database'
import { listPendingPublicBookings } from '@/services/pending-bookings'
import { updateAppointment } from '@/services/appointments'
import { createPayment } from '@/services/payments'

type Deposit = { amount: number; currency: string } | null

const fmt = (n: number, cur: string) => {
  try { return n.toLocaleString('es-AR', { style: 'currency', currency: cur, minimumFractionDigits: 0 }) }
  catch { return `${cur} ${n.toLocaleString('es-AR')}` }
}

export function PendingDeposits({
  organizationId, deposit, professionals, services,
}: {
  organizationId: string
  deposit: Deposit
  professionals: Professional[]
  services: Service[]
}) {
  const [list, setList] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const profName = (id: string) => professionals.find((p) => p.id === id)?.name ?? 'Profesional'
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? 'Servicio'

  async function load() {
    setLoading(true)
    try { setList(await listPendingPublicBookings()) }
    catch { /* ignorar */ }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  // Confirmar: opcionalmente registra la seña en Caja y marca el turno confirmado
  async function confirm(a: Appointment, withPayment: boolean) {
    setBusy(a.id)
    try {
      if (withPayment && deposit) {
        await createPayment(organizationId, {
          appointment_id: a.id,
          patient_id: a.patient_id ?? null,
          amount: deposit.amount,
          method: 'transferencia',
          kind: 'seña',
          notes: 'Seña de reserva online',
          paid_at: new Date().toISOString(),
        })
      }
      await updateAppointment(a.id, { status: 'confirmed' })
      await load()
    } catch (e) {
      alert('No se pudo confirmar: ' + (e instanceof Error ? e.message : 'error'))
    } finally { setBusy(null) }
  }

  async function cancel(a: Appointment) {
    if (!window.confirm(`¿Cancelar la reserva de ${a.client_name}?`)) return
    setBusy(a.id)
    try { await updateAppointment(a.id, { status: 'cancelled' }); await load() }
    catch (e) { alert('No se pudo cancelar: ' + (e instanceof Error ? e.message : 'error')) }
    finally { setBusy(null) }
  }

  if (loading) return null
  if (list.length === 0) return null

  return (
    <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.22)', borderRadius: 14, padding: '20px 22px', marginTop: 18, maxWidth: 720 }}>
      <h2 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={18} color="#34d399" /> Reservas online por confirmar ({list.length})
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
        {deposit
          ? 'Cuando recibas la seña, tocá "Confirmar pago": se registra en Caja y el turno queda confirmado.'
          : 'Confirmá o cancelá las reservas que llegaron desde tu portal.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((a) => {
          const d = new Date(a.start_time)
          const dis = busy === a.id
          return (
            <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 14.5, margin: 0 }}>{a.client_name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5, margin: '3px 0 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <span style={meta}><Calendar size={12} /> {d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span style={meta}><Clock size={12} /> {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {a.client_phone && <span style={meta}><Phone size={12} /> {a.client_phone}</span>}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '3px 0 0' }}>{svcName(a.service_id)} · {profName(a.professional_id)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 11, flexWrap: 'wrap' }}>
                {deposit ? (
                  <button onClick={() => confirm(a, true)} disabled={dis} style={{ ...btnOk, opacity: dis ? 0.5 : 1 }}>
                    <Check size={14} /> Confirmar pago · {fmt(deposit.amount, deposit.currency)}
                  </button>
                ) : (
                  <button onClick={() => confirm(a, false)} disabled={dis} style={{ ...btnOk, opacity: dis ? 0.5 : 1 }}>
                    <Check size={14} /> Confirmar
                  </button>
                )}
                <button onClick={() => cancel(a)} disabled={dis} style={{ ...btnCancel, opacity: dis ? 0.5 : 1 }}>
                  <X size={14} /> Cancelar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const meta: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4 }
const btnOk: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#34d399,#10b981)', color: 'white', border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const btnCancel: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
