import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { preApproval } from '@/lib/mercadopago'
import { planById, type PlanId } from '@/lib/plans'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan: PlanId }
  const p = planById(plan)
  if (!p) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Falta configurar Mercado Pago (MP_ACCESS_TOKEN).' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: org } = await supabase.from('organizations').select('id, owner_id').single()
  if (!org || org.owner_id !== user.id) {
    return NextResponse.json({ error: 'Solo el dueño puede gestionar el plan.' }, { status: 403 })
  }

  const origin = new URL(request.url).origin
  try {
    const result = await preApproval().create({
      body: {
        reason: `Vision OS — ${p.name}`,
        external_reference: `${org.id}|${plan}`,
        payer_email: user.email ?? undefined,
        back_url: `${origin}/plan?mp=success`,
        status: 'pending',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: p.priceARS,
          currency_id: 'ARS',
        },
      },
    })
    const url = result.init_point ?? (result as { sandbox_init_point?: string }).sandbox_init_point
    if (!url) throw new Error('Mercado Pago no devolvió el link de pago')
    return NextResponse.json({ url })
  } catch (err) {
    // El SDK de MP a veces trae el detalle en .message, .cause o .error
    const e = err as { message?: string; error?: string; cause?: Array<{ description?: string }> }
    const detail = e?.cause?.map((c) => c.description).filter(Boolean).join(' · ')
    const msg = detail || e?.message || e?.error || 'Error de Mercado Pago'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
