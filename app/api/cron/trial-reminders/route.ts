import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subStatus } from '@/lib/plans'
import { sendTrialEndingEmail, sendActivationEmail } from '@/lib/email'

// Días transcurridos desde el registro (0, 1, 2, 3, …)
function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export const runtime = 'nodejs'

// Se ejecuta 1 vez por día (Vercel Cron). Avisa a quienes les quedan 3 o 1 día de prueba.
export async function GET(request: Request) {
  // Seguridad: solo lo llama Vercel Cron (que manda el CRON_SECRET)
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - 16 * 86400000).toISOString()
  const { data: orgs } = await admin
    .from('organizations')
    .select('id, owner_id, name, plan, created_at')
    .gte('created_at', since)
    .or('plan.is.null,plan.eq.trial')

  let sent = 0
  let activation = 0
  for (const o of orgs ?? []) {
    const st = subStatus(o.plan, o.created_at, Date.now())

    // Día 3 de la prueba: si cargó pocos turnos, mandamos el check-in de activación.
    if (st.state === 'trial' && daysSince(o.created_at) === 3) {
      const { count } = await admin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', o.id)
      if ((count ?? 0) < 4) {
        try {
          const { data } = await admin.auth.admin.getUserById(o.owner_id)
          const email = data?.user?.email
          if (email) { await sendActivationEmail(email, o.name ?? ''); activation++ }
        } catch { /* seguir */ }
      }
    }

    // Aviso de vencimiento (3 y 1 día antes)
    if (st.state === 'trial' && [3, 1].includes(st.daysLeft)) {
      try {
        const { data } = await admin.auth.admin.getUserById(o.owner_id)
        const email = data?.user?.email
        if (email) { await sendTrialEndingEmail(email, st.daysLeft, o.name ?? ''); sent++ }
      } catch { /* ignorar un usuario y seguir */ }
    }
  }

  return NextResponse.json({ ok: true, checked: orgs?.length ?? 0, sent, activation })
}
