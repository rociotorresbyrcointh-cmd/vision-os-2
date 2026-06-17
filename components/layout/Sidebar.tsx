'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Tag, Ban, UserRound, MessageCircle, BellRing, Wallet, BarChart3, Globe, Settings, Trash2, Sparkles, Clock, TrendingUp, Menu, X, LogOut, UserCog } from 'lucide-react'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { logout } from '@/app/actions/auth'
import { canSee, type Role } from '@/lib/auth/role'

const NAV = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/espera', label: 'Lista de espera', icon: Clock },
  { href: '/pacientes', label: 'Pacientes', icon: UserRound },
  { href: '/pagos', label: 'Caja', icon: Wallet },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/crecimiento', label: 'Crecimiento', icon: TrendingUp },
  { href: '/reservas', label: 'Reservas online', icon: Globe },
  { href: '/profesionales', label: 'Profesionales', icon: Users },
  { href: '/servicios', label: 'Servicios', icon: Tag },
  { href: '/bloqueos', label: 'Bloqueos', icon: Ban },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/recordatorios', label: 'Recordatorios', icon: BellRing },
  { href: '/papelera', label: 'Papelera', icon: Trash2 },
  { href: '/equipo', label: 'Equipo', icon: UserCog },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar({ businessName, socialEnabled, role = 'owner' }: { businessName: string; socialEnabled?: boolean; role?: Role }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  // Cierra el menú al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  const full = socialEnabled
    ? [...NAV.slice(0, -1), { href: '/redes', label: 'Redes', icon: Sparkles }, NAV[NAV.length - 1]]
    : NAV
  // Cada rol ve solo las secciones permitidas
  const nav = full.filter((item) => canSee(item.href, role))

  const inner = (
    <>
      {/* Marca */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <VisionLogoWhite size={34} />
          <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>
            {businessName}
          </p>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 12px', borderRadius: 9,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(37,99,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(37,99,255,0.35)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
              <Icon size={17} color={active ? '#60a5fa' : 'currentColor'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <form action={logout} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '11px 12px', borderRadius: 9, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit' }}>
          <LogOut size={17} /> Cerrar sesión
        </button>
      </form>
    </>
  )

  // ─── Escritorio: menú fijo a la izquierda ───
  if (!isMobile) {
    return (
      <aside style={{ width: 240, minWidth: 240, background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        {inner}
      </aside>
    )
  }

  // ─── Móvil: barra superior + menú deslizable ───
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#0a0a14', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', zIndex: 45 }}>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <Menu size={24} />
        </button>
        <VisionLogoWhite size={26} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>{businessName}</span>
      </div>

      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 55 }} />}

      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 270, maxWidth: '82vw', background: '#0a0a14', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', zIndex: 60, transform: open ? 'translateX(0)' : 'translateX(-105%)', transition: 'transform 0.25s ease', boxShadow: open ? '0 0 50px rgba(0,0,0,0.7)' : 'none' }}>
        {inner}
      </aside>
    </>
  )
}
