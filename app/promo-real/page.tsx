'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, ImagePlus } from 'lucide-react'

// Carrusel con TUS capturas reales de la app. Subís la foto del calendario y
// la herramienta la enmarca con el texto y la marca. Exporta 1080×1350 (4:5).
const W = 320
const H = 400
const RATIO = 1080 / W

type Slot = { badge: string; title: string; accentTitle: string; sub: string }

const SLOTS: Slot[] = [
  { badge: 'BUSCO NEGOCIOS DE TURNOS', title: 'Probá mi app ', accentTitle: 'gratis 14 días', sub: 'Subí tu captura del calendario real de la app' },
  { badge: 'TU AGENDA', title: 'Así de ordenada ', accentTitle: 'queda tu semana', sub: 'Subí una captura de la vista de calendario / semana' },
  { badge: 'RESERVAS Y SEÑAS', title: 'Reservan solas y ', accentTitle: 'cobrás la seña', sub: 'Subí una captura de reservas o del cobro de seña' },
  { badge: 'PROBALA GRATIS', title: '14 días sin ', accentTitle: 'tarjeta', sub: 'visionturnos.online' },
]

export default function PromoRealPage() {
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
    a.download = `vision-real-${i + 1}.png`
    a.click()
  }

  return (
    <div style={{ background: '#06060d', color: 'white', minHeight: '100vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto 26px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Carrusel con tus capturas reales</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '10px 0 0', lineHeight: 1.5 }}>
          En cada slide tocá <b>“Subir captura”</b> y elegí una foto real de tu app (el calendario, reservas, etc.).
          Después descargá cada una (1080×1350) y subilas a Instagram en orden.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        {SLOTS.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              ref={(el) => { refs.current[i] = el }}
              style={{
                width: W, height: H, position: 'relative', overflow: 'hidden',
                background: 'radial-gradient(120% 70% at 80% 0%, rgba(37,99,255,0.28), transparent 55%), linear-gradient(165deg, #0c0c1a, #07070f)',
                display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Encabezado */}
              <div style={{ padding: '22px 24px 14px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 9.5, fontWeight: 800, letterSpacing: '0.16em', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', borderRadius: 999, padding: '5px 12px', marginBottom: 12 }}>{s.badge}</div>
                <h2 style={{ fontSize: 21, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{s.title}<span style={{ color: '#60a5fa' }}>{s.accentTitle}</span></h2>
              </div>

              {/* Captura real (o placeholder) */}
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

              {/* Pie con marca */}
              <div style={{ padding: '14px 24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}>VISION <span style={{ color: '#60a5fa' }}>OS</span></span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6ee7b7' }}>visionturnos.online</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <ImagePlus size={14} /> Subir captura
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onPick(i, e.target.files?.[0])} />
              </label>
              <button onClick={() => download(i)} disabled={!imgs[i]} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: imgs[i] ? '#2563FF' : 'rgba(255,255,255,0.06)', border: 'none', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 800, cursor: imgs[i] ? 'pointer' : 'not-allowed', opacity: imgs[i] ? 1 : 0.5 }}>
                <Download size={14} /> Descargar {i + 1}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
