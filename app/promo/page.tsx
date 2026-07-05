'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Calendar, Globe, Wallet, BarChart3, Check } from 'lucide-react'

const S = 360

// Mini calendario decorativo con un día destacado
function MiniCal({ accent }: { accent: string }) {
  const cells = Array.from({ length: 28 }, (_, i) => i)
  const active = 17
  return (
    <div style={{ width: 168, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Calendar size={13} color={accent} />
        <span style={{ fontSize: 11, fontWeight: 800 }}>Tu agenda</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3.5 }}>
        {cells.map((c) => (
          <div key={c} style={{ height: 15, borderRadius: 4, background: c === active ? accent : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: c === active ? '#06060d' : 'rgba(255,255,255,0.4)' }}>{c > 6 ? c - 6 : ''}</div>
        ))}
      </div>
    </div>
  )
}

const slides: DeckSlide[] = [
  // ── OPCIÓN 1: Calendario protagonista ──
  { accent: '#2563FF', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px 44px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', borderRadius: 999, padding: '5px 12px', marginBottom: 14 }}>BUSCO NEGOCIOS DE TURNOS</div>
      <MiniCal accent="#2563FF" />
      <h2 style={{ fontSize: 23, fontWeight: 900, margin: '16px 0 0', lineHeight: 1.15, maxWidth: 270 }}>Probá mi app <span style={{ color: '#60a5fa' }}>gratis</span> 14 días</h2>
      <p style={{ margin: '9px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.4, maxWidth: 250 }}>Agenda, reservas online, señas y tus números en un solo lugar.</p>
      <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: '#6ee7b7' }}>Sin tarjeta · visionturnos.online</div>
    </div>
  ) },

  // ── OPCIÓN 2: "GRATIS" gigante ──
  { accent: '#34d399', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 36px 44px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3, maxWidth: 270 }}>Busco negocios de turnos que quieran probar mi app</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 66, lineHeight: 0.95, color: '#6ee7b7', margin: '6px 0 1px' }}>GRATIS</div>
      <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 16 }}>durante 14 días</div>
      {[
        { icon: Calendar, t: 'Tu agenda ordenada' },
        { icon: Globe, t: 'Reservas online 24/7' },
        { icon: Wallet, t: 'Cobrás la seña' },
        { icon: BarChart3, t: 'Tus números claros' },
      ].map((f) => (
        <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <div style={{ width: 23, height: 23, borderRadius: 7, background: 'rgba(110,231,183,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#6ee7b7" /></div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{f.t}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 800, color: 'white' }}>Sin tarjeta · visionturnos.online</div>
    </div>
  ) },

  // ── OPCIÓN 3: Mockup teléfono ──
  { accent: '#7c3aed', render: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px 44px' }}>
      <h2 style={{ fontSize: 21, fontWeight: 900, margin: 0, lineHeight: 1.2, maxWidth: 285 }}>Ordená tu negocio de turnos desde el celular</h2>
      <div style={{ margin: '14px 0', width: 104, height: 132, borderRadius: 18, border: '2px solid rgba(255,255,255,0.18)', background: 'linear-gradient(160deg, #12122a, #0a0a16)', padding: 9, boxShadow: '0 18px 44px rgba(124,58,237,0.35)' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 800, color: '#c4b5fd', marginBottom: 6 }}>VISION OS</div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: 'flex', gap: 4, marginBottom: 5, alignItems: 'center' }}>
            <div style={{ width: 5, height: 5, borderRadius: 999, background: ['#60a5fa', '#6ee7b7', '#c4b5fd'][r] }} />
            <div style={{ flex: 1, height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.09)' }} />
          </div>
        ))}
        <div style={{ marginTop: 7, height: 20, borderRadius: 6, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>Nuevo turno</div>
      </div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.4)', borderRadius: 999, padding: '5px 12px', marginBottom: 8 }}>PROBALA GRATIS 14 DÍAS</div>
      <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>Sin tarjeta · visionturnos.online</p>
    </div>
  ) },
]

export default function PromoPage() {
  return <SlideDeck title="Fotos para la publicidad" subtitle="3 opciones (1080×1080). Descargá la que más te guste y usala en Meta / Instagram." slides={slides} width={S} height={S} filePrefix="vision-promo" />
}
