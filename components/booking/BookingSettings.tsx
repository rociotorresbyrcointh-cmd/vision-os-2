'use client'

import { useState, useEffect } from 'react'
import { Globe, Copy, Check, ExternalLink } from 'lucide-react'
import { setPublicBooking } from '@/services/public-booking'

export function BookingSettings({
  organizationId,
  initialEnabled,
}: {
  organizationId: string
  initialEnabled: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState('')

  useEffect(() => {
    setLink(`${window.location.origin}/reservar/${organizationId}`)
  }, [organizationId])

  const toggle = async () => {
    const next = !enabled
    setEnabled(next); setSaving(true)
    try { await setPublicBooking(organizationId, next) }
    catch { setEnabled(!next) }
    finally { setSaving(false) }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Globe size={20} color="#60a5fa" /> Reservas online
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 24 }}>
        Compartí un link para que tus clientes reserven solos, sin que tengas que cargar el turno.
      </p>

      {/* Interruptor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 15, margin: 0 }}>Activar reservas online</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0' }}>
            {enabled ? 'El link está activo y recibe reservas.' : 'El link está desactivado.'}
          </p>
        </div>
        <button onClick={toggle} disabled={saving} aria-label="Activar"
          style={{ width: 52, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            background: enabled ? '#2563FF' : 'rgba(255,255,255,0.15)' }}>
          <span style={{ position: 'absolute', top: 3, left: enabled ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
        </button>
      </div>

      {/* Link */}
      {enabled && (
        <div style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.2)', borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Tu link de reservas</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input readOnly value={link} style={{ flex: '1 1 240px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '11px 13px', color: 'white', fontSize: 13.5, outline: 'none' }} />
            <button onClick={copy} style={btnPrimary}>
              {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
            </button>
            <a href={link} target="_blank" rel="noreferrer" style={{ ...btnGhost, textDecoration: 'none' }}>
              <ExternalLink size={15} /> Abrir
            </a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, margin: '14px 0 0', lineHeight: 1.6 }}>
            💡 Compartilo por WhatsApp, Instagram o en tu web. Las reservas entran como turnos <b>pendientes</b> en tu agenda, listas para que confirmes.
          </p>
        </div>
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '11px 16px', fontSize: 13.5, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '11px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
