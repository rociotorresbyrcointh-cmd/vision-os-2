import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: org } = await supabase
    .from('organizations')
    .select('id, owner_id, stripe_customer_id')
    .single()
  if (!org || org.owner_id !== user.id) {
    return NextResponse.json({ error: 'Solo el dueño puede gestionar el plan.' }, { status: 403 })
  }
  if (!org.stripe_customer_id) {
    return NextResponse.json({ error: 'Todavía no tenés una suscripción.' }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id as string,
    return_url: `${origin}/plan`,
  })

  return NextResponse.json({ url: session.url })
}
