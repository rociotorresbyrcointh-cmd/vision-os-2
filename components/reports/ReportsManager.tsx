'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { TrendingUp, CalendarDays, Receipt, UserX, Download } from 'lucide-react'
import type { Professional, Service, Appointment, Payment, PaymentMethod } from '@/types/database'
import { listAppointmentsBetween } from '@/services/appointments'
import { listPaymentsBetween, METHOD_LABELS } from '@/services/payments'
import { exportToExcel } from '@/lib/excel'

const money = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })

type Period = 'mes' | 'mesPasado' | 'dias30'

function rangeFor(p: Period): { from: Date; to: Date; label: string } {
  const now = new Date()
  if (p === 'mes') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return { from, to, label: 'Este mes' }
  }
  if (p === 'mesPasado') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from, to, label: 'Mes pasado' }
  }
  const to = new Date(now); to.setDate(to.getDate() + 1); to.setHours(0, 0, 0, 0)
  const from = new Date(to); from.setDate(from.getDate() - 30)
  return { from, to, label: 'Últimos 30 días' }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendientes', color: '#fbbf24' },
  confirmed: { label: 'Confirmados', color: '#34d399' },
  completed: { label: 'Completados', color: '#60a5fa' },
  cancelled: { label: 'Cancelados', color: '#f87171' },
  no_show: { label: 'No asistió', color: '#9ca3af' },
}

