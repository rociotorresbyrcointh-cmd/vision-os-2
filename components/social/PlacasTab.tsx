'use client'

import { useRef, useState, useEffect } from 'react'
import { Download, ImagePlus, X } from 'lucide-react'
import type { Brand } from '@/services/org-settings'

type Preset = { key: string; label: string; label2: string; title: string; subtitle: string }

function presets(b: Brand): Preset[] {
  const at = b.instagram?.replace('@', '').trim()
  const handle = at ? '@' + at : (b.name || 'tu negocio')
  return [
    { key: 'promo', label: 'Promo', label2: 'OFERTA ESPECIAL', title: '20% OFF', subtitle: 'En todos nuestros servicios.\nReservá por el link de la bio.' },
    { key: 'reserva', label: 'Reservá', label2: 'TURNOS ONLINE', title: 'Reservá tu turno', subtitle: 'En 1 minuto, sin llamar.\nLink en la bio 📲' },
    { key: 'horarios', label: 'Horarios', label2: 'INFORMACIÓN', title: 'Horarios de atención', subtitle: b.extra?.trim() || 'Lunes a Viernes de 9 a 18 hs\nSábados de 9 a 13 hs' },
    { key: 'frase', label: 'Frase', label2: handle, title: 'Tu bienestar es nuestra prioridad', subtitle: '' },
    { key: 'novedad', label: 'Novedad', label2: 'NOVEDAD', title: 'Sumamos un nuevo servicio', subtitle: 'Vení a conocerlo. Te esperamos 💙' },
  ]
}

// Dibuja texto centrado con salto de línea automático; devuelve la altura usada
function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const paragraphs = text.split('\n')
  let cursorY = y
  for (const para of paragraphs) {
    const words = para.split(' ')
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, cursorY); cursorY += lineH; line = w
      } else line = test
    }
    if (line) { ctx.fillText(line, x, cursorY); cursorY += lineH }
  }
  return cursorY
}

