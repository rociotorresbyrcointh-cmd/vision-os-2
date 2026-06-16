'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, FileHeart, Store, Check, Sparkles } from 'lucide-react'
import { setOrgFlag, saveOrgData, type OrgData } from '@/services/org-settings'

export function ConfigManager({
  organizationId,
  clinicalEnabled,
  socialEnabled,
  orgData,
}: {
  organizationId: string
  clinicalEnabled: boolean
  socialEnabled: boolean
  orgData: OrgData
}) {
  const router = useRouter()
  const [clinical, setClinical] = useState(clinicalEnabled)
  const [social, setSocial] = useState(socialEnabled)
  const [saving, setSaving] = useState(false)

  const toggleSocial = async () => {
    const next = !social
    setSocial(next); setSaving(true)
    try {
      await setOrgFlag(organizationId, 'social_enabled', next)
      router.refresh() // actualiza el menú lateral al instante
    } catch { setSocial(!next) }
    finally { setSaving(false) }
  }

  // Datos del negocio
  const [data, setData] = useState<OrgData>(orgData)
  const [savingData, setSavingData] = useState(false)
  const [savedData, setSavedData] = useState(false)
  const setField = (k: keyof OrgData, v: string) => setData((d) => ({ ...d, [k]: v }))

  const persistData = async () => {
    if (!data.name.trim()) return
    setSavingData(true); setSavedData(false)
    try {
      await saveOrgData(organizationId, {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        hours_note: data.hours_note?.trim() || null,
        review_link: data.review_link?.trim() || null,
      })
      setSavedData(true); setTimeout(() => setSavedData(false), 2500)
    } finally { setSavingData(false) }
  }

  const toggleClinical = async () => {
    const next = !clinical
    setClinical(next); setSaving(true)
    try { await setOrgFlag(organizationId, 'clinical_history_enabled', next) }
    catch { setClinical(!next) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Settings size={20} color="#60a5fa" /> Configuración
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 24 }}>
        Datos de tu negocio y funciones según tu rubro.
      </p>

      {/* Datos del negocio */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
        <h2 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Store size={18} color="#60a5fa" /> Datos del negocio
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Field label="Nombre del negocio">
            <input value={data.name} onChange={(e) => setField('name', e.target.value)} style={input} />
          </Field>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Field label="Teléfono"><input value={data.phone ?? ''} onChange={(e) => setField('phone', e.target.value)} placeholder="Ej: 11 2345 6789" style={input} /></Field>
            <Field label="Dirección"><input value={data.address ?? ''} onChange={(e) => setField('address', e.target.value)} placeholder="Ej: Av. Siempreviva 742" style={input} /></Field>
          </div>
          <Field label="Horarios de atención">
            <input value={data.hours_note ?? ''} onChange={(e) => setField('hours_note', e.target.value)} placeholder="Ej: Lunes a Viernes de 9 a 18 hs · Sábados de 9 a 13 hs" style={input} />
          </Field>
          <Field label="Link de reseñas (Google)">
            <input value={data.review_link ?? ''} onChange={(e) => setField('review_link', e.target.value)} placeholder="Pegá el link para que tus clientes te dejen reseña" style={input} />
          </Field>
          <button onClick={persistData} disabled={savingData || !data.name.trim()} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: savingData || !data.name.trim() ? 0.5 : 1 }}>
            {savedData ? <><Check size={15} /> Guardado</> : savingData ? 'Guardando…' : 'Guardar datos'}
          </button>
        </div>
      </div>

      <h2 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '24px 0 12px' }}>Funciones</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleRow
          icon={<FileHeart size={20} color="#f472b6" />}
          title="Historia clínica"
          desc={clinical
            ? 'Activada: vas a ver la historia clínica en la ficha de cada paciente.'
            : 'Desactivada: ideal para negocios que no la necesitan (peluquería, barbería…).'}
          on={clinical}
          disabled={saving}
          onToggle={toggleClinical}
        />
        <ToggleRow
          icon={<Sparkles size={20} color="#22d3ee" />}
          title="Redes sociales"
          desc={social
            ? 'Activada: aparece la sección "Redes" con tu marca, ideas de contenido y auditoría.'
            : 'Desactivada: activala si querés ayuda para tus redes (Instagram, etc.).'}
          on={social}
          disabled={saving}
          onToggle={toggleSocial}
        />
      </div>
    </div>
  )
}

function ToggleRow({ icon, title, desc, on, disabled, onToggle }: {
  icon: React.ReactNode; title: string; desc: string; on: boolean; disabled: boolean; onToggle: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 15, margin: 0 }}>{title}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0', lineHeight: 1.5 }}>{desc}</p>
        </div>
      </div>
      <button onClick={onToggle} disabled={disabled} aria-label="Activar"
        style={{ width: 52, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s',
          background: on ? '#2563FF' : 'rgba(255,255,255,0.15)' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
      </button>
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

const input: React.CSSProperties = {
  width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, padding: '10px 12px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '11px 18px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
