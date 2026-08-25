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
const moneyCur = (n: number, cur: string) => {
  try { return n.toLocaleString('es-AR', { style: 'currency', currency: cur, minimumFractionDigits: 0 }) }
  catch { return `${cur} ${n.toLocaleString('es-AR')}` }
}

// ── Tema de la página pública (lo elige el negocio en Configuración) ──
// Se aplica con variables CSS en el contenedor de Shell; el modo oscuro
// reproduce exactamente los colores originales.
export type PublicTheme = 'light' | 'dark'
const THEME_VARS: Record<PublicTheme, React.CSSProperties> = {
  dark: {
    ['--pb-page' as string]: '#07070F',
    ['--pb-card' as string]: '#0d0d18',
    ['--pb-card-border' as string]: 'rgba(37,99,255,0.2)',
    ['--pb-text' as string]: '#ffffff',
    ['--pb-text-mut' as string]: 'rgba(255,255,255,0.6)',
    ['--pb-text-faint' as string]: 'rgba(255,255,255,0.42)',
    ['--pb-text-dim' as string]: 'rgba(255,255,255,0.25)',
    ['--pb-input-bg' as string]: 'rgba(0,0,0,0.35)',
    ['--pb-input-border' as string]: 'rgba(255,255,255,0.1)',
    ['--pb-soft-bg' as string]: 'rgba(255,255,255,0.04)',
    ['--pb-soft-border' as string]: 'rgba(255,255,255,0.1)',
    ['--pb-opt-bg' as string]: '#0d0d1a',
    ['--pb-shadow' as string]: '0 24px 60px rgba(0,0,0,0.5)',
  },
  light: {
    ['--pb-page' as string]: '#f4f5fa',
    ['--pb-card' as string]: '#ffffff',
    ['--pb-card-border' as string]: 'rgba(37,99,255,0.25)',
    ['--pb-text' as string]: '#15162a',
    ['--pb-text-mut' as string]: 'rgba(20,22,42,0.62)',
    ['--pb-text-faint' as string]: 'rgba(20,22,42,0.45)',
    ['--pb-text-dim' as string]: 'rgba(20,22,42,0.3)',
    ['--pb-input-bg' as string]: '#ffffff',
    ['--pb-input-border' as string]: 'rgba(20,22,42,0.18)',
    ['--pb-soft-bg' as string]: 'rgba(20,22,42,0.035)',
    ['--pb-soft-border' as string]: 'rgba(20,22,42,0.1)',
    ['--pb-opt-bg' as string]: '#ffffff',
    ['--pb-shadow' as string]: '0 24px 60px rgba(20,22,42,0.14)',
  },
}

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
  const deposit = ready ? (info.deposit ?? null) : null

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

  // Tema elegido por el negocio (por defecto claro, mejor para estética/belleza).
  const theme: PublicTheme = info && info.enabled && info.theme ? info.theme : 'light'

  // ── Estados de carga / error ──
  if (loadError) return <Shell theme={theme}><Msg title="No pudimos cargar la página" text="Verificá el enlace e intentá de nuevo." /></Shell>
  if (!info) return <Shell theme={theme}><Msg title="Cargando…" text="" /></Shell>
  if (!ready) return <Shell theme={theme}><Msg title="Reservas no disponibles" text="Este negocio no tiene las reservas online activas en este momento." /></Shell>

  if (done) {
    return (
      <Shell businessName={info.name} logo={info.logo} poweredBy={info.powered_by !== false} theme={theme}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Check size={32} color="#34d399" />
          </div>
          <h2 style={{ color: 'var(--pb-text)', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
            {deposit ? '¡Turno reservado!' : '¡Reserva confirmada!'}
          </h2>
          <p style={{ color: 'var(--pb-text-mut)', fontSize: 14, margin: '0 0 20px' }}>
            {deposit ? 'Para confirmarlo, aboná la seña. Guardá estos datos:' : 'Te esperamos. Guardá estos datos:'}
          </p>
          <div style={{ background: 'var(--pb-soft-bg)', border: '1px solid var(--pb-soft-border)', borderRadius: 12, padding: 18, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row icon={<Calendar size={16} />} text={done.date} />
            <Row icon={<Clock size={16} />} text={`${done.time} hs`} />
            <Row icon={<User size={16} />} text={`${done.service} · ${done.prof}`} />
          </div>

          {deposit && (
            <div style={{ marginTop: 16, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: 18, textAlign: 'left' }}>
              <p style={{ color: 'var(--pb-text)', fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>
                Seña: {moneyCur(deposit.amount, deposit.currency)}
              </p>
              {deposit.note && <p style={{ color: 'var(--pb-text-mut)', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>{deposit.note}</p>}
              {deposit.link && /^https?:\/\//i.test(deposit.link.trim()) ? (
                <a href={deposit.link.trim()} target="_blank" rel="noopener noreferrer"
                  style={{ ...btnPrimary, textDecoration: 'none', boxShadow: '0 0 24px rgba(52,211,153,0.3)', background: 'linear-gradient(135deg,#34d399,#10b981)' }}>
                  Pagar la seña
                </a>
              ) : deposit.link ? (
                <div>
                  <p style={{ color: 'var(--pb-text-mut)', fontSize: 12, margin: '0 0 5px' }}>Transferí la seña a:</p>
                  <p style={{ color: 'var(--pb-text)', fontSize: 17, fontWeight: 800, margin: 0, userSelect: 'all', letterSpacing: '0.02em', wordBreak: 'break-all' }}>{deposit.link.trim()}</p>
                </div>
              ) : (
                <p style={{ color: 'var(--pb-text-mut)', fontSize: 12.5, margin: 0 }}>El negocio te indicará cómo abonarla.</p>
              )}
              <p style={{ color: 'var(--pb-text-faint)', fontSize: 11.5, margin: '12px 0 0' }}>
                Tu turno queda reservado y se confirma cuando recibimos la seña.
              </p>
            </div>
          )}
        </div>
      </Shell>
    )
  }

  // ── Flujo de reserva ──
  return (
    <Shell businessName={info.name} logo={info.logo} poweredBy={info.powered_by !== false}>
      <h2 style={{ color: 'var(--pb-text)', fontSize: 19, fontWeight: 700, margin: '0 0 4px' }}>Reservar un turno</h2>
      <p style={{ color: 'var(--pb-text-faint)', fontSize: 13.5, margin: '0 0 22px' }}>Elegí el servicio, profesional y horario.</p>

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
              <p style={{ color: 'var(--pb-text-faint)', fontSize: 13 }}>Buscando horarios…</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--pb-text-faint)', fontSize: 13 }}>No hay horarios disponibles ese día. Probá con otra fecha.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                {slots.map((s) => (
                  <button key={s} onClick={() => setSlot(s)}
                    style={{ padding: '9px 0', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums',
                      background: slot === s ? 'rgba(37,99,255,0.3)' : 'var(--pb-soft-bg)',
                      border: slot === s ? '1px solid #2563FF' : '1px solid var(--pb-soft-border)',
                      color: slot === s ? '#2563FF' : 'var(--pb-text-mut)' }}>
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
            {deposit && (
              <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 10, padding: '11px 13px', color: 'var(--pb-text-mut)', fontSize: 12.5, lineHeight: 1.5 }}>
                💳 Este turno requiere una seña de <strong style={{ color: 'var(--pb-text)' }}>{moneyCur(deposit.amount, deposit.currency)}</strong>. Después de reservar te mostramos cómo pagarla.
              </div>
            )}
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

function Shell({ children, businessName, logo, poweredBy = true, theme = 'light' }: { children: React.ReactNode; businessName?: string; logo?: string | null; poweredBy?: boolean; theme?: PublicTheme }) {
  return (
    <div style={{ ...THEME_VARS[theme], minHeight: '100vh', background: 'var(--pb-page)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {(businessName || logo) && (
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            {logo
              ? <img src={logo} alt={businessName ?? 'logo'} style={{ maxWidth: 120, maxHeight: 90, objectFit: 'contain', marginBottom: 12 }} />
              // Sin logo propio: iniciales del negocio (nunca la marca de Vision).
              : businessName && <InitialsAvatar name={businessName} />}
            {businessName && <h1 style={{ color: 'var(--pb-text)', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'capitalize', fontFamily: "'Orbitron', sans-serif" }}>{businessName}</h1>}
          </div>
        )}
        <div style={{ background: 'var(--pb-card)', border: '1px solid var(--pb-card-border)', borderRadius: 18, padding: 26, boxShadow: 'var(--pb-shadow)' }}>
          {children}
        </div>
        {poweredBy && <p style={{ textAlign: 'center', color: 'var(--pb-text-dim)', fontSize: 11, marginTop: 18 }}>Reservas con Vision OS</p>}
      </div>
    </div>
  )
}

// Iniciales del negocio sobre un círculo de color derivado del nombre.
// Es el fallback cuando el salón no subió su logo: se ve intencional y
// nunca muestra una marca ajena.
function InitialsAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return (
    <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: "'Orbitron', sans-serif", background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 42%))`, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
      {initials || '★'}
    </div>
  )
}

function Msg({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <h2 style={{ color: 'var(--pb-text)', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{title}</h2>
      {text && <p style={{ color: 'var(--pb-text-faint)', fontSize: 14, margin: 0 }}>{text}</p>}
    </div>
  )
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--pb-text)', fontSize: 14.5, textTransform: 'capitalize' }}>
      <span style={{ color: '#60a5fa' }}>{icon}</span>{text}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--pb-text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7, fontFamily: "'Orbitron', sans-serif" }}>{label}</label>
      {children}
    </div>
  )
}

const opt: React.CSSProperties = { background: 'var(--pb-opt-bg)', color: 'var(--pb-text)' }
const input: React.CSSProperties = {
  width: '100%', background: 'var(--pb-input-bg)', border: '1px solid var(--pb-input-border)',
  // 16px evita el zoom automático del navegador móvil al enfocar el campo.
  borderRadius: 10, padding: '11px 13px', color: 'var(--pb-text)', fontSize: 16, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
  background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 10,
  padding: '13px 16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(37,99,255,0.35)', fontFamily: 'inherit',
}
