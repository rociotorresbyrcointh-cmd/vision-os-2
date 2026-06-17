'use client'

import type { LucideIcon } from 'lucide-react'

// Estado vacío reutilizable: ícono + título + ayuda + (opcional) botón de acción.
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      padding: 'clamp(32px, 7vw, 56px) 24px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 16,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.25)',
      }}>
        <Icon size={26} color="#60a5fa" />
      </div>
      <h3 style={{ margin: 0, color: 'white', fontSize: 16.5, fontWeight: 700 }}>{title}</h3>
      {description && (
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 360, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: 18, background: '#2563FF', color: 'white', border: 'none',
            borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
