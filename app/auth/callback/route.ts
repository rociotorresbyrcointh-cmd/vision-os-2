import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Canjea el código del email (recuperación / confirmación) por una sesión
// y redirige a la página indicada en ?next.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextRaw = searchParams.get('next') ?? '/inicio'
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/inicio'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Sin código o link vencido → volver a pedir recuperación.
  return NextResponse.redirect(`${origin}/recuperar?error=1`)
}
