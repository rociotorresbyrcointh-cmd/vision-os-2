'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Sparkles, Wand2, PenLine, Share2, Clock, ArrowRight } from 'lucide-react'

const S = 360

function Step({ n, icon: Icon, color, title, text }: { n: string; icon: typeof Sparkles; color: string; title: string; text: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
      <span style={{ position: 'absolute', top: 18, right: 24, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 190, lineHeight: 1, color, opacity: 0.1 }}>{n}</span>
      <div style={{ position: 'relative', width: 66, height: 66, borderRadius: 18, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={32} color={color} />
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color, marginBottom: 10 }}>PASO {n}</div>
      <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.12, maxWidth: 260 }}>{title}</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 250 }}>{text}</p>
    </div>
  )
}

const slides: DeckSlide[] = [
  { accent: '#a78bfa', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.24em', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.4)', borderRadius: 999, padding: '7px 16px', marginBottom: 22 }}>INTELIGENCIA ARTIFICIAL</div>
      <h2 style={{ fontSize: 38, fontWeight: 900, margin: 0, lineHeight: 1.05 }}>Contenido para tus redes <span style={{ color: '#c4b5fd' }}>con IA</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>Creá fotos y textos para Instagram sin salir de la app</p>
    </div>
  ) },
  { accent: '#c4b5fd', render: () => <Step n="01" icon={Sparkles} color="#c4b5fd" title="Elegí qué querés mostrar" text="Un servicio, una promo o una novedad. Le decís a la app de qué se trata y listo." /> },
  { accent: '#60a5fa', render: () => <Step n="02" icon={Wand2} color="#60a5fa" title="La IA crea la imagen" text="Genera una foto lista para postear, pensada para tu rubro y con tu estilo." /> },
  { accent: '#22d3ee', render: () => <Step n="03" icon={PenLine} color="#67e8f9" title="Y también el texto" text="Te escribe la descripción del posteo, con gancho y lista para copiar y pegar." /> },
  { accent: '#34d399', render: () => <Step n="04" icon={Share2} color="#6ee7b7" title="Descargá y publicá" text="Bajás la imagen y el texto, los subís a Instagram y seguís con lo tuyo." /> },
  { accent: '#f472b6', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
      <div style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(249,168,212,0.13)', border: '1px solid rgba(249,168,212,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Clock size={32} color="#f9a8d4" />
      </div>
      <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.12, maxWidth: 270 }}>Ahorrás horas de diseño</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 255 }}>Nada de programas complicados ni pagar diseño. Publicás seguido y sin excusas.</p>
    </div>
  ) },
  { accent: '#a78bfa', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Probá la <span style={{ color: '#c4b5fd' }}>IA</span> gratis</h2>
      <p style={{ margin: '16px 0 22px', fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>14 días gratis, sin tarjeta</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#7c3aed', borderRadius: 12, padding: '13px 22px', fontSize: 17, fontWeight: 800 }}>
        visionturnos.online <ArrowRight size={18} />
      </div>
    </div>
  ) },
]

export default function CarruselIaPage() {
  return <SlideDeck title="Carrusel · IA para redes" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-ia" />
}
