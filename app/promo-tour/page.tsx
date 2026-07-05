'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, ImagePlus, ArrowRight } from 'lucide-react'

// Tour completo de la app: subís una captura real por cada sección y se arma
// un carrusel mostrando TODO Vision OS por dentro. Exporta 1080×1350 (4:5).
const W = 320
const H = 400
const RATIO = 1080 / W

type Slot =
  | { type: 'cover' }
  | { type: 'cta' }
  | { type: 'shot'; badge: string; title: string; accentTitle: string; sub: string }

const SLOTS: Slot[] = [
  { type: 'cover' },
  { type: 'shot', badge: 'AGENDA', title: 'Todos tus turnos ', accentTitle: 'ordenados', sub: 'Captura de la vista de calendario / semana' },
  { type: 'shot', badge: 'NUEVO TURNO', title: 'Cargás uno en ', accentTitle: 'segundos', sub: 'Captura de la pantalla para crear un turno' },
  { type: 'shot', badge: 'RESERVAS ONLINE', title: 'Tus clientas ', accentTitle: 'reservan solas', sub: 'Captura del link / pantalla de reservas' },
  { type: 'shot', badge: 'SEÑAS', title: 'Cobrás por ', accentTitle: 'adelantado', sub: 'Captura del cobro de seña' },
  { type: 'shot', badge: 'CAJA', title: 'Toda tu plata del ', accentTitle: 'día, clara', sub: 'Captura de la caja (ingresos y gastos)' },
  { type: 'shot', badge: 'REPORTES', title: 'Sabés cuánto ', accentTitle: 'facturás', sub: 'Captura de reportes / estadísticas' },
  { type: 'shot', badge: 'CONTENIDO CON IA', title: 'Creás posteos ', accentTitle: 'con IA', sub: 'Captura de la sección de contenido con IA' },
  { type: 'cta' },
]

export default function PromoTourPage() {
  const [imgs, setImgs] = useState<(string | null)[]>(SLOTS.map(() => null))
  const refs = useRef<(HTMLDivElement | null)[]>([])

  const onPick = (i: number, file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgs((prev) => prev.map((v, k) => (k === i ? (reader.result as string) : v)))
    reader.readAsDataURL(file)
  }

  const download = async (i: number) => {
    const node = refs.current[i]
    if (!node) return
    const dataUrl = await toPng(node, { pixelRatio: RATIO, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `vision-tour-${i + 1}.png`
    a.click()
  }

  const frame = {
    width: W, height: H, position: 'relative' as const, overflow: 'hidden' as const,
    background: 'radial-gradient(120% 70% at 80% 0%, rgba(37,99,255,0.28), transparent 55%), linear-gradient(165deg, #0c0c1a, #07070f)',
    display: 'flex', flexDirection: 'column' as const, border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div style={{ background: '#06060d', color: 'white', minHeight: '100vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto 26px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Tour completo de la app</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '10px 0 0', lineHeight: 1.5 }}>
          Subí una captura real por sección (agenda, reservas, seña, caja, reportes, IA). La portada y el cierre ya están listos.
          Descargá cada slide (1080×1350) y subilos a Instagram en orden.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        {SLOTS.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div ref={(el) => { refs.current[i] = el }} style={frame}>
              {s.type === 'cover' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px' }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: '0.05em', marginBottom: 16 }}>VISION<span style={{ color: '#60a5fa' }}> OS</span></div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.12 }}>Mirá la app <span style={{ color: '#60a5fa' }}>por dentro</span></h2>
                  <p style={{ margin: '16px 0 0', fontSize: 14.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45 }}>Todo lo que hace por tu negocio de turnos. Deslizá 👉</p>
                </div>
              ) : s.type === 'cta' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 34px' }}>
                  <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.4)', borderRadius: 999, padding: '5px 12px', marginBottom: 16 }}>14 DÍAS GRATIS</div>
                  <h2 style={{ fontSize: 27, fontWeight: 900, margin: 0, lineHeight: 1.12 }}>Probala <span style={{ color: '#60a5fa' }}>gratis</span></h2>
                  <p style={{ margin: '14px 0 20px', fontSize: 14.5, color: 'rgba(255,255,255,0.62)' }}>Sin tarjeta. Sin compromiso.</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563FF', borderRadius: 11, padding: '11px 18px', fontSize: 15, fontWeight: 800 }}>visionturnos.online <ArrowRight size={16} /></div>
                </div>
              ) : (
                <>
                  <div style={{ padding: '22px 24px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 9.5, fontWeight: 800, letterSpacing: '0.16em', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', borderRadius: 999, padding: '5px 12px', marginBottom: 12 }}>{s.badge}</div>
                    <h2 style={{ fontSize: 21, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{s.title}<span style={{ color: '#60a5fa' }}>{s.accentTitle}</span></h2>
                  </div>
                  <div style={{ flex: 1, margin: '0 22px', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.45)' }}>
                    {imgs[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgs[i]!} alt="captura" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 20 }}>
                        <ImagePlus size={30} />
                        <div style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.4 }}>{s.sub}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '14px 24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}>VISION <span style={{ color: '#60a5fa' }}>OS</span></span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6ee7b7' }}>visionturnos.online</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {s.type === 'shot' && (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <ImagePlus size={14} /> Subir captura
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(i, e.target.files?.[0])} />
                </label>
              )}
              <button onClick={() => download(i)} disabled={s.type === 'shot' && !imgs[i]} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.type !== 'shot' || imgs[i] ? '#2563FF' : 'rgba(255,255,255,0.06)', border: 'none', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 800, cursor: s.type !== 'shot' || imgs[i] ? 'pointer' : 'not-allowed', opacity: s.type !== 'shot' || imgs[i] ? 1 : 0.5 }}>
                <Download size={14} /> Descargar {i + 1}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
