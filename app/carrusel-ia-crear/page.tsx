'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Sparkles, Wand2, ArrowRight, Camera, Heart, Download } from 'lucide-react'

const W = 320
const H = 400

// Marco de teléfono reutilizable: da sensación de "app real", muy visual.
function Phone({ children, glow = '#7c3aed' }: { children: React.ReactNode; glow?: string }) {
  return (
    <div style={{ width: 150, height: 246, borderRadius: 26, border: '3px solid rgba(255,255,255,0.16)', background: 'linear-gradient(165deg, #14142e, #0a0a16)', padding: 11, boxShadow: `0 26px 60px ${glow}55`, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 42, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.18)' }} />
      <div style={{ marginTop: 8, height: 'calc(100% - 8px)', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  )
}

function AppBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
      <Sparkles size={11} color="#c4b5fd" />
      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 800, letterSpacing: '0.06em' }}>VISION <span style={{ color: '#60a5fa' }}>OS</span></span>
    </div>
  )
}

const slides: DeckSlide[] = [
  // 1 · PORTADA — marca + app + CTA fuerte
  { accent: '#7c3aed', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 26px 42px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.05em', marginBottom: 12 }}>VISION<span style={{ color: '#c4b5fd' }}> OS</span></div>
      <Phone glow="#7c3aed">
        <AppBar />
        <div style={{ flex: 1, borderRadius: 12, background: 'linear-gradient(150deg, #7c3aed, #2563FF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', overflow: 'hidden' }}>
          <Sparkles size={26} color="white" />
          <div style={{ fontSize: 9, fontWeight: 800, color: 'white', opacity: 0.95 }}>Imagen lista</div>
          <div style={{ position: 'absolute', bottom: 8, width: '78%', height: 15, borderRadius: 6, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 800, color: '#7c3aed' }}>Descargar</div>
        </div>
      </Phone>
      <h2 style={{ fontSize: 20, fontWeight: 900, margin: '14px 0 0', lineHeight: 1.15, maxWidth: 275 }}>Creá contenido para tus redes <span style={{ color: '#c4b5fd' }}>con IA</span></h2>
      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#7c3aed', borderRadius: 999, padding: '8px 16px', fontSize: 12.5, fontWeight: 800 }}>Probala gratis · deslizá <ArrowRight size={14} /></div>
    </div>
  ) },

  // 2 · PASO 1 — escribí qué querés
  { accent: '#60a5fa', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px 42px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', color: '#60a5fa', marginBottom: 4 }}>PASO 1</div>
      <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 14px', textAlign: 'center' }}>Escribí qué querés mostrar</h2>
      <Phone glow="#2563FF">
        <AppBar />
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 5 }}>Contame tu idea</div>
        <div style={{ borderRadius: 9, border: '1px solid rgba(96,165,250,0.5)', background: 'rgba(96,165,250,0.08)', padding: 8, fontSize: 8.5, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)', minHeight: 54 }}>Promo de uñas esculpidas, 2x1 este viernes<span style={{ color: '#60a5fa' }}>|</span></div>
        <div style={{ marginTop: 'auto', height: 24, borderRadius: 8, background: '#2563FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 9, fontWeight: 800 }}><Wand2 size={11} /> Generar</div>
      </Phone>
    </div>
  ) },

  // 3 · PASO 2 — la IA genera
  { accent: '#a78bfa', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px 42px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', color: '#c4b5fd', marginBottom: 4 }}>PASO 2</div>
      <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 14px', textAlign: 'center' }}>La IA la crea por vos</h2>
      <Phone glow="#7c3aed">
        <AppBar />
        <div style={{ flex: 1, borderRadius: 12, background: 'rgba(196,181,253,0.08)', border: '1px solid rgba(196,181,253,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, border: '3px solid rgba(196,181,253,0.25)', borderTopColor: '#c4b5fd' }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: '#c4b5fd' }}>Generando imagen…</div>
          <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0.9, 0.6, 0.75].map((w, k) => <div key={k} style={{ height: 5, width: `${w * 100}%`, borderRadius: 3, background: 'rgba(196,181,253,0.35)' }} />)}
          </div>
        </div>
      </Phone>
    </div>
  ) },

  // 4 · PASO 3 — imagen lista con tu marca
  { accent: '#22d3ee', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px 42px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', color: '#67e8f9', marginBottom: 4 }}>PASO 3</div>
      <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 14px', textAlign: 'center' }}>Lista, con tu estilo</h2>
      <Phone glow="#22d3ee">
        <AppBar />
        <div style={{ flex: 1, borderRadius: 12, background: 'linear-gradient(150deg, #22d3ee, #2563FF)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 8 }}>
          <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 999, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={11} color="white" /></div>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>UÑAS 2x1<br /><span style={{ fontSize: 7, fontWeight: 700, opacity: 0.9 }}>Este viernes</span></div>
        </div>
        <div style={{ marginTop: 7, display: 'flex', gap: 5 }}>
          <div style={{ flex: 1, height: 20, borderRadius: 7, background: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 8, fontWeight: 800, color: '#06060d' }}><Download size={10} /> Bajar</div>
        </div>
      </Phone>
    </div>
  ) },

  // 5 · PASO 4 — publicá en tus redes
  { accent: '#f472b6', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px 42px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', color: '#f9a8d4', marginBottom: 4 }}>PASO 4</div>
      <h2 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 14px', textAlign: 'center' }}>Publicá y listo</h2>
      <Phone glow="#f472b6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
          <Camera size={12} color="#f9a8d4" />
          <div style={{ width: 16, height: 16, borderRadius: 999, background: 'linear-gradient(135deg, #f472b6, #7c3aed)' }} />
          <span style={{ fontSize: 8, fontWeight: 700 }}>tu.negocio</span>
        </div>
        <div style={{ flex: 1, borderRadius: 10, background: 'linear-gradient(150deg, #22d3ee, #2563FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'white' }}>UÑAS 2x1</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={12} color="#f9a8d4" fill="#f9a8d4" />
          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)' }}>A 128 personas les gusta</div>
        </div>
      </Phone>
    </div>
  ) },

  // 6 · CIERRE — CTA fuerte
  { accent: '#7c3aed', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px 42px' }}>
      <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.4)', borderRadius: 999, padding: '6px 14px', marginBottom: 18 }}>14 DÍAS GRATIS</div>
      <h2 style={{ fontSize: 27, fontWeight: 900, margin: 0, lineHeight: 1.12 }}>Dejá de pelear con el <span style={{ color: '#c4b5fd' }}>contenido</span></h2>
      <p style={{ margin: '14px 0 20px', fontSize: 14.5, color: 'rgba(255,255,255,0.64)', lineHeight: 1.45, maxWidth: 260 }}>Creá tus posteos en minutos, desde la misma app donde manejás tus turnos.</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', borderRadius: 12, padding: '13px 22px', fontSize: 16, fontWeight: 800 }}>visionturnos.online <ArrowRight size={17} /></div>
    </div>
  ) },
]

export default function CarruselIaCrearPage() {
  return <SlideDeck title="Carrusel · Crear imágenes con IA" subtitle="Paso a paso, bien visual. Descargá cada slide (1080×1350) y subilos en orden." slides={slides} width={W} height={H} filePrefix="vision-ia-crear" />
}
