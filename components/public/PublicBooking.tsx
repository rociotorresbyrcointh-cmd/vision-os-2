'use client'

import { useState, useEffect } from 'react'
import { Check, Calendar, Clock, User } from 'lucide-react'
import { getDateKey, minutesToTime, timeToMinutes } from '@/lib/date-utils'
import { computeSlots, type Interval } from '@/lib/slots'
import {
  getPublicInfo, getBusy, getPublicBlocks, bookPublic,
  type PublicInfo, type PublicService, type PublicProfessional, type PublicBlock,
} from '@/services/public-booking'

const money = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Convierte un bloqueo en su intervalo (en minutos) para un día/profesional, o null
function blockInterval(b: PublicBlock, date: Date, profId: string): Interval | null {
  if (b.professional_id && b.professional_id !== profId) return null
  const rule = b.recurring_rule as any
  const start = new Date(b.start_time), end = new Date(b.end_time)
  const wd = date.getDay()
  let applies = false
  if (!rule) applies = getDateKey(start) === getDateKey(date)
  else if (rule.freq === 'daily') applies = true
  else if (rule.freq === 'weekly') applies = Array.isArray(rule.days) && rule.days.includes(wd)
  if (!applies) return null
  return { start: start.getHours() * 60 + start.getMinutes(), end: end.getHours() * 60 + end.getMinutes() }
}

