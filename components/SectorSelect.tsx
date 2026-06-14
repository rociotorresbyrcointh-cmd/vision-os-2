'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SECTOR_GROUPS } from '@/lib/constants'

// Selector de rubro. Envía su valor como campo `sector` del formulario.
export function SectorSelect() {
  const [value, setValue] = useState('')

  const base: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '11px 36px 11px 14px', color: value ? 'white' : 'rgba(255,255,255,0.3)',
    fontSize: 14, outline: 'none', fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s', appearance: 'none', WebkitAppearance: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ position: 'relative' }}>
      <select
        name="sector"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={base}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(37,99,255,0.6)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      >
        <option value="" disabled style={{ background: '#0a0a18' }}>
          Seleccioná el rubro de tu negocio
        </option>
        {SECTOR_GROUPS.map((group) => (
          <optgroup
            key={group.label}
            label={group.label}
            style={{ background: '#0a0a18', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}
          >
            {group.sectors.map((s) => (
              <option key={s} value={s} style={{ background: '#0d0d1a', color: 'white' }}>
                {s}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}
      />
    </div>
  )
}
