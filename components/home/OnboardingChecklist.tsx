'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Circle, ArrowRight, Rocket, X } from 'lucide-react'

export type SetupState = {
  hasProf: boolean
  hasSvc: boolean
  hasAppt: boolean
  bookingOn: boolean
  hasLogo: boolean
}

export function OnboardingChecklist({ setup }: { setup: SetupState }) {
  const [hidden, setHidden] = useState(false)

  const steps = [
    { done: setup.hasProf, title: 'Cargá tus profesionales', desc: 'Las personas o recursos que atienden turnos.', href: '/profesionales', cta: 'Agregar profesional' },
    { done: setup.hasSvc, title: 'Cargá tus servicios', desc: 'Lo que ofrecés, con su duración y precio.', href: '/servicios', cta: 'Agregar servicio' },
    { done: setup.hasAppt, title: 'Cargá tu primer turno', desc: 'Probá la agenda creando un turno.', href: '/agenda', cta: 'Ir a la agenda' },
    { done: setup.bookingOn, title: 'Activá las reservas online', desc: 'Para que tus clientes saquen turno solos por un link.', href: '/reservas', cta: 'Activar reservas' },
    { done: setup.hasLogo, title: 'Subí tu logo', desc: 'Para que tu marca aparezca en reservas y placas.', href: '/configuracion', cta: 'Subir logo' },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const total = steps.length
  const allDone = doneCount === total

  if (hidden || allDone) return null

  const next = steps.find((s) => !s.done)
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div style={{ background: 'linear-gradient(165deg, rgba(37,99,255,0.1), rgba(255,255,255,0.025))', border: '1px solid rgba(37,99,255,0.3)', borderRadius: 16, padding: 'clamp(18px, 3vw, 24px)', marginBottom: 22, position: 'relative' }}>
      <button onClick={() => setHidden(true)} title="Ocultar" style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(37,99,255,0.18)', border: '1px solid rgba(37,99,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Rocket size={20} color="#60a5fa" /></span>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'white' }}>Configurá tu negocio en 5 pasos</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Completaste {doneCount} de {total}. {next ? `Lo próximo: ${next.title.toLowerCase()}.` : ''}</p>
        </div>
      </div>

      {/* barra de progreso */}
      <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', margin: '14px 0 18px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#2563FF)', borderRadius: 4, transition: 'width 0.4s' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s) => (
          <Link key={s.title} href={s.href} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 13px', borderRadius: 11, textDecoration: 'none', background: s.done ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${s.done ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
            {s.done
              ? <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={15} color="#06281c" /></span>
              : <Circle size={24} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: s.done ? 'rgba(255,255,255,0.55)' : 'white', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</p>
              {!s.done && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{s.desc}</p>}
            </div>
            {!s.done && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: '#60a5fa', whiteSpace: 'nowrap' }}>{s.cta} <ArrowRight size={13} /></span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
