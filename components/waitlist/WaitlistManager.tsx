'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Trash2, MessageCircle, Clock, UserCheck } from 'lucide-react'
import type { Professional, Service } from '@/types/database'
import {
  listWaitlist, addToWaitlist, setWaitlistStatus, deleteWaitlistEntry,
  type WaitlistEntry, type WaitlistInput,
} from '@/services/waitlist'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export function WaitlistManager({
  organizationId,
  professionals,
  services,
}: {
  organizationId: string
  professionals: Professional[]
  services: Service[]
}) {
  const [list, setList] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => { listWaitlist().then(setList).catch(() => {}).finally(() => setLoading(false)) }, [])

  const profName = (id: string | null) => (id ? professionals.find((p) => p.id === id)?.name ?? '—' : 'Cualquiera')
  const svcName = (id: string | null) => (id ? services.find((s) => s.id === id)?.name ?? '—' : 'Cualquiera')

  const contact = (e: WaitlistEntry) => {
    if (!e.client_phone) return
    const msg = `¡Hola ${e.client_name}! 😊 Te avisamos que se liberó un turno${e.service_id ? ` para ${svcName(e.service_id)}` : ''}. ¿Querés reservarlo? Avisanos y te lo guardamos. 🙌`
    window.open(buildWhatsAppLink(e.client_phone, msg), '_blank')
    markContacted(e)
  }
  const markContacted = async (e: WaitlistEntry) => {
    if (e.status === 'contactado') return
    setList((l) => l.map((x) => (x.id === e.id ? { ...x, status: 'contactado' } : x)))
    await setWaitlistStatus(e.id, 'contactado').catch(() => {})
  }
  const resolve = async (e: WaitlistEntry) => {
    setList((l) => l.filter((x) => x.id !== e.id))
    await setWaitlistStatus(e.id, 'resuelto').catch(() => {})
  }
  const remove = async (e: WaitlistEntry) => {
    if (!confirm(`¿Sacar a ${e.client_name} de la lista de espera?`)) return
    setList((l) => l.filter((x) => x.id !== e.id))
    await deleteWaitlistEntry(e.id).catch(() => {})
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
            <Clock size={20} color="#fbbf24" /> Lista de espera
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 5 }}>
            Gente que quiere turno. Cuando se libera uno, los avisás con un click.
          </p>
        </div>
        <button onClick={() => setOpen(true)} style={btnPrimary}><Plus size={16} /> Agregar a la espera</button>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Cargando…</p>
      ) : list.length === 0 ? (
        <div style={emptyBox}>La lista de espera está vacía.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((e) => (
            <div key={e.id} style={row}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{e.client_name}</span>
                  {e.status === 'contactado' && <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', borderRadius: 6, padding: '2px 8px' }}>Contactado</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', flexWrap: 'wrap' }}>
                  {e.client_phone && <span>{e.client_phone}</span>}
                  <span>{svcName(e.service_id)} · {profName(e.professional_id)}</span>
                  {e.note && <span>📝 {e.note}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {e.client_phone && <button onClick={() => contact(e)} title="Avisar por WhatsApp" style={{ ...iconBtn, color: '#25d366', borderColor: 'rgba(37,211,102,0.35)' }}><MessageCircle size={15} /></button>}
                <button onClick={() => resolve(e)} title="Resuelto (ya reservó)" style={{ ...iconBtn, color: '#34d399', borderColor: 'rgba(52,211,153,0.35)' }}><UserCheck size={15} /></button>
                <button onClick={() => remove(e)} title="Eliminar" style={{ ...iconBtn, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <AddModal organizationId={organizationId} professionals={professionals} services={services}
          onClose={() => setOpen(false)} onAdded={(e) => { setList((l) => [...l, e]); setOpen(false) }} />
      )}
    </div>
  )
}

function AddModal({ organizationId, professionals, services, onClose, onAdded }: {
  organizationId: string; professionals: Professional[]; services: Service[]
  onClose: () => void; onAdded: (e: WaitlistEntry) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [prof, setProf] = useState('')
  const [svc, setSvc] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (!name.trim()) { setError('Poné el nombre.'); return }
    setSaving(true); setError('')
    const input: WaitlistInput = {
      patient_id: null, client_name: name.trim(), client_phone: phone.trim() || null,
      professional_id: prof || null, service_id: svc || null, note: note.trim() || null,
    }
    try { onAdded(await addToWaitlist(organizationId, input)) }
    catch (e: any) { setError(e.message ?? 'Error.'); setSaving(false) }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div className="v-modal" style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>Agregar a la espera</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} style={input} autoFocus /></Field>
            <Field label="Teléfono"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" style={input} /></Field>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Profesional (opcional)">
              <select value={prof} onChange={(e) => setProf(e.target.value)} style={input}>
                <option value="" style={opt}>Cualquiera</option>
                {professionals.map((p) => <option key={p.id} value={p.id} style={opt}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Servicio (opcional)">
              <select value={svc} onChange={(e) => setSvc(e.target.value)} style={input}>
                <option value="" style={opt}>Cualquiera</option>
                {services.map((s) => <option key={s.id} value={s.id} style={opt}>{s.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Nota (ej: prefiere mañanas)"><input value={note} onChange={(e) => setNote(e.target.value)} style={input} /></Field>
          {error && <p style={{ color: '#f87171', fontSize: 12, margin: 0 }}>{error}</p>}
          <button onClick={save} disabled={saving} style={{ ...btnPrimary, justifyContent: 'center', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
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
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  cursor: 'pointer',
}
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 13, background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px',
}
const emptyBox: React.CSSProperties = {
  padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14,
}
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20,
}
const modal: React.CSSProperties = {
  background: '#0d0d18', border: '1px solid rgba(37,99,255,0.25)', borderRadius: 18, padding: 24,
  width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
}
