'use client'

import { SlideDeck, type DeckSlide } from '@/components/marketing/SlideDeck'
import { Lock, Users, Crown, TrendingUp, Hourglass, ArrowRight } from 'lucide-react'

const S = 360

// Bloque con ícono, título y bajada. Venta indirecta: cuenta, no vende.
function Block({ icon: Icon, color, tag, title, text }: { icon: typeof Lock; color: string; tag: string; title: string; text: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
      <div style={{ position: 'relative', width: 66, height: 66, borderRadius: 18, background: `${color}22`, border: `1px solid ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={32} color={color} />
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color, marginBottom: 10 }}>{tag}</div>
      <h2 style={{ fontSize: 29, fontWeight: 900, margin: 0, lineHeight: 1.13, maxWidth: 268 }}>{title}</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 258 }}>{text}</p>
    </div>
  )
}

const slides: DeckSlide[] = [
  // 1 · Portada — gancho indirecto, misterioso
  { accent: '#c084fc', render: () => (
    <div style={{ textAlign: 'center', padding: '0 40px' }}>
      <div style={{ display: 'inline-block', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.24em', color: '#e9d5ff', border: '1px solid rgba(233,213,255,0.4)', borderRadius: 999, padding: '7px 16px', marginBottom: 22 }}>ACCESO LIMITADO</div>
      <h2 style={{ fontSize: 39, fontWeight: 900, margin: 0, lineHeight: 1.05 }}>Esto no es <span style={{ color: '#e9d5ff' }}>para todos</span></h2>
      <p style={{ margin: '18px 0 0', fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>Estamos abriendo un cupo muy chico. Deslizá.</p>
    </div>
  ) },
  // 2 · La escasez, clara
  { accent: '#f59e0b', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 34px' }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', color: '#fbbf24', marginBottom: 14 }}>PLAN FUNDADORES</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 100, lineHeight: 1, color: '#fbbf24' }}>20</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>lugares. Nada más.</div>
      <p style={{ margin: '16px 0 0', fontSize: 15.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, maxWidth: 250 }}>Este mes sumamos solo 20 negocios nuevos. Cuando se llena, se cierra.</p>
    </div>
  ) },
  // 3 · Por qué es limitado (indirecto: da valor, no vende)
  { accent: '#c4b5fd', render: () => <Block icon={Users} color="#c4b5fd" tag="POR QUÉ TAN POCOS" title="Porque a cada uno lo acompañamos" text="No es soltar una app y chau. Te ayudamos a dejar tu negocio andando de verdad. Eso lleva tiempo." /> },
  // 4 · El beneficio fundador (escasez de precio)
  { accent: '#34d399', render: () => <Block icon={Crown} color="#6ee7b7" tag="SOLO FUNDADORES" title="Tu precio queda congelado" text="Los que entran ahora mantienen el precio de fundador para siempre, aunque después suba para el resto." /> },
  // 5 · Proyección (venta indirecta: futuro)
  { accent: '#60a5fa', render: () => <Block icon={TrendingUp} color="#60a5fa" tag="PENSALO ASÍ" title="¿Dónde querés estar en un año?" text="Con tu agenda ordenada, cobrando señas y sin perder clientas. O igual que hoy. Vos elegís." /> },
  // 6 · Urgencia temporal
  { accent: '#fb7185', render: () => (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 36px' }}>
      <div style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(251,113,133,0.14)', border: '1px solid rgba(251,113,133,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Hourglass size={32} color="#fda4af" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.12 }}>Los lugares se llenan</h2>
      <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5, maxWidth: 255 }}>No hace falta que decidas hoy. Pero cuando los 20 estén, la lista se cierra.</p>
    </div>
  ) },
  // 7 · Cierre — CTA suave con escasez
  { accent: '#7c3aed', render: () => (
    <div style={{ textAlign: 'center', padding: '0 38px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: "'Orbitron', sans-serif", fontSize: 11.5, fontWeight: 800, letterSpacing: '0.16em', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.45)', borderRadius: 999, padding: '6px 14px', marginBottom: 20 }}><Lock size={13} /> QUEDAN POCOS</div>
      <h2 style={{ fontSize: 31, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Fijate si <span style={{ color: '#c4b5fd' }}>entrás</span></h2>
      <p style={{ margin: '15px 0 22px', fontSize: 16, color: 'rgba(255,255,255,0.62)', lineHeight: 1.45 }}>Probá 14 días gratis. Sin tarjeta. Sin compromiso.</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#7c3aed', borderRadius: 12, padding: '13px 22px', fontSize: 17, fontWeight: 800 }}>
        visionturnos.online <ArrowRight size={18} />
      </div>
    </div>
  ) },
]

export default function CarruselFundadoresPage() {
  return <SlideDeck title="Carrusel · Plan Fundadores (escasez)" subtitle="Descargá cada slide (1080×1080) y subilos a Instagram en orden." slides={slides} width={S} height={S} filePrefix="vision-fundadores" />
}
