import { createBrowserClient } from '@supabase/ssr'

// Cliente Supabase para componentes del navegador ('use client').
// Lee la sesión desde las cookies que mantiene el proxy.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
