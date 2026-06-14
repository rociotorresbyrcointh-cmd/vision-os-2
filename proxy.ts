import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy-session'

// proxy.ts reemplaza a middleware.ts en Next 16.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Corre en todo salvo estáticos e imágenes (ver doc de matcher de Next 16).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
