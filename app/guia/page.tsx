'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Rocket, Users, Tag, Calendar, Repeat, Ban, UserRound, FileHeart, Globe, Wallet,
  BarChart3, BellRing, Sparkles, TrendingUp, UserCog, Settings, Smartphone, CreditCard,
  HelpCircle, Printer, ArrowLeft, Check, Copy,
} from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/site'

type Section = { id: string; icon: typeof Rocket; title: string; steps: (string | { t: string; sub: string[] })[] }

const SECTIONS: Section[] = [
  {
    id: 'inicio', icon: Rocket, title: 'Primeros pasos',
    steps: [
      'Al entrar, la app te muestra una guía de 5 pasos en el Inicio. Seguila para dejar todo listo.',
      'Lo primero: cargá tus profesionales y tus servicios. Sin eso no podés dar turnos.',
      '¿Querés ver cómo funciona sin cargar nada? En el Inicio tocá "Cargar datos de ejemplo" y explorá la app ya funcionando (después los borrás).',
    ],
  },
  {
    id: 'profesionales', icon: Users, title: 'Cargar profesionales',
    steps: [
      'Andá a "Profesionales" → "Nuevo profesional".',
      'Poné el nombre, color, días y horarios de atención.',
      { t: 'Capacidad por hora:', sub: ['Si es una persona (una camilla/silla), dejá capacidad 1.', 'Si es una sala o recurso que atiende a varios a la vez, poné la capacidad (ej. 4) → van a poder convivir turnos en el mismo horario.'] },
    ],
  },
  {
    id: 'servicios', icon: Tag, title: 'Cargar servicios',
    steps: [
      'Andá a "Servicios" → "Nuevo servicio".',
      'Poné el nombre, la duración (define cuánto ocupa en la agenda) y el precio.',
      'Podés tener todos los servicios que quieras (consulta, sesión, corte, etc.).',
    ],
  },
  {
    id: 'agenda', icon: Calendar, title: 'La agenda y los turnos',
    steps: [
      'En "Agenda" tenés las vistas Día, Semana y Lista. Elegí la que más te sirva.',
      'Para crear un turno: tocá "Nuevo turno" (o hacé clic en un hueco de la agenda) → elegí cliente, servicio, profesional, día y hora.',
      { t: 'Estados del turno:', sub: ['Marcá "Vino" cuando el cliente asistió, o "No" si faltó. Así llevás el control del ausentismo.'] },
      'Al lado del cliente ves su obra social (si la cargaste en su ficha).',
    ],
  },
  {
    id: 'recurrentes', icon: Repeat, title: 'Turnos recurrentes',
    steps: [
      'Al crear un turno, en "Repetir este turno" elegí "Días de la semana".',
      'Marcá los días (ej. Lunes, Miércoles, Viernes) y cuántos turnos en total querés.',
      'La app crea toda la serie sola, salteando feriados y días bloqueados hasta completar la cantidad. Si querés borrar toda la serie, al eliminar un turno te da la opción.',
    ],
  },
  {
    id: 'bloqueos', icon: Ban, title: 'Bloqueos (feriados, almuerzo, vacaciones)',
    steps: [
      'Andá a "Bloqueos" para marcar días u horarios en los que NO atendés.',
      'Podés bloquear "todo el día" o un rango de horas, para un profesional o para todo el negocio.',
      'Los turnos y las reservas online respetan estos bloqueos automáticamente.',
    ],
  },
  {
    id: 'pacientes', icon: UserRound, title: 'Pacientes / clientes',
    steps: [
      'En "Pacientes" cargás la ficha de cada cliente: nombre, contacto, DNI, obra social, etc.',
      'Desde la ficha ves su historial de turnos y podés agregar notas.',
      'Buscá cualquier paciente al instante con el buscador (o con Ctrl+K desde cualquier lado).',
    ],
  },
  {
    id: 'historia', icon: FileHeart, title: 'Historia clínica (opcional)',
    steps: [
      'Si tu rubro la necesita, activala en Configuración → Funciones → "Historia clínica".',
      'Una vez activada, vas a ver la historia clínica dentro de la ficha de cada paciente.',
    ],
  },
  {
    id: 'reservas', icon: Globe, title: 'Reservas online',
    steps: [
      'Andá a "Reservas online" y activá el interruptor.',
      'Copiá tu link de reservas y compartilo (WhatsApp, Instagram, etc.).',
      'Tus clientes entran, eligen servicio, profesional, día y horario, y reservan solos, 24/7 — con tu logo y tu marca.',
      'Las reservas que llegan aparecen en tu agenda y también en "Reservas online" para confirmarlas.',
    ],
  },
  {
    id: 'sena', icon: Wallet, title: 'Cobrar una seña',
    steps: [
      'En Configuración → Funciones → "Seña para reservar", activala.',
      'Cargá el monto y tu propio medio de cobro: un link de pago (Mercado Pago, PayPal) o tu alias/CBU.',
      'Al reservar, el cliente ve la seña y cómo pagarla. Cuando recibís el pago, en "Reservas online" tocás "Confirmar pago" → se registra en Caja y el turno queda confirmado.',
    ],
  },
  {
    id: 'caja', icon: BarChart3, title: 'Caja y reportes',
    steps: [
      'En "Caja" registrás los cobros de cada turno (efectivo, tarjeta, transferencia, seña…).',
      'En "Reportes" ves tus ingresos, ausentismo y métricas del negocio.',
      'Podés exportar la caja y los reportes a Excel.',
    ],
  },
  {
    id: 'recordatorios', icon: BellRing, title: 'Recordatorios por WhatsApp',
    steps: [
      'En "Recordatorios" armás el mensaje para tus clientes.',
      'Con un clic abrís el WhatsApp con el mensaje ya escrito para enviarlo.',
    ],
  },
  {
    id: 'redes', icon: Sparkles, title: 'Redes con IA (crear contenido)',
    steps: [
      'Activá "Redes sociales" en Configuración. Aparece la sección "Redes".',
      'Cargá tu marca (logo, colores, rubro) una vez.',
      { t: 'Con la inteligencia artificial podés:', sub: ['Generar imágenes/placas para Instagram con tu marca.', 'Escribir textos y captions para tus posteos.', 'Pedir ideas de contenido y un calendario de qué publicar.'] },
    ],
  },
  {
    id: 'crecimiento', icon: TrendingUp, title: 'Crecimiento',
    steps: [
      'Reactivá clientes que hace tiempo no vienen.',
      'Llená los huecos de tu agenda.',
      'Pedí reseñas a tus clientes para mejorar tu reputación.',
    ],
  },
  {
    id: 'equipo', icon: UserCog, title: 'Equipo y roles',
    steps: [
      'Si trabajás con más gente, andá a "Equipo" e invitá por email a tu recepción o profesionales.',
      { t: 'Cada rol ve lo que le corresponde:', sub: ['Dueño: todo.', 'Recepción: agenda, pacientes, caja, reservas (sin reportes ni configuración).', 'Profesional: agenda, lista de espera y pacientes.'] },
      'La persona invitada se registra con ese email y entra directo a tu negocio con su rol.',
    ],
  },
  {
    id: 'config', icon: Settings, title: 'Configuración y tu marca',
    steps: [
      'En "Configuración" cargás los datos de tu negocio y subís tu logo (aparece en las reservas y en las placas).',
      'Activás o desactivás funciones según tu rubro (historia clínica, redes, seña).',
    ],
  },
  {
    id: 'celular', icon: Smartphone, title: 'Instalar la app en el celular',
    steps: [
      'Abrí la app en el navegador del celular.',
      'En el menú del navegador, elegí "Agregar a pantalla de inicio" / "Instalar app".',
      'Queda como una app más en tu teléfono, sin pasar por ninguna tienda ni pagar comisiones.',
    ],
  },
  {
    id: 'plan', icon: CreditCard, title: 'Tu plan y la suscripción',
    steps: [
      'Tenés 14 días gratis para probar todo.',
      'En "Mi plan" elegís el plan (según cuántos profesionales sos) y pagás con tarjeta (USD) o Mercado Pago (pesos).',
      'Se renueva solo cada mes. Podés cancelar cuando quieras desde "Administrar suscripción".',
    ],
  },
]

