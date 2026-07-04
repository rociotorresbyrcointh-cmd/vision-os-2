'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { MessageCircleOff, CalendarX, UserX, HelpCircle, NotebookPen, ArrowRight } from 'lucide-react'

const S = 360

function Sign({ n, icon: Icon, color, title, text }: { n: string; icon: typeof CalendarX; color: string; title: string; text: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
      <span style={{ position: 'absolute', top: 18, right: 24, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 190, lineHeight: 1, color, opacity: 0.1 }}>{n}</span>
      <div style={{ position: 'relative', width: 66, height: 66, borderRadius: 18, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={32} color={color} />
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color, marginBottom: 10 }}>SEÑAL {n}</div>
      <h2 style={{ fontSize: 29, fontWeight: 900, margin: 0, lineHeight: 1.12, maxWidth: 265 }}>{title}</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 255 }}>{text}</p>
    </div>
  )
}

const slides: DeckSlide[] = [
  { accent: '#f472b6', render: () => (
    <div style={{ textAlign: 'center', padding: '0 38px' }}>
      <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color: '#f9a8d4', border: '1px solid rgba(249,168,212,0.4)', borderRadius: 999, padding: '7px 16px', marginBottom: 22 }}>LEÉ ESTO</div>
      <h2 style={{ fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1.08 }}>5 señales de que tu negocio <span style={{ color: '#f9a8d4' }}>necesita orden</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>Si te pasa alguna, esto es para vos</p>
    </div>
  ) },
  { accent: '#60a5fa', render: () => <Sign n="01" icon={MessageCircleOff} color="#60a5fa" title="Vivís contestando WhatsApp" text="Pasás el día respondiendo “¿tenés lugar?” en vez de trabajar en lo tuyo." /> },
  { accent: '#f472b6', render: () => <Sign n="02" icon={UserX} color="#f9a8d4" title="Te faltan clientas sin avisar" text="Reservás el horario, no aparecen y perdés esa plata que no vuelve." /> },
  { accent: '#a78bfa', render: () => <Sign n="03" icon={NotebookPen} color="#c4b5fd" title="Anotás los turnos en un cuaderno" text="Papel, notas del celu y cabeza. Si se pierde o te olvidás, es un lío." /> },
  { accent: '#22d3ee', render: () => <Sign n="04" icon={HelpCircle} color="#67e8f9" title="No sabés cuánto facturaste" text="A fin de mes es todo a ojo: no sabés qué servicio deja más ni cuánto entró." /> },
  { accent: '#34d399', render: () => <Sign n="05" icon={CalendarX} color="#6ee7b7" title="Te superponés o dejás huecos" text="Dos turnos a la misma hora, o agenda con espacios vacíos que podrías llenar." /> },
  { accent: '#2563FF', render: () => (
    <div style={{ textAlign: 'center', padding: '0 38px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Vision OS lo <span style={{ color: '#60a5fa' }}>ordena todo</span></h2>
      <p style={{ margin: '16px 0 22px', fontSize: 16, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45 }}>Agenda, reservas online, señas y reportes en un solo lugar</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#2563FF', borderRadius: 12, padding: '13px 22px', fontSize: 17, fontWeight: 800 }}>
        visionturnos.online <ArrowRight size={18} />
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>14 días gratis, sin tarjeta</p>
    </div>
  ) },
]

export default function CarruselSenalesPage() {
  return <SlideDeck title="Carrusel · 5 señales" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-senales" />
}
