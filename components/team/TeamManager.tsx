'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Mail, Shield, X } from 'lucide-react'
import {
  listMembers, listInvites, inviteMember, cancelInvite,
  changeMemberRole, removeMember, type Member, type Invite,
} from '@/services/team'
import { ROLE_LABEL, type Role } from '@/lib/auth/role'

// Supabase no devuelve siempre un Error clásico: extraemos el mensaje real
function errText(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const parts = [o.message, o.details, o.hint, o.code].filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }
  return fallback
}

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'admin', label: 'Recepción', desc: 'Agenda, pacientes, caja, reservas. Sin reportes ni configuración.' },
  { value: 'staff', label: 'Profesional', desc: 'Solo agenda, lista de espera y pacientes.' },
  { value: 'owner', label: 'Dueño', desc: 'Acceso total, incluido equipo y configuración.' },
]

export function TeamManager({ organizationId, currentUserId }: { organizationId: string; currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('admin')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [m, i] = await Promise.all([listMembers(), listInvites()])
      setMembers(m)
      setInvites(i)
    } catch (e) {
      setErr(errText(e, 'Error al cargar'))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function onInvite(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null)
    const clean = email.toLowerCase().trim()
    if (!clean || !clean.includes('@')) { setErr('Ingresá un email válido.'); return }
    if (members.some((m) => m.email.toLowerCase() === clean)) { setErr('Esa persona ya es parte del equipo.'); return }
    if (invites.some((i) => i.email.toLowerCase() === clean)) { setErr('Ya hay una invitación pendiente para ese email.'); return }
    setBusy(true)
    try {
      await inviteMember(organizationId, clean, role)
      setEmail('')
      setMsg('Invitación creada. Cuando esa persona se registre con ese email, entrará a tu negocio con el rol elegido.')
      await load()
    } catch (e) {
      setErr(errText(e, 'No se pudo invitar'))
    } finally {
      setBusy(false)
    }
  }

  async function onChangeRole(userId: string, newRole: string) {
    setErr(null); setMsg(null)
    try {
      await changeMemberRole(userId, newRole)
      await load()
    } catch (e) {
      setErr(errText(e, 'No se pudo cambiar el rol'))
    }
  }

  async function onRemove(userId: string, label: string) {
    if (!confirm(`¿Quitar a ${label} del equipo? Perderá el acceso al negocio.`)) return
    setErr(null); setMsg(null)
    try {
      await removeMember(userId)
      await load()
    } catch (e) {
      setErr(errText(e, 'No se pudo quitar'))
    }
  }

  async function onCancelInvite(id: string) {
    setErr(null); setMsg(null)
    try {
      await cancelInvite(id)
      await load()
    } catch (e) {
      setErr(errText(e, 'No se pudo cancelar'))
    }
  }

  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 48px)', maxWidth: 820, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>Equipo</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 14 }}>
          Invitá a tu equipo y asigná qué puede ver cada uno.
        </p>
      </header>

      {err && <Banner color="#f87171" bg="rgba(248,113,113,0.12)">{err}</Banner>}
      {msg && <Banner color="#34d399" bg="rgba(52,211,153,0.12)">{msg}</Banner>}

      {/* Invitar */}
      <section style={card}>
        <h2 style={cardTitle}><UserPlus size={18} color="#60a5fa" /> Invitar persona</h2>
        <form onSubmit={onInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@ejemplo.com" style={input}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROLES.map((r) => (
              <label key={r.value} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px',
                borderRadius: 10, cursor: 'pointer',
                background: role === r.value ? 'rgba(37,99,255,0.12)' : 'rgba(255,255,255,0.03)',
                border: role === r.value ? '1px solid rgba(37,99,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
              }}>
                <input type="radio" name="role" checked={role === r.value} onChange={() => setRole(r.value)} style={{ marginTop: 3 }} />
                <span>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{r.label}</span>
                  <span style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, marginTop: 2 }}>{r.desc}</span>
                </span>
              </label>
            ))}
          </div>
          <button type="submit" disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Enviando…' : 'Crear invitación'}
          </button>
        </form>
      </section>

      {/* Miembros */}
      <section style={{ ...card, marginTop: 18 }}>
        <h2 style={cardTitle}><Shield size={18} color="#60a5fa" /> Miembros del equipo</h2>
        {loading ? (
          <p style={dim}>Cargando…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {members.map((m) => {
              const isMe = m.user_id === currentUserId
              return (
                <div key={m.user_id} style={row}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.email} {isMe && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>(vos)</span>}
                    </div>
                  </div>
                  {m.role === 'owner' || isMe ? (
                    <span style={badge}>{ROLE_LABEL[m.role as Role] ?? m.role}</span>
                  ) : (
                    <>
                      <select value={m.role} onChange={(e) => onChangeRole(m.user_id, e.target.value)} style={select}>
                        <option value="admin">Recepción</option>
                        <option value="staff">Profesional</option>
                        <option value="owner">Dueño</option>
                      </select>
                      <button onClick={() => onRemove(m.user_id, m.email)} title="Quitar" style={iconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Invitaciones pendientes */}
      {invites.length > 0 && (
        <section style={{ ...card, marginTop: 18 }}>
          <h2 style={cardTitle}><Mail size={18} color="#60a5fa" /> Invitaciones pendientes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {invites.map((i) => (
              <div key={i.id} style={row}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.email}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Esperando registro · {ROLE_LABEL[i.role as Role] ?? i.role}</div>
                </div>
                <button onClick={() => onCancelInvite(i.id)} title="Cancelar invitación" style={iconBtn}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Banner({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}40`, color, borderRadius: 10, padding: '11px 14px', fontSize: 13.5, marginBottom: 14 }}>
      {children}
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 'clamp(16px, 3vw, 22px)' }
const cardTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 9, fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }
const input: React.CSSProperties = { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '11px 13px', color: 'white', fontSize: 14, outline: 'none' }
const select: React.CSSProperties = { ...input, padding: '7px 9px', fontSize: 13 }
const btnPrimary: React.CSSProperties = { background: '#2563FF', color: 'white', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }
const badge: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#60a5fa', background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.3)', borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap' }
const iconBtn: React.CSSProperties = { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex' }
const dim: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }
