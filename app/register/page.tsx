'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { SectorSelect } from '@/components/SectorSelect'
import { AuthBackground } from '@/components/auth/AuthBackground'

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '11px 14px', color: 'white', fontSize: 14,
  outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
  textTransform: 'uppercase', marginBottom: 7, fontFamily: "'Orbitron', sans-serif",
}
const focus = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = 'rgba(37,99,255,0.6)')
const blur = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = 'rgba(255,255,255,0.1)')

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined)

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 24 }}>
      <AuthBackground />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <VisionLogoWhite size={60} animate />
        </div>

        <div style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)', borderRadius: 20, padding: '28px 28px 22px', border: '1px solid rgba(37,99,255,0.25)', backdropFilter: 'blur(16px)', boxShadow: '0 0 40px rgba(37,99,255,0.1),0 24px 48px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 3px' }}>Crear cuenta</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 22px' }}>Registrá tu negocio en Vision OS</p>

          <form action={formAction}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre del negocio</label>
                <input name="business_name" type="text" required placeholder="Ej: Estética Lumière" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Rubro</label>
                <SectorSelect />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" required placeholder="tu@negocio.com" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={labelStyle}>Contraseña</label>
                <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" style={fieldStyle} onFocus={focus} onBlur={blur} />
              </div>

              {state?.error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px 14px', color: '#f87171', fontSize: 12 }}>
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                style={{ background: pending ? 'rgba(37,99,255,0.4)' : 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', boxShadow: pending ? 'none' : '0 0 24px rgba(37,99,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {pending ? (
                  <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creando cuenta…</>
                ) : 'Crear cuenta →'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Al crear tu cuenta aceptás los{' '}
            <Link href="/terminos" style={{ color: '#60a5fa', textDecoration: 'none' }}>Términos</Link> y la{' '}
            <Link href="/privacidad" style={{ color: '#60a5fa', textDecoration: 'none' }}>Política de Privacidad</Link>.
          </p>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Ingresá</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>
          © 2026 Vision OS
        </p>
      </div>
    </div>
  )
}
