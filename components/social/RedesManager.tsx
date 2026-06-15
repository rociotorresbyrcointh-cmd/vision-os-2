'use client'

import { useState, useMemo, useEffect } from 'react'
import { Sparkles, Palette, Lightbulb, ClipboardCheck, Copy, Check, Save, Wand2, CalendarDays, Search, Bookmark, Trash2, ImageIcon } from 'lucide-react'
import { saveBrand, type Brand } from '@/services/org-settings'
import { generateIdeas, suggestHashtags } from '@/lib/content-ideas'
import { saveContent, listSavedContent, deleteSavedContent, type SavedContent } from '@/services/ai-content'
import { PlacasTab } from './PlacasTab'

type Tab = 'marca' | 'ia' | 'placas' | 'guardados' | 'ideas' | 'auditoria'

const KIND_LABEL: Record<string, string> = { ideas: '💡 Ideas', calendario: '📅 Calendario', analisis: '🔍 Análisis' }

const RUBROS = ['Estética', 'Kinesiología', 'Peluquería / Barbería', 'Nutrición', 'Psicología', 'Spa / Masajes', 'Consultorio médico', 'Uñas', 'Otro']

export function RedesManager({
  organizationId,
  businessName,
  initialBrand,
}: {
  organizationId: string
  businessName: string
  initialBrand: Brand
}) {
  const [tab, setTab] = useState<Tab>('marca')
  const [brand, setBrand] = useState<Brand>({ ...initialBrand, name: initialBrand.name || businessName })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const set = (k: keyof Brand, v: string) => setBrand((b) => ({ ...b, [k]: v }))

  const persist = async () => {
    setSaving(true); setSaved(false)
    try { await saveBrand(organizationId, brand); setSaved(true); setTimeout(() => setSaved(false), 2500) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Sparkles size={20} color="#22d3ee" /> Redes sociales
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 20 }}>
        Tu marca, ideas de contenido y una auditoría para mejorar tu perfil.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, width: 'fit-content' }}>
        {([['marca', 'Mi Marca', Palette], ['ia', 'Asistente IA', Wand2], ['placas', 'Placas', ImageIcon], ['guardados', 'Guardados', Bookmark], ['ideas', 'Ideas rápidas', Lightbulb], ['auditoria', 'Auditoría', ClipboardCheck]] as [Tab, string, any][]).map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: tab === t ? 'rgba(34,211,238,0.18)' : 'transparent', color: tab === t ? '#22d3ee' : 'rgba(255,255,255,0.5)' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'marca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Cargá tu identidad una vez. Con esto, las <b>ideas de contenido</b> se personalizan a tu marca. 💡
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Field label="Nombre de la marca"><input value={brand.name} onChange={(e) => set('name', e.target.value)} style={input} /></Field>
            <Field label="Rubro">
              <select value={brand.rubro} onChange={(e) => set('rubro', e.target.value)} style={input}>
                <option value="" style={opt}>Elegí…</option>
                {RUBROS.map((r) => <option key={r} value={r} style={opt}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="¿Qué ofrecés? (descripción corta)">
            <textarea value={brand.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Ej: Tratamientos de kinesiología deportiva y rehabilitación." style={{ ...input, resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Field label="¿A quién le hablás? (público)">
              <input value={brand.audience} onChange={(e) => set('audience', e.target.value)} placeholder="Ej: Deportistas amateurs de 20 a 45 años" style={input} />
            </Field>
            <Field label="Ciudad / zona">
              <input value={brand.city} onChange={(e) => set('city', e.target.value)} placeholder="Ej: Palermo, CABA" style={input} />
            </Field>
          </div>
          <Field label="Servicios o productos principales">
            <textarea value={brand.services} onChange={(e) => set('services', e.target.value)} rows={2} placeholder="Ej: Masaje descontracturante, drenaje linfático, rehabilitación post-lesión…" style={{ ...input, resize: 'vertical' }} />
          </Field>
          <Field label="¿Qué te hace diferente? (tu valor)">
            <textarea value={brand.differentiator} onChange={(e) => set('differentiator', e.target.value)} rows={2} placeholder="Ej: Atención personalizada, +10 años de experiencia, primera sesión de evaluación gratis…" style={{ ...input, resize: 'vertical' }} />
          </Field>
          <Field label="Objetivo en redes">
            <select value={brand.goal} onChange={(e) => set('goal', e.target.value)} style={input}>
              <option value="" style={opt}>Elegí…</option>
              <option value="Conseguir más turnos/clientes nuevos" style={opt}>Conseguir más turnos/clientes nuevos</option>
              <option value="Que me conozcan más (posicionarme)" style={opt}>Que me conozcan más (posicionarme)</option>
              <option value="Fidelizar a mis clientes actuales" style={opt}>Fidelizar a mis clientes actuales</option>
              <option value="Vender productos" style={opt}>Vender productos</option>
            </select>
          </Field>
          <Field label="Tono de comunicación">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['cercano', 'profesional', 'divertido'] as Brand['tone'][]).map((t) => {
                const on = brand.tone === t
                return (
                  <button key={t} onClick={() => set('tone', t)}
                    style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                      background: on ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.3)', border: on ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.1)', color: on ? '#22d3ee' : 'rgba(255,255,255,0.5)' }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Color principal">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={brand.color} onChange={(e) => set('color', e.target.value)} style={{ width: 48, height: 42, border: 'none', borderRadius: 9, background: 'transparent', cursor: 'pointer' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'monospace' }}>{brand.color}</span>
              </div>
            </Field>
            <Field label="Instagram (usuario o link)"><input value={brand.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@tucuenta" style={input} /></Field>
            <Field label="Facebook (opcional)"><input value={brand.facebook} onChange={(e) => set('facebook', e.target.value)} style={input} /></Field>
          </div>
          <Field label="Contanos más (todo lo que quieras — la IA lo usa)">
            <textarea value={brand.extra} onChange={(e) => set('extra', e.target.value)} rows={4}
              placeholder="Escribí libremente: tu historia, promociones actuales, lo que querés transmitir, palabras o frases que te gustan, lo que NO querés decir, tus horarios especiales, etc. Cuanto más le cuentes, mejor sale el contenido."
              style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          </Field>
          <button onClick={persist} disabled={saving} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
            {saved ? <><Check size={16} /> Guardado</> : <><Save size={15} /> {saving ? 'Guardando…' : 'Guardar marca'}</>}
          </button>
        </div>
      )}

      {tab === 'ia' && <AITab brand={brand} organizationId={organizationId} />}
      {tab === 'placas' && <PlacasTab brand={brand} />}
      {tab === 'guardados' && <SavedTab />}
      {tab === 'ideas' && <IdeasTab brand={brand} />}
      {tab === 'auditoria' && <AuditTab />}
    </div>
  )
}

// ─── Guardados ───────────────────────────────────────────────────
function SavedTab() {
  const [items, setItems] = useState<SavedContent[] | null>(null)
  const [copied, setCopied] = useState('')
  useEffect(() => { listSavedContent().then(setItems).catch(() => setItems([])) }, [])

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este contenido guardado?')) return
    await deleteSavedContent(id)
    setItems((l) => (l ?? []).filter((x) => x.id !== id))
  }
  const copy = (id: string, text: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1500) }

  if (items === null) return <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando…</p>
  if (items.length === 0) return (
    <div style={{ padding: 40, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 680 }}>
      Todavía no guardaste contenido. Generá algo en <b>Asistente IA</b> y tocá <b>Guardar</b>. 📌
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680 }}>
      {items.map((it) => (
        <div key={it.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#22d3ee' }}>
              {KIND_LABEL[it.kind] ?? it.kind} · <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{new Date(it.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => copy(it.id, it.content)} style={copyBtn}>{copied === it.id ? <Check size={13} /> : <Copy size={13} />}</button>
              <button onClick={() => remove(it.id)} style={{ ...copyBtn, color: '#f87171' }}><Trash2 size={13} /></button>
            </div>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{it.content}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Asistente IA ────────────────────────────────────────────────
function AITab({ brand, organizationId }: { brand: Brand; organizationId: string }) {
  const [result, setResult] = useState('')
  const [resultKind, setResultKind] = useState('')
  const [loading, setLoading] = useState<string>('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState('')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const run = async (kind: 'ideas' | 'calendario' | 'analisis', input = '') => {
    setLoading(kind); setError(''); setResult(''); setSaved(false)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, brand, input }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setResult(data.text); setResultKind(kind)
    } catch (e: any) {
      setError(e.message ?? 'No se pudo generar.')
    } finally {
      setLoading('')
    }
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const save = async () => { await saveContent(organizationId, resultKind, result); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const busy = !!loading

  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
        La IA crea contenido <b>único y a medida de tu marca</b> (no plantillas). Cargá bien tu marca en la primera pestaña para mejores resultados. ✨
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <button onClick={() => run('ideas')} disabled={busy} style={aiBtn}>
          <Lightbulb size={16} /> {loading === 'ideas' ? 'Generando…' : 'Generar ideas'}
        </button>
        <button onClick={() => run('calendario')} disabled={busy} style={aiBtn}>
          <CalendarDays size={16} /> {loading === 'calendario' ? 'Generando…' : 'Calendario semanal'}
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'white' }}>🔍 Analizar mi perfil</p>
        <textarea value={profile} onChange={(e) => setProfile(e.target.value)} rows={3}
          placeholder="Pegá tu bio actual o contá cómo es tu perfil de Instagram (qué publicás, cuántos seguidores, etc.)"
          style={{ ...input, resize: 'vertical', lineHeight: 1.5, marginBottom: 10 }} />
        <button onClick={() => run('analisis', profile)} disabled={busy || !profile.trim()} style={{ ...aiBtn, opacity: busy || !profile.trim() ? 0.5 : 1 }}>
          <Search size={16} /> {loading === 'analisis' ? 'Analizando…' : 'Analizar perfil'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 11, padding: '14px 16px', color: '#f87171', fontSize: 13.5, lineHeight: 1.5 }}>
          {error.includes('ANTHROPIC') || error.includes('clave de IA')
            ? '⚙️ Todavía falta conectar la IA. Seguí los pasos para cargar la clave (te los pasó tu desarrolladora) y volvé a probar.'
            : `Ups: ${error}`}
        </div>
      )}

      {result && (
        <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 13, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#22d3ee', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wand2 size={14} /> Generado con IA
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={save} style={copyBtn}>{saved ? <><Check size={13} /> Guardado</> : <><Bookmark size={13} /> Guardar</>}</button>
              <button onClick={copy} style={copyBtn}>{copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}</button>
            </div>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result}</p>
        </div>
      )}
    </div>
  )
}

