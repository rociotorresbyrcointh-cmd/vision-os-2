'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { CalendarPlus, Repeat, Link2, Wallet, CheckCircle2, ArrowRight } from 'lucide-react'

const S = 360

// Slide con número gigante de fondo, ícono, título y bajada. Sin emojis, bien llamativo.
function Step({ n, icon: Icon, color, title, text }: { n: string; icon: typeof CalendarPlus; color: string; title: string; text: string }) {
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
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.24em', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.4)', borderRadius: 999, padding: '7px 16px', marginBottom: 22 }}>GUÍA RÁPIDA</div>
      <h2 style={{ fontSize: 40, fontWeight: 900, margin: 0, lineHeight: 1.05 }}>Turnos <span style={{ color: '#60a5fa' }}>sin caos</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>Aprendé a manejar tu agenda con Vision OS en 5 pasos</p>
    </div>
  ) },
  { accent: '#60a5fa', render: () => <Step n="01" icon={CalendarPlus} color="#60a5fa" title="Cargá un turno en segundos" text="Elegís cliente, servicio y profesional. La duración se calcula sola y queda ordenado." /> },
  { accent: '#a78bfa', render: () => <Step n="02" icon={Repeat} color="#c4b5fd" title="Programá turnos que se repiten" text="“Todos los martes a las 15” y la app crea la serie sola, saltando feriados y bloqueos." /> },
  { accent: '#22d3ee', render: () => <Step n="03" icon={Link2} color="#67e8f9" title="Compartí tu link de reservas" text="Tus clientas reservan solas, 24/7, y el turno aparece al instante en tu agenda." /> },
  { accent: '#34d399', render: () => <Step n="04" icon={Wallet} color="#6ee7b7" title="Cobrá la seña al reservar" text="Cobrás por adelantado y se terminan las ausencias de último momento." /> },
  { accent: '#f472b6', render: () => <Step n="05" icon={CheckCircle2} color="#f9a8d4" title="Controlá el ausentismo" text="Marcás quién vino y quién no. Sabés cuánto falla cada cliente sin anotar nada aparte." /> },
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <h2 style={{ fontSize: 34, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Empezá <span style={{ color: '#60a5fa' }}>hoy</span></h2>
      <p style={{ margin: '16px 0 22px', fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>14 días gratis, sin tarjeta</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#2563FF', borderRadius: 12, padding: '13px 22px', fontSize: 17, fontWeight: 800 }}>
        visionturnos.online <ArrowRight size={18} />
      </div>
    </div>
  ) },
]

export default function CarruselUsoPage() {
  return <SlideDeck title="Carrusel · Cómo usar los turnos" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-uso" />
}
