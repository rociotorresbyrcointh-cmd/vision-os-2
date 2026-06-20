'use client'

import { useState } from 'react'
import { Check, Star, Zap, Users, AlertTriangle, Settings2 } from 'lucide-react'
import { PLANS, planById, isTrial, type PlanId } from '@/lib/plans'

export function PlanManager({
  organizationId, currentPlan, professionalCount, hasSubscription, planStatus,
}: {
  organizationId: string
  currentPlan: string
  professionalCount: number
  hasSubscription?: boolean
  planStatus?: string | null
}) {
  const [plan] = useState(currentPlan)
  const [busy, setBusy] = useState<string | null>(null)
  const current = planById(plan)
  const trial = isTrial(plan)

  // Ir al checkout de Stripe para suscribirse a un plan
  async function subscribe(id: PlanId) {
    const target = planById(id)!
    if (professionalCount > target.maxProf) {
      alert(`Tenés ${professionalCount} profesionales activos y el plan ${target.name} permite hasta ${target.maxProf}. Desactivá profesionales o elegí un plan más grande.`)
      return
    }
    setBusy(id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'No se pudo iniciar el pago')
      window.location.href = data.url
    } catch (e) {
      alert('No se pudo iniciar el pago: ' + (e instanceof Error ? e.message : 'error'))
      setBusy(null)
    }
  }

  // Abrir el portal de Stripe para administrar/cancelar la suscripción
  async function manage() {
    setBusy('manage')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error')
      window.location.href = data.url
    } catch (e) {
      alert('No se pudo abrir la gestión: ' + (e instanceof Error ? e.message : 'error'))
      setBusy(null)
    }
  }

  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 48px)', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>Mi plan</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 14 }}>
          Tu plan según la cantidad de profesionales de tu negocio.
        </p>
      </header>

      {/* Estado actual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 14, padding: '16px 20px', margin: '18px 0 26px' }}>
        <Zap size={22} color="#60a5fa" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>
            {trial ? 'Estás en período de prueba' : `Plan actual: ${current?.name}`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '3px 0 0' }}>
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Usás <strong style={{ color: 'white' }}>{professionalCount}</strong> profesional{professionalCount === 1 ? '' : 'es'}
            {current && ` de ${current.maxProf} incluidos`}
            {planStatus === 'canceled' && ' · suscripción cancelada'}
          </p>
        </div>
        {hasSubscription && (
          <button onClick={manage} disabled={busy === 'manage'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '10px 15px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: busy === 'manage' ? 0.6 : 1 }}>
            <Settings2 size={15} /> {busy === 'manage' ? 'Abriendo…' : 'Administrar suscripción'}
          </button>
        )}
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
              <p style={{ margin: '14px 0 0', color: 'white' }}>
                <span style={{ fontSize: 30, fontWeight: 800 }}>${p.price}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}> USD/mes</span>
              </p>
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
                  onClick={() => subscribe(p.id)}
                  disabled={busy === p.id || overLimit}
                  title={overLimit ? `Tenés ${professionalCount} profesionales; este plan permite ${p.maxProf}` : ''}
                  style={{
                    padding: '11px', borderRadius: 10, border: 'none', cursor: overLimit ? 'not-allowed' : 'pointer',
                    background: overLimit ? 'rgba(255,255,255,0.06)' : '#2563FF',
                    color: overLimit ? 'rgba(255,255,255,0.4)' : 'white', fontSize: 14, fontWeight: 700,
                    opacity: busy === p.id ? 0.6 : 1,
                  }}
                >
                  {busy === p.id ? 'Redirigiendo…' : overLimit ? 'No alcanza' : 'Suscribirme'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 22, color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.6 }}>
        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          El pago es seguro con tarjeta (procesado por Stripe) y se renueva automáticamente cada mes. Podés cancelar cuando quieras desde "Administrar suscripción".
          Para más de 10 profesionales, se suman extras de $15 USD c/u.
        </span>
      </div>
    </div>
  )
}
