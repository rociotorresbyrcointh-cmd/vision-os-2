'use client'

import Link from 'next/link'
import { Gift } from 'lucide-react'

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 3
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
      padding: '9px 16px', fontSize: 13.5, fontWeight: 600,
      background: urgent ? 'rgba(251,191,36,0.12)' : 'rgba(37,99,255,0.1)',
      borderBottom: `1px solid ${urgent ? 'rgba(251,191,36,0.3)' : 'rgba(37,99,255,0.25)'}`,
      color: urgent ? '#fbbf24' : '#93c5fd',
    }}>
      <Gift size={15} />
      <span>{daysLeft === 1 ? 'Te queda 1 día de prueba gratis' : `Te quedan ${daysLeft} días de prueba gratis`}</span>
      <Link href="/plan" style={{ color: 'white', textDecoration: 'underline', fontWeight: 700 }}>Elegir un plan</Link>
    </div>
  )
}
