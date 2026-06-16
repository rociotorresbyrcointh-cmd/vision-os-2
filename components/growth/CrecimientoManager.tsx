'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, HeartHandshake, CalendarClock, MessageCircle, Wand2, Copy, Check, RefreshCw } from 'lucide-react'
import type { Professional, Service, Appointment, Patient } from '@/types/database'
import type { Brand } from '@/services/org-settings'
import { getInactivePatients } from '@/services/patients'
import { listAppointmentsBetween } from '@/services/appointments'
import { listAllBlocks, expandBlocksForDay } from '@/services/blocked-times'
import { computeSlots, type Interval } from '@/lib/slots'
import { timeToMinutes } from '@/lib/date-utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'

type Tab = 'reactivar' | 'huecos'

const DEFAULT_REACT = '¡Hola {nombre}! 😊 Hace un tiempo que no te vemos. Tenemos lugar esta semana, ¿querés reservar tu turno? ¡Te esperamos! 💙'

export function CrecimientoManager({
  businessName, brand, professionals, services,
}: {
  businessName: string; brand: Brand; professionals: Professional[]; services: Service[]
}) {
  const [tab, setTab] = useState<Tab>('reactivar')
  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <TrendingUp size={20} color="#34d399" /> Crecimiento
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 20 }}>
        Herramientas con IA para traer más clientes y llenar tu agenda.
      </p>

      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, width: 'fit-content', flexWrap: 'wrap' }}>
        {([['reactivar', 'Reactivar clientes', HeartHandshake], ['huecos', 'Llenar huecos', CalendarClock]] as [Tab, string, any][]).map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: tab === t ? 'rgba(52,211,153,0.18)' : 'transparent', color: tab === t ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'reactivar' && <ReactivarTab businessName={businessName} brand={brand} />}
      {tab === 'huecos' && <HuecosTab brand={brand} professionals={professionals} />}
    </div>
  )
}

