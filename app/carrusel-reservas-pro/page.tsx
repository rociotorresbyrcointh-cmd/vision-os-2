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
  { accent: '#22d3ee', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 40px' }}>
      <Glow color="#22d3ee" top={-30} left={-50} size={230} />
      <Glow color="#2563FF" bottom={-40} right={-40} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.9)', marginBottom: 26 }}>VISION <span style={{ color: '#67e8f9' }}>OS</span></div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', color: '#67e8f9', marginBottom: 14 }}>RESERVAS ONLINE</div>
        <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, lineHeight: 1.03, letterSpacing: '-0.02em' }}>Que reserven<br />solos,<br />mientras vos<br /><span style={{ background: 'linear-gradient(90deg,#67e8f9,#60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>trabajás</span></h2>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 800 }}>Mirá cómo <ArrowRight size={16} /></div>
      </div>
    </div>
  ) },

  { accent: '#fb7185', render: () => <Step n="1" kicker="EL PROBLEMA" color="#fda4af" title={<>Vivís en el <span style={{ color: '#fda4af' }}>WhatsApp</span></>} text="“¿Tenés lugar?”, “¿a qué hora?”, “¿cuánto sale?”. Todo el día contestando en vez de trabajar." /> },
  { accent: '#22d3ee', render: () => <Step n="2" kicker="TU LINK" color="#67e8f9" title={<>Un link con tu <span style={{ color: '#67e8f9' }}>marca</span></>} text="Lo ponés en tu bio de Instagram. Ahí tus clientes ven tus horarios libres y eligen." /> },
  { accent: '#60a5fa', render: () => <Step n="3" kicker="24/7" color="#60a5fa" title={<>Reservan a <span style={{ color: '#60a5fa' }}>cualquier hora</span></>} text="A la madrugada, un domingo, cuando sea. El turno cae solo en tu agenda, al instante." /> },
  { accent: '#c4b5fd', render: () => <Step n="4" kicker="VOS TRANQUILA" color="#c4b5fd" title={<>Sin contestar <span style={{ color: '#c4b5fd' }}>nada</span></>} text="Menos mensajes, menos idas y vueltas. Tu agenda se llena sola mientras hacés lo tuyo." /> },

  { accent: '#22d3ee', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center', padding: '0 36px 40px' }}>
      <Glow color="#22d3ee" top={-20} left={-40} size={220} />
      <Glow color="#2563FF" bottom={-50} right={-30} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', color: '#67e8f9', border: '1px solid rgba(103,232,249,0.4)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>14 DÍAS GRATIS</div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.08, letterSpacing: '-0.01em' }}>Tu link de reservas,<br /><span style={{ color: '#67e8f9' }}>hoy mismo</span></h2>
        <p style={{ margin: '16px 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45, maxWidth: 250 }}>Probalo gratis, sin tarjeta. Si te sirve, seguís.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 12, padding: '13px 24px', fontSize: 16, fontWeight: 900 }}>visionturnos.online <ArrowRight size={17} /></div>
      </div>
    </div>
  ) },
]

export default function CarruselReservasProPage() {
  return <SlideDeck title="Carrusel · Reservas online (premium)" subtitle="Diseño premium. Descargá cada slide (1080×1350) y subilos en orden." slides={slides} width={W} height={H} filePrefix="vision-reservas-pro" />
}
