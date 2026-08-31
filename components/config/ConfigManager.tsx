'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, FileHeart, Store, Check, Sparkles, ImagePlus, X, Wallet, KeyRound, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { setOrgFlag, saveOrgData, saveDepositSettings, setPublicTheme, type OrgData, type DepositSettings } from '@/services/org-settings'
import { AccountSettings } from '@/components/config/AccountSettings'
import { uploadLogo, setLogoUrl } from '@/services/storage'

export function ConfigManager({
  organizationId,
  clinicalEnabled,
  socialEnabled,
  logoUrl,
  orgData,
  depositEnabled,
  depositData,
  publicTheme = 'light',
}: {
  organizationId: string
  clinicalEnabled: boolean
  socialEnabled: boolean
  logoUrl: string | null
  orgData: OrgData
  depositEnabled: boolean
  depositData: DepositSettings
  publicTheme?: 'light' | 'dark'
}) {
  const toast = useToast()
  // Qué sección del acordeón está abierta (una a la vez).
  const [abierta, setAbierta] = useState<string | null>('acceso')
  const toggleSeccion = (id: string) => setAbierta((p) => (p === id ? null : id))
  const [logo, setLogo] = useState<string | null>(logoUrl)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const onLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploadingLogo(true)
    try {
      const url = await uploadLogo(organizationId, file)
      await setLogoUrl(organizationId, url)
      setLogo(url)
    } catch (err: any) { toast('No se pudo subir el logo: ' + (err.message ?? err), 'error') }
    finally { setUploadingLogo(false) }
  }
  const removeLogo = async () => {
    await setLogoUrl(organizationId, null).catch(() => {})
    setLogo(null)
  }
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

  // Tema de la página pública de reservas
  const [theme, setTheme] = useState<'light' | 'dark'>(publicTheme)
  const changeTheme = async (next: 'light' | 'dark') => {
    const prev = theme
    setTheme(next)
    try { await setPublicTheme(organizationId, next) }
    catch { setTheme(prev); toast('No se pudo guardar el tema.', 'error') }
  }

  const toggleClinical = async () => {
    const next = !clinical
    setClinical(next); setSaving(true)
    try { await setOrgFlag(organizationId, 'clinical_history_enabled', next) }
    catch { setClinical(!next) }
    finally { setSaving(false) }
  }

  // Seña
  const [deposit, setDeposit] = useState(depositEnabled)
  const [dep, setDep] = useState<DepositSettings>(depositData)
  const [savingDep, setSavingDep] = useState(false)
  const [savedDep, setSavedDep] = useState(false)
  const setDepField = (k: keyof DepositSettings, v: string | number | null) => setDep((d) => ({ ...d, [k]: v }))

  const toggleDeposit = async () => {
    const next = !deposit
    // No permitir activar la seña sin un alias/link de cobro cargado: evita que
    // las señas se depositen en una cuenta equivocada o inexistente.
    if (next && !dep.link?.trim()) {
      setAbierta('sena') // abre la sección de la seña para que carguen el alias
      toast('Antes de activar la seña, cargá tu link de cobro o alias en "Datos de la seña" y guardá.', 'error')
      return
    }
    setDeposit(next); setSaving(true)
    try { await setOrgFlag(organizationId, 'deposit_enabled', next) }
    catch { setDeposit(!next) }
    finally { setSaving(false) }
  }

  const persistDeposit = async () => {
    if (!dep.link?.trim()) {
      toast('Cargá tu link de cobro o alias antes de guardar la seña.', 'error')
      return
    }
    setSavingDep(true); setSavedDep(false)
    try {
      await saveDepositSettings(organizationId, dep)
      setSavedDep(true); setTimeout(() => setSavedDep(false), 2500)
    } finally { setSavingDep(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720 }}>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Settings size={20} color="#60a5fa" /> Configuración
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5, marginBottom: 24 }}>
        Datos de tu negocio y funciones según tu rubro.
      </p>

      {/* Acceso a la cuenta */}
      <Accordion id="acceso" title="Acceso a la cuenta" subtitle="Cambiá tu email y contraseña" icon={<KeyRound size={18} color="#60a5fa" />} open={abierta === 'acceso'} onToggle={() => toggleSeccion('acceso')}>
        <AccountSettings embedded />
      </Accordion>

      {/* Datos del negocio */}
      <Accordion id="datos" title="Datos del negocio" subtitle="Logo, nombre, teléfono, horarios" icon={<Store size={18} color="#60a5fa" />} open={abierta === 'datos'} onToggle={() => toggleSeccion('datos')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Orbitron', sans-serif" }}>Logo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logo ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImagePlus size={22} color="rgba(255,255,255,0.3)" />}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ ...btnGhostSm, cursor: uploadingLogo ? 'default' : 'pointer', opacity: uploadingLogo ? 0.6 : 1 }}>
                  <ImagePlus size={14} /> {uploadingLogo ? 'Subiendo…' : logo ? 'Cambiar logo' : 'Subir logo'}
                  <input type="file" accept="image/*" onChange={onLogoFile} disabled={uploadingLogo} style={{ display: 'none' }} />
                </label>
                {logo && <button onClick={removeLogo} style={{ ...btnGhostSm, color: '#f87171' }}><X size={13} /> Quitar</button>}
              </div>
            </div>
            {!logo && (
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '8px 11px', lineHeight: 1.5 }}>
                Mientras no subas tu logo, tus clientes ven las iniciales de tu negocio en la página de reservas. Subí el tuyo para que aparezca tu marca.
              </p>
            )}
          </div>

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
      </Accordion>

      {/* Página de reservas */}
      <Accordion id="reservas" title="Página de reservas" subtitle="Tema claro u oscuro para tus clientes" icon={<Sparkles size={18} color="#60a5fa" />} open={abierta === 'reservas'} onToggle={() => toggleSeccion('reservas')}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 14px' }}>
          Tema con el que tus clientes ven la página pública para reservar.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['light', 'dark'] as const).map((t) => {
            const on = theme === t
            return (
              <button key={t} onClick={() => changeTheme(t)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: on ? 'rgba(37,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: on ? '1px solid rgba(37,99,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: on ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                }}>
                <span style={{ width: 16, height: 16, borderRadius: 5, border: '1px solid rgba(255,255,255,0.25)', background: t === 'light' ? '#f4f5fa' : '#0d0d18' }} />
                {t === 'light' ? 'Claro' : 'Oscuro'}{on && <Check size={14} />}
              </button>
            )
          })}
        </div>
      </Accordion>

      {/* Funciones */}
      <Accordion id="funciones" title="Funciones" subtitle="Historia clínica, redes sociales, seña" icon={<SlidersHorizontal size={18} color="#60a5fa" />} open={abierta === 'funciones'} onToggle={() => toggleSeccion('funciones')}>
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
        <ToggleRow
          icon={<Wallet size={20} color="#34d399" />}
          title="Seña para reservar"
          desc={deposit
            ? 'Activada: en tu portal de reservas se le pide al cliente una seña para confirmar el turno.'
            : 'Desactivada: tus clientes reservan sin pagar nada por adelantado.'}
          on={deposit}
          disabled={saving}
          onToggle={toggleDeposit}
        />
      </div>
      </Accordion>

      {/* Datos de la seña */}
      <Accordion id="sena" title="Datos de la seña" subtitle="Monto y link de cobro para las reservas" icon={<Wallet size={18} color="#34d399" />} open={abierta === 'sena'} onToggle={() => toggleSeccion('sena')}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
            Pegá tu propio link de cobro (Mercado Pago, PayPal, alias bancario…). El cliente lo verá al reservar y abona ahí. Vos confirmás el turno cuando recibís el pago.
          </p>
          {dep.link?.trim() && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 9, padding: '9px 12px', marginBottom: 14, fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, wordBreak: 'break-all' }}>
              Las señas se depositan en: <strong style={{ color: '#34d399' }}>{dep.link.trim()}</strong>. Verificá que sea tuyo.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Field label="Monto de la seña">
                <input type="number" inputMode="decimal" value={dep.amount ?? ''} onChange={(e) => setDepField('amount', e.target.value === '' ? null : Number(e.target.value))} placeholder="Ej: 5000" style={input} />
              </Field>
              <Field label="Moneda">
                <select value={dep.currency} onChange={(e) => setDepField('currency', e.target.value)} style={input}>
                  <option value="ARS">Pesos (ARS)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </Field>
            </div>
            <Field label="Link de cobro / alias">
              <input value={dep.link ?? ''} onChange={(e) => setDepField('link', e.target.value)} placeholder="https://link.mercadopago… · paypal.me/… · o tu alias/CBU" style={input} />
            </Field>
            <Field label="Aclaración para el cliente (opcional)">
              <input value={dep.note ?? ''} onChange={(e) => setDepField('note', e.target.value)} placeholder="Ej: Aboná la seña y mandanos el comprobante por WhatsApp para confirmar." style={input} />
            </Field>
            <button onClick={persistDeposit} disabled={savingDep} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: savingDep ? 0.5 : 1 }}>
              {savedDep ? <><Check size={15} /> Guardado</> : savingDep ? 'Guardando…' : 'Guardar seña'}
            </button>
          </div>
        </div>
      </Accordion>
    </div>
  )
}

// Sección plegable (acordeón) de Configuración.
function Accordion({ title, subtitle, icon, open, onToggle, children }: {
  id?: string; title: string; subtitle?: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ border: `1px solid ${open ? 'rgba(37,99,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, marginBottom: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', background: open ? 'rgba(37,99,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
        <span style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(37,99,255,0.14)', border: '1px solid rgba(37,99,255,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', color: 'white', fontSize: 15, fontWeight: 700 }}>{title}</span>
          {subtitle && <span style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12.5, marginTop: 2 }}>{subtitle}</span>}
        </span>
        <ChevronDown size={18} color="rgba(255,255,255,0.5)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && <div style={{ padding: '4px 18px 20px' }}>{children}</div>}
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
const btnGhostSm: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  padding: '8px 13px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