export default function GuiaPage() {
  const [copied, setCopied] = useState(false)
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* */ }
  }
  return (
    <div style={{ background: '#06060d', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ ...container, paddingTop: 40, paddingBottom: 20, textAlign: 'center' }}>
        <Link href="/inicio" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13.5, marginBottom: 18 }}>
          <ArrowLeft size={15} /> Volver a la app
        </Link>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Guía de uso de <span style={{ color: '#60a5fa' }}>Vision OS</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, margin: '12px 0 0' }}>
          Todo lo que necesitás para sacarle el jugo a tu app, paso a paso. 💙
        </p>
        <button onClick={() => window.print()} style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          <Printer size={15} /> Imprimir / Guardar PDF
        </button>
      </header>

      {/* Índice */}
      <nav style={{ ...container, paddingBottom: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 12px' }}>Contenido</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '8px 16px' }}>
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
                <s.icon size={15} color="#60a5fa" /> {i + 1}. {s.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Secciones */}
      <main style={{ ...container, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id} style={{ scrollMarginTop: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 'clamp(20px, 3vw, 28px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,255,0.15)', border: '1px solid rgba(37,99,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={22} color="#60a5fa" />
              </span>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{i + 1}. {s.title}</h2>
            </div>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {s.steps.map((step, j) => (
                <li key={j} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(37,99,255,0.2)', color: '#60a5fa', fontSize: 12.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{j + 1}</span>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                    {typeof step === 'string' ? step : (
                      <>
                        <b style={{ color: 'white' }}>{step.t}</b>
                        <ul style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {step.sub.map((x) => (
                            <li key={x} style={{ display: 'flex', gap: 8, fontSize: 14.5, color: 'rgba(255,255,255,0.65)' }}>
                              <Check size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} /> {x}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        {/* Soporte */}
        <section style={{ background: 'linear-gradient(160deg, rgba(37,99,255,0.12), rgba(255,255,255,0.025))', border: '1px solid rgba(37,99,255,0.3)', borderRadius: 16, padding: 'clamp(22px, 3vw, 30px)', textAlign: 'center' }}>
          <HelpCircle size={26} color="#60a5fa" style={{ marginBottom: 10 }} />
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>¿Te quedó alguna duda?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, margin: '8px 0 16px' }}>Estamos para ayudarte. Escribinos a este email y te respondemos a la brevedad.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 15, fontWeight: 600, wordBreak: 'break-all' }}>{SUPPORT_EMAIL}</span>
            <button onClick={copyEmail} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: copied ? 'rgba(52,211,153,0.15)' : '#2563FF', border: copied ? '1px solid rgba(52,211,153,0.4)' : 'none', color: copied ? '#34d399' : 'white', borderRadius: 8, padding: '7px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

const container: React.CSSProperties = { maxWidth: 860, margin: '0 auto', paddingLeft: 'clamp(16px, 4vw, 28px)', paddingRight: 'clamp(16px, 4vw, 28px)' }
