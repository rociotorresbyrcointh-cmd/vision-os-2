'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, Calendar, Clock, UserRound, Wallet, BarChart3, TrendingUp, Globe,
  Users, Tag, Ban, MessageCircle, BellRing, Trash2, UserCog, Settings, Sparkles,
  Search, CornerDownLeft, X,
} from 'lucide-react'
import { searchPatients } from '@/services/patients'
import { fullName } from '@/services/patients'
import { canSee, type Role } from '@/lib/auth/role'

type Item = { type: 'nav' | 'patient'; label: string; sub?: string; href: string; icon: typeof Home }

const SECTIONS: Item[] = [
  { type: 'nav', label: 'Inicio', href: '/inicio', icon: Home },
  { type: 'nav', label: 'Agenda', href: '/agenda', icon: Calendar },
  { type: 'nav', label: 'Lista de espera', href: '/espera', icon: Clock },
  { type: 'nav', label: 'Pacientes', href: '/pacientes', icon: UserRound },
  { type: 'nav', label: 'Caja', href: '/pagos', icon: Wallet },
  { type: 'nav', label: 'Reportes', href: '/reportes', icon: BarChart3 },
  { type: 'nav', label: 'Crecimiento', href: '/crecimiento', icon: TrendingUp },
  { type: 'nav', label: 'Reservas online', href: '/reservas', icon: Globe },
  { type: 'nav', label: 'Profesionales', href: '/profesionales', icon: Users },
  { type: 'nav', label: 'Servicios', href: '/servicios', icon: Tag },
  { type: 'nav', label: 'Bloqueos', href: '/bloqueos', icon: Ban },
  { type: 'nav', label: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { type: 'nav', label: 'Recordatorios', href: '/recordatorios', icon: BellRing },
  { type: 'nav', label: 'Redes', href: '/redes', icon: Sparkles },
  { type: 'nav', label: 'Papelera', href: '/papelera', icon: Trash2 },
  { type: 'nav', label: 'Equipo', href: '/equipo', icon: UserCog },
  { type: 'nav', label: 'Configuración', href: '/configuracion', icon: Settings },
]

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function CommandPalette({ role = 'owner' }: { role?: Role }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [patients, setPatients] = useState<Item[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const navItems = SECTIONS.filter((s) => canSee(s.href, role))

  // Atajo de teclado + evento global desde el botón "Buscar"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('vision:command', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('vision:command', onOpen)
    }
  }, [])

  // Al abrir: limpiar y enfocar
  useEffect(() => {
    if (open) {
      setQ(''); setPatients([]); setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // Buscar pacientes (con debounce)
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setPatients([]); return }
    let alive = true
    const t = setTimeout(async () => {
      try {
        const res = await searchPatients(term)
        if (!alive) return
        setPatients(res.map((p) => ({
          type: 'patient' as const,
          label: fullName(p),
          sub: p.dni ? `DNI ${p.dni}` : (p.phone ?? 'Paciente'),
          href: '/pacientes',
          icon: UserRound,
        })))
      } catch { /* ignorar */ }
    }, 220)
    return () => { alive = false; clearTimeout(t) }
  }, [q])

  const filteredNav = q.trim()
    ? navItems.filter((s) => norm(s.label).includes(norm(q.trim())))
    : navItems
  const results = [...filteredNav, ...patients]

  const go = useCallback((item: Item) => {
    setOpen(false)
    router.push(item.href)
  }, [router])

  useEffect(() => { setActive(0) }, [q])

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]) }
  }

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 92vw)', background: '#10101c',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={18} color="rgba(255,255,255,0.45)" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onInputKey}
            placeholder="Buscar sección o paciente…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15 }}
          />
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: 8 }}>
          {results.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, textAlign: 'center', padding: '22px 0' }}>
              {q.trim().length >= 2 ? 'Sin resultados' : 'Escribí para buscar…'}
            </p>
          ) : (
            results.map((item, i) => {
              const Icon = item.icon
              const on = i === active
              return (
                <button
                  key={`${item.type}-${item.href}-${i}`}
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    textAlign: 'left', background: on ? 'rgba(37,99,255,0.16)' : 'transparent',
                  }}
                >
                  <Icon size={17} color={on ? '#60a5fa' : 'rgba(255,255,255,0.5)'} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', color: 'white', fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                    {item.sub && <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{item.sub}</span>}
                  </span>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {item.type === 'patient' ? 'Paciente' : 'Ir a'}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div style={{ display: 'flex', gap: 14, padding: '9px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CornerDownLeft size={12} /> Abrir</span>
          <span>↑ ↓ Moverse</span>
          <span>Esc Cerrar</span>
        </div>
      </div>
    </div>
  )
}
