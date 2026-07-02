'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Calendar, Globe, Wallet, Sparkles, Gift } from 'lucide-react'

const W = 270
const H = 480 // 9:16 → exporta 1080×1920

function Story({ emoji, icon: Icon, color, title, text }: { emoji?: string; icon?: typeof Calendar; color: string; title: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 30px' }}>
      {emoji ? <div style={{ fontSize: 56, marginBottom: 18 }}>{emoji}</div> : Icon && (
        <div style={{ width: 74, height: 74, borderRadius: 20, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon size={36} color={color} />
        </div>
      )}
      <h2 style={{ fontSize: 27, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{title}</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{text}</p>
    </div>
  )
}

const slides: DeckSlide[] = [
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 30px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 38, letterSpacing: '0.06em', lineHeight: 1 }}>VISION<span style={{ color: '#60a5fa' }}> OS</span></div>
      <p style={{ margin: '18px 0 0', fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>La app que ordena tu negocio de turnos 💙</p>
    </div>
  ) },
  { accent: '#2563FF', render: () => <Story icon={Calendar} color="#60a5fa" title="Agenda inteligente" text="Todos tus turnos ordenados. Turnos recurrentes, bloqueos y control del ausentismo." /> },
  { accent: '#22d3ee', render: () => <Story icon={Globe} color="#67e8f9" title="Reservas online 24/7" text="Tus clientas reservan solas por un link con tu marca, sin que contestes nada." /> },
  { accent: '#34d399', render: () => <Story icon={Wallet} color="#6ee7b7" title="Cobrá la seña" text="Cobrás por adelantado al reservar. Adiós a las ausencias de último momento." /> },
  { accent: '#a78bfa', render: () => <Story icon={Sparkles} color="#c4b5fd" title="Contenido con IA" text="Creá imágenes y textos para Instagram con inteligencia artificial, con tu marca." /> },
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 30px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#6ee7b7', fontSize: 13, fontWeight: 800, marginBottom: 20 }}><Gift size={15} /> 14 DÍAS GRATIS</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>Probala <span style={{ color: '#60a5fa' }}>gratis</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 17, fontWeight: 800, color: 'white' }}>visionturnos.online</p>
      <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Deslizá hacia arriba 👆</p>
    </div>
  ) },
]

export default function HistoriasPage() {
  return <SlideDeck title="Historias · Destacadas 📱" subtitle="Descargá cada historia (1080×1920) y subilas a tus Historias / Destacados." slides={slides} width={W} height={H} filePrefix="vision-historia" />
}