// ─── Ideas ───────────────────────────────────────────────────────
function IdeasTab({ brand }: { brand: Brand }) {
  const ideas = useMemo(() => generateIdeas(brand), [brand])
  const hashtags = useMemo(() => suggestHashtags(brand), [brand])
  const [copied, setCopied] = useState<string>('')
  const copy = (key: string, text: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500) }

  return (
    <div>
      <div style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Hashtags sugeridos</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: '#22d3ee', fontSize: 13.5, fontFamily: 'monospace' }}>{hashtags}</span>
          <button onClick={() => copy('hash', hashtags)} style={copyBtn}>{copied === 'hash' ? <Check size={13} /> : <Copy size={13} />}</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ideas.map((idea, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, padding: 18 }}>
            <h3 style={{ margin: '0 0 10px', color: 'white', fontSize: 15, fontWeight: 700 }}>{idea.title}</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{idea.caption}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, flex: 1, minWidth: 200 }}>💡 {idea.tip}</p>
              <button onClick={() => copy('idea' + i, idea.caption)} style={{ ...copyBtn, padding: '7px 13px' }}>
                {copied === 'idea' + i ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar texto</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Auditoría ───────────────────────────────────────────────────
const AUDIT_ITEMS = [
  { q: '¿Tu bio explica claramente qué hacés y dónde?', why: 'En 1 segundo tienen que entender qué ofrecés y tu ciudad/zona.' },
  { q: '¿Tenés el link de reservas en la bio?', why: 'Es la forma #1 de convertir seguidores en turnos. Poné tu link de Vision OS.' },
  { q: '¿Tu foto de perfil es tu logo o algo claro?', why: 'Tiene que verse bien en chiquito y representar tu marca.' },
  { q: '¿Tenés historias destacadas organizadas?', why: 'Ej: "Turnos", "Resultados", "Precios", "Ubicación". Ordenan la info clave.' },
  { q: '¿Publicás al menos 2-3 veces por semana?', why: 'La constancia es lo que más pesa para crecer. Usá las ideas de la pestaña anterior.' },
  { q: '¿Mostrás resultados reales (antes/después, fotos)?', why: 'Es lo que más confianza y reservas genera.' },
  { q: '¿Respondés los mensajes y comentarios rápido?', why: 'La gente reserva donde le responden. La velocidad importa.' },
  { q: '¿Tus publicaciones tienen un llamado a la acción?', why: 'Siempre cerrá con "reservá por el link", "escribinos", etc.' },
]

function AuditTab() {
  const [checked, setChecked] = useState<boolean[]>(() => AUDIT_ITEMS.map(() => false))
  const score = Math.round((checked.filter(Boolean).length / AUDIT_ITEMS.length) * 100)
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)))

  const color = score >= 75 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171'
  const msg = score >= 75 ? '¡Tu perfil está muy bien! 🎉' : score >= 40 ? 'Vas bien, pero hay margen para mejorar.' : 'Hay varias cosas clave para mejorar.'

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Tu puntaje</span>
          <span style={{ color, fontSize: 26, fontWeight: 800 }}>{score}%</span>
        </div>
        <div style={{ height: 9, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
        <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 13.5 }}>{msg}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {AUDIT_ITEMS.map((item, i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: `1px solid ${checked[i] ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 11, padding: '13px 15px', cursor: 'pointer' }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: checked[i] ? '#34d399' : 'transparent', border: checked[i] ? 'none' : '1.5px solid rgba(255,255,255,0.25)' }}>
              {checked[i] && <Check size={14} color="#07241a" />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: 'white', fontSize: 14, fontWeight: 600 }}>{item.q}</p>
              {!checked[i] && <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.5 }}>→ {item.why}</p>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
        Tildá lo que ya tenés resuelto. Lo que quede sin tildar es tu lista de mejoras. 🎯
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Orbitron', sans-serif" }}>{label}</label>
      {children}
    </div>
  )
}

const opt: React.CSSProperties = { background: '#0d0d1a', color: 'white' }
const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
  color: '#062a30', border: 'none', borderRadius: 9, padding: '11px 18px', fontSize: 14, fontWeight: 800,
  cursor: 'pointer', fontFamily: 'inherit',
}
const aiBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
  color: '#062a30', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 800,
  cursor: 'pointer', fontFamily: 'inherit',
}
const copyBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
}
