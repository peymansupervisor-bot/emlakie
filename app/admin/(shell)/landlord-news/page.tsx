import { requireAdmin } from '@/lib/admin/auth'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import LandlordNewsSender from '@/components/admin/LandlordNewsSender'

export default async function LandlordNewsPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="EMLAKIE Update"
        description="Send the recurring landlord newsletter. One personalized email per landlord — no shared To/BCC list, each with its own unsubscribe link."
      />
      <LandlordNewsSender />
    </div>
  )
}