export function PlacasTab({ brand }: { brand: Brand }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ps = presets(brand)
  const [label, setLabel] = useState(ps[0].label2)
  const [title, setTitle] = useState(ps[0].title)
  const [subtitle, setSubtitle] = useState(ps[0].subtitle)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const color = brand.color || '#2563FF'
  const color2 = brand.color2 || color
  const handle = brand.instagram?.trim() ? (brand.instagram.startsWith('@') ? brand.instagram : '@' + brand.instagram) : (brand.name || '')

  const applyPreset = (p: Preset) => { setLabel(p.label2); setTitle(p.title); setSubtitle(p.subtitle) }

  const loadImg = (setter: (img: HTMLImageElement) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const img = new Image(); img.onload = () => setter(img); img.src = reader.result as string }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Redibuja la placa cada vez que cambia algo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const S = 1080
    ctx.clearRect(0, 0, S, S)

    if (photo) {
      // Foto de fondo (cover) + capa oscura para que se lea el texto
      const scale = Math.max(S / photo.width, S / photo.height)
      const w = photo.width * scale, h = photo.height * scale
      ctx.drawImage(photo, (S - w) / 2, (S - h) / 2, w, h)
      ctx.fillStyle = 'rgba(7,7,15,0.5)'; ctx.fillRect(0, 0, S, S)
      const ov = ctx.createLinearGradient(0, 0, 0, S)
      ov.addColorStop(0, 'rgba(7,7,15,0.35)'); ov.addColorStop(0.55, 'rgba(7,7,15,0.15)'); ov.addColorStop(1, 'rgba(7,7,15,0.85)')
      ctx.fillStyle = ov; ctx.fillRect(0, 0, S, S)
      // Barra de color de marca abajo
      const bar = ctx.createLinearGradient(0, 0, S, 0)
      bar.addColorStop(0, color); bar.addColorStop(1, color2)
      ctx.fillStyle = bar; ctx.fillRect(0, S - 14, S, 14)
    } else {
      // Fondo oscuro con acentos de los 2 colores de marca
      const bg = ctx.createLinearGradient(0, 0, S, S)
      bg.addColorStop(0, '#0d0d18'); bg.addColorStop(1, '#07070F')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S)
      ctx.save()
      ctx.globalAlpha = 0.18; ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(S - 120, S - 100, 420, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 0.16; ctx.fillStyle = color2
      ctx.beginPath(); ctx.arc(120, 150, 300, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // Marco
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3
    ctx.strokeRect(48, 48, S - 96, S - 96)

    // Sombra para que el texto se lea bien sobre fotos
    if (photo) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2 }

    const cx = S / 2
    let y = 200

    // Logo (si hay)
    if (logo) {
      const max = 200
      const ratio = Math.min(max / logo.width, max / logo.height)
      const w = logo.width * ratio, h = logo.height * ratio
      ctx.drawImage(logo, cx - w / 2, y - h / 2, w, h)
      y += h / 2 + 70
    } else { y += 30 }

    // Etiqueta superior (color de marca)
    if (label.trim()) {
      ctx.fillStyle = color; ctx.textAlign = 'center'
      ctx.font = '700 34px Inter, Arial, sans-serif'
      ctx.fillText(label.toUpperCase(), cx, y)
      // subrayado
      const lw = ctx.measureText(label.toUpperCase()).width
      ctx.fillRect(cx - lw / 2, y + 16, lw, 4)
      y += 90
    }

    // Título grande
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'
    ctx.font = '800 84px Inter, Arial, sans-serif'
    y = drawWrapped(ctx, title || ' ', cx, y + 30, S - 220, 96) + 20

    // Subtítulo
    if (subtitle.trim()) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '400 40px Inter, Arial, sans-serif'
      drawWrapped(ctx, subtitle, cx, y + 40, S - 260, 56)
    }

    // Pie: handle / nombre
    if (handle) {
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'
      ctx.font = '700 38px Inter, Arial, sans-serif'
      ctx.fillText(handle, cx, S - 110)
    }
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
  }, [label, title, subtitle, logo, photo, color, color2, handle])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `placa-${(title || 'vision').toLowerCase().replace(/\s+/g, '-').slice(0, 24)}.png`
      a.click(); URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
      {/* Editor */}
      <div style={{ flex: '1 1 320px', minWidth: 300, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <p style={lbl}>Plantilla</p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {ps.map((p) => (
              <button key={p.key} onClick={() => applyPreset(p)} style={chip}>{p.label}</button>
            ))}
          </div>
        </div>

        <Field label="Etiqueta (arriba)"><input value={label} onChange={(e) => setLabel(e.target.value)} style={input} /></Field>
        <Field label="Título"><textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} style={{ ...input, resize: 'vertical' }} /></Field>
        <Field label="Texto"><textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} style={{ ...input, resize: 'vertical' }} /></Field>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div>
            <p style={lbl}>Logo (opcional)</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ ...chip, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImagePlus size={14} /> Subir logo
                <input type="file" accept="image/*" onChange={loadImg(setLogo)} style={{ display: 'none' }} />
              </label>
              {logo && <button onClick={() => setLogo(null)} style={{ ...chip, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}><X size={13} /> Quitar</button>}
            </div>
          </div>
          <div>
            <p style={lbl}>Foto de fondo (opcional)</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ ...chip, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImagePlus size={14} /> Subir foto
                <input type="file" accept="image/*" onChange={loadImg(setPhoto)} style={{ display: 'none' }} />
              </label>
              {photo && <button onClick={() => setPhoto(null)} style={{ ...chip, color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}><X size={13} /> Quitar</button>}
            </div>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5, margin: '-2px 0 0' }}>Los colores los toma de tu marca. Cambialos en “Mi Marca”.</p>

        <button onClick={download} style={btnDl}><Download size={16} /> Descargar placa (PNG)</button>
      </div>

      {/* Vista previa */}
      <div style={{ flex: '0 0 auto' }}>
        <p style={lbl}>Vista previa (1080×1080)</p>
        <canvas ref={canvasRef} width={1080} height={1080}
          style={{ width: 340, height: 340, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }} />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p style={lbl}>{label}</p>{children}</div>
}

const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 7px', fontFamily: "'Orbitron', sans-serif" }
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const chip: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const btnDl: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
  color: '#062a30', border: 'none', borderRadius: 10, padding: '13px 18px', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
}
