'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Calendar, Globe, Wallet, BellRing, Sparkles, BarChart3, Users, Smartphone,
  Check, ArrowRight, Star, ChevronDown, Menu, X, Repeat, Ban, Search, Wand2,
  Image as ImageIcon, CalendarDays, MessageSquareText, Gift,
  Home, UserRound, Tag, TrendingUp, Settings, Clock, FileHeart,
} from 'lucide-react'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { PLANS } from '@/lib/plans'

const BLUE = '#2563FF'

export function Landing() {
  const [menu, setMenu] = useState(false)
  const [faq, setFaq] = useState<number | null>(0)
  const [tilt, setTilt] = useState({ x: 8, y: -12 })
  const [par, setPar] = useState({ dx: 0, dy: 0, rx: 0, ry: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax 3D: el mockup se inclina y el logo de fondo se mueve con profundidad
  function onHeroMove(e: React.MouseEvent) {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: 6 - py * 14, y: -px * 18 })
    setPar({ dx: -px * 50, dy: -py * 50, rx: py * 16, ry: -px * 20 })
  }
  function onHeroLeave() { setTilt({ x: 8, y: -12 }); setPar({ dx: 0, dy: 0, rx: 0, ry: 0 }) }

  return (
    <div style={{ background: '#06060d', color: 'white', overflowX: 'hidden', position: 'relative' }}>
      {/* Fondos animados */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="ld-blob" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.4), transparent 70%)', filter: 'blur(50px)' }} />
        <div className="ld-blob" style={{ position: 'absolute', top: '25%', right: '-12%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.32), transparent 70%)', filter: 'blur(50px)', animationDelay: '4s' }} />
        <div className="ld-blob" style={{ position: 'absolute', bottom: '-12%', left: '15%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.24), transparent 70%)', filter: 'blur(50px)', animationDelay: '8s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ───── NAV ───── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(6,6,13,0.72)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <a href="#" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '0.04em', color: 'white', textDecoration: 'none' }}>
              VISION<span style={{ color: '#60a5fa' }}> OS</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="ld-desktop-nav">
              <a href="#agenda" className="ld-nav-link" style={navLink}>Agenda</a>
              <a href="#redes" className="ld-nav-link" style={navLink}>Redes con IA</a>
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
              <a href="#agenda" onClick={() => setMenu(false)} style={navLink}>Agenda</a>
              <a href="#redes" onClick={() => setMenu(false)} style={navLink}>Redes con IA</a>
              <a href="#precios" onClick={() => setMenu(false)} style={navLink}>Precios</a>
              <a href="#faq" onClick={() => setMenu(false)} style={navLink}>Preguntas</a>
              <Link href="/login" style={navLink}>Iniciar sesión</Link>
              <Link href="/register" style={{ ...ctaSmall, textAlign: 'center' }}>Probar gratis</Link>
            </div>
          )}
        </nav>

        {/* ───── HERO ───── */}
        <header ref={heroRef} onMouseMove={onHeroMove} onMouseLeave={onHeroLeave} style={{ ...container, position: 'relative', paddingTop: 'clamp(70px, 12vw, 150px)', paddingBottom: 'clamp(40px, 7vw, 80px)', textAlign: 'center' }}>
          {/* Logo gigante DETRÁS del título: gira en 3D, se arma/desarma y hace parallax */}
          <div aria-hidden style={{ position: 'absolute', top: 'clamp(0px, 2vw, 40px)', left: '50%', zIndex: 0, pointerEvents: 'none', opacity: 0.34, perspective: '1300px', transform: `translate(-50%, 0) translate(${par.dx}px, ${par.dy}px)`, transition: 'transform 0.18s ease-out', filter: 'drop-shadow(0 0 90px rgba(37,99,255,1))' }}>
            <span className="ld-logo-3d" style={{ display: 'inline-block', lineHeight: 0 }}>
              <HeroV />
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="ld-rise" style={{ fontSize: 'clamp(36px, 6.5vw, 68px)', fontWeight: 900, lineHeight: 1.04, margin: 0, letterSpacing: '-0.025em' }}>
            Llená tu agenda y<br />
            <span className="ld-gradient-text">olvidate del ausentismo</span>
          </h1>
          <p className="ld-rise" style={{ maxWidth: 640, margin: '24px auto 0', fontSize: 'clamp(16px, 2.2vw, 20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}>
            La app todo-en-uno para tu negocio de turnos: agenda inteligente, reservas online con tu marca, seña anti-faltas y <strong style={{ color: 'white' }}>creación de contenido para redes con IA</strong>.
          </p>
          {/* Banner prueba gratis — justo arriba de los botones */}
          <div className="ld-rise" style={{ marginTop: 30 }}>
            <span className="ld-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 20px', borderRadius: 999, background: 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(34,211,238,0.14))', border: '1px solid rgba(52,211,153,0.5)', fontSize: 14, fontWeight: 800, color: '#6ee7b7', letterSpacing: '0.01em' }}>
              <Gift size={16} /> 14 DÍAS GRATIS · PROBALA SIN PAGAR NADA
            </span>
          </div>
          <div className="ld-rise" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
            <Link href="/register" className="ld-cta" style={ctaBig}>
              Empezar gratis ahora <ArrowRight size={18} />
            </Link>
            <a href="#precios" className="ld-cta" style={ctaGhost}>Ver precios</a>
          </div>
          <p className="ld-rise" style={{ marginTop: 16, fontSize: 13.5, color: 'rgba(255,255,255,0.45)' }}>
            ✓ Sin tarjeta · ✓ Sin instalar nada · ✓ Cancelás cuando quieras
          </p>

          {/* Mockup realista con tilt 3D */}
          <div style={{ perspective: 1600, marginTop: 'clamp(44px, 6vw, 76px)' }}>
            <div className="ld-mock" style={{ maxWidth: 960, margin: '0 auto', transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
              <AppMockup />
            </div>
          </div>
          </div>
        </header>

        {/* ───── RUBROS (carrusel infinito) ───── */}
        <section style={{ paddingTop: 'clamp(20px, 4vw, 50px)', paddingBottom: 'clamp(40px, 6vw, 70px)' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 8 }}>Pensada para tu rubro</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3.4vw, 34px)', fontWeight: 900, margin: '0 0 30px', letterSpacing: '-0.02em' }}>Cualquier negocio con turnos</h2>
          <div className="ld-marquee-mask" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
            <div className="ld-marquee-track">
              {[...RUBROS.slice(0, 10), ...RUBROS.slice(0, 10)].map((r, i) => <Chip key={'a' + i} label={r} i={i} />)}
            </div>
            <div className="ld-marquee-track rev">
              {[...RUBROS.slice(10), ...RUBROS.slice(10)].map((r, i) => <Chip key={'b' + i} label={r} i={i + 5} />)}
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>…y cualquier otro negocio que trabaje con turnos. <span style={{ color: '#93c5fd', fontWeight: 600 }}>Si das turnos, es para vos.</span></p>
        </section>

        {/* ───── PROBLEMA → SOLUCIÓN ───── */}
        <section style={{ ...container, paddingTop: 'clamp(10px, 2vw, 20px)', paddingBottom: 'clamp(40px, 6vw, 90px)' }}>
          <SectionTitle kicker="El cambio" title="De caótico a profesional" sub="Mirá la diferencia entre manejar tu negocio a la antigua y hacerlo con Vision OS." />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 46 }}>
            {/* Antes */}
            <div style={{ ...glass, padding: 'clamp(24px, 3vw, 32px)', background: 'linear-gradient(165deg, rgba(248,113,113,0.07), rgba(255,255,255,0.02))', borderColor: 'rgba(248,113,113,0.22)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#f87171" /></span>
                <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>Sin Vision OS</span>
              </div>
              {['Turnos anotados en cuaderno o WhatsApp', 'Clientes que reservan y nunca aparecen', 'Horas perdidas coordinando por chat', 'No sabés cuánto facturás ni quién te debe'].map((t) => (
                <div key={t} style={compRow}><X size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 2, opacity: 0.8 }} /><span style={{ color: 'rgba(255,255,255,0.6)' }}>{t}</span></div>
              ))}
            </div>
            {/* Con Vision OS */}
            <div style={{ ...glass, padding: 'clamp(24px, 3vw, 32px)', background: 'linear-gradient(165deg, rgba(52,211,153,0.09), rgba(255,255,255,0.02))', borderColor: 'rgba(52,211,153,0.32)', boxShadow: '0 20px 60px rgba(52,211,153,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(52,211,153,0.16)', border: '1px solid rgba(52,211,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={19} color="#34d399" /></span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>Con Vision OS</span>
              </div>
              {['Agenda profesional, ordenada y en la nube', 'Seña online → casi nadie falta', 'Tus clientes reservan solos por un link', 'Caja, reportes y todo bajo control'].map((t) => (
                <div key={t} style={compRow}><Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ color: 'rgba(255,255,255,0.85)' }}>{t}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── SPOTLIGHT: AGENDA ───── */}
        <section id="agenda" className="ld-spotlight" style={{ ...container, paddingTop: 'clamp(20px, 4vw, 50px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div style={spotGrid}>
            <div>
              <span style={kickerPill('#2563FF')}><Calendar size={14} /> Agenda inteligente</span>
              <h2 style={spotTitle}>La agenda más <span className="ld-gradient-text">poderosa</span> para tu negocio</h2>
              <p style={spotSub}>No es un simple calendario. Es un cerebro que ordena tu día y trabaja por vos.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
                {AGENDA_POINTS.map((p) => (
                  <div key={p.t} style={{ display: 'flex', gap: 13 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37,99,255,0.15)', border: '1px solid rgba(37,99,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><p.icon size={18} color="#60a5fa" /></span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15.5 }}>{p.t}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ld-spotlight-img" style={{ transform: 'perspective(1000px) rotateY(-8deg)' }}>
              <AgendaPreview />
            </div>
          </div>
        </section>

        {/* ───── SPOTLIGHT: REDES CON IA ───── */}
        <section id="redes" className="ld-spotlight" style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 90px)' }}>
          <div style={{ ...spotGrid, direction: 'rtl' }}>
            <div style={{ direction: 'ltr' }}>
              <span style={kickerPill('#a78bfa')}><Sparkles size={14} /> Marketing con IA</span>
              <h2 style={spotTitle}>Creá contenido <span className="ld-gradient-text">que vende</span>, en segundos</h2>
              <p style={spotSub}>La función estrella. Una inteligencia artificial que arma tu marketing por vos: placas, textos e ideas listas para publicar.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
                {REDES_POINTS.map((p) => (
                  <div key={p.t} style={{ display: 'flex', gap: 13 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><p.icon size={18} color="#c4b5fd" /></span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15.5 }}>{p.t}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ direction: 'ltr' }}>
              <PlacasPreview />
            </div>
          </div>
        </section>

        {/* ───── OTRAS FUNCIONES ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Una plataforma completa" title="Todo lo que tu negocio necesita" sub="Dejá de saltar entre el cuaderno, WhatsApp, Excel y mil apps. Vision OS reúne todo en un solo lugar." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18, marginTop: 44 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="ld-card" style={{ ...glass, background: `linear-gradient(165deg, ${f.color}12, rgba(255,255,255,0.025))`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${f.color}22, transparent 70%)`, filter: 'blur(10px)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 13, background: `${f.color}22`, border: `1px solid ${f.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 8px 20px ${f.color}22` }}><f.icon size={23} color={f.color} /></div>
                  <h3 style={{ margin: 0, fontSize: 17.5, fontWeight: 800 }}>{f.title}</h3>
                  <p style={{ margin: '9px 0 0', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───── CÓMO FUNCIONA ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="En 3 pasos" title="Empezá hoy mismo" sub="No necesitás conocimientos técnicos." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginTop: 44 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="ld-card" style={{ ...glass, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 16, right: 20, fontSize: 44, fontWeight: 900, color: 'rgba(255,255,255,0.06)' }}>{i + 1}</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── PRECIOS ───── */}
        <section id="precios" style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Precios" title="Planes simples, sin sorpresas" sub="Empezá con 14 días gratis. Cancelás cuando quieras." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18, marginTop: 44, maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
            {PLANS.map((p) => (
              <div key={p.id} className="ld-card" style={{ ...glass, position: 'relative', display: 'flex', flexDirection: 'column', borderColor: p.popular ? 'rgba(37,99,255,0.6)' : 'rgba(255,255,255,0.1)', boxShadow: p.popular ? '0 20px 60px rgba(37,99,255,0.22)' : 'none' }}>
                {p.popular && (
                  <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', fontSize: 12, fontWeight: 800, borderRadius: 999, padding: '4px 14px', whiteSpace: 'nowrap' }}><Star size={12} /> Más elegido</span>
                )}
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{p.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>{p.blurb}</p>
                <p style={{ margin: '18px 0 0' }}><span style={{ fontSize: 40, fontWeight: 900 }}>${p.price}</span><span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}> USD/mes</span></p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 26px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.78)' }}><Check size={17} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} /> {f}</li>
                  ))}
                </ul>
                <Link href="/register" className="ld-cta" style={{ ...(p.popular ? ctaBig : ctaGhost), justifyContent: 'center', width: '100%', padding: '13px' }}>Probar gratis</Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: 'rgba(255,255,255,0.45)' }}>💳 Tarjeta internacional (USD) o Mercado Pago en pesos 🇦🇷</p>
        </section>

        {/* ───── TESTIMONIOS ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
          <SectionTitle kicker="Testimonios" title="Lo que dicen quienes ya la usan" sub="" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 44 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="ld-card" style={glass}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} color="#fbbf24" fill="#fbbf24" />)}</div>
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
                {faq === i && <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>{q.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* ───── CTA FINAL ───── */}
        <section style={{ ...container, paddingBottom: 'clamp(50px, 8vw, 100px)' }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, border: '1px solid rgba(37,99,255,0.35)', background: 'linear-gradient(135deg, rgba(37,99,255,0.2), rgba(167,139,250,0.14))', padding: 'clamp(40px, 6vw, 70px) clamp(20px, 4vw, 50px)', textAlign: 'center' }}>
            <div className="ld-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', fontSize: 13.5, fontWeight: 800, color: '#6ee7b7', marginBottom: 22 }}>
              <Gift size={15} /> 14 DÍAS GRATIS, SIN TARJETA
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Probá Vision OS <span className="ld-gradient-text">sin pagar nada</span></h2>
            <p style={{ maxWidth: 540, margin: '18px auto 0', fontSize: 16.5, color: 'rgba(255,255,255,0.7)' }}>Empezá a ordenar tu negocio hoy. Si no te sirve, no pagás. Así de simple.</p>
            <Link href="/register" className="ld-cta" style={{ ...ctaBig, marginTop: 30, display: 'inline-flex', fontSize: 17, padding: '16px 32px' }}>Crear mi cuenta gratis <ArrowRight size={19} /></Link>
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
          <p style={{ ...container, paddingBottom: 28, margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>© 2026 Vision OS · Byrcointh LLC. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}

/* ───────── Mockups visuales ───────── */

function AppMockup() {
  const NAV = [
    { icon: Home, label: 'Inicio' },
    { icon: Calendar, label: 'Agenda', active: true },
    { icon: Clock, label: 'Lista de espera' },
    { icon: UserRound, label: 'Pacientes' },
    { icon: Wallet, label: 'Caja' },
    { icon: BarChart3, label: 'Reportes' },
    { icon: Globe, label: 'Reservas online' },
    { icon: Sparkles, label: 'Redes' },
    { icon: TrendingUp, label: 'Crecimiento' },
    { icon: Users, label: 'Profesionales' },
    { icon: Settings, label: 'Configuración' },
  ]
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 50px 130px rgba(37,99,255,0.32)', background: '#07070f' }}>
      {/* barra de ventana */}
      <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a14' }}>
        <span style={dot('#ff5f57')} /><span style={dot('#febc2e')} /><span style={dot('#28c840')} />
        <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>vision.byrcointh.online/agenda</span>
      </div>
      <div style={{ display: 'flex', minHeight: 300 }}>
        {/* menú lateral con todas las opciones */}
        <div style={{ width: 168, flexShrink: 0, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ padding: '4px 8px 12px' }}><VisionLogoWhite size={22} /></div>
          {NAV.map((n) => (
            <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, color: n.active ? 'white' : 'rgba(255,255,255,0.5)', background: n.active ? 'rgba(37,99,255,0.16)' : 'transparent', border: n.active ? '1px solid rgba(37,99,255,0.35)' : '1px solid transparent' }}>
              <n.icon size={14} color={n.active ? '#60a5fa' : 'currentColor'} /> {n.label}
            </div>
          ))}
        </div>
        {/* contenido: agenda */}
        <div style={{ flex: 1, minWidth: 0 }}><AgendaPreview embedded /></div>
      </div>
    </div>
  )
}

function AgendaPreview({ embedded }: { embedded?: boolean }) {
  const cols = [
    { name: 'Sofía', color: '#2563FF' },
    { name: 'Martina', color: '#34d399' },
    { name: 'Lucía', color: '#a78bfa' },
  ]
  const appts = [
    { col: 0, top: 8, h: 46, name: 'Ana G.', svc: 'Limpieza facial', tag: '✓' },
    { col: 1, top: 30, h: 60, name: 'Caro M.', svc: 'Masaje', tag: '½' },
    { col: 2, top: 14, h: 40, name: 'Belén R.', svc: 'Lashes' },
    { col: 0, top: 70, h: 50, name: 'Flor T.', svc: 'Depilación', tag: '$' },
    { col: 2, top: 66, h: 54, name: 'Romi P.', svc: 'Uñas' },
  ]
  return (
    <div style={{ background: '#07070f', borderRadius: embedded ? 0 : 16, border: embedded ? 'none' : '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Hoy · Viernes 27</span>
        <span style={{ fontSize: 12, color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 7, padding: '3px 9px', fontWeight: 700 }}>+ Nuevo turno</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(3, 1fr)', minHeight: 230 }}>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingTop: 30 }}>
          {['09', '10', '11', '12'].map((h) => <div key={h} style={{ height: 44, fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right', paddingRight: 6 }}>{h}</div>)}
        </div>
        {cols.map((c, ci) => (
          <div key={c.name} style={{ borderRight: ci < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', position: 'relative' }}>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{c.name}</span>
            </div>
            {appts.filter((a) => a.col === ci).map((a, i) => (
              <div key={i} style={{ position: 'absolute', top: 30 + a.top, left: 4, right: 4, height: a.h, background: `linear-gradient(135deg, ${cols[a.col].color}33, ${cols[a.col].color}1a)`, borderLeft: `3px solid ${cols[a.col].color}`, borderRadius: 6, padding: '4px 7px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{a.name}</span>
                  {a.tag && <span style={{ fontSize: 9, fontWeight: 800, color: a.tag === '$' ? '#34d399' : a.tag === '½' ? '#fbbf24' : '#60a5fa' }}>{a.tag}</span>}
                </div>
                <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)' }}>{a.svc}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PlacasPreview() {
  const placas = [
    { bg: 'linear-gradient(135deg,#2563FF,#7c3aed)', t: '¡Reservá tu turno!', s: 'Estética Bella · 20% OFF' },
    { bg: 'linear-gradient(135deg,#ec4899,#a78bfa)', t: 'Nuevo: Lashes Volumen', s: 'Agendá por el link 💖' },
    { bg: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', t: 'Promo Septiembre', s: '3 sesiones x 2' },
  ]
  return (
    <div style={{ position: 'relative', padding: '10px 0' }}>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {placas.map((p, i) => (
          <div key={i} className="ld-card" style={{ width: 150, height: 150, borderRadius: 16, background: p.bg, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 18px 40px rgba(0,0,0,0.4)', transform: `rotate(${i === 1 ? 0 : i === 0 ? -5 : 5}deg)`, border: '1px solid rgba(255,255,255,0.18)' }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 15, lineHeight: 1.1 }}>{p.t}</p>
            <p style={{ margin: '5px 0 0', fontSize: 11, opacity: 0.9 }}>{p.s}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, ...glass, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Wand2 size={18} color="#c4b5fd" />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>“Generá una placa para promo de depilación…” → <strong style={{ color: 'white' }}>listo en 3 segundos</strong></span>
      </div>
    </div>
  )
}

// La "V" gigante del hero, partida en dos mitades que se arman y desarman.
function HeroV() {
  return (
    <svg viewBox="-40 0 280 175" style={{ width: 'min(96vw, 760px)', height: 'auto', display: 'block', overflow: 'visible' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hv-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a55" /><stop offset="60%" stopColor="#14141f" /><stop offset="100%" stopColor="#08080f" />
        </linearGradient>
        <linearGradient id="hv-r" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#26263e" /><stop offset="60%" stopColor="#0e0e1a" /><stop offset="100%" stopColor="#060610" />
        </linearGradient>
        <linearGradient id="hv-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="50%" stopColor="#2563FF" /><stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="hv-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g className="ld-v-left">
        <polygon points="12,12 78,12 100,148 55,148" fill="url(#hv-l)" />
        <polygon points="70,12 78,12 100,148 93,148" fill="#1e1e32" opacity="0.95" />
        <line x1="78" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#hv-glow)" opacity="0.95" />
        <line x1="78" y1="12" x2="100" y2="148" stroke="url(#hv-line)" strokeWidth="1.6" opacity="0.9" />
      </g>
      <g className="ld-v-right">
        <polygon points="188,12 122,12 100,148 145,148" fill="url(#hv-r)" />
        <polygon points="130,12 122,12 100,148 107,148" fill="#161626" opacity="0.85" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#hv-glow)" opacity="0.95" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="url(#hv-line)" strokeWidth="1.6" opacity="0.9" />
      </g>
    </svg>
  )
}

function Chip({ label, i }: { label: string; i: number }) {
  const colors = ['#60a5fa', '#34d399', '#a78bfa', '#22d3ee', '#f472b6', '#fbbf24']
  return <span className="ld-chip"><span className="ld-chip-dot" style={{ background: colors[i % colors.length] }} />{label}</span>
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

const AGENDA_POINTS = [
  { icon: Repeat, t: 'Turnos recurrentes garantizados', d: 'Cargá “todos los lunes y miércoles” y la app crea la serie completa, salteando feriados sola.' },
  { icon: Ban, t: 'Bloqueos y capacidad', d: 'Bloqueá horarios, vacaciones o configurá salas con capacidad para varios a la vez.' },
  { icon: Search, t: 'Encontrá todo al instante', d: 'Buscador global (Ctrl+K) para hallar cualquier paciente o turno en segundos.' },
  { icon: BellRing, t: 'Notificaciones que te cuidan', d: 'Al entrar ves turnos del día, cancelaciones y a quién cobrar. La app trabaja por vos.' },
]

const REDES_POINTS = [
  { icon: ImageIcon, t: 'Placas con tu logo y marca', d: 'Diseños profesionales para Instagram en segundos, con tus colores y tu logo.' },
  { icon: MessageSquareText, t: 'Textos y captions con IA', d: 'La IA escribe el copy perfecto para cada publicación, listo para copiar y pegar.' },
  { icon: CalendarDays, t: 'Calendario de contenido', d: 'Ideas y un plan de qué publicar cada semana para no quedarte sin contenido.' },
  { icon: Wand2, t: 'Asistente experto en marketing', d: 'Pedile lo que necesites (promos, reels, reseñas) y te lo arma al instante.' },
]

const RUBROS = [
  'Estética & Spa', 'Cosmetología', 'Kinesiología', 'Peluquerías', 'Barberías',
  'Uñas & Manicura', 'Cejas & Pestañas', 'Depilación', 'Maquillaje', 'Masajes',
  'Nutrición', 'Psicología', 'Consultorios médicos', 'Odontología', 'Podología',
  'Fonoaudiología', 'Tatuajes & Piercing', 'Veterinarias', 'Personal trainer', 'Centros de salud',
]

const FEATURES = [
  { icon: Globe, color: '#22d3ee', title: 'Reservas online 24/7', desc: 'Compartí un link con tu marca y tus clientes sacan turno solos, a cualquier hora, sin que tengas que contestar mensajes. Respeta tus horarios y disponibilidad automáticamente.' },
  { icon: Wallet, color: '#34d399', title: 'Seña anti-ausentismo', desc: 'Pedí una seña al reservar y mirá cómo desaparecen las faltas. Cobrás por adelantado con tu propio medio de pago y asegurás tu agenda llena.' },
  { icon: BarChart3, color: '#f472b6', title: 'Caja y reportes', desc: 'Sabé exactamente cuánto facturás, quién te debe y cómo viene tu negocio. Caja diaria, estados de pago y reportes con un clic. Exportá todo a Excel.' },
  { icon: Users, color: '#60a5fa', title: 'Equipo y roles', desc: 'Sumá a tu recepción y profesionales, cada uno con su usuario y sus permisos. Tu recepcionista ve la agenda; vos ves todo. Ideal para negocios que crecen.' },
  { icon: Smartphone, color: '#818cf8', title: 'App en el celular', desc: 'Se instala como app en tu teléfono (y el de tu equipo) con un toque, sin pasar por las tiendas ni pagar comisiones. La tenés siempre a mano.' },
  { icon: FileHeart, color: '#fb7185', title: 'Historia clínica', desc: 'Ficha completa de cada cliente: datos, obra social, historial de turnos y notas. Activala solo si tu rubro la necesita. Todo seguro y en la nube.' },
  { icon: BellRing, color: '#fbbf24', title: 'Recordatorios', desc: 'Mandá recordatorios por WhatsApp a tus clientes y reducí los olvidos. Mensajes listos para enviar con un clic.' },
  { icon: TrendingUp, color: '#34d399', title: 'Crecimiento', desc: 'Reactivá clientes que no vienen hace tiempo, llená los huecos de tu agenda y pedí reseñas. La app te ayuda a vender más.' },
]

const STEPS = [
  { title: 'Creá tu cuenta', desc: 'Registrate gratis en 2 minutos y cargá los datos de tu negocio.' },
  { title: 'Cargá tu agenda', desc: 'Sumá tus profesionales y servicios. La app te guía paso a paso.' },
  { title: 'Compartí tu link', desc: 'Pasá tu link de reservas y empezá a recibir turnos automáticamente.' },
]

const TESTIMONIALS = [
  { name: 'Virginia L.', role: 'Estética', text: 'Bajé muchísimo el ausentismo con la seña online. Mis clientas reservan solas y gano tiempo todos los días.' },
  { name: 'Ludmila R.', role: 'Kinesiología', text: 'Tener todo en un lugar (turnos, pagos, recordatorios) me cambió la organización del consultorio.' },
  { name: 'Daiana F.', role: 'Peluquería', text: 'Lo de crear placas con IA es increíble, publico en Instagram sin perder horas. ¡Y el link de reservas es lo mejor!' },
]

const FAQS = [
  { q: '¿Necesito instalar algo o saber de tecnología?', a: 'No. Funciona desde el navegador y se instala como app en tu celular con un toque. Es muy fácil y te guiamos al empezar.' },
  { q: '¿Cómo funciona la prueba gratis?', a: 'Tenés 14 días gratis sin poner tarjeta. Usás todo y, si te sirve, elegís un plan. Si no, no pagás nada.' },
  { q: '¿Qué es lo de crear contenido con IA?', a: 'Una inteligencia artificial dentro de la app que te genera placas para Instagram, textos, ideas y un calendario de contenido. Hacés tu marketing en minutos.' },
  { q: '¿Puedo cobrar la seña a mis clientes?', a: 'Sí. Tus clientes la abonan al reservar con tu propio medio de pago (Mercado Pago, transferencia, etc.). Reducís muchísimo las ausencias.' },
  { q: '¿Cómo pago la suscripción?', a: 'Con tarjeta internacional (USD) vía Stripe, o con Mercado Pago en pesos. Se renueva sola cada mes y cancelás cuando quieras.' },
]

const container: React.CSSProperties = { maxWidth: 1140, margin: '0 auto', paddingLeft: 'clamp(18px, 4vw, 32px)', paddingRight: 'clamp(18px, 4vw, 32px)' }
const navLink: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14.5, fontWeight: 600 }
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 'clamp(20px, 3vw, 26px)' }
const ctaSmall: React.CSSProperties = { background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 20px rgba(37,99,255,0.4)' }
const ctaBig: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '15px 28px', fontSize: 16, fontWeight: 800, boxShadow: '0 10px 34px rgba(37,99,255,0.45)' }
const ctaGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '15px 28px', fontSize: 16, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }
const compRow: React.CSSProperties = { display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.45, padding: '11px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }
const footerLink: React.CSSProperties = { color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }
const spotGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(28px, 5vw, 60px)', alignItems: 'center' }
const spotTitle: React.CSSProperties = { fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, margin: '16px 0 0', lineHeight: 1.1, letterSpacing: '-0.02em' }
const spotSub: React.CSSProperties = { fontSize: 16.5, color: 'rgba(255,255,255,0.6)', margin: '14px 0 0', lineHeight: 1.55 }
const kickerPill = (c: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, background: `${c}1f`, border: `1px solid ${c}55`, fontSize: 13, fontWeight: 700, color: c === '#2563FF' ? '#93c5fd' : '#c4b5fd' })
const dot = (c: string): React.CSSProperties => ({ width: 11, height: 11, borderRadius: '50%', background: c, display: 'inline-block' })
