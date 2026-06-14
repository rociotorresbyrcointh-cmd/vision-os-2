'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Registro ────────────────────────────────────────────────────
// El nombre del negocio se guarda en metadata; el trigger de la DB
// (handle_new_user) crea la organización y la membresía automáticamente.
export async function register(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const businessName = String(formData.get('business_name') ?? '').trim()
  const sector = String(formData.get('sector') ?? '').trim()

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios.' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName || 'Mi Negocio',
        sector: sector || 'Otro',
      },
    },
  })

  if (error) return { error: error.message }

  redirect('/inicio')
}

// ─── Login ───────────────────────────────────────────────────────
export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Ingresá tu email y contraseña.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Email o contraseña incorrectos.' }

  redirect('/inicio')
}

// ─── Logout ──────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
