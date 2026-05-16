import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  LAUNCH_DEAL_CAP,
  LAUNCH_DEAL_EXPIRES_AT_ISO,
  LAUNCH_DEAL_PRICE_USD,
  getLaunchDealStatus,
  isLaunchDealExpired,
} from '@/lib/pricing/launch-deal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key)
  }
  return _stripe
}

export async function GET() {
  const priceId = process.env.STRIPE_PRICE_LAUNCH_ANNUAL
  const expired = isLaunchDealExpired()

  if (!priceId) {
    return NextResponse.json({
      cap: LAUNCH_DEAL_CAP,
      claimed: 0,
      expired,
      available: false,
      priceUsd: LAUNCH_DEAL_PRICE_USD,
      expiresAt: LAUNCH_DEAL_EXPIRES_AT_ISO,
    })
  }

  try {
    const status = await getLaunchDealStatus(getStripe(), priceId)
    return NextResponse.json(status)
  } catch {
    return NextResponse.json({
      cap: LAUNCH_DEAL_CAP,
      claimed: 0,
      expired,
      available: false,
      priceUsd: LAUNCH_DEAL_PRICE_USD,
      expiresAt: LAUNCH_DEAL_EXPIRES_AT_ISO,
    }, { status: 503 })
  }
}
