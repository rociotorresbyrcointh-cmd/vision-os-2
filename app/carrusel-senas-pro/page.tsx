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
  { accent: '#34d399', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 40px' }}>
      <Glow color="#34d399" top={-30} left={-50} size={230} />
      <Glow color="#2563FF" bottom={-40} right={-40} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.9)', marginBottom: 26 }}>VISION <span style={{ color: '#6ee7b7' }}>OS</span></div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', color: '#6ee7b7', marginBottom: 14 }}>ADIÓS AUSENCIAS</div>
        <h2 style={{ fontSize: 37, fontWeight: 900, margin: 0, lineHeight: 1.03, letterSpacing: '-0.02em' }}>Dejá de<br />perder plata<br />con los que<br /><span style={{ background: 'linear-gradient(90deg,#6ee7b7,#60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>no vienen</span></h2>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 800 }}>Te muestro cómo <ArrowRight size={16} /></div>
      </div>
    </div>
  ) },

  { accent: '#fb7185', render: () => <Step n="1" kicker="EL PROBLEMA" color="#fda4af" title={<>Reservan y <span style={{ color: '#fda4af' }}>no aparecen</span></>} text="Guardaste el horario, no vino nadie y esa plata no vuelve. Pasa más seguido de lo que parece." /> },
  { accent: '#60a5fa', render: () => <Step n="2" kicker="LA SOLUCIÓN" color="#60a5fa" title={<>Cobrás una <span style={{ color: '#60a5fa' }}>seña</span></>} text="Al reservar, tu cliente deja una seña por adelantado. Simple y automático, desde el link." /> },
  { accent: '#34d399', render: () => <Step n="3" kicker="EL RESULTADO" color="#6ee7b7" title={<>El que paga, <span style={{ color: '#6ee7b7' }}>viene</span></>} text="Cuando hay plata puesta, casi nadie falta. Tu agenda se llena de gente que sí asiste." /> },
  { accent: '#c4b5fd', render: () => <Step n="4" kicker="Y SI FALTA" color="#c4b5fd" title={<>No perdés <span style={{ color: '#c4b5fd' }}>nada</span></>} text="Si igual no viene, la seña ya quedó cobrada. Tu tiempo siempre está cubierto." /> },

  // 6 · CIERRE
  { accent: '#34d399', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center', padding: '0 36px 40px' }}>
      <Glow color="#34d399" top={-20} left={-40} size={220} />
      <Glow color="#2563FF" bottom={-50} right={-30} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>14 DÍAS GRATIS</div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.08, letterSpacing: '-0.01em' }}>Que no te falten<br /><span style={{ color: '#6ee7b7' }}>nunca más</span></h2>
        <p style={{ margin: '16px 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45, maxWidth: 250 }}>Activá las señas en Vision OS y probalo gratis, sin tarjeta.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 12, padding: '13px 24px', fontSize: 16, fontWeight: 900 }}>visionturnos.online <ArrowRight size={17} /></div>
      </div>
    </div>
  ) },
]

export default function CarruselSenasProPage() {
  return <SlideDeck title="Carrusel · Señas / ausencias (premium)" subtitle="Diseño premium. Descargá cada slide (1080×1350) y subilos en orden." slides={slides} width={W} height={H} filePrefix="vision-senas-pro" />
}
