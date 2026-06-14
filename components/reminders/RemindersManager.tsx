'use client'

import { useState, useEffect, useMemo } from 'react'
import { MessageCircle, Check, BellRing } from 'lucide-react'
import type { Professional, Service, Appointment } from '@/types/database'
import { listAppointmentsBetween, markReminderSent } from '@/services/appointments'
import { buildWhatsAppLink, renderTemplate, type WhatsAppTemplate } from '@/lib/whatsapp'

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export function RemindersManager({
  businessName,
  templates,
  professionals,
  services,
}: {
  businessName: string
  templates: WhatsAppTemplate[]
  professionals: Professional[]
  services: Service[]
}) {
  const [appts, setAppts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  // por defecto, la plantilla de recordatorio
  const [tplId, setTplId] = useState(
    templates.find((t) => t.id === 'recordatorio')?.id ?? templates[1]?.id ?? templates[0]?.id ?? ''
  )

  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d
  }, [])

  useEffect(() => {
    const from = new Date(tomorrow)
    const to = new Date(tomorrow); to.setDate(to.getDate() + 1)
    listAppointmentsBetween(from.toISOString(), to.toISOString())
      .then((a) => setAppts(a.filter((x) => x.status !== 'cancelled')))
      .finally(() => setLoading(false))
  }, [tomorrow])

  const profName = (id: string) => professionals.find((p) => p.id === id)?.name ?? '—'
  const profColor = (id: string) => professionals.find((p) => p.id === id)?.color ?? '#888'
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? ''
  const tpl = templates.find((t) => t.id === tplId) ?? templates[0]

  const sorted = useMemo(
    () => [...appts].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [appts]
  )
  const conTelefono = sorted.filter((a) => a.client_phone?.trim())
  const enviados = conTelefono.filter((a) => a.reminder_sent_at).length

  const send = (a: Appointment) => {
    if (!a.client_phone || !tpl) return
    const msg = renderTemplate(tpl.body, {
      clientName: a.client_name,
      businessName,
      dateLabel: new Date(a.start_time).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
      timeLabel: hhmm(a.start_time),
      serviceName: svcName(a.service_id),
      professionalName: profName(a.professional_id),
    })
    window.open(buildWhatsAppLink(a.client_phone, msg), '_blank')
    // marcar como enviado (optimista)
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, reminder_sent_at: new Date().toISOString() } : x)))
    markReminderSent(a.id).catch(() => {})
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <BellRing size={20} color="#fbbf24" /> Recordatorios de mañana
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, textTransform: 'capitalize' }}>
        {tomorrow.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        <span style={{ textTransform: 'none' }}> · {loading ? 'cargando…' : `${conTelefono.length} con teléfono · ${enviados} enviados`}</span>
      </p>

      {/* Selector de mensaje */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Mensaje a enviar:</span>
        <select value={tplId} onChange={(e) => setTplId(e.target.value)} style={select}>
          {templates.map((t) => <option key={t.id} value={t.id} style={{ background: '#0d0d1a' }}>{t.title}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando turnos de mañana…</p>
      ) : sorted.length === 0 ? (
        <div style={emptyBox}>No hay turnos agendados para mañana.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((a) => {
            const sent = !!a.reminder_sent_at
            const phone = a.client_phone?.trim()
            return (
              <div key={a.id} style={row}>
                <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{hhmm(a.start_time)}</span>
                </div>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: profColor(a.professional_id) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.client_name}</p>
                  <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{svcName(a.service_id)} · {profName(a.professional_id)}</p>
                </div>
                {!phone ? (
                  <span style={{ flexShrink: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>sin teléfono</span>
                ) : (
                  <button onClick={() => send(a)} style={sent ? btnSent : btnWhats}>
                    {sent ? <><Check size={14} /> Enviado · reenviar</> : <><MessageCircle size={15} /> Enviar</>}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const select: React.CSSProperties = {
  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '8px 12px', color: 'white', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 14px',
}
const btnWhats: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: 'rgba(37,211,102,0.12)', color: '#25d366',
  border: '1px solid rgba(37,211,102,0.4)', borderRadius: 8, padding: '8px 13px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnSent: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 13px', fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
}
const emptyBox: React.CSSProperties = {
  padding: 40, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14,
}
