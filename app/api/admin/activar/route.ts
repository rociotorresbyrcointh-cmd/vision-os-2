import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendActivationEmail } from '@/lib/email'

export const runtime = 'nodejs'

// Disparador MANUAL (solo para la dueña): envía el mail de "día 3" / check-in
// a los usuarios en prueba que se registraron hace 2+ días (evita hoy y ayer).
// Uso: abrir en el navegador  /api/admin/activar?key=TU_CRON_SECRET
export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key') || request.headers.get('authorization')?.replace('Bearer ', '')
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const desde = new Date(Date.now() - 16 * 86400000).toISOString() // dentro de la ventana de prueba
  const hasta = new Date(Date.now() - 2 * 86400000).toISOString()  // al menos 2 días (evita hoy y ayer)

  const { data: orgs } = await admin
    .from('organizations')
    .select('id, owner_id, name, plan, created_at')
    .gte('created_at', desde)
    .lte('created_at', hasta)
    .or('plan.is.null,plan.eq.trial')

  let enviados = 0
  const detalle: string[] = []
  for (const o of orgs ?? []) {
    try {
      const { data } = await admin.auth.admin.getUserById(o.owner_id)
      const email = data?.user?.email
      if (email) { await sendActivationEmail(email, o.name ?? ''); enviados++; detalle.push(email) }
    } catch { /* seguir con el siguiente */ }
  }

  return NextResponse.json({ ok: true, candidatos: orgs?.length ?? 0, enviados, detalle })
}
