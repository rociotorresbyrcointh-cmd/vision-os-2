// ─────────────────────────────────────────────────────────────────
//  Crear cuentas demo para vender Vision OS.
//
//  Qué hace, por cada negocio del archivo de entrada:
//   1) Crea un usuario (email autogenerado + contraseña) → el trigger de la
//      DB crea la organización sola.
//   2) Carga 4 profesionales, 4 servicios (genéricos) y ~10 turnos repartidos
//      entre HOY y MAÑANA, con pagos en la caja para los completados.
//   3) Escribe las credenciales en un Excel (CSV) para que puedas entrar.
//
//  Cómo se usa (desde la carpeta del proyecto):
//     node scripts/crear-negocios.mjs
//
//  Entrada:  C:\Users\rocio\Desktop\negocios-a-crear.csv   (una columna: nombre)
//  Salida:   C:\Users\rocio\Desktop\credenciales-negocios.csv
// ─────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const APP_URL = 'https://visionturnos.online'
const DESKTOP = join(homedir(), 'Desktop')
const ENTRADA = join(DESKTOP, 'negocios-a-crear.csv')
const SALIDA = join(DESKTOP, 'credenciales-negocios.csv')

// ── Leer credenciales de Supabase desde .env.local ──
function leerEnv() {
  const txt = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  const env = {}
  for (const linea of txt.split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return env
}

const env = leerEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}
const supabase = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } })

// ── Helpers ──
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'negocio'
const rand = (n = 6) => Math.random().toString(36).slice(2, 2 + n)
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const COLORES = ['#ec4899', '#2563ff', '#34d399', '#f59e0b', '#a78bfa', '#06b6d4']
const NOMBRES_CLIENTE = ['Sofía Gómez', 'Martina Ruiz', 'Camila Díaz', 'Valentina Sosa', 'Lucía Fernández', 'Julieta Pérez', 'Agustina López', 'Florencia Romero', 'Micaela Torres', 'Carla Benítez']

// Fecha local a un hora:min de un día (0 = hoy, 1 = mañana)
function fecha(diaOffset, hora, min) {
  const d = new Date()
  d.setDate(d.getDate() + diaOffset)
  d.setHours(hora, min, 0, 0)
  return d
}

// ── Datos demo ──
const SERVICIOS = [
  { name: 'Servicio 1', duration_minutes: 30, price: 8000 },
  { name: 'Servicio 2', duration_minutes: 45, price: 12000 },
  { name: 'Servicio 3', duration_minutes: 60, price: 18000 },
  { name: 'Servicio 4', duration_minutes: 90, price: 25000 },
]
const PROFESIONALES = ['Ana', 'Lucía', 'Julián', 'Marina']

// Turnos: (díaOffset, hora, min, estado). Hoy y mañana. Completados → pago en caja.
const TURNOS = [
  [0, 10, 0, 'completed'], [0, 11, 30, 'completed'], [0, 14, 0, 'confirmed'], [0, 16, 30, 'pending'],
  [1, 9, 30, 'confirmed'], [1, 11, 0, 'confirmed'], [1, 12, 30, 'pending'], [1, 15, 0, 'confirmed'], [1, 16, 30, 'pending'], [1, 18, 0, 'confirmed'],
]

