'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Clock, CheckCircle2, Wallet, ArrowRight, Plus, Sparkles, Check } from 'lucide-react'
import type { Professional, Service, Appointment, Payment } from '@/types/database'
import { listAppointmentsBetween } from '@/services/appointments'
import { listPaymentsBetween } from '@/services/payments'
import { seedExampleData } from '@/services/onboarding'
import { OnboardingChecklist, type SetupState } from '@/components/home/OnboardingChecklist'

const money = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: '#fbbf24' },
  confirmed: { label: 'Confirmado', color: '#34d399' },
  completed: { label: 'Atendido', color: '#60a5fa' },
  cancelled: { label: 'Cancelado', color: '#f87171' },
  no_show: { label: 'No vino', color: '#9ca3af' },
}

export function InicioDashboard({
  organizationId,
  businessName,
  professionals,
  services,
  setup,
}: {
  organizationId: string
  businessName: string
  professionals: Professional[]
  services: Service[]
  setup: SetupState
}) {
  const router = useRouter()
  const [appts, setAppts] = useState<Appointment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => Date.now())
  const [seeding, setSeeding] = useState(false)

  const loadExample = async () => {
    setSeeding(true)
    try { await seedExampleData(organizationId); router.refresh() }
    catch { setSeeding(false) }
  }

  useEffect(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    Promise.all([
      listAppointmentsBetween(today.toISOString(), tomorrow.toISOString()),
      listPaymentsBetween(today.toISOString(), tomorrow.toISOString()),
    ]).then(([a, p]) => { setAppts(a); setPayments(p) })
      .finally(() => setLoading(false))
  }, [])

  const profName = (id: string) => professionals.find((p) => p.id === id)?.name ?? '—'
  const profColor = (id: string) => professionals.find((p) => p.id === id)?.color ?? '#888'
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? ''

  const m = useMemo(() => {
    const activos = appts.filter((a) => a.status !== 'cancelled')
    const cobrado = payments.reduce((s, p) => s + Number(p.amount), 0)
    const atendidos = appts.filter((a) => a.status === 'completed').length
    const proximos = activos
      .filter((a) => new Date(a.end_time).getTime() > now && a.status !== 'completed')
      .sort((x, y) => new Date(x.start_time).getTime() - new Date(y.start_time).getTime())
    return { total: activos.length, cobrado, atendidos, proximos }
  }, [appts, payments, now])

  const today = new Date()
  const hora = today.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const setupPending = professionals.length === 0 || services.length === 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
          {saludo}, <span style={{ color: '#60a5fa' }}>{businessName}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 5, textTransform: 'capitalize' }}>
          {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {setupPending ? (
        <div style={{ background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 14, padding: 24, maxWidth: 640 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>¡Bienvenido a Vision OS! 🚀</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 18px', lineHeight: 1.6 }}>
            Configurá tu negocio en 2 pasos. O cargá <b>datos de ejemplo</b> para explorar la app ya funcionando.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <Step n={1} done={professionals.length > 0} title="Cargá tu primer profesional" desc="Quién atiende, sus días y horarios" href="/profesionales" />
            <Step n={2} done={services.length > 0} title="Cargá tus servicios" desc="Qué ofrecés, duración y precio" href="/servicios" />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>
              ¿Querés ver cómo funciona primero? Cargá datos de ejemplo (un profesional, servicios, una paciente y turnos de hoy). Después los podés borrar.
            </p>
            <button onClick={loadExample} disabled={seeding} style={{ ...btnExample, opacity: seeding ? 0.6 : 1 }}>
              <Sparkles size={16} /> {seeding ? 'Cargando ejemplo…' : 'Cargar datos de ejemplo'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <OnboardingChecklist setup={setup} />

          {/* KPIs del día */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 26 }}>
            <Kpi icon={<CalendarDays size={18} />} color="#60a5fa" label="Turnos hoy" value={loading ? '—' : String(m.total)} />
            <Kpi icon={<Clock size={18} />} color="#fbbf24" label="Próximos" value={loading ? '—' : String(m.proximos.length)} />
            <Kpi icon={<CheckCircle2 size={18} />} color="#34d399" label="Atendidos" value={loading ? '—' : String(m.atendidos)} />
            <Kpi icon={<Wallet size={18} />} color="#a78bfa" label="Cobrado hoy" value={loading ? '—' : money(m.cobrado)} />
          </div>

          {/* Próximos turnos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>Próximos turnos de hoy</h2>
            <Link href="/agenda" style={{ ...linkBtn }}>Ver agenda <ArrowRight size={14} /></Link>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando…</p>
          ) : m.proximos.length === 0 ? (
            <div style={emptyBox}>
              No hay más turnos por hoy. <Link href="/agenda" style={{ color: '#60a5fa', textDecoration: 'none' }}>Agendar uno →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {m.proximos.slice(0, 8).map((a) => {
                const st = STATUS[a.status] ?? STATUS.pending
                return (
                  <Link key={a.id} href="/agenda" style={{ textDecoration: 'none' }}>
                    <div style={row}>
                      <div style={{ width: 58, textAlign: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{hhmm(a.start_time)}</span>
                      </div>
                      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: profColor(a.professional_id) }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.client_name}</p>
                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{svcName(a.service_id)} · {profName(a.professional_id)}</p>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: st.color, background: `${st.color}1f`, border: `1px solid ${st.color}44`, borderRadius: 7, padding: '4px 9px' }}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Accesos rápidos */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 26 }}>
            <Link href="/agenda" style={btnPrimary}><Plus size={15} /> Nuevo turno</Link>
            <Link href="/pacientes" style={btnGhost}>Pacientes</Link>
            <Link href="/pagos" style={btnGhost}>Caja</Link>
            <Link href="/reportes" style={btnGhost}>Reportes</Link>
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, marginBottom: 8 }}>
        {icon}<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

function Step({ n, done, title, desc, href }: { n: number; done: boolean; title: string; desc: string; href: string }) {
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: '13px 15px', textDecoration: 'none' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14,
        background: done ? '#34d399' : 'rgba(37,99,255,0.2)', color: done ? '#07241a' : '#60a5fa' }}>
        {done ? <Check size={16} /> : n}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 14.5, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>{title}</p>
        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{desc}</p>
      </div>
      {!done && <ArrowRight size={16} color="rgba(255,255,255,0.4)" />}
    </Link>
  )
}

const btnExample: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,211,238,0.12)', color: '#22d3ee',
  border: '1px solid rgba(34,211,238,0.4)', borderRadius: 9, padding: '11px 18px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 14px', cursor: 'pointer',
}
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 13.5, fontWeight: 700,
  cursor: 'pointer', textDecoration: 'none', boxShadow: '0 0 20px rgba(37,99,255,0.3)',
}
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '10px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
}
const linkBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, color: '#60a5fa', fontSize: 13, fontWeight: 600, textDecoration: 'none',
}
const emptyBox: React.CSSProperties = {
  padding: 32, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.45)', fontSize: 14,
}
