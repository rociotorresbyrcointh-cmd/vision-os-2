'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Star, Zap, Users, AlertTriangle, Settings2, Gift, PartyPopper } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { PLANS, planById, isTrial, isCortesia, usdFor, arsFromUsd, type PlanId, type BillingCycle } from '@/lib/plans'

type Currency = 'ARS' | 'USD'

export function PlanManager({
  organizationId, currentPlan, professionalCount, hasSubscription, planStatus, defaultCurrency = 'USD',
}: {
  organizationId: string
  currentPlan: string
  professionalCount: number
  hasSubscription?: boolean
  planStatus?: string | null
  defaultCurrency?: Currency
}) {
  const toast = useToast()
  const [plan] = useState(currentPlan)
  const [busy, setBusy] = useState<string | null>(null)
  const [choosing, setChoosing] = useState<PlanId | null>(null)
  const [welcome, setWelcome] = useState(false)
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  // Moneda: arranca por país (prop del server) y se puede cambiar a mano.
  // La elección manual se recuerda en localStorage.
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vision:currency')
      if (saved === 'ARS' || saved === 'USD') setCurrency(saved)
    } catch { /* sin acceso a storage */ }
  }, [])
  const changeCurrency = (c: Currency) => {
    setCurrency(c)
    try { localStorage.setItem('vision:currency', c) } catch { /* */ }
  }

  // ─── Formato de precios según moneda y ciclo ───
  const fmtUSD = (n: number) => `US$ ${n.toLocaleString('es-AR')}`
  const fmtARS = (n: number) => `$ ${n.toLocaleString('es-AR')}`
  const priceMain = (p: typeof PLANS[number]) => {
    const usd = usdFor(p, cycle)
    return currency === 'ARS' ? fmtARS(arsFromUsd(usd)) : fmtUSD(usd)
  }
  const equivMonthly = (p: typeof PLANS[number]) => {
    const annualUsd = usdFor(p, 'annual')
    if (currency === 'ARS') return fmtARS(Math.round(arsFromUsd(annualUsd) / 12 / 100) * 100)
    return `US$ ${(annualUsd / 12).toFixed(2).replace('.', ',')}`
  }

  // Al volver del pago (Stripe ?success=1 / MP ?mp=success) mostramos la bienvenida
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('success') === '1' || q.get('mp') === 'success') {
      setWelcome(true)
      window.history.replaceState({}, '', '/plan') // limpia la URL
    }
  }, [])
  const current = planById(plan)
  const trial = isTrial(plan)
  const cortesia = isCortesia(plan)

  // Ir al checkout de Stripe para suscribirse a un plan
  async function subscribe(id: PlanId) {
    const target = planById(id)!
    if (professionalCount > target.maxProf) {
      toast(`Tenés ${professionalCount} profesionales activos y el plan ${target.name} permite hasta ${target.maxProf}. Desactivá profesionales o elegí un plan más grande.`, 'error')
      return
    }
    setBusy(id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: id, cycle }),
      })
      const text = await res.text()
      let data: { url?: string; error?: string } = {}
      try { data = JSON.parse(text) } catch { /* respuesta no-JSON */ }
      if (!res.ok || !data.url) throw new Error(data.error || text || 'No se pudo iniciar el pago')
      window.location.href = data.url
    } catch (e) {
      toast('No se pudo iniciar el pago: ' + (e instanceof Error ? e.message : 'error'), 'error')
      setBusy(null)
    }
  }

  // Suscribirse con Mercado Pago (pesos, para Argentina)
  async function subscribeMP(id: PlanId) {
    const target = planById(id)!
    if (professionalCount > target.maxProf) {
      toast(`Tenés ${professionalCount} profesionales activos y el plan ${target.name} permite hasta ${target.maxProf}.`, 'error')
      return
    }
    setBusy('mp-' + id)
    try {
      const res = await fetch('/api/mp/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: id, cycle }),
      })
      const text = await res.text()
      let data: { url?: string; error?: string } = {}
      try { data = JSON.parse(text) } catch { /* no-JSON */ }
      if (!res.ok || !data.url) throw new Error(data.error || text || 'No se pudo iniciar el pago')
      window.location.href = data.url
    } catch (e) {
      toast('No se pudo iniciar el pago con Mercado Pago: ' + (e instanceof Error ? e.message : 'error'), 'error')
      setBusy(null)
    }
  }

  // Abrir el portal de Stripe para administrar/cancelar la suscripción
  async function manage() {
    setBusy('manage')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const text = await res.text()
      let data: { url?: string; error?: string } = {}
      try { data = JSON.parse(text) } catch { /* respuesta no-JSON */ }
      if (!res.ok || !data.url) throw new Error(data.error || text || 'Error')
      window.location.href = data.url
    } catch (e) {
      toast('No se pudo abrir la gestión: ' + (e instanceof Error ? e.message : 'error'), 'error')
      setBusy(null)
    }
  }

  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 48px)', maxWidth: 1000, margin: '0 auto' }}>
      {/* Bienvenida después de pagar */}
      {welcome && (
        <div onClick={() => setWelcome(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(6,6,13,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(460px, 94vw)', textAlign: 'center', background: 'linear-gradient(160deg, #10101c, #0a0a14)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 18, padding: '36px 28px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <PartyPopper size={32} color="#34d399" />
            </div>
            <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: 0 }}>¡Bienvenido a Vision OS! 🎉</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: '12px 0 0', lineHeight: 1.55 }}>
              Tu suscripción está en camino de activarse (puede tardar unos segundos). ¡Ya podés usar todo sin límites!
            </p>
            <Link href="/inicio" style={{ display: 'inline-block', marginTop: 24, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', textDecoration: 'none', borderRadius: 11, padding: '13px 26px', fontSize: 15, fontWeight: 800 }}>
              Ir a mi negocio
            </Link>
          </div>
        </div>
      )}

      <header style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>Mi plan</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 14 }}>
          Tu plan según la cantidad de profesionales de tu negocio.
        </p>
      </header>

      {/* Estado actual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderRadius: 14, padding: '16px 20px', margin: '18px 0 26px',
        background: cortesia ? 'rgba(52,211,153,0.08)' : 'rgba(37,99,255,0.08)',
        border: cortesia ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(37,99,255,0.25)' }}>
        {cortesia ? <Gift size={22} color="#34d399" /> : <Zap size={22} color="#60a5fa" />}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>
            {cortesia ? '🎁 Plan Cortesía — acceso libre y gratuito' : trial ? 'Estás en período de prueba' : `Plan actual: ${current?.name}`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '3px 0 0' }}>
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Usás <strong style={{ color: 'white' }}>{professionalCount}</strong> profesional{professionalCount === 1 ? '' : 'es'}
            {current && ` de ${current.maxProf} incluidos`}
            {cortesia && ' · sin límite'}
            {planStatus === 'canceled' && ' · suscripción cancelada'}
          </p>
        </div>
        {hasSubscription && (
          <button onClick={manage} disabled={busy === 'manage'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '10px 15px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: busy === 'manage' ? 0.6 : 1 }}>
            <Settings2 size={15} /> {busy === 'manage' ? 'Abriendo…' : 'Administrar suscripción'}
          </button>
        )}
      </div>

      {/* Controles: ciclo de pago y moneda */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        {/* Mensual / Anual */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 3 }}>
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => {
            const on = cycle === c
            return (
              <button key={c} onClick={() => setCycle(c)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  background: on ? 'rgba(37,99,255,0.25)' : 'transparent', color: on ? '#60a5fa' : 'rgba(255,255,255,0.55)' }}>
                {c === 'monthly' ? 'Mensual' : 'Anual'}
                {c === 'annual' && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#34d399', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 6, padding: '1px 6px' }}>2 meses gratis</span>}
              </button>
            )
          })}
        </div>
        {/* ARS / USD */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 3 }}>
          {(['ARS', 'USD'] as Currency[]).map((c) => {
            const on = currency === c
            return (
              <button key={c} onClick={() => changeCurrency(c)}
                style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  background: on ? 'rgba(37,99,255,0.25)' : 'transparent', color: on ? '#60a5fa' : 'rgba(255,255,255,0.55)' }}>
                {c === 'ARS' ? '🇦🇷 Pesos' : '🌎 Dólares'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Planes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {PLANS.map((p) => {
          const active = plan === p.id
          const overLimit = professionalCount > p.maxProf
          return (
            <div key={p.id} style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              background: active ? 'rgba(37,99,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: active ? '2px solid #2563FF' : p.popular ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '22px 20px',
            }}>
              {p.popular && (
                <span style={{ position: 'absolute', top: -11, left: 20, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#1a1205', fontSize: 11.5, fontWeight: 800, borderRadius: 7, padding: '3px 10px' }}>
                  <Star size={11} /> Más popular
                </span>
              )}
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>{p.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '2px 0 0' }}>{p.blurb}</p>
              <div style={{ margin: '14px 0 0', color: 'white' }}>
                <span style={{ fontSize: 30, fontWeight: 800 }}>{priceMain(p)}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{cycle === 'annual' ? ' /año' : ' /mes'}</span>
                {cycle === 'annual' && (
                  <>
                    <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                      equivale a {equivMonthly(p)}/mes · pagás 10, usás 12
                    </span>
                    <span style={{ display: 'inline-block', marginTop: 7, fontSize: 11, fontWeight: 800, color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)', borderRadius: 6, padding: '2px 8px' }}>
                      2 meses gratis
                    </span>
                  </>
                )}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 20px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 9, color: 'rgba(255,255,255,0.75)', fontSize: 13.5 }}>
                    <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                  </li>
                ))}
              </ul>
              {active ? (
                <span style={{ textAlign: 'center', padding: '11px', borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)', color: '#34d399', fontSize: 14, fontWeight: 700 }}>
                  Tu plan actual ✓
                </span>
              ) : (
                <button
                  onClick={() => setChoosing(p.id)}
                  disabled={overLimit}
                  title={overLimit ? `Tenés ${professionalCount} profesionales; este plan permite ${p.maxProf}` : ''}
                  style={{
                    padding: '11px', borderRadius: 10, border: 'none', cursor: overLimit ? 'not-allowed' : 'pointer', width: '100%',
                    background: overLimit ? 'rgba(255,255,255,0.06)' : '#2563FF',
                    color: overLimit ? 'rgba(255,255,255,0.4)' : 'white', fontSize: 14, fontWeight: 700,
                  }}
                >
                  {overLimit ? 'No alcanza' : 'Suscribirme'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 22, color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.6 }}>
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          {cycle === 'annual'
            ? 'El plan anual es un solo cobro por año y se renueva automáticamente cada 12 meses. Podés cancelar cuando quieras.'
            : 'El pago se renueva automáticamente cada mes y podés cancelar cuando quieras.'}
          {' '}Tarjeta internacional con Stripe (USD) o Mercado Pago (pesos). Para más de 10 profesionales, se suman extras de $15 USD c/u.
          {currency === 'ARS' && ' Los precios en pesos son de referencia: el cobro final lo procesa Mercado Pago al tipo de cambio del día.'}
        </span>
      </div>

      {/* Elección de medio de pago */}
      {choosing && (() => {
        const p = planById(choosing)!
        return (
          <div onClick={() => setChoosing(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px, 94vw)', background: '#10101c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>Suscribirte a {p.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, margin: '4px 0 18px' }}>
                Plan {cycle === 'annual' ? 'anual (un cobro por año)' : 'mensual'} · elegí cómo querés pagar:
              </p>

              <button onClick={() => subscribe(p.id)} disabled={busy === p.id}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(37,99,255,0.4)', background: 'rgba(37,99,255,0.12)', color: 'white', cursor: 'pointer', marginBottom: 10, opacity: busy === p.id ? 0.6 : 1 }}>
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>💳 Tarjeta internacional</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Visa, Mastercard, etc. · en tu moneda</span>
                </span>
                <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>US$ {usdFor(p, cycle).toLocaleString('es-AR')}{cycle === 'annual' ? '/año' : ''}</span>
              </button>

              <button onClick={() => subscribeMP(p.id)} disabled={busy === 'mp-' + p.id}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,177,234,0.4)', background: 'rgba(0,177,234,0.12)', color: 'white', cursor: 'pointer', opacity: busy === 'mp-' + p.id ? 0.6 : 1 }}>
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>🇦🇷 Mercado Pago</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Tarjeta o dinero en cuenta · en pesos</span>
                </span>
                <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>$ {arsFromUsd(usdFor(p, cycle)).toLocaleString('es-AR')}{cycle === 'annual' ? '/año' : ''}</span>
              </button>

              <button onClick={() => setChoosing(null)} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
