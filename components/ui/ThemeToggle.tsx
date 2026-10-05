'use client'

import { useEffect, useState } from 'react'

// Interruptor día/noche. Por defecto NOCHE (como está hoy). Guarda la elección.
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    let saved: 'dark' | 'light' = 'dark'
    try { saved = (localStorage.getItem('vision-theme') as 'dark' | 'light') || 'dark' } catch {}
    setTheme(saved)
    document.documentElement.dataset.theme = saved
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('vision-theme', next) } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Activar modo día' : 'Activar modo noche'}
      title={theme === 'dark' ? 'Modo día' : 'Modo noche'}
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        width: 52, height: 52, borderRadius: '50%',
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text)', cursor: 'pointer', fontSize: 22,
        boxShadow: '0 6px 20px rgba(0,0,0,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
