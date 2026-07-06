'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { ArrowRight } from 'lucide-react'

const W = 320
const H = 400

// Esfera de degradé difusa: elemento premium que da profundidad sin parecer casero.
function Glow({ color, size = 220, top, left, right, bottom }: { color: string; size?: number; top?: string | number; left?: string | number; right?: string | number; bottom?: string | number }) {
  return <div style={{ position: 'absolute', top, left, right, bottom, width: size, height: size, borderRadius: '50%', background: color, filter: 'blur(60px)', opacity: 0.55, pointerEvents: 'none' }} />
}

// Slide de paso: número enorme como fondo, título bold, una línea de copy. Editorial.
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
  // 1 · PORTADA — premium, marca + CTA
  { accent: '#7c3aed', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 40px' }}>
      <Glow color="#7c3aed" top={-30} left={-50} size={230} />
      <Glow color="#2563FF" bottom={-40} right={-40} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.9)', marginBottom: 26 }}>VISION <span style={{ color: '#c4b5fd' }}>OS</span></div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', color: '#c4b5fd', marginBottom: 14 }}>INTELIGENCIA ARTIFICIAL</div>
        <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, lineHeight: 1.03, letterSpacing: '-0.02em' }}>Creá el<br />contenido de<br />tus redes<br /><span style={{ background: 'linear-gradient(90deg,#c4b5fd,#60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>en minutos</span></h2>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 999, padding: '11px 20px', fontSize: 14, fontWeight: 800 }}>Mirá cómo <ArrowRight size={16} /></div>
      </div>
    </div>
  ) },

  { accent: '#c4b5fd', render: () => <Step n="1" kicker="ELEGÍS" color="#c4b5fd" title={<>Decís qué querés <span style={{ color: '#c4b5fd' }}>mostrar</span></>} text="Una promo, un servicio, una novedad. Lo escribís en una línea, como se lo dirías a alguien." /> },
  { accent: '#60a5fa', render: () => <Step n="2" kicker="LA IA TRABAJA" color="#60a5fa" title={<>Crea la imagen <span style={{ color: '#60a5fa' }}>por vos</span></>} text="En segundos genera una imagen pensada para tu rubro, sin que sepas nada de diseño." /> },
  { accent: '#22d3ee', render: () => <Step n="3" kicker="Y EL TEXTO" color="#67e8f9" title={<>Con el copy <span style={{ color: '#67e8f9' }}>listo</span></>} text="También te escribe la descripción del posteo, con gancho y lista para copiar y pegar." /> },
  { accent: '#34d399', render: () => <Step n="4" kicker="PUBLICÁS" color="#6ee7b7" title={<>Descargás y <span style={{ color: '#6ee7b7' }}>listo</span></>} text="Bajás imagen y texto, los subís a tus redes y seguís con lo tuyo. Sin vueltas." /> },

  // 6 · CIERRE — CTA fuerte
  { accent: '#7c3aed', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center', padding: '0 36px 40px' }}>
      <Glow color="#7c3aed" top={-20} left={-40} size={220} />
      <Glow color="#2563FF" bottom={-50} right={-30} size={200} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.4)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}>14 DÍAS GRATIS</div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.08, letterSpacing: '-0.01em' }}>Tus redes activas,<br />sin perder <span style={{ color: '#c4b5fd' }}>horas</span></h2>
        <p style={{ margin: '16px 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45, maxWidth: 250 }}>Creá contenido desde la misma app donde manejás tus turnos.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'white', color: '#0a0a16', borderRadius: 12, padding: '13px 24px', fontSize: 16, fontWeight: 900 }}>visionturnos.online <ArrowRight size={17} /></div>
      </div>
    </div>
  ) },
]

export default function CarruselIaCrearPage() {
  return <SlideDeck title="Carrusel · Contenido con IA" subtitle="Diseño premium, paso a paso. Descargá cada slide (1080×1350) y subilos en orden." slides={slides} width={W} height={H} filePrefix="vision-ia-crear" />
}
