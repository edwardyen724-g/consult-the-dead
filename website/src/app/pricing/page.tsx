import PricingClient from './PricingClient'
import { getPricingStats } from '@/lib/pricing/live-stats'
import { PRICING_STATS_DEFAULT } from '@/lib/pricing/stats'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  let initialStats = PRICING_STATS_DEFAULT

  try {
    initialStats = await getPricingStats()
  } catch {
    // The page still renders with the fallback counts if live stats are unavailable.
  }

  return <PricingClient initialStats={initialStats} />
}
