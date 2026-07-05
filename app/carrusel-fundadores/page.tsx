'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Calendar, Globe, Wallet, BarChart3, Crown, Hourglass, ArrowRight } from 'lucide-react'

const S = 360

const slides: DeckSlide[] = [
  // 1 · Portada — QUÉ es, claro
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 30, letterSpacing: '0.05em', marginBottom: 18 }}>VISION<span style={{ color: '#60a5fa' }}> OS</span></div>
      <h2 style={{ fontSize: 33, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>La app que ordena tu <span style={{ color: '#60a5fa' }}>negocio de turnos</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>Agenda, reservas online, señas y números. Todo en un lugar.</p>
    </div>
  ) },
  // 2 · Qué hace (valor claro, de un vistazo)
  { accent: '#60a5fa', render: () => (
    <div style={{ padding: '0 40px', width: '100%' }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 22px', lineHeight: 1.15 }}>Todo lo que hace por vos</h2>
      {[
        { icon: Calendar, color: '#60a5fa', t: 'Agenda ordenada', d: 'Cargás turnos en segundos, sin superponerte' },
        { icon: Globe, color: '#67e8f9', t: 'Reservas online 24/7', d: 'Tus clientas reservan solas por un link' },
        { icon: Wallet, color: '#6ee7b7', t: 'Cobrás la seña', d: 'Por adelantado, y se acaban las ausencias' },
        { icon: BarChart3, color: '#c4b5fd', t: 'Caja y reportes', d: 'Sabés cuánto entra y cuánto facturás' },
      ].map((f) => (
        <div key={f.t} style={{ display: 'flex', gap: 13, alignItems: 'center', marginBottom: 15 }}>
          <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 12, background: `${f.color}22`, border: `1px solid ${f.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <f.icon size={21} color={f.color} />
          </div>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{f.t}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.35 }}>{f.d}</div>
          </div>
        </div>
      ))}
    </div>
  ) },
  // 3 · La oferta, clara: qué es el Plan Fundadores
  { accent: '#f59e0b', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 34px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', color: '#fbbf24', marginBottom: 14 }}>OFERTA DE LANZAMIENTO</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 96, lineHeight: 1, color: '#fbbf24' }}>20</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>lugares con precio fundador</div>
      <p style={{ margin: '16px 0 0', fontSize: 15.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, maxWidth: 250 }}>Solo los primeros 20 negocios entran con este precio especial.</p>
    </div>
  ) },
  // 4 · El beneficio fundador (precio congelado)
  { accent: '#34d399', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
      <div style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(110,231,183,0.14)', border: '1px solid rgba(110,231,183,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Crown size={32} color="#6ee7b7" />
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', color: '#6ee7b7', marginBottom: 10 }}>QUÉ GANÁS</div>
      <h2 style={{ fontSize: 29, fontWeight: 900, margin: 0, lineHeight: 1.13, maxWidth: 268 }}>Tu precio queda congelado</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 258 }}>Entrás ahora y mantenés el precio de fundador para siempre, aunque después suba para todos.</p>
    </div>
  ) },
  // 5 · Urgencia
  { accent: '#fb7185', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 36px' }}>
      <div style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(251,113,133,0.14)', border: '1px solid rgba(251,113,133,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Hourglass size={32} color="#fda4af" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.12 }}>Cuando se llena, se cierra</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 255 }}>Al completar los 20 lugares, el precio de fundador desaparece. Los que entran, entran.</p>
    </div>
  ) },
  // 6 · Cierre — CTA claro
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 38px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Probala <span style={{ color: '#60a5fa' }}>gratis</span> primero</h2>
      <p style={{ margin: '15px 0 22px', fontSize: 16, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45 }}>14 días sin costo y sin tarjeta. Si te sirve, entrás como fundadora.</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#2563FF', borderRadius: 12, padding: '13px 22px', fontSize: 17, fontWeight: 800 }}>
        visionturnos.online <ArrowRight size={18} />
      </div>
    </div>
  ) },
]

export default function CarruselFundadoresPage() {
  return <SlideDeck title="Carrusel · Plan Fundadores (escasez)" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-fundadores" />
}
