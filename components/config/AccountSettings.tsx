'use client'

import { useActionState, useEffect, useState } from 'react'
import { KeyRound, Check, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateAccount } from '@/app/actions/auth'

// Sección de Configuración para que el dueño cambie su email y/o contraseña
// (por ejemplo, al tomar el control de una cuenta demo que se le creó).
export function AccountSettings({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, pending] = useActionState(updateAccount, undefined)
  const [currentEmail, setCurrentEmail] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const e = data.user?.email ?? ''
      setCurrentEmail(e); setEmail(e)
    })
  }, [])
  // Al guardar bien, limpiamos las contraseñas.
  useEffect(() => { if (state?.ok) { const f = document.getElementById('acc-pass') as HTMLInputElement | null; if (f) f.value = '' } }, [state?.ok])

  const wrapStyle: React.CSSProperties = embedded
    ? {}
    : { background: 'linear-gradient(145deg, rgba(37,99,255,0.12), rgba(37,99,255,0.04))', border: '1px solid rgba(37,99,255,0.4)', borderRadius: 14, padding: '20px 22px', marginBottom: 18, boxShadow: '0 0 24px rgba(37,99,255,0.12)' }

  return (
    <div style={wrapStyle}>
      {!embedded && (
        <h2 style={{ color: 'white', fontSize: 17, fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(37,99,255,0.2)', border: '1px solid rgba(37,99,255,0.45)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={18} color="#60a5fa" />
          </span>
          Acceso a la cuenta
        </h2>
      )}
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
        Cambiá el email y/o la contraseña con la que entrás a la app. Dejá la contraseña en blanco si no la querés cambiar.
      </p>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div>
          <label style={labelStyle}>Email de acceso</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...input, paddingLeft: 34 }} placeholder="tu@email.com" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input id="acc-pass" name="password" type="password" style={input} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Repetir contraseña</label>
            <input name="confirm" type="password" style={input} placeholder="Repetí la nueva contraseña" autoComplete="new-password" />
          </div>
        </div>

        {state?.error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{state.error}</p>}
        {state?.ok && <p style={{ color: '#34d399', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={15} /> {state.info ?? 'Datos de acceso actualizados.'}</p>}

        <button type="submit" disabled={pending} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: pending ? 0.6 : 1 }}>
          {pending ? 'Guardando…' : 'Guardar cambios de acceso'}
        </button>
      </form>

      {currentEmail && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '12px 0 0' }}>Entrás actualmente con: {currentEmail}</p>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Orbitron', sans-serif",
}
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
