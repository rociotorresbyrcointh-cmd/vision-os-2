'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// Interruptor día/noche: sol — barra — luna. Monocromo, va dentro del menú.
// Por defecto NOCHE (como está hoy). Guarda la elección.
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    let saved: 'dark' | 'light' = 'dark'
    try { saved = (localStorage.getItem('vision-theme') as 'dark' | 'light') || 'dark' } catch {}
    setTheme(saved)
    document.documentElement.dataset.theme = saved
  }, [])

  const apply = (next: 'dark' | 'light') => {
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('vision-theme', next) } catch {}
  }
  const toggle = () => apply(theme === 'dark' ? 'light' : 'dark')

  const isLight = theme === 'light'

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '10px 12px',
      }}
    >
      {/* Sol → modo día */}
      <button
        onClick={() => apply('light')}
        aria-label="Modo día"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 2,
          display: 'flex', lineHeight: 0,
          color: 'var(--text)', opacity: isLight ? 1 : 0.4,
          transition: 'opacity 0.15s',
        }}
      >
        <Sun size={18} />
      </button>

      {/* Barra deslizable → alterna */}
      <button
        onClick={toggle}
        role="switch"
        aria-checked={isLight}
        aria-label={isLight ? 'Cambiar a modo noche' : 'Cambiar a modo día'}
        style={{
          position: 'relative', width: 42, height: 22, borderRadius: 999,
          background: 'rgba(var(--ui-rgb),0.12)', border: '1px solid rgba(var(--ui-rgb),0.2)',
          cursor: 'pointer', padding: 0, flexShrink: 0,
          transition: 'background 0.15s',
        }}
      >
        <span
          style={{
            position: 'absolute', top: '50%', left: isLight ? 2 : 'calc(100% - 20px)',
            transform: 'translateY(-50%)',
            width: 16, height: 16, borderRadius: '50%', background: 'var(--text)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>

      {/* Luna → modo noche */}
      <button
        onClick={() => apply('dark')}
        aria-label="Modo noche"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 2,
          display: 'flex', lineHeight: 0,
          color: 'var(--text)', opacity: isLight ? 0.4 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        <Moon size={18} />
      </button>
    </div>
  )
}
