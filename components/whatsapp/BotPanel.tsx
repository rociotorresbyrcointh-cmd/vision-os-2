'use client'

import { useState } from 'react'
import { Bot, Plus, Trash2, Save, Check, Smartphone, Info } from 'lucide-react'
import { saveBotConfig } from '@/services/org-settings'
import { resolveBotConfig, type BotConfig, type BotTone, type BotBookingMode } from '@/lib/whatsapp-bot'

export function BotPanel({
  organizationId,
  initialConfig,
  enabled,
}: {
  organizationId: string
  initialConfig: BotConfig
  enabled: boolean
}) {
  const [cfg, setCfg] = useState<BotConfig>(() => resolveBotConfig(initialConfig))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof BotConfig>(k: K, v: BotConfig[K]) => setCfg((c) => ({ ...c, [k]: v }))
  const setFaq = (i: number, patch: Partial<{ q: string; a: string }>) =>
    setCfg((c) => ({ ...c, faqs: c.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }))
  const addFaq = () => setCfg((c) => ({ ...c, faqs: [...c.faqs, { q: '', a: '' }] }))
  const removeFaq = (i: number) => setCfg((c) => ({ ...c, faqs: c.faqs.filter((_, idx) => idx !== i) }))

  const persist = async () => {
    setSaving(true); setSaved(false)
    try {
      await saveBotConfig(organizationId, { ...cfg, faqs: cfg.faqs.filter((f) => f.q.trim() || f.a.trim()) })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Cómo funciona + los dos números */}
      <div style={{ background: 'rgba(37,99,255,0.07)', border: '1px solid rgba(37,99,255,0.2)', borderRadius: 12, padding: '16px 18px' }}>
        <p style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontSize: 14.5, fontWeight: 700 }}>
          <Info size={16} color="#60a5fa" /> Cómo funciona el bot
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
          El bot responde <strong style={{ color: 'white' }}>solo</strong> a las clientas que te escriben por WhatsApp:
          contesta dudas, precios y horarios, y agenda el turno en tu agenda. Importante:
        </p>
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7 }}>
          <li>El número que conectás al bot se maneja desde <strong style={{ color: 'white' }}>Meta</strong>: las conversaciones del bot <strong style={{ color: 'white' }}>no</strong> se ven en la app de WhatsApp del celular, sino en el panel de Meta (y los turnos que agenda aparecen acá, en Vision OS).</li>
          <li>Por eso conviene usar <strong style={{ color: 'white' }}>un número aparte solo para el bot</strong>, y dejar tu WhatsApp de siempre para lo personal y las confirmaciones.</li>
          <li>Podés usar <strong style={{ color: 'white' }}>los dos, uno, o el otro</strong>: el bot y las confirmaciones se prenden y apagan por separado.</li>
        </ul>
      </div>

      {/* Conexión (Fase próxima) */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Smartphone size={20} color="#25d366" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, color: 'white', fontSize: 14, fontWeight: 700 }}>Conectar mi WhatsApp</p>
          <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, lineHeight: 1.5 }}>
            Muy pronto vas a poder conectar tu número en 2 clics. Mientras tanto, dejá configurado abajo qué debe responder el bot.
          </p>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 7, padding: '4px 10px' }}>
          Próximamente
        </span>
      </div>

      {/* Onboarding: qué debe responder el bot */}
      <div>
        <h3 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={17} color="#60a5fa" /> Qué debe saber el bot de tu negocio
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
          El bot ya conoce tus servicios, precios, profesionales y horarios (de tu cuenta). Completá lo que falta para que responda como vos querés.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Tono con el que habla">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['cercano', 'neutro', 'formal'] as BotTone[]).map((t) => {
                const on = cfg.tone === t
                return (
                  <button key={t} onClick={() => set('tone', t)}
                    style={{ padding: '9px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                      background: on ? 'rgba(37,99,255,0.18)' : 'rgba(255,255,255,0.04)',
                      border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: on ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}>
                    {t === 'cercano' ? 'Cercano / canchero' : t === 'neutro' ? 'Neutro' : 'Formal'}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="¿Qué hace el bot con las reservas?">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {([['agendar', 'Agenda el turno directo'], ['link', 'Solo pasa el link de reservas']] as [BotBookingMode, string][]).map(([m, lbl]) => {
                const on = cfg.bookingMode === m
                return (
                  <button key={m} onClick={() => set('bookingMode', m)}
                    style={{ padding: '9px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                      background: on ? 'rgba(37,99,255,0.18)' : 'rgba(255,255,255,0.04)',
                      border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: on ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}>
                    {lbl}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Dirección / cómo llegar (opcional)">
            <input value={cfg.address} onChange={(e) => set('address', e.target.value)} placeholder="Ej: Av. Corrientes 1234, timbre 2. A una cuadra del subte." style={input} />
          </Field>

          <Field label="Qué NO debe prometer ni decir (opcional)">
            <textarea value={cfg.avoid} onChange={(e) => set('avoid', e.target.value)} rows={2}
              placeholder="Ej: no prometer resultados médicos; no dar descuentos que no existan; no confirmar sin seña." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          </Field>

          <Field label="Info extra que quieras que sepa (opcional)">
            <textarea value={cfg.extraInfo} onChange={(e) => set('extraInfo', e.target.value)} rows={2}
              placeholder="Ej: aceptamos tarjeta y transferencia; estacionamiento propio; promo de la semana." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          </Field>

          {/* Preguntas frecuentes */}
          <Field label="Preguntas frecuentes y sus respuestas">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cfg.faqs.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>Todavía no cargaste ninguna. Agregá las que más te preguntan.</p>
              )}
              {cfg.faqs.map((f, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder="Pregunta (ej: ¿Atienden los domingos?)" style={{ ...input, fontWeight: 600, flex: 1 }} />
                    <button onClick={() => removeFaq(i)} style={iconDanger}><Trash2 size={14} /></button>
                  </div>
                  <textarea value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} rows={2} placeholder="Respuesta" style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              ))}
              <button onClick={addFaq} style={btnGhost}><Plus size={15} /> Agregar pregunta</button>
            </div>
          </Field>

          <button onClick={persist} disabled={saving} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
            {saved ? <><Check size={16} /> Guardado</> : <><Save size={15} /> {saving ? 'Guardando…' : 'Guardar configuración del bot'}</>}
          </button>
          {!enabled && (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, margin: 0 }}>
              El bot está apagado. Podés dejar todo configurado y prenderlo cuando conectes tu número.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Orbitron', sans-serif" }}>{label}</label>
      {children}
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
  display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '9px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start',
}
const iconDanger: React.CSSProperties = {
  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171',
  borderRadius: 8, padding: 8, cursor: 'pointer', flexShrink: 0,
}
