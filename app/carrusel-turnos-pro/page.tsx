'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { ArrowRight } from 'lucide-react'

const W = 320
const H = 400

function Glow({ color, size = 220, top, left, right, bottom }: { color: string; size?: number; top?: string | number; left?: string | number; right?: string | number; bottom?: string | number }) {
  return <div style={{ position: 'absolute', top, left, right, bottom, width: size, height: size, borderRadius: '50%', background: color, filter: 'blur(60px)', opacity: 0.55, pointerEvents: 'none' }} />
}

function Step({ n, kicker, color, title, text }: { n: string; kicker: string; color: string; title: React.ReactNode; text: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 40px' }}>
      <Glow color={color} top={-40} right={-60} size={200} />
      <span style={{ position: 'absolute', bottom: 30, right: 26, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 150, lineHeight: 1, color, opacity: 0.14 }}>{n}</span>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ width: 26, height: 2, background: color }} />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', color }}>{kicker}</span>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.1, maxWidth: 255, letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ margin: '16px 0 0', fontSize: 15.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, maxWidth: 240 }}>{text}</p>
      </div>
    </div>
  )
}

const slides: DeckSlide[] = [
  // 1 · PORTADA
  { accent: '#2563FF', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 40px' }}>
      <Glow color="#2563FF" top={-30} left={-50} size={230} />
      <Glow color="#22d3ee" bottom={-40} right={-40} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.9)', marginBottom: 26 }}>VISION <span style={{ color: '#60a5fa' }}>OS</span></div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', color: '#67e8f9', marginBottom: 14 }}>GESTIÓN DE TURNOS</div>
        <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, lineHeight: 1.03, letterSpacing: '-0.02em' }}>Manejá tu<br />agenda como<br />un <span style={{ background: 'linear-gradient(90deg,#60a5fa,#22d3ee)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>profesional</span></h2>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 800 }}>Mirá cómo <ArrowRight size={16} /></div>
      </div>
    </div>
  ) },

  { accent: '#60a5fa', render: () => <Step n="1" kicker="AGENDA" color="#60a5fa" title={<>Todo en <span style={{ color: '#60a5fa' }}>orden</span></>} text="Cargás un turno en segundos y nunca más te superponés. Chau cuaderno y Google Calendar." /> },
  { accent: '#22d3ee', render: () => <Step n="2" kicker="RESERVAS 24/7" color="#67e8f9" title={<>Reservan <span style={{ color: '#67e8f9' }}>solos</span></>} text="Un link con tu marca donde tus clientes se agendan a cualquier hora, sin que contestes nada." /> },
  { accent: '#34d399', render: () => <Step n="3" kicker="SEÑAS" color="#6ee7b7" title={<>Cobrás por <span style={{ color: '#6ee7b7' }}>adelantado</span></>} text="Pedís una seña al reservar y se terminan las ausencias de último momento." /> },
  { accent: '#c4b5fd', render: () => <Step n="4" kicker="TUS NÚMEROS" color="#c4b5fd" title={<>Sabés cuánto <span style={{ color: '#c4b5fd' }}>facturás</span></>} text="Caja y reportes claros: cuánto entró, qué servicio deja más y quién falta seguido." /> },

  // 6 · CIERRE
  { accent: '#2563FF', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center', padding: '0 36px 40px' }}>
      <Glow color="#2563FF" top={-20} left={-40} size={220} />
      <Glow color="#22d3ee" bottom={-50} right={-30} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>14 DÍAS GRATIS</div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.08, letterSpacing: '-0.01em' }}>Ordená tu negocio<br />desde <span style={{ color: '#60a5fa' }}>hoy</span></h2>
        <p style={{ margin: '16px 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45, maxWidth: 250 }}>Probala gratis, sin tarjeta. Si te sirve, seguís.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 12, padding: '13px 24px', fontSize: 16, fontWeight: 900 }}>visionturnos.online <ArrowRight size={17} /></div>
      </div>
    </div>
  ) },
]

export default function CarruselTurnosProPage() {
  return <SlideDeck title="Carrusel · Gestión de turnos (premium)" subtitle="Diseño premium. Descargá cada slide (1080×1350) y subilos en orden." slides={slides} width={W} height={H} filePrefix="vision-turnos-pro" />
}
