import type { Metadata } from 'next'
import { Landing } from '@/components/landing/Landing'

export const metadata: Metadata = {
  title: 'Vision OS — La agenda inteligente para tu negocio de turnos',
  description: 'Organizá tus turnos, recibí reservas online con tu marca, cobrá la seña por adelantado y crecé en redes. Probá gratis 14 días, sin tarjeta.',
  openGraph: {
    title: 'Vision OS — La agenda inteligente para tu negocio',
    description: 'Turnos, reservas online, seña anti-ausentismo y más. Probá gratis 14 días.',
    type: 'website',
  },
}

// La raíz ahora es la página de ventas pública.
export default function Home() {
  return <Landing />
}