async function crearNegocio(nombre) {
  const email = `${slugify(nombre)}-${rand()}@demos.visionturnos.online`
  const password = `Vision${rand(8)}!`

  // 1) Usuario → el trigger crea la organización
  const { data: creado, error: eUser } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { business_name: nombre, sector: 'Otro' },
  })
  if (eUser) throw new Error('crear usuario: ' + eUser.message)
  const userId = creado.user.id

  // 2) Buscar la organización que creó el trigger (con reintentos)
  let orgId = null
  for (let i = 0; i < 8 && !orgId; i++) {
    await sleep(400)
    const { data } = await supabase.from('organizations').select('id').eq('owner_id', userId).maybeSingle()
    orgId = data?.id ?? null
  }
  if (!orgId) throw new Error('no apareció la organización (trigger)')

  // 3) Servicios
  const { data: svc, error: eSvc } = await supabase.from('services')
    .insert(SERVICIOS.map((s) => ({ ...s, organization_id: orgId, is_active: true })))
    .select('id, price, duration_minutes')
  if (eSvc) throw new Error('servicios: ' + eSvc.message)

  // 4) Profesionales
  const { data: profs, error: eProf } = await supabase.from('professionals')
    .insert(PROFESIONALES.map((name, i) => ({
      organization_id: orgId, name, color: COLORES[i % COLORES.length],
      days_of_week: [1, 2, 3, 4, 5, 6], hours_start: '09:00', hours_end: '19:00', is_active: true,
    })))
    .select('id')
  if (eProf) throw new Error('profesionales: ' + eProf.message)

  // 5) Turnos (+ pagos para los completados)
  let cobradoHoy = 0
  for (let i = 0; i < TURNOS.length; i++) {
    const [dia, hora, min, status] = TURNOS[i]
    const prof = profs[i % profs.length]
    const s = svc[i % svc.length]
    const start = fecha(dia, hora, min)
    const end = new Date(start.getTime() + (s.duration_minutes ?? 60) * 60000)
    const { data: appt, error: eAppt } = await supabase.from('appointments').insert({
      organization_id: orgId, professional_id: prof.id, service_id: s.id,
      client_name: NOMBRES_CLIENTE[i % NOMBRES_CLIENTE.length], client_phone: '',
      start_time: start.toISOString(), end_time: end.toISOString(),
      status, capacity_consumed: 1,
    }).select('id').single()
    if (eAppt) { console.warn('   ⚠ turno:', eAppt.message); continue }

    if (status === 'completed') {
      const amount = Number(s.price) || 0
      await supabase.from('payments').insert({
        organization_id: orgId, appointment_id: appt.id, patient_id: null,
        amount, method: 'efectivo', kind: 'pago',
        notes: NOMBRES_CLIENTE[i % NOMBRES_CLIENTE.length], paid_at: new Date().toISOString(),
      })
      cobradoHoy += amount
    }
  }

  return { email, password, orgId, cobradoHoy }
}

// ── Main ──
if (!existsSync(ENTRADA)) {
  console.error(`❌ No encontré el archivo de entrada:\n   ${ENTRADA}\n   Creá ese CSV con una columna de nombres de negocio (uno por fila).`)
  process.exit(1)
}
const lineas = readFileSync(ENTRADA, 'utf8').split('\n')
  .map((l) => l.trim()).filter(Boolean)
  .filter((l) => !/^nombre/i.test(l) && !l.startsWith('#')) // saltar encabezado y comentarios
  .map((l) => l.split(',')[0].replace(/^["']|["']$/g, '').trim())
  .filter(Boolean)

if (!lineas.length) { console.error('❌ El archivo no tiene negocios cargados.'); process.exit(1) }

// Encabezado del CSV de salida (si no existe)
if (!existsSync(SALIDA)) {
  writeFileSync(SALIDA, 'negocio,email,password,org_id,link_login,link_reservas,cobrado_hoy\n', 'utf8')
}

console.log(`\n🚀 Creando ${lineas.length} negocio(s)...\n`)
let ok = 0
for (const nombre of lineas) {
  try {
    const r = await crearNegocio(nombre)
    appendFileSync(SALIDA, [
      csvCell(nombre), csvCell(r.email), csvCell(r.password), csvCell(r.orgId),
      csvCell(APP_URL + '/login'), csvCell(APP_URL + '/reservar/' + r.orgId), csvCell(r.cobradoHoy),
    ].join(',') + '\n', 'utf8')
    console.log(`✅ ${nombre}\n   email: ${r.email}\n   pass:  ${r.password}\n`)
    ok++
  } catch (e) {
    console.error(`❌ ${nombre}: ${e.message}\n`)
  }
}
console.log(`\nListo: ${ok}/${lineas.length} creados.\nCredenciales en: ${SALIDA}\n`)
