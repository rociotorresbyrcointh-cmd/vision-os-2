// Tipos y helpers PUROS de roles (se pueden usar en cliente y servidor).
// Las funciones que tocan Supabase/redirect viven en ./role-server.

export type Role = 'owner' | 'admin' | 'staff' | 'readonly'

// Etiquetas amigables para la UI
export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Dueño',
  admin: 'Recepción',
  staff: 'Profesional',
  readonly: 'Solo lectura',
}

// Qué rutas puede ver cada rol. El dueño ve todo.
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/inicio': ['owner', 'admin', 'staff', 'readonly'],
  '/agenda': ['owner', 'admin', 'staff', 'readonly'],
  '/espera': ['owner', 'admin', 'staff'],
  '/pacientes': ['owner', 'admin', 'staff'],
  '/pagos': ['owner', 'admin'],
  '/reportes': ['owner'],
  '/crecimiento': ['owner'],
  '/reservas': ['owner', 'admin'],
  '/profesionales': ['owner', 'admin'],
  '/servicios': ['owner', 'admin'],
  '/bloqueos': ['owner', 'admin'],
  '/whatsapp': ['owner', 'admin'],
  '/recordatorios': ['owner', 'admin'],
  '/redes': ['owner'],
  '/papelera': ['owner', 'admin'],
  '/guia': ['owner', 'admin', 'staff', 'readonly'],
  '/configuracion': ['owner'],
  '/equipo': ['owner'],
  '/plan': ['owner'],
}

export function canSee(href: string, role: Role): boolean {
  const allowed = ROUTE_ROLES[href]
  return allowed ? allowed.includes(role) : role === 'owner'
}
