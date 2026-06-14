'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, MessageCircle, Check } from 'lucide-react'
import { TEMPLATE_VARS, renderTemplate, type WhatsAppTemplate } from '@/lib/whatsapp'
import { saveTemplates } from '@/services/org-settings'

const PREVIEW = {
  clientName: 'María', businessName: 'tu negocio', dateLabel: 'lunes 15 de junio',
  timeLabel: '14:30', serviceName: 'Masaje', professionalName: 'Ana',
}

function uid() {
  return 'tpl-' + Math.random().toString(36).slice(2, 9)
}

export function WhatsAppManager({
  organizationId,
  initial,
}: {
  organizationId: string
  initial: WhatsAppTemplate[]
}) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = (id: string, patch: Partial<WhatsAppTemplate>) =>
    setTemplates((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const remove = (id: string) => setTemplates((t) => t.filter((x) => x.id !== id))
  const add = () =>
    setTemplates((t) => [...t, { id: uid(), title: 'Nuevo mensaje', body: 'Hola {cliente}, ' }])

  const persist = async () => {
    setSaving(true); setSaved(false)
    try {
      await saveTemplates(organizationId, templates)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
            <MessageCircle size={20} color="#25d366" /> Mensajes de WhatsApp
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 }}>
            Editá los mensajes que enviás a tus clientes desde la agenda.
          </p>
        </div>
        <button onClick={persist} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saved ? <><Check size={16} /> Guardado</> : <><Save size={15} /> {saving ? 'Guardando…' : 'Guardar'}</>}
        </button>
      </div>

      {/* Variables disponibles */}
      <div style={{ background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.2)', borderRadius: 11, padding: '12px 16px', marginBottom: 22 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Variables que podés usar
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TEMPLATE_VARS.map((v) => (
            <span key={v.key} title={v.desc} style={{ fontSize: 12.5, color: '#60a5fa', background: 'rgba(37,99,255,0.12)', borderRadius: 6, padding: '4px 9px', fontFamily: 'monospace' }}>
              {v.key}
            </span>
          ))}
        </div>
      </div>

      {/* Plantillas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {templates.map((t) => (
          <div key={t.id} style={card}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <input value={t.title} onChange={(e) => update(t.id, { title: e.target.value })}
                style={{ ...input, fontWeight: 700, flex: 1 }} placeholder="Título del mensaje" />
              <button onClick={() => remove(t.id)} style={iconDanger}><Trash2 size={15} /></button>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <textarea value={t.body} onChange={(e) => update(t.id, { body: e.target.value })}
                rows={6} style={{ ...input, flex: '1 1 320px', resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }} />
              <div style={{ flex: '1 1 240px', minWidth: 220 }}>
                <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vista previa</p>
                <div style={{ background: '#0b141a', borderRadius: 10, padding: 12 }}>
                  <div style={{ background: '#005c4b', borderRadius: '8px 8px 8px 2px', padding: '8px 11px', maxWidth: 260, color: 'white', fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {renderTemplate(t.body, PREVIEW)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} style={{ ...btnGhost, marginTop: 16 }}>
        <Plus size={15} /> Agregar mensaje
      </button>
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '10px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const iconDanger: React.CSSProperties = {
  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171',
  borderRadius: 8, padding: 8, cursor: 'pointer',
}
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 18,
}
