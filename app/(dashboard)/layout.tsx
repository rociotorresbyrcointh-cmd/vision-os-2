import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { TrialBanner } from '@/components/trial/TrialBanner'
import { TrialGate } from '@/components/trial/TrialGate'
import { PaymentBanner } from '@/components/trial/PaymentBanner'
import { getCurrentRole } from '@/lib/auth/role-server'
import { subStatus } from '@/lib/plans'

// Layout compartido por todas las páginas del dashboard.
// El proxy ya garantiza que hay sesión; acá traemos el nombre del negocio.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, social_enabled, plan, created_at, plan_status')
    .single()
  const role = await getCurrentRole()
  const sub = subStatus(org?.plan, org?.created_at, Date.now())
  const paymentIssue = org?.plan_status === 'past_due' || org?.plan_status === 'mp_paused'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07070F' }}>
      <Sidebar businessName={org?.name ?? 'Mi Negocio'} socialEnabled={org?.social_enabled ?? false} role={role} />
      <CommandPalette role={role} />
      <main className="vision-main" style={{ flex: 1, minWidth: 0 }}>
        {paymentIssue && <PaymentBanner />}
        {sub.state === 'trial' && <TrialBanner daysLeft={sub.daysLeft} />}
        {children}
      </main>
      {sub.state === 'expired' && <TrialGate isOwner={role === 'owner'} />}
    </div>
  )
}
