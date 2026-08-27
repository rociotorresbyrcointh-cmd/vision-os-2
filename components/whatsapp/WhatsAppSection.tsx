'use client'

import { useState } from 'react'
import { MessageCircle, Bot } from 'lucide-react'
import { WhatsAppManager } from '@/components/whatsapp/WhatsAppManager'
import { BotPanel } from '@/components/whatsapp/BotPanel'
import { setOrgFlag } from '@/services/org-settings'
import { resolveBotConfig, type BotConfig } from '@/lib/whatsapp-bot'
import type { WhatsAppTemplate } from '@/lib/whatsapp'

type Tab = 'confirmaciones' | 'bot'

export function WhatsAppSection({
  organizationId,
  initialTemplates,
  confirmationsEnabled,
  botEnabled,
  botConfig,
}: {
  organizationId: string
  initialTemplates: WhatsAppTemplate[]
  confirmationsEnabled: boolean
  botEnabled: boolean
  botConfig: BotConfig
}) {
  const [tab, setTab] = useState<Tab>('confirmaciones')
  const [confOn, setConfOn] = useState(confirmationsEnabled)
  const [botOn, setBotOn] = useState(botEnabled)
  const [busy, setBusy] = useState(false)

  const toggleConf = async () => {
    const next = !confOn; setConfOn(next); setBusy(true)
    try { await setOrgFlag(organizationId, 'whatsapp_confirmations_enabled', next) }
    catch { setConfOn(!next) } finally { setBusy(false) }
  }
  const toggleBot = async () => {
    const next = !botOn; setBotOn(next); setBusy(true)
    try { await setOrgFlag(organizationId, 'whatsapp_bot_enabled', next) }
    catch { setBotOn(!next) } finally { setBusy(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <MessageCircle size={20} color="#25d366" /> WhatsApp
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '5px 0 20px' }}>
        Dos herramientas independientes: las confirmaciones que enviás vos, y el bot que responde solo.
      </p>

      {/* Pestañas */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: 4, marginBottom: 22, maxWidth: 460 }}>
        {([['confirmaciones', 'Confirmaciones', MessageCircle], ['bot', 'Bot de respuestas', Bot]] as [Tab, string, typeof Bot][]).map(([id, label, Icon]) => {
          const on = tab === id
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                background: on ? 'rgba(37,99,255,0.2)' : 'transparent', color: on ? '#60a5fa' : 'rgba(255,255,255,0.55)' }}>
              <Icon size={16} /> {label}
            </button>
          )
        })}
      </div>

      {/* Interruptor de la herramienta activa */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: 'white', fontSize: 14.5, fontWeight: 700 }}>
            {tab === 'confirmaciones' ? 'Confirmaciones por WhatsApp' : 'Bot de respuestas automáticas'}
          </p>
          <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, lineHeight: 1.5 }}>
            {tab === 'confirmaciones'
              ? 'Los botones para enviar mensajes a tus clientes desde la agenda (desde tu WhatsApp de siempre).'
              : 'Responde solo a las clientas que te escriben, desde un número conectado a la API de WhatsApp.'}
          </p>
        </div>
        <Toggle on={tab === 'confirmaciones' ? confOn : botOn} disabled={busy} onToggle={tab === 'confirmaciones' ? toggleConf : toggleBot} />
      </div>

      {/* Contenido de la pestaña */}
      {tab === 'confirmaciones' ? (
        confOn ? (
          <WhatsAppManager organizationId={organizationId} initial={initialTemplates} embedded />
        ) : (
          <Apagado texto="Las confirmaciones están apagadas. Prendé el interruptor de arriba para editar y usar los mensajes." />
        )
      ) : (
        <BotPanel organizationId={organizationId} initialConfig={resolveBotConfig(botConfig)} enabled={botOn} />
      )}
    </div>
  )
}

function Apagado({ texto }: { texto: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: '28px 22px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.6 }}>
      {texto}
    </div>
  )
}

function Toggle({ on, disabled, onToggle }: { on: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} disabled={disabled} aria-label="Activar"
      style={{ position: 'relative', width: 46, height: 26, borderRadius: 13, border: 'none', cursor: disabled ? 'default' : 'pointer', flexShrink: 0,
        background: on ? '#2563FF' : 'rgba(255,255,255,0.15)', transition: 'background 0.2s', opacity: disabled ? 0.6 : 1 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
    </button>
  )
}
