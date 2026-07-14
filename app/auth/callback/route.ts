import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Canjea el enlace del email (recuperación / confirmación) por una sesión y
// redirige a la página indicada en ?next.
// Soporta las dos formas en que Supabase puede mandar el enlace:
//   • token_hash + type  → verifyOtp  (recomendado, valida en el servidor)
//   • code               → exchangeCodeForSession (flujo PKCE)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const nextRaw = searchParams.get('next') ?? '/inicio'
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/inicio'

  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // Sin código / enlace vencido → volver a pedir recuperación.
  return NextResponse.redirect(`${origin}/recuperar?error=1`)
}
