'use client'

import { useState } from 'react'
import { Check, Star, Gift, LogOut } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/plans'
import { logout } from '@/app/actions/auth'

// Pantalla bloqueante cuando se terminó la prueba de 14 días.
export function TrialGate({ isOwner }: { isOwner: boolean }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [choosing, setChoosing] = useState<PlanId | null>(null)

  async function pay(endpoint: string, plan: PlanId, key: string) {
    setBusy(key)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
      const text = await res.text()
      let data: { url?: string; error?: string } = {}
      try { data = JSON.parse(text) } catch { /* */ }
      if (!res.ok || !data.url) throw new Error(data.error || text || 'Error')
      window.location.href = data.url
    } catch (e) {
      alert('No se pudo iniciar el pago: ' + (e instanceof Error ? e.message : 'error'))
      setBusy(null)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(6,6,13,0.92)', backdropFilter: 'blur(6px)', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(20px, 5vw, 60px) 16px' }}>
      <div style={{ width: '100%', maxWidth: 1000 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24', fontSize: 13, fontWeight: 800, marginBottom: 16 }}>
            <Gift size={15} /> Tu prueba gratis terminó
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: 'white', margin: 0 }}>Elegí un plan para seguir</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginTop: 10 }}>
            {isOwner ? 'Tus datos están a salvo. Activá un plan y seguís donde lo dejaste.' : 'El dueño del negocio debe activar un plan para volver a usar la app.'}
          </p>
        </div>

        {isOwner ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {PLANS.map((p) => (
              <div key={p.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.035)', borderRadius: 16, padding: 24, border: p.popular ? '2px solid #2563FF' : '1px solid rgba(255,255,255,0.1)' }}>
                {p.popular && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontSize: 12, fontWeight: 800, borderRadius: 999, padding: '4px 14px', whiteSpace: 'nowrap' }}><Star size={12} /> Más elegido</span>}
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'white' }}>{p.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>{p.blurb}</p>
                <p style={{ margin: '16px 0 0', color: 'white' }}><span style={{ fontSize: 36, fontWeight: 900 }}>${p.price}</span><span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}> USD/mes</span></p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 22px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {p.features.map((f) => <li key={f} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'rgba(255,255,255,0.78)' }}><Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} /> {f}</li>)}
                </ul>
                <button onClick={() => setChoosing(p.id)} style={{ padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#2563FF', color: 'white', fontSize: 14, fontWeight: 700 }}>Suscribirme</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Avisale al dueño para que renueve el plan. 🙌</p>
        )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <form action={logout}>
            <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13.5, cursor: 'pointer' }}>
              <LogOut size={15} /> Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {/* Elección de medio de pago */}
      {choosing && (() => {
        const p = PLANS.find((x) => x.id === choosing)!
        return (
          <div onClick={() => setChoosing(null)} style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px, 94vw)', background: '#10101c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>Suscribirte a {p.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, margin: '4px 0 18px' }}>Elegí cómo querés pagar:</p>
              <button onClick={() => pay('/api/stripe/checkout', p.id, 's')} disabled={busy === 's'} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(37,99,255,0.4)', background: 'rgba(37,99,255,0.12)', color: 'white', cursor: 'pointer', marginBottom: 10 }}>
                <span style={{ textAlign: 'left' }}><span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>💳 Tarjeta internacional</span><span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>en tu moneda</span></span>
                <span style={{ fontWeight: 800 }}>US$ {p.price}</span>
              </button>
              <button onClick={() => pay('/api/mp/subscribe', p.id, 'm')} disabled={busy === 'm'} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,177,234,0.4)', background: 'rgba(0,177,234,0.12)', color: 'white', cursor: 'pointer' }}>
                <span style={{ textAlign: 'left' }}><span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>🇦🇷 Mercado Pago</span><span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>en pesos</span></span>
                <span style={{ fontWeight: 800 }}>${p.priceARS.toLocaleString('es-AR')}</span>
              </button>
              <button onClick={() => setChoosing(null)} style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
