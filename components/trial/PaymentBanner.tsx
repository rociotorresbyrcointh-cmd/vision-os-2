'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

// Aviso cuando el pago de la suscripción falló (período de gracia).
export function PaymentBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
      padding: '9px 16px', fontSize: 13.5, fontWeight: 600,
      background: 'rgba(248,113,113,0.12)', borderBottom: '1px solid rgba(248,113,113,0.35)', color: '#fca5a5',
    }}>
      <AlertTriangle size={15} />
      <span>Hubo un problema con el cobro de tu suscripción. Actualizá tu método de pago para no perder el acceso.</span>
      <Link href="/plan" style={{ color: 'white', textDecoration: 'underline', fontWeight: 700 }}>Revisar</Link>
    </div>
  )
}
