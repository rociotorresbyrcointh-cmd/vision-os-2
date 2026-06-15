'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Tag, Ban, UserRound, MessageCircle, BellRing, Wallet, BarChart3, Globe, Settings, Trash2, Sparkles, Clock, LogOut } from 'lucide-react'
import { VisionLogoWhite } from '@/components/VisionLogo'
import { logout } from '@/app/actions/auth'

const NAV = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/espera', label: 'Lista de espera', icon: Clock },
  { href: '/pacientes', label: 'Pacientes', icon: UserRound },
  { href: '/pagos', label: 'Caja', icon: Wallet },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/reservas', label: 'Reservas online', icon: Globe },
  { href: '/profesionales', label: 'Profesionales', icon: Users },
  { href: '/servicios', label: 'Servicios', icon: Tag },
  { href: '/bloqueos', label: 'Bloqueos', icon: Ban },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/recordatorios', label: 'Recordatorios', icon: BellRing },
  { href: '/papelera', label: 'Papelera', icon: Trash2 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar({ businessName, socialEnabled }: { businessName: string; socialEnabled?: boolean }) {
  const pathname = usePathname()
  // "Redes" aparece solo si el negocio activó la función
  const nav = socialEnabled
    ? [...NAV.slice(0, -1), { href: '/redes', label: 'Redes', icon: Sparkles }, NAV[NAV.length - 1]]
    : NAV

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: '#0a0a14',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Marca */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <VisionLogoWhite size={34} />
        <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>
          {businessName}
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 9,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(37,99,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(37,99,255,0.35)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={17} color={active ? '#60a5fa' : 'currentColor'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <form action={logout} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          type="submit"
          style={{
            display: 'flex', alignItems: 'center', gap: 11, width: '100%',
            padding: '10px 12px', borderRadius: 9, background: 'transparent',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit',
          }}
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </form>
    </aside>
  )
}
