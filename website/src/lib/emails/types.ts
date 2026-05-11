/**
 * Shared types for the retention email subsystem.
 */

import type { RetentionCampaign } from './utm'

export interface RenderedEmail {
  subject: string
  html: string
  /** Plain-text version for deliverability / clients that prefer it. */
  text: string
}

/**
 * Subset of Clerk user metadata the suppression layer cares about.
 * Wider Clerk types are intentionally not imported — keeping this narrow
 * makes unit tests trivial and keeps the cron handler decoupled from
 * Clerk SDK shape changes.
 */
export interface SuppressionMetadata {
  /** publicMetadata.subscription_tier from Clerk. */
  subscriptionTier?: string | null
  /**
   * privateMetadata.email_unsubscribed (per task spec). The marketing brief
   * also references publicMetadata.email_opted_out — we accept either via
   * the resolveSuppressionMetadata adapter.
   */
  emailUnsubscribed?: boolean
  /** privateMetadata.email_bounce_count for hard bounces. */
  emailBounceCount?: number
}

export interface NudgeUserCandidate {
  clerkUserId: string
  email: string
  firstName?: string | null
  /** ISO timestamp of Clerk user.created. */
  createdAt: string
  /** Number of agons the user has run since signup. */
  agonCount: number
  suppression: SuppressionMetadata
}

export interface DigestUserCandidate {
  clerkUserId: string
  email: string
  firstName?: string | null
  suppression: SuppressionMetadata
}

export interface RecapVariables {
  firstName?: string | null
  agonTopic: string
  councilNames: string[]
  consensusExcerpt: string
  agonShareId: string
  agonsRemaining: number | 'unlimited' | null
}

export interface DigestVariables {
  firstName?: string | null
  featuredAgonTopic: string
  featuredConsensusExcerpt: string
  featuredAgonShareId: string
  newMindName?: string | null
  newMindTagline?: string | null
  newMindHowArguesBlurb?: string | null
  agonsRemaining: number | 'unlimited' | null
  unsubscribeUrl: string
}

export type { RetentionCampaign }
