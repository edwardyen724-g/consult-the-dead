/**
 * Public surface of the retention email subsystem.
 *
 * Import templates / send wrappers / suppression helpers from this entry
 * so code outside src/lib/emails/* doesn't need to know the internal
 * file layout.
 */

export {
  buildBeehiivSubscribePayload,
  subscribeToBeehiiv,
  type BeehiivSubscribeInput,
  type BeehiivSubscribePayload,
  type BeehiivSubscribeResult,
} from './beehiiv'

export {
  buildUtmUrl,
  type RetentionCampaign,
  type BuildUtmUrlInput,
} from './utm'

export {
  evaluateSuppression,
  isUserEligible,
  resolveSuppressionMetadata,
  type SuppressionReason,
  type SuppressionResult,
} from './suppression'

export {
  renderWelcome,
  WELCOME_EMAIL_ID,
  type WelcomeVariables,
} from './templates/welcome'
export { renderRecap, RECAP_EMAIL_ID } from './templates/recap'
export {
  renderNudge,
  NUDGE_EMAIL_ID,
  NUDGE_PROMPTS,
  type NudgeVariables,
} from './templates/nudge'
export { renderDigest, DIGEST_EMAIL_ID } from './templates/digest'

export {
  sendDigest,
  sendNudge,
  sendRecap,
  sendRendered,
  sendWelcome,
  recapScheduledAt,
  type SendOptions,
  type SendResult,
} from './send'

export {
  authorizeCronRequest,
  isInNudgeWindow,
  runDigestCron,
  runNudgeCron,
  type CronSummary,
} from './cron'

export type {
  DigestUserCandidate,
  DigestVariables,
  NudgeUserCandidate,
  RecapVariables,
  RenderedEmail,
  SuppressionMetadata,
} from './types'
