import { PublicBooking } from '@/components/public/PublicBooking'

export default async function ReservarPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params
  return <PublicBooking orgId={org} />
}
