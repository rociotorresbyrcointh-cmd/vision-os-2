'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Ban, Search } from 'lucide-react'
import type { Professional, Service, Appointment, BlockedTime } from '@/types/database'
import type { WhatsAppTemplate } from '@/lib/whatsapp'
import { getDateKey, timeToMinutes } from '@/lib/date-utils'
import { listAppointmentsBetween, updateAppointment, searchAppointmentsByClient } from '@/services/appointments'
import { ClientSearch } from './ClientSearch'
import { fetchBlocks, expandBlocksForDay, deleteBlock, type BlockInstance } from '@/services/blocked-times'
import { listPaymentsForAppointments } from '@/services/payments'
import { BlockModal } from './BlockModal'
import { CalendarDayView } from './CalendarDayView'
import { CalendarListView } from './CalendarListView'
import { CalendarWeekView } from './CalendarWeekView'
import { CalendarMonthView } from './CalendarMonthView'
import { AppointmentModal, type ModalSeed } from './AppointmentModal'

type View = 'day' | 'list' | 'week' | 'month'

// Rango [desde, hasta) a consultar según la vista y la fecha actual
function rangeFor(view: View, d: Date): { from: Date; to: Date } {
  if (view === 'day' || view === 'list') {
    const from = new Date(d); from.setHours(0, 0, 0, 0)
    const to = new Date(d); to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  if (view === 'week') {
    const from = new Date(d); from.setDate(d.getDate() - d.getDay()); from.setHours(0, 0, 0, 0)
    const to = new Date(from); to.setDate(from.getDate() + 7)
    return { from, to }
  }
  // month
  const from = new Date(d.getFullYear(), d.getMonth(), 1)
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return { from, to }
}

// Suma lo cobrado por cada turno
function buildPaidMap(pays: { appointment_id: string | null; amount: number }[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of pays) {
    if (!p.appointment_id) continue
    map.set(p.appointment_id, (map.get(p.appointment_id) ?? 0) + Number(p.amount))
  }
  return map
}

export function CalendarContainer({
  organizationId,
  businessName,
  whatsappTemplates,
  professionals,
  services,
}: {
  organizationId: string
  businessName: string
  whatsappTemplates: WhatsAppTemplate[]
  professionals: Professional[]
  services: Service[]
}) {
  const [view, setView] = useState<View>('day')
  const [date, setDate] = useState(() => new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [blocks, setBlocks] = useState<BlockedTime[]>([])
  const [paidByAppt, setPaidByAppt] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalSeed | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const openMin = professionals.length
    ? Math.min(...professionals.map((p) => timeToMinutes(p.hours_start.slice(0, 5))))
    : 8 * 60
  const closeMin = professionals.length
    ? Math.max(...professionals.map((p) => timeToMinutes(p.hours_end.slice(0, 5))))
    : 20 * 60

  const refetch = useCallback(async (v: View, d: Date) => {
    setLoading(true)
    const { from, to } = rangeFor(v, d)
    try {
      const [appts, blks] = await Promise.all([
        listAppointmentsBetween(from.toISOString(), to.toISOString()),
        fetchBlocks(from.toISOString(), to.toISOString()),
      ])
      setAppointments(appts)
      setBlocks(blks)
      const pays = await listPaymentsForAppointments(appts.map((a) => a.id))
      setPaidByAppt(buildPaidMap(pays))
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresca solo los pagos (tras cobrar desde el modal)
  const refreshPaid = useCallback(async () => {
    const pays = await listPaymentsForAppointments(appointments.map((a) => a.id))
    setPaidByAppt(buildPaidMap(pays))
  }, [appointments])

  useEffect(() => { refetch(view, date) }, [view, date, refetch])

  // Bloqueos del día actual (para vistas Día y Lista)
  const dayBlocks = useMemo(() => expandBlocksForDay(blocks, date), [blocks, date])

  const handleBlockClick = async (b: BlockInstance) => {
    const msg = b.recurring
      ? `Eliminar el bloqueo recurrente "${b.title}"? Se quita de todos los días.`
      : `Eliminar el bloqueo "${b.title}"?`
    if (!confirm(msg)) return
    await deleteBlock(b.sourceId)
    setBlocks((list) => list.filter((x) => x.id !== b.sourceId))
  }

  const shift = (delta: number) =>
    setDate((d) => {
      const n = new Date(d)
      if (view === 'day' || view === 'list') n.setDate(d.getDate() + delta)
      else if (view === 'week') n.setDate(d.getDate() + delta * 7)
      else n.setMonth(d.getMonth() + delta)
      return n
    })

  const onSaved = (appt: Appointment) => {
    setAppointments((list) => {
      const exists = list.some((a) => a.id === appt.id)
      return exists ? list.map((a) => (a.id === appt.id ? appt : a)) : [...list, appt]
    })
    setModal(null)
  }
  const onDeleted = (id: string) => {
    setAppointments((list) => list.filter((a) => a.id !== id))
    setModal(null)
  }

  // Cambio rápido de estado desde la lista (✓ Vino / ✗ No vino)
  const onStatusChange = async (appt: Appointment, status: Appointment['status']) => {
    setAppointments((list) => list.map((a) => (a.id === appt.id ? { ...a, status } : a)))
    try {
      await updateAppointment(appt.id, { status })
    } catch {
      setAppointments((list) => list.map((a) => (a.id === appt.id ? appt : a))) // revertir si falla
    }
  }

  const label =
    view === 'month'
      ? date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      : view === 'week'
      ? `Semana del ${rangeFor('week', date).from.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`
      : date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  const isToday = getDateKey(date) === getDateKey(new Date())
  const ready = professionals.length && services.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => shift(-1)} style={navBtn}><ChevronLeft size={18} /></button>
            <button onClick={() => shift(1)} style={navBtn}><ChevronRight size={18} /></button>
          </div>
          <button onClick={() => setDate(new Date())} style={{ ...navBtn, width: 'auto', padding: '0 14px', fontSize: 13, fontWeight: 600, opacity: isToday ? 0.5 : 1 }}>Hoy</button>
          <h1 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>{label}</h1>
          {loading && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>actualizando…</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSearchOpen(true)} title="Buscar turnos por cliente"
            style={{ ...navBtn, width: 'auto', padding: '0 13px', gap: 7, fontSize: 13, fontWeight: 600 }}>
            <Search size={15} /> Buscar
          </button>

          {/* Selector de vista */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 9, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['day', 'list', 'week', 'month'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  background: view === v ? 'rgba(37,99,255,0.25)' : 'transparent',
                  color: view === v ? '#60a5fa' : 'rgba(255,255,255,0.5)' }}>
                {v === 'day' ? 'Día' : v === 'list' ? 'Lista' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBlockOpen(true)}
            disabled={!professionals.length}
            title="Bloquear horario (almuerzo, vacaciones…)"
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 13px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: professionals.length ? 1 : 0.4 }}
          >
            <Ban size={15} /> Bloqueo
          </button>

          <button
            onClick={() => setModal({ professionalId: professionals[0]?.id ?? '', date, startMin: openMin })}
            disabled={!ready}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#3b82f6,#2563FF)', color: 'white', border: 'none', borderRadius: 9, padding: '9px 15px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px rgba(37,99,255,0.3)', opacity: ready ? 1 : 0.4 }}
          >
            <Plus size={15} /> Nuevo turno
          </button>
        </div>
      </header>

      {!professionals.length ? (
        <Empty msg="Cargá profesionales para ver el calendario." />
      ) : !services.length ? (
        <Empty msg="Cargá al menos un servicio para poder crear turnos." />
      ) : view === 'list' ? (
        <CalendarListView
          professionals={professionals}
          services={services}
          appointments={appointments}
          blocks={dayBlocks}
          paidByAppt={paidByAppt}
          onApptClick={(appt) => setModal({ edit: appt })}
          onBlockClick={handleBlockClick}
          onStatusChange={onStatusChange}
        />
      ) : view === 'day' ? (
        <CalendarDayView
          professionals={professionals}
          services={services}
          appointments={appointments}
          blocks={dayBlocks}
          paidByAppt={paidByAppt}
          openMin={openMin}
          closeMin={closeMin}
          onEmptyClick={(professionalId, startMin) => setModal({ professionalId, date, startMin })}
          onApptClick={(appt) => setModal({ edit: appt })}
          onBlockClick={handleBlockClick}
        />
      ) : view === 'week' ? (
        <CalendarWeekView
          professionals={professionals}
          services={services}
          appointments={appointments}
          weekStart={rangeFor('week', date).from}
          openMin={openMin}
          closeMin={closeMin}
          onEmptyClick={(day, startMin) => setModal({ professionalId: professionals[0]!.id, date: day, startMin })}
          onApptClick={(appt) => setModal({ edit: appt })}
          onShowDay={(day) => { setDate(day); setView('list') }}
        />
      ) : (
        <CalendarMonthView
          professionals={professionals}
          appointments={appointments}
          monthDate={date}
          onDayClick={(day) => { setDate(day); setView('list') }}
        />
      )}

      {modal && (
        <AppointmentModal
          seed={modal}
          organizationId={organizationId}
          businessName={businessName}
          whatsappTemplates={whatsappTemplates}
          professionals={professionals}
          services={services}
          blocks={blocks}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onPaid={refreshPaid}
        />
      )}

      {searchOpen && (
        <ClientSearch
          professionals={professionals}
          services={services}
          paidByAppt={paidByAppt}
          onClose={() => setSearchOpen(false)}
          onPick={(appt) => { setSearchOpen(false); setModal({ edit: appt }) }}
        />
      )}

      {blockOpen && (
        <BlockModal
          date={date}
          organizationId={organizationId}
          professionals={professionals}
          onClose={() => setBlockOpen(false)}
          onSaved={() => { setBlockOpen(false); refetch(view, date) }}
        />
      )}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>
      {msg}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit',
}
