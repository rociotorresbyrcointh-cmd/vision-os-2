'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

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
  // Adónde mandar después de registrarse (solo rutas internas)
  const nextRaw = String(formData.get('next') ?? '')
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/inicio'

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

  // Email de bienvenida (no bloquea si Resend no está configurado)
  await sendWelcomeEmail(email, businessName)

  redirect(next)
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

// ─── Recuperar contraseña ────────────────────────────────────────
// Envía un email con un link para restablecer la contraseña.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://visionturnos.online'

export async function requestPasswordReset(
  _prev: { error?: string; sent?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Ingresá tu email.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/auth/callback?next=/actualizar-contrasena`,
  })

  // No revelamos si el email existe o no (seguridad): siempre "enviado".
  if (error && !/rate limit|too many/i.test(error.message)) {
    return { error: 'No pudimos enviar el email. Probá de nuevo.' }
  }
  return { sent: true }
}

// Guarda la nueva contraseña (el usuario ya tiene sesión de recuperación).
export async function updatePassword(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }
  if (password !== confirm) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'El link venció. Pedí uno nuevo desde “Recuperar contraseña”.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/inicio')
}

// ─── Logout ──────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
