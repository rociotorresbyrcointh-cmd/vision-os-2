'use client'

import { useState } from 'react'
import { HelpCircle, X, Copy, Check, Mail, MessageCircle } from 'lucide-react'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/site'

export function SupportButton({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* */ }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 11, width: 'calc(100% - 24px)', margin: '0 12px', padding: '11px 12px', borderRadius: 9, fontSize: 14, fontWeight: 600, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontFamily: 'inherit' }}
      >
        <HelpCircle size={17} /> Ayuda y soporte
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(400px, 94vw)', background: '#10101c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 24, position: 'relative' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,255,0.15)', border: '1px solid rgba(37,99,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <HelpCircle size={22} color="#60a5fa" />
            </div>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: 0 }}>¿Necesitás ayuda?</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, margin: '6px 0 18px', lineHeight: 1.5 }}>Escribinos y te respondemos a la brevedad.</p>

            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 7px' }}>Email</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px' }}>
              <span style={{ flex: 1, color: 'white', fontSize: 14, wordBreak: 'break-all' }}>{SUPPORT_EMAIL}</span>
              <button onClick={copy} title="Copiar" style={{ background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(37,99,255,0.15)', border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(37,99,255,0.35)'}`, color: copied ? '#34d399' : '#60a5fa', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700 }}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Ayuda%20con%20Vision%20OS`} style={{ flex: 1, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#2563FF', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 700 }}>
                <Mail size={15} /> Escribir un email
              </a>
              {SUPPORT_WHATSAPP && (
                <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '11px', fontSize: 13.5, fontWeight: 700 }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
