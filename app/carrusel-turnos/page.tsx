'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Calendar, Repeat, Globe, CheckCircle2, Ban, Gift } from 'lucide-react'

const S = 360

function Feature({ icon: Icon, color, title, points }: { icon: typeof Calendar; color: string; title: string; points: string[] }) {
  return (
    <div style={{ padding: '0 38px', width: '100%' }}>
      <div style={{ width: 62, height: 62, borderRadius: 18, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={30} color={color} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{title}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 9, fontSize: 15.5, color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ color, fontWeight: 900 }}>✓</span> {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

const slides: DeckSlide[] = [
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 34px' }}>
      <div style={{ fontSize: 54, marginBottom: 12 }}>📅</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>Cómo funciona la <span style={{ color: '#60a5fa' }}>agenda</span></h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>Deslizá y mirá lo fácil que es 👉</p>
    </div>
  ) },
  { accent: '#2563FF', render: () => (
    <Feature icon={Calendar} color="#60a5fa" title="Cargá un turno en segundos" points={['Elegís cliente, servicio y profesional', 'La duración se calcula sola', 'Queda ordenado en tu agenda']} />
  ) },
  { accent: '#a78bfa', render: () => (
    <Feature icon={Repeat} color="#c4b5fd" title="Turnos recurrentes" points={['Ej: “todos los martes a las 15”', 'La app crea la serie sola', 'Saltea feriados y bloqueos']} />
  ) },
  { accent: '#22d3ee', render: () => (
    <Feature icon={Globe} color="#67e8f9" title="Reservas online 24/7" points={['Tus clientas reservan solas', 'Aparece en tu agenda al instante', 'Sin contestar por WhatsApp']} />
  ) },
  { accent: '#34d399', render: () => (
    <Feature icon={CheckCircle2} color="#6ee7b7" title="Control del ausentismo" points={['Marcás “Vino” o “No vino”', 'Sabés quién falta y cuánto', 'Sumado a la seña: casi nadie falta']} />
  ) },
  { accent: '#fbbf24', render: () => (
    <Feature icon={Ban} color="#fcd34d" title="Bloqueos" points={['Feriados, vacaciones o almuerzo', 'Bloqueás todo el día o un rango', 'Los turnos lo respetan solos']} />
  ) },
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 34px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#6ee7b7', fontSize: 13, fontWeight: 800, marginBottom: 18 }}><Gift size={15} /> 14 DÍAS GRATIS</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>Probá la agenda <span style={{ color: '#60a5fa' }}>gratis</span></h2>
      <p style={{ margin: '16px 0 0', fontSize: 17, fontWeight: 700, color: 'white' }}>👉 visionturnos.online</p>
    </div>
  ) },
]

export default function CarruselTurnosPage() {
  return <SlideDeck title="Carrusel · La agenda 📅" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-agenda" />
}
