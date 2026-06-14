'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Ban, Repeat } from 'lucide-react'
import type { Professional, BlockedTime } from '@/types/database'
import { deleteBlock, listAllBlocks } from '@/services/blocked-times'
import { BlockModal } from '@/components/calendar/BlockModal'

function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function recurrenceLabel(rule: any): string {
  if (!rule) return 'Una vez'
  if (rule.freq === 'daily') return 'Todos los días'
  if (rule.freq === 'weekly') return 'Lun a Vie'
  return 'Recurrente'
}
function blockDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlocksManager({
  organizationId,
  professionals,
  initial,
}: {
  organizationId: string
  professionals: Professional[]
  initial: BlockedTime[]
}) {
  const [list, setList] = useState<BlockedTime[]>(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BlockedTime | null>(null)

  const profName = (id: string | null) =>
    id ? professionals.find((p) => p.id === id)?.name ?? '—' : 'Todo el negocio'

  const reload = async () => setList(await listAllBlocks())

  const remove = async (b: BlockedTime) => {
    if (!confirm(`¿Eliminar el bloqueo "${b.title}"?`)) return
    await deleteBlock(b.id)
    setList((l) => l.filter((x) => x.id !== b.id))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Bloqueos</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
            Almuerzos, vacaciones y horarios no disponibles.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true) }} style={btnPrimary}>
          <Plus size={16} /> Nuevo bloqueo
        </button>
      </div>

      {list.length === 0 ? (
        <div style={emptyBox}>
          <Ban size={26} color="rgba(255,255,255,0.3)" style={{ marginBottom: 10 }} /><br />
          No hay bloqueos cargados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>
          {list.map((b) => (
            <div key={b.id} style={card}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Ban size={15} color="rgba(255,255,255,0.5)" />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>{b.title}</span>
                  {b.recurring_rule && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#60a5fa', background: 'rgba(37,99,255,0.12)', borderRadius: 6, padding: '2px 7px' }}>
                      <Repeat size={11} /> {recurrenceLabel(b.recurring_rule)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 7, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap', paddingLeft: 24 }}>
                  <span>{profName(b.professional_id)}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{hhmm(b.start_time)}–{hhmm(b.end_time)}</span>
                  {!b.recurring_rule && <span>{blockDate(b.start_time)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditing(b); setOpen(true) }} style={btnGhost}><Pencil size={13} /> Editar</button>
                <button onClick={() => remove(b)} style={{ ...btnGhost, color: '#f87171' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <BlockModal
          date={new Date()}
          editing={editing}
          organizationId={organizationId}
          professionals={professionals}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); reload() }}
        />
      )}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)',
  color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', fontFamily: 'inherit',
}
const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
  padding: '7px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const card: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px',
}
const emptyBox: React.CSSProperties = {
  padding: 48, borderRadius: 14, border: '1px dashed rgba(255,255,255,0.12)', textAlign: 'center',
  color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.7, maxWidth: 760,
}