export function PublicBooking({ orgId }: { orgId: string }) {
  const [info, setInfo] = useState<PublicInfo | null>(null)
  const [blocks, setBlocks] = useState<PublicBlock[]>([])
  const [loadError, setLoadError] = useState(false)

  const [serviceId, setServiceId] = useState('')
  const [profId, setProfId] = useState('')
  const [dateKey, setDateKey] = useState(getDateKey(new Date()))
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slot, setSlot] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<null | { date: string; time: string; service: string; prof: string }>(null)

  useEffect(() => {
    Promise.all([getPublicInfo(orgId), getPublicBlocks(orgId).catch(() => [])])
      .then(([i, b]) => { setInfo(i); setBlocks(b) })
      .catch(() => setLoadError(true))
  }, [orgId])

  const ready = info?.enabled === true
  const service = ready ? info.services.find((s) => s.id === serviceId) : undefined
  const professional = ready ? info.professionals.find((p) => p.id === profId) : undefined

  // Recalcula slots cuando hay servicio + profesional + fecha
  useEffect(() => {
    if (!service || !professional) { setSlots([]); return }
    setSlotsLoading(true); setSlot('')
    const date = parseDateKey(dateKey)
    const from = new Date(date); from.setHours(0, 0, 0, 0)
    const to = new Date(from); to.setDate(to.getDate() + 1)

    getBusy(orgId, professional.id, from.toISOString(), to.toISOString())
      .then((busyRaw) => {
        const busy: Interval[] = busyRaw.map((b) => {
          const s = new Date(b.start_time), e = new Date(b.end_time)
          return { start: s.getHours() * 60 + s.getMinutes(), end: e.getHours() * 60 + e.getMinutes() }
        })
        for (const b of blocks) {
          const iv = blockInterval(b, date, professional.id)
          if (iv) busy.push(iv)
        }
        const todayKey = getDateKey(new Date())
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
        setSlots(computeSlots({
          weekday: date.getDay(),
          daysOfWeek: professional.days_of_week,
          openMin: timeToMinutes(professional.hours_start.slice(0, 5)),
          closeMin: timeToMinutes(professional.hours_end.slice(0, 5)),
          durationMin: service.duration_minutes,
          busy,
          nowMinIfToday: dateKey === todayKey ? nowMin : null,
        }))
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [orgId, service, professional, dateKey, blocks])

  const confirm = async () => {
    if (!service || !professional || !slot) return
    if (!name.trim()) { setError('Ingresá tu nombre.'); return }
    if (!phone.trim()) { setError('Ingresá tu teléfono.'); return }
    setBooking(true); setError('')
    const date = parseDateKey(dateKey)
    const startMin = timeToMinutes(slot)
    const start = new Date(date); start.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
    const end = new Date(start); end.setMinutes(end.getMinutes() + service.duration_minutes)
    try {
      await bookPublic({
        orgId, profId: professional.id, serviceId: service.id,
        name: name.trim(), phone: phone.trim(),
        startISO: start.toISOString(), endISO: end.toISOString(),
      })
      setDone({
        date: date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
        time: slot, service: service.name, prof: professional.name,
      })
    } catch (e: any) {
      setError('Ese horario ya fue tomado. Elegí otro, por favor.')
      setSlot('')
      // recalcular slots
      setServiceId((s) => s)
    } finally {
      setBooking(false)
    }
  }

  // ── Estados de carga / error ──
  if (loadError) return <Shell><Msg title="No pudimos cargar la página" text="Verificá el enlace e intentá de nuevo." /></Shell>
  if (!info) return <Shell><Msg title="Cargando…" text="" /></Shell>
  if (!ready) return <Shell><Msg title="Reservas no disponibles" text="Este negocio no tiene las reservas online activas en este momento." /></Shell>

  if (done) {
    return (
      <Shell businessName={info.name} logo={info.logo}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Check size={32} color="#34d399" />
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>¡Reserva confirmada!</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '0 0 20px' }}>Te esperamos. Guardá estos datos:</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 18, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row icon={<Calendar size={16} />} text={done.date} />
            <Row icon={<Clock size={16} />} text={`${done.time} hs`} />
            <Row icon={<User size={16} />} text={`${done.service} · ${done.prof}`} />
          </div>
        </div>
      </Shell>
    )
  }

  // ── Flujo de reserva ──
  return (
    <Shell businessName={info.name} logo={info.logo}>
      <h2 style={{ color: 'white', fontSize: 19, fontWeight: 700, margin: '0 0 4px' }}>Reservar un turno</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, margin: '0 0 22px' }}>Elegí el servicio, profesional y horario.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Servicio">
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={input}>
            <option value="" style={opt}>Elegí un servicio…</option>
            {info.services.map((s) => (
              <option key={s.id} value={s.id} style={opt}>{s.name} · {s.duration_minutes}min{s.price ? ` · ${money(s.price)}` : ''}</option>
            ))}
          </select>
        </Field>

        <Field label="Profesional">
          <select value={profId} onChange={(e) => setProfId(e.target.value)} style={input} disabled={!serviceId}>
            <option value="" style={opt}>Elegí un profesional…</option>
            {info.professionals.map((p) => <option key={p.id} value={p.id} style={opt}>{p.name}</option>)}
          </select>
        </Field>

        <Field label="Día">
          <input type="date" value={dateKey} min={getDateKey(new Date())} onChange={(e) => setDateKey(e.target.value)} style={input} disabled={!profId} />
        </Field>

        {service && professional && (
          <Field label="Horario disponible">
            {slotsLoading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Buscando horarios…</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No hay horarios disponibles ese día. Probá con otra fecha.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                {slots.map((s) => (
                  <button key={s} onClick={() => setSlot(s)}
                    style={{ padding: '9px 0', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums',
                      background: slot === s ? 'rgba(37,99,255,0.3)' : 'rgba(255,255,255,0.04)',
                      border: slot === s ? '1px solid #2563FF' : '1px solid rgba(255,255,255,0.1)',
                      color: slot === s ? 'white' : 'rgba(255,255,255,0.7)' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Field>
        )}

        {slot && (
          <>
            <div style={{ display: 'flex', gap: 12 }}>
              <Field label="Tu nombre"><input value={name} onChange={(e) => setName(e.target.value)} style={input} /></Field>
              <Field label="Teléfono"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" style={input} /></Field>
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 12.5, margin: 0 }}>{error}</p>}
            <button onClick={confirm} disabled={booking} style={{ ...btnPrimary, opacity: booking ? 0.6 : 1 }}>
              {booking ? 'Confirmando…' : `Confirmar turno · ${slot} hs`}
            </button>
          </>
        )}
      </div>
    </Shell>
  )
}

function Shell({ children, businessName, logo }: { children: React.ReactNode; businessName?: string; logo?: string | null }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {(businessName || logo) && (
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            {logo && <img src={logo} alt={businessName ?? 'logo'} style={{ maxWidth: 120, maxHeight: 90, objectFit: 'contain', marginBottom: 12 }} />}
            {businessName && <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'capitalize', fontFamily: "'Orbitron', sans-serif" }}>{businessName}</h1>}
          </div>
        )}
        <div style={{ background: '#0d0d18', border: '1px solid rgba(37,99,255,0.2)', borderRadius: 18, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {children}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 18 }}>Reservas con Vision OS</p>
      </div>
    </div>
  )
}

function Msg({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{title}</h2>
      {text && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>{text}</p>}
    </div>
  )
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 14.5, textTransform: 'capitalize' }}>
      <span style={{ color: '#60a5fa' }}>{icon}</span>{text}
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

const opt: React.CSSProperties = { background: '#0d0d1a', color: 'white' }
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '11px 13px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
  background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 10,
  padding: '13px 16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(37,99,255,0.35)', fontFamily: 'inherit',
}