export function ReportsManager({
  professionals,
  services,
}: {
  professionals: Professional[]
  services: Service[]
}) {
  const [period, setPeriod] = useState<Period>('mes')
  const [appts, setAppts] = useState<Appointment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const { from, to, label } = useMemo(() => rangeFor(period), [period])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, p] = await Promise.all([
        listAppointmentsBetween(from.toISOString(), to.toISOString()),
        listPaymentsBetween(from.toISOString(), to.toISOString()),
      ])
      setAppts(a); setPayments(p)
    } finally { setLoading(false) }
  }, [from, to])

  useEffect(() => { load() }, [load])

  const m = useMemo(() => {
    const ingresos = payments.reduce((s, p) => s + Number(p.amount), 0)

    const byMethod = new Map<PaymentMethod, number>()
    for (const p of payments) byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + Number(p.amount))

    const byStatus = new Map<string, number>()
    for (const a of appts) byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1)

    const completados = byStatus.get('completed') ?? 0
    const noShow = byStatus.get('no_show') ?? 0
    const ausentismo = completados + noShow > 0 ? (noShow / (completados + noShow)) * 100 : 0

    // mapa turno -> profesional (para atribuir ingresos)
    const apptProf = new Map(appts.map((a) => [a.id, a.professional_id]))
    const paidAppts = new Set(payments.map((p) => p.appointment_id).filter(Boolean) as string[])
    const ticket = paidAppts.size > 0 ? ingresos / paidAppts.size : 0

    // por profesional
    const profStats = new Map<string, { turnos: number; ingresos: number }>()
    for (const a of appts) {
      const s = profStats.get(a.professional_id) ?? { turnos: 0, ingresos: 0 }
      s.turnos++; profStats.set(a.professional_id, s)
    }
    for (const p of payments) {
      const profId = p.appointment_id ? apptProf.get(p.appointment_id) : null
      if (!profId) continue
      const s = profStats.get(profId) ?? { turnos: 0, ingresos: 0 }
      s.ingresos += Number(p.amount); profStats.set(profId, s)
    }

    // servicios más vendidos
    const svcCount = new Map<string, number>()
    for (const a of appts) svcCount.set(a.service_id, (svcCount.get(a.service_id) ?? 0) + 1)
    const topServices = [...svcCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)

    return { ingresos, byMethod, byStatus, ausentismo, ticket, profStats, topServices, turnos: appts.length }
  }, [appts, payments])

  const profName = (id: string) => professionals.find((p) => p.id === id)?.name ?? '—'
  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? '—'
  const maxSvc = m.topServices[0]?.[1] ?? 1

  const exportExcel = () => {
    const rows: Record<string, string | number>[] = []
    rows.push({ Sección: 'RESUMEN', Detalle: 'Ingresos', Valor: m.ingresos })
    rows.push({ Sección: 'RESUMEN', Detalle: 'Turnos', Valor: m.turnos })
    rows.push({ Sección: 'RESUMEN', Detalle: 'Ticket promedio', Valor: Math.round(m.ticket) })
    rows.push({ Sección: 'RESUMEN', Detalle: 'Ausentismo %', Valor: Math.round(m.ausentismo) })
    rows.push({ Sección: '', Detalle: '', Valor: '' })
    for (const [id, s] of [...m.profStats.entries()].sort((a, b) => b[1].ingresos - a[1].ingresos)) {
      rows.push({ Sección: 'PROFESIONAL', Detalle: `${profName(id)} (${s.turnos} turnos)`, Valor: s.ingresos })
    }
    rows.push({ Sección: '', Detalle: '', Valor: '' })
    for (const [id, count] of m.topServices) {
      rows.push({ Sección: 'SERVICIO', Detalle: svcName(id), Valor: count })
    }
    exportToExcel(`reporte-${label.replace(/\s+/g, '-').toLowerCase()}.xlsx`, 'Reporte', rows)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Reportes</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 }}>{label} · {loading ? 'cargando…' : `${m.turnos} turnos`}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={exportExcel} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Download size={15} /> Exportar
        </button>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 9, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['mes', 'mesPasado', 'dias30'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '6px 13px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                background: period === p ? 'rgba(37,99,255,0.25)' : 'transparent',
                color: period === p ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
              {p === 'mes' ? 'Este mes' : p === 'mesPasado' ? 'Mes pasado' : 'Últimos 30 días'}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 26 }}>
        <Kpi icon={<TrendingUp size={18} />} color="#34d399" label="Ingresos" value={money(m.ingresos)} />
        <Kpi icon={<CalendarDays size={18} />} color="#60a5fa" label="Turnos" value={String(m.turnos)} />
        <Kpi icon={<Receipt size={18} />} color="#a78bfa" label="Ticket promedio" value={money(m.ticket)} />
        <Kpi icon={<UserX size={18} />} color="#f87171" label="Ausentismo" value={`${m.ausentismo.toFixed(0)}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Ingresos por método */}
        <Panel title="Ingresos por método">
          {m.byMethod.size === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...m.byMethod.entries()].sort((a, b) => b[1] - a[1]).map(([method, val]) => (
                <Bar key={method} label={METHOD_LABELS[method]} value={money(val)} pct={(val / m.ingresos) * 100} color="#34d399" />
              ))}
            </div>
          )}
        </Panel>

        {/* Turnos por estado */}
        <Panel title="Turnos por estado">
          {m.byStatus.size === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...m.byStatus.entries()].sort((a, b) => b[1] - a[1]).map(([st, count]) => (
                <Bar key={st} label={STATUS_LABELS[st]?.label ?? st} value={String(count)} pct={(count / m.turnos) * 100} color={STATUS_LABELS[st]?.color ?? '#888'} />
              ))}
            </div>
          )}
        </Panel>

        {/* Por profesional */}
        <Panel title="Por profesional">
          {m.profStats.size === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...m.profStats.entries()].sort((a, b) => b[1].ingresos - a[1].ingresos).map(([id, s]) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                  <span style={{ color: 'white' }}>{profName(id)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{s.turnos} turnos · <span style={{ color: '#34d399', fontWeight: 600 }}>{money(s.ingresos)}</span></span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Servicios más vendidos */}
        <Panel title="Servicios más vendidos">
          {m.topServices.length === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {m.topServices.map(([id, count]) => (
                <Bar key={id} label={svcName(id)} value={`${count}`} pct={(count / maxSvc) * 100} color="#60a5fa" />
              ))}
            </div>
          )}
        </Panel>
      </div>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
      <h3 style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>{title}</h3>
      {children}
    </div>
  )
}

function Bar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
        <span style={{ color: 'white', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(2, Math.min(100, pct))}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  )
}

function Empty() {
  return <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>Sin datos en este período.</p>
}
