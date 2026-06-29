'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Globe, Wallet, BellRing, Sparkles, BarChart3, Users, Smartphone,
  Check, ArrowRight, Star, ShieldCheck, Zap, Clock, ChevronDown, Menu, X,
} from 'lucide-react'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { PLANS } from '@/lib/plans'

const BLUE = '#2563FF'

export function Landing() {
  const [menu, setMenu] = useState(false)
  const [faq, setFaq] = useState<number | null>(0)

  return (
    <div style={{ background: '#06060d', color: 'white', overflowX: 'hidden', position: 'relative' }}>
      {/* Fondos animados (blobs) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="ld-blob" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.35), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="ld-blob" style={{ position: 'absolute', top: '30%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.28), transparent 70%)', filter: 'blur(40px)', animationDelay: '4s' }} />
        <div className="ld-blob" style={{ position: 'absolute', bottom: '-10%', left: '20%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)', filter: 'blur(40px)', animationDelay: '8s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ───── NAV ───── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(6,6,13,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
            <VisionLogoWhite size={30} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="ld-desktop-nav">
              <a href="#funciones" className="ld-nav-link" style={navLink}>Funciones</a>
              <a href="#como" className="ld-nav-link" style={navLink}>Cómo funciona</a>
              <a href="#precios" className="ld-nav-link" style={navLink}>Precios</a>
              <a href="#faq" className="ld-nav-link" style={navLink}>Preguntas</a>
              <Link href="/login" style={{ ...navLink, color: 'rgba(255,255,255,0.85)' }}>Iniciar sesión</Link>
              <Link href="/register" className="ld-cta" style={ctaSmall}>Probar gratis</Link>
            </div>
            <button onClick={() => setMenu(!menu)} className="ld-mobile-btn" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}>
              {menu ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
          {menu && (
            <div style={{ ...container, paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="#funciones" onClick={() => setMenu(false)} style={navLink}>Funciones</a>
              <a href="#como" onClick={() => setMenu(false)} style={navLink}>Cómo funciona</a>
              <a href="#precios" onClick={() => setMenu(false)} style={navLink}>Precios</a>
              <a href="#faq" onClick={() => setMenu(false)} style={navLink}>Preguntas</a>
              <Link href="/login" style={navLink}>Iniciar sesión</Link>
              <Link href="/register" style={{ ...ctaSmall, textAlign: 'center' }}>Probar gratis</Link>
            </div>
          )}
        </nav>

        {/* ───── HERO ───── */}
        <header style={{ ...container, paddingTop: 'clamp(48px, 9vw, 110px)', paddingBottom: 'clamp(40px, 7vw, 80px)', textAlign: 'center' }}>
          <div className="ld-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 999, background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', fontSize: 13, fontWeight: 600, color: '#93c5fd', marginBottom: 26 }}>
            <Sparkles size={14} /> La agenda inteligente para tu negocio de turnos
          </div>
          <h1 className="ld-reveal" style={{ fontSize: 'clamp(34px, 6vw, 62px)', fontWeight: 900, lineHeight: 1.05, margin: 0, letterSpacing: '-0.02em' }}>
            Llená tu agenda y<br />
            <span className="ld-gradient-text">olvidate del ausentismo</span>
          </h1>
          <p className="ld-reveal" style={{ maxWidth: 620, margin: '24px auto 0', fontSize: 'clamp(16px, 2.2vw, 19px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.62)' }}>
            Vision OS organiza tus turnos, recibe reservas online con tu marca, cobra la seña por adelantado y te ayuda a crecer en redes. Todo desde una app que se instala en el celular.
          </p>
          <div className="ld-reveal" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 34 }}>
            <Link href="/register" className="ld-cta" style={ctaBig}>
              Probar gratis 14 días <ArrowRight size={18} />
            </Link>
            <a href="#precios" className="ld-cta" style={ctaGhost}>Ver precios</a>
          </div>
          <p className="ld-reveal" style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Sin tarjeta · Sin instalar nada · Lista en 5 minutos
          </p>

          {/* Mockup flotante */}
          <div style={{ perspective: 1400, marginTop: 'clamp(40px, 6vw, 70px)' }}>
            <div className="ld-float" style={{ maxWidth: 920, margin: '0 auto', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 120px rgba(37,99,255,0.25)', background: 'linear-gradient(160deg, #0c0c18, #07070f)' }}>
              <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={dot('#ff5f57')} /><span style={dot('#febc2e')} /><span style={dot('#28c840')} />
                <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>vision.byrcointh.online</span>
              </div>
              <div style={{ padding: 'clamp(18px, 3vw, 30px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                {[
                  { t: 'Turnos hoy', v: '24', c: BLUE },
                  { t: 'Ingresos del día', v: '$184.500', c: '#34d399' },
                  { t: 'Reservas online', v: '8', c: '#22d3ee' },
                  { t: 'Ausentismo', v: '3%', c: '#a78bfa' },
                ].map((k) => (
                  <div key={k.t} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{k.t}</p>
                    <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: k.c }}>{k.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ───── TRUST STRIP ───── */}
        <section style={{ ...container, paddingTop: 10, paddingBottom: 50 }}>
          <p style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
            Ideal para
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px 34px', color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 600 }}>
            {['Estética & Spa', 'Kinesiología', 'Peluquerías', 'Consultorios', 'Nutrición', 'Barberías', 'Uñas & Lashes'].map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        </section>

        {/* ───── PROBLEMA → SOLUCIÓN ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div style={{ ...glass, borderColor: 'rgba(248,113,113,0.25)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: 0, letterSpacing: '0.05em' }}>SIN VISION OS 😣</p>
              <ul style={problemList}>
                <li>Turnos anotados en cuaderno o WhatsApp</li>
                <li>Clientes que reservan y no vienen</li>
                <li>Horas perdidas coordinando por chat</li>
                <li>No sabés cuánto facturás ni quién te debe</li>
              </ul>
            </div>
            <div style={{ ...glass, borderColor: 'rgba(52,211,153,0.3)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399', margin: 0, letterSpacing: '0.05em' }}>CON VISION OS 🚀</p>
              <ul style={{ ...problemList, color: 'rgba(255,255,255,0.8)' }}>
                <li>Agenda profesional, ordenada y en la nube</li>
                <li>Seña online → casi nadie falta</li>
                <li>Tus clientes reservan solos por un link</li>
                <li>Caja, reportes y todo bajo control</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ───── FUNCIONES ───── */}
        <section id="funciones" style={{ ...container, paddingTop: 'clamp(30px, 5vw, 60px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Funciones" title="Todo lo que tu negocio necesita" sub="Una sola app para gestionar, cobrar y crecer." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginTop: 44 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="ld-card" style={glass}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${f.color}1f`, border: `1px solid ${f.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── CÓMO FUNCIONA ───── */}
        <section id="como" style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="En 3 pasos" title="Empezá hoy mismo" sub="No necesitás conocimientos técnicos." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginTop: 44 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ ...glass, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 18, right: 20, fontSize: 44, fontWeight: 900, color: 'rgba(255,255,255,0.06)' }}>{i + 1}</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── PRECIOS ───── */}
        <section id="precios" style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Precios" title="Planes simples, sin sorpresas" sub="Cobramos por cantidad de profesionales. Cancelás cuando quieras." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18, marginTop: 44, maxWidth: 980, margin: '44px auto 0' }}>
            {PLANS.map((p) => (
              <div key={p.id} className="ld-card" style={{ ...glass, position: 'relative', display: 'flex', flexDirection: 'column', borderColor: p.popular ? 'rgba(37,99,255,0.6)' : 'rgba(255,255,255,0.1)', boxShadow: p.popular ? '0 20px 60px rgba(37,99,255,0.22)' : 'none' }}>
                {p.popular && (
                  <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontSize: 12, fontWeight: 800, borderRadius: 999, padding: '4px 14px', whiteSpace: 'nowrap' }}>
                    <Star size={12} /> Más elegido
                  </span>
                )}
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{p.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>{p.blurb}</p>
                <p style={{ margin: '18px 0 0' }}>
                  <span style={{ fontSize: 40, fontWeight: 900 }}>${p.price}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}> USD/mes</span>
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 26px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>
                      <Check size={17} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="ld-cta" style={{ ...(p.popular ? ctaBig : ctaGhost), justifyContent: 'center', width: '100%', padding: '13px' }}>
                  Probar gratis
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: 'rgba(255,255,255,0.45)' }}>
            💳 Pagás con tarjeta (USD) o Mercado Pago (pesos) · 🇦🇷 Precios en pesos disponibles al suscribirte
          </p>
        </section>

        {/* ───── TESTIMONIOS ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Testimonios" title="Lo que dicen quienes ya la usan" sub="" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 44 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={glass}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>“{t.text}”</p>
                <p style={{ margin: '16px 0 0', fontSize: 13.5, fontWeight: 700 }}>{t.name} <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>· {t.role}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── FAQ ───── */}
        <section id="faq" style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)', maxWidth: 760 }}>
          <SectionTitle kicker="Preguntas frecuentes" title="Todo lo que querés saber" sub="" />
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((q, i) => (
              <div key={q.q} style={{ ...glass, padding: 0, overflow: 'hidden' }}>
                <button onClick={() => setFaq(faq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 15.5, fontWeight: 600 }}>
                  {q.q}
                  <ChevronDown size={18} style={{ flexShrink: 0, transition: 'transform 0.2s', transform: faq === i ? 'rotate(180deg)' : 'none', color: 'rgba(255,255,255,0.5)' }} />
                </button>
                {faq === i && (
                  <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>{q.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ───── CTA FINAL ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(50px, 8vw, 100px)' }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, border: '1px solid rgba(37,99,255,0.35)', background: 'linear-gradient(135deg, rgba(37,99,255,0.18), rgba(167,139,250,0.12))', padding: 'clamp(36px, 6vw, 64px) clamp(20px, 4vw, 50px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              Probá Vision OS <span className="ld-gradient-text">gratis 14 días</span>
            </h2>
            <p style={{ maxWidth: 520, margin: '18px auto 0', fontSize: 16.5, color: 'rgba(255,255,255,0.7)' }}>
              Sin tarjeta. Sin compromiso. Empezá a ordenar tu negocio hoy y mirá la diferencia.
            </p>
            <Link href="/register" className="ld-cta" style={{ ...ctaBig, marginTop: 30, display: 'inline-flex' }}>
              Crear mi cuenta gratis <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ───── FOOTER ───── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ ...container, paddingTop: 36, paddingBottom: 36, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <VisionLogoWhite size={26} />
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>La agenda inteligente para tu negocio.</p>
            </div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 13.5 }}>
              <Link href="/login" style={footerLink}>Iniciar sesión</Link>
              <Link href="/register" style={footerLink}>Probar gratis</Link>
              <Link href="/privacidad" style={footerLink}>Privacidad</Link>
              <Link href="/terminos" style={footerLink}>Términos</Link>
            </div>
          </div>
          <p style={{ ...container, paddingBottom: 28, margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
            © 2026 Vision OS · Byrcointh LLC. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', margin: 0 }}>{kicker}</p>
      <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, margin: '12px 0 0', lineHeight: 1.12, letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ margin: '14px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.55)' }}>{sub}</p>}
    </div>
  )
}

const FEATURES = [
  { icon: Calendar, color: '#2563FF', title: 'Agenda inteligente', desc: 'Turnos por día, semana y profesional. Turnos recurrentes, bloqueos y todo a un clic.' },
  { icon: Globe, color: '#22d3ee', title: 'Reservas online', desc: 'Tus clientes sacan turno solos desde un link, con tu logo y tu marca. 24/7.' },
  { icon: Wallet, color: '#34d399', title: 'Seña anti-ausentismo', desc: 'Cobrá una seña por adelantado al reservar. Menos faltas, más ingresos asegurados.' },
  { icon: BellRing, color: '#fbbf24', title: 'Recordatorios', desc: 'Avisá a tus clientes por WhatsApp y reducí los olvidos.' },
  { icon: Sparkles, color: '#a78bfa', title: 'Redes con IA', desc: 'Generá placas y contenido para Instagram con inteligencia artificial.' },
  { icon: BarChart3, color: '#f472b6', title: 'Caja y reportes', desc: 'Controlá ingresos, cobros y métricas de tu negocio en tiempo real.' },
  { icon: Users, color: '#60a5fa', title: 'Equipo y roles', desc: 'Sumá a tu recepción y profesionales, cada uno con sus permisos.' },
  { icon: Smartphone, color: '#22d3ee', title: 'App en el celular', desc: 'Se instala como app en tu teléfono. Sin tiendas, sin costos extra.' },
]

const STEPS = [
  { title: 'Creá tu cuenta', desc: 'Registrate gratis en 2 minutos y cargá los datos de tu negocio.' },
  { title: 'Cargá tu agenda', desc: 'Sumá tus profesionales y servicios. La app te guía paso a paso.' },
  { title: 'Compartí tu link', desc: 'Pasá tu link de reservas y empezá a recibir turnos automáticamente.' },
]

const TESTIMONIALS = [
  { name: 'Virginia L.', role: 'Estética', text: 'Bajé muchísimo el ausentismo con la seña online. Mis clientas reservan solas y yo gano tiempo todos los días.' },
  { name: 'Ludmila R.', role: 'Kinesiología', text: 'Tener todo en un solo lugar (turnos, pagos, recordatorios) me cambió la organización del consultorio.' },
  { name: 'Daiana F.', role: 'Peluquería', text: 'El link de reservas es lo mejor. La gente saca turno a cualquier hora y yo no contesto más por WhatsApp.' },
]

const FAQS = [
  { q: '¿Necesito instalar algo o saber de tecnología?', a: 'No. Vision OS funciona desde el navegador y se puede instalar como app en tu celular con un toque. Es muy fácil de usar y te guiamos al empezar.' },
  { q: '¿Cómo funciona la prueba gratis?', a: 'Tenés 14 días gratis sin poner tarjeta. Usás todo y, si te sirve, elegís un plan. Si no, no pagás nada.' },
  { q: '¿Puedo cobrar la seña a mis clientes?', a: 'Sí. Activás la seña y tus clientes la abonan al reservar, con tu propio medio de pago (Mercado Pago, transferencia, etc.). Reducís muchísimo las ausencias.' },
  { q: '¿Cómo pago la suscripción?', a: 'Con tarjeta internacional (USD) vía Stripe, o con Mercado Pago en pesos si estás en Argentina. Se renueva sola cada mes y cancelás cuando quieras.' },
  { q: '¿Sirve si trabajamos varias personas?', a: 'Sí. Sumás a tu equipo (recepción, profesionales) con roles y permisos. Elegís el plan según cuántos profesionales sean.' },
]

const container: React.CSSProperties = { maxWidth: 1140, margin: '0 auto', paddingLeft: 'clamp(18px, 4vw, 32px)', paddingRight: 'clamp(18px, 4vw, 32px)' }
const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14.5, fontWeight: 600 }
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 'clamp(20px, 3vw, 26px)' }
const ctaSmall: React.CSSProperties = { background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 20px rgba(37,99,255,0.4)' }
const ctaBig: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '15px 28px', fontSize: 16, fontWeight: 800, boxShadow: '0 10px 34px rgba(37,99,255,0.45)' }
const ctaGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '15px 28px', fontSize: 16, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }
const problemList: React.CSSProperties = { listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14.5, lineHeight: 1.4, color: 'rgba(255,255,255,0.6)' }
const footerLink: React.CSSProperties = { color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }
const dot = (c: string): React.CSSProperties => ({ width: 11, height: 11, borderRadius: '50%', background: c, display: 'inline-block' })
