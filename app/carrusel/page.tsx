'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Calendar, Globe, Wallet, Sparkles, Gift, ArrowRight } from 'lucide-react'

const SIZE = 360 // preview; se exporta x3 = 1080px

type Slide = {
  accent: string
  render: () => React.ReactNode
}

const wordmark = (
  <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.85)' }}>
    VISION <span style={{ color: '#60a5fa' }}>OS</span>
  </span>
)

const SLIDES: Slide[] = [
  {
    accent: '#2563FF',
    render: () => (
      <>
        <div style={{ position: 'absolute', top: 28, left: 30 }}>
          <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#6ee7b7', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>NUEVO ✨</span>
        </div>
        <div style={{ textAlign: 'center', padding: '0 34px' }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 46, letterSpacing: '0.06em', lineHeight: 1 }}>VISION<span style={{ color: '#60a5fa' }}> OS</span></div>
          <p style={{ margin: '18px 0 0', fontSize: 19, fontWeight: 600, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>La app que ordena tu negocio de turnos 💙</p>
        </div>
        <div style={{ position: 'absolute', bottom: 26, right: 30, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700 }}>Deslizá <ArrowRight size={15} /></div>
      </>
    ),
  },
  {
    accent: '#f87171',
    render: () => (
      <div style={{ textAlign: 'center', padding: '0 40px' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>😩</div>
        <h2 style={{ fontSize: 27, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>¿Turnos por WhatsApp y clientes que <span style={{ color: '#fca5a5' }}>no vienen</span>?</h2>
        <p style={{ margin: '16px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>Hay una forma más fácil y profesional.</p>
      </div>
    ),
  },
  {
    accent: '#2563FF',
    render: () => (
      <SlideFeature icon={Calendar} color="#60a5fa" title="Tu agenda, inteligente" points={['Turnos por día, semana y profesional', 'Turnos recurrentes automáticos', 'Todo ordenado y en la nube']} />
    ),
  },
  {
    accent: '#22d3ee',
    render: () => (
      <SlideFeature icon={Globe} color="#67e8f9" title="Reservas online 24/7" points={['Tus clientes reservan solos', 'Con tu logo y tu marca', 'Un link para compartir']} />
    ),
  },
  {
    accent: '#34d399',
    render: () => (
      <SlideFeature icon={Wallet} color="#6ee7b7" title="Cobrá la seña" points={['Adiós al ausentismo', 'Cobrás por adelantado', 'Con tu propio medio de pago']} />
    ),
  },
  {
    accent: '#a78bfa',
    render: () => (
      <SlideFeature icon={Sparkles} color="#c4b5fd" title="Contenido con IA" points={['Imágenes para Instagram', 'Textos y captions listos', 'Ideas de qué publicar']} />
    ),
  },
  {
    accent: '#2563FF',
    render: () => (
      <div style={{ textAlign: 'center', padding: '0 34px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#6ee7b7', fontSize: 13, fontWeight: 800, marginBottom: 18 }}><Gift size={15} /> 14 DÍAS GRATIS</div>
        <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.15, margin: 0 }}>Probala <span style={{ color: '#60a5fa' }}>gratis</span>, sin tarjeta</h2>
        <p style={{ margin: '18px 0 0', fontSize: 17, fontWeight: 700, color: 'white' }}>👉 visionturnos.online</p>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Empezá hoy en 5 minutos</p>
      </div>
    ),
  },
]

function SlideFeature({ icon: Icon, color, title, points }: { icon: typeof Calendar; color: string; title: string; points: string[] }) {
  return (
    <div style={{ padding: '0 38px', width: '100%' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={32} color={color} />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{title}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 10, fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ color, fontWeight: 900 }}>✓</span> {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CarruselPage() {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [busy, setBusy] = useState(false)

  const downloadOne = async (i: number) => {
    const node = refs.current[i]
    if (!node) return
    const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `vision-os-carrusel-${i + 1}.png`
    a.click()
  }

  const downloadAll = async () => {
    setBusy(true)
    for (let i = 0; i < SLIDES.length; i++) {
      await downloadOne(i)
      await new Promise((r) => setTimeout(r, 400))
    }
    setBusy(false)
  }

  return (
    <div style={{ background: '#06060d', color: 'white', minHeight: '100vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center', marginBottom: 26 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Carrusel de lanzamiento 🚀</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14.5, margin: '10px 0 18px' }}>
          Descargá cada slide (1080×1080) y subilos a Instagram en orden. ¡Ya vienen con tu marca!
        </p>
        <button onClick={downloadAll} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563FF', color: 'white', border: 'none', borderRadius: 11, padding: '12px 22px', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
          <Download size={17} /> {busy ? 'Descargando…' : 'Descargar todas'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              ref={(el) => { refs.current[i] = el }}
              style={{
                width: SIZE, height: SIZE, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(120% 90% at 80% 0%, ${s.accent}33, transparent 55%), linear-gradient(160deg, #0c0c18, #07070f)`,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* marca de agua */}
              <span style={{ position: 'absolute', bottom: 22, left: 30 }}>{wordmark}</span>
              {s.render()}
            </div>
            <button onClick={() => downloadOne(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Download size={14} /> Descargar slide {i + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
