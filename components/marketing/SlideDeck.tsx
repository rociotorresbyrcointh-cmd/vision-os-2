'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'

export type DeckSlide = { accent: string; render: () => React.ReactNode }

// Renderiza slides con la marca y permite descargarlos como PNG (se exporta a 1080px de ancho).
export function SlideDeck({
  title, subtitle, slides, width, height, filePrefix,
}: {
  title: string
  subtitle: string
  slides: DeckSlide[]
  width: number
  height: number
  filePrefix: string
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [busy, setBusy] = useState(false)
  const ratio = 1080 / width

  const downloadOne = async (i: number) => {
    const node = refs.current[i]
    if (!node) return
    const dataUrl = await toPng(node, { pixelRatio: ratio, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${filePrefix}-${i + 1}.png`
    a.click()
  }
  const downloadAll = async () => {
    setBusy(true)
    for (let i = 0; i < slides.length; i++) {
      await downloadOne(i)
      await new Promise((r) => setTimeout(r, 400))
    }
    setBusy(false)
  }

  return (
    <div style={{ background: '#06060d', color: 'white', minHeight: '100vh', padding: '36px 16px 60px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', marginBottom: 26 }}>
        <h1 style={{ fontSize: 25, fontWeight: 900, margin: 0 }}>{title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '10px 0 18px' }}>{subtitle}</p>
        <button onClick={downloadAll} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563FF', color: 'white', border: 'none', borderRadius: 11, padding: '12px 22px', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
          <Download size={17} /> {busy ? 'Descargando…' : 'Descargar todas'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        {slides.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              ref={(el) => { refs.current[i] = el }}
              style={{
                width, height, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(120% 80% at 80% 0%, ${s.accent}33, transparent 55%), linear-gradient(160deg, #0c0c18, #07070f)`,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ position: 'absolute', bottom: 22, left: 26, fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.85)' }}>
                VISION <span style={{ color: '#60a5fa' }}>OS</span>
              </span>
              {s.render()}
            </div>
            <button onClick={() => downloadOne(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Download size={14} /> Descargar {i + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