// ─── Reactivar clientes ──────────────────────────────────────────
function ReactivarTab({ businessName, brand }: { businessName: string; brand: Brand }) {
  const [days, setDays] = useState(60)
  const [list, setList] = useState<{ patient: Patient; lastVisit: string }[] | null>(null)
  const [msg, setMsg] = useState(DEFAULT_REACT)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    setList(null)
    getInactivePatients(days).then(setList).catch(() => setList([]))
  }, [days])

  const genMsg = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'reactivacion', brand, input: '' }) })
      const data = await res.json()
      if (res.ok && data.text) setMsg(data.text)
    } finally { setAiLoading(false) }
  }

  const send = (p: Patient) => {
    if (!p.phone) return
    window.open(buildWhatsAppLink(p.phone, msg.replaceAll('{nombre}', p.first_name)), '_blank')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5 }}>No vienen hace más de</span>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...input, width: 'auto' }}>
          <option value={30} style={opt}>30 días</option>
          <option value={60} style={opt}>60 días</option>
          <option value={90} style={opt}>90 días</option>
          <option value={180} style={opt}>6 meses</option>
        </select>
      </div>

      {/* Mensaje */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Mensaje a enviar <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(usá <code style={{ color: '#34d399' }}>{'{nombre}'}</code>)</span></span>
          <button onClick={genMsg} disabled={aiLoading} style={aiBtn}><Wand2 size={14} /> {aiLoading ? 'Escribiendo…' : 'Escribir con IA'}</button>
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
      </div>

      {list === null ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Buscando…</p>
      ) : list.length === 0 ? (
        <div style={emptyBox}>🎉 No hay clientes inactivos en este período. ¡Todos vienen seguido!</div>
      ) : (
        <>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 12px' }}>{list.length} clientes para reactivar:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map(({ patient, lastVisit }) => (
              <div key={patient.id} style={row}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14.5 }}>{patient.first_name} {patient.last_name ?? ''}</p>
                  <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>
                    Última visita: {new Date(lastVisit).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {patient.phone ? ` · ${patient.phone}` : ' · sin teléfono'}
                  </p>
                </div>
                {patient.phone && (
                  <button onClick={() => send(patient)} style={waBtn}><MessageCircle size={15} /> Enviar</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Llenar huecos ───────────────────────────────────────────────
function HuecosTab({ brand, professionals }: { brand: Brand; professionals: Professional[] }) {
  const [slots, setSlots] = useState<{ name: string; times: string[] }[] | null>(null)
  const [promo, setPromo] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d })()

  useEffect(() => {
    const from = new Date(tomorrow)
    const to = new Date(tomorrow); to.setDate(to.getDate() + 1)
    Promise.all([
      listAppointmentsBetween(from.toISOString(), to.toISOString()),
      listAllBlocks().catch(() => []),
    ]).then(([appts, blocks]) => {
      const wd = tomorrow.getDay()
      const out: { name: string; times: string[] }[] = []
      for (const p of professionals) {
        if (!p.days_of_week.includes(wd)) continue
        const busy: Interval[] = (appts as Appointment[])
          .filter((a) => a.professional_id === p.id)
          .map((a) => {
            const s = new Date(a.start_time), e = new Date(a.end_time)
            return { start: s.getHours() * 60 + s.getMinutes(), end: e.getHours() * 60 + e.getMinutes() }
          })
        for (const b of expandBlocksForDay(blocks, tomorrow)) {
          if (b.professional_id && b.professional_id !== p.id) continue
          const s = new Date(b.start_time), e = new Date(b.end_time)
          busy.push({ start: s.getHours() * 60 + s.getMinutes(), end: e.getHours() * 60 + e.getMinutes() })
        }
        const free = computeSlots({
          weekday: wd, daysOfWeek: p.days_of_week,
          openMin: timeToMinutes(p.hours_start.slice(0, 5)), closeMin: timeToMinutes(p.hours_end.slice(0, 5)),
          durationMin: 30, busy, nowMinIfToday: null,
        })
        if (free.length) out.push({ name: p.name, times: free })
      }
      setSlots(out)
    }).catch(() => setSlots([]))
  }, [])

  const totalFree = slots?.reduce((s, x) => s + x.times.length, 0) ?? 0

  const genPromo = async () => {
    if (!slots) return
    const desc = slots.map((s) => `${s.name}: ${s.times.slice(0, 8).join(', ')}`).join('\n')
    setAiLoading(true); setPromo('')
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'promo_huecos', brand, input: desc }) })
      const data = await res.json()
      setPromo(res.ok ? data.text : (data.error ?? 'No se pudo generar.'))
    } finally { setAiLoading(false) }
  }

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, margin: '0 0 16px' }}>
        Horarios libres de <b style={{ color: 'white' }}>mañana</b> ({tomorrow.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}).
      </p>

      {slots === null ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Calculando huecos…</p>
      ) : totalFree === 0 ? (
        <div style={emptyBox}>🎉 ¡Mañana tenés la agenda llena! No hay huecos.</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {slots.map((s) => (
              <div key={s.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: '12px 14px' }}>
                <p style={{ margin: '0 0 8px', color: 'white', fontWeight: 600, fontSize: 14 }}>{s.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>· {s.times.length} libres</span></p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.times.map((t) => <span key={t} style={{ fontSize: 12.5, color: '#34d399', background: 'rgba(52,211,153,0.1)', borderRadius: 6, padding: '3px 9px', fontVariantNumeric: 'tabular-nums' }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          <button onClick={genPromo} disabled={aiLoading} style={{ ...aiBtn, padding: '11px 18px', fontSize: 14 }}>
            <Wand2 size={16} /> {aiLoading ? 'Generando…' : 'Generar promo con IA para llenarlos'}
          </button>

          {promo && (
            <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 13, padding: 18, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#34d399', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Promo generada</span>
                <button onClick={() => { navigator.clipboard.writeText(promo); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={copyBtn}>
                  {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                </button>
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{promo}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const opt: React.CSSProperties = { background: '#0d0d1a', color: 'white' }
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const aiBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(52,211,153,0.12)', color: '#34d399',
  border: '1px solid rgba(52,211,153,0.4)', borderRadius: 9, padding: '8px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
const waBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: 'rgba(37,211,102,0.12)', color: '#25d366',
  border: '1px solid rgba(37,211,102,0.4)', borderRadius: 8, padding: '8px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
const copyBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px',
}
const emptyBox: React.CSSProperties = {
  padding: 40, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.45)', fontSize: 14,
}
