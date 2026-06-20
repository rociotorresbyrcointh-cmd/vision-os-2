import { createClient } from '@supabase/supabase-js'

// Cliente con privilegios de servicio (service role). SOLO para el servidor
// (webhooks, tareas sin sesión de usuario). NUNCA exponer en el navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
