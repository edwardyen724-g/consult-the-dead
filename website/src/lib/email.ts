import { Resend } from 'resend'

// Lazy-initialised Resend client. Constructing `new Resend(...)` at module
// top-level forces `next build` page-data collection to fail when this
// module is reached during build without RESEND_API_KEY set. Defer to first
// send call so the build can statically inspect API routes that import it.
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = 'notifications@consultthedead.com'
const AGORA_URL = 'https://www.consultthedead.com/agora'

type RecapEmailUser = {
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  firstName?: string | null
}

type NudgeEmailUser = {
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  firstName?: string | null
}

type DigestEmailUser = {
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId?: string | null
  firstName?: string | null
}

type RecapEmailAgon = {
  topic: string
  share_id: string | null
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const greeting = name ? `Hi ${name},` : 'Hi,'

  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Welcome to the Agora',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${greeting}</p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Your account is set up. You now have access to the Agora — a council of historical minds
      that will argue your decisions out on your behalf.
    </p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      The free tier gives you <strong style="color:#D4A574;">3 agons per day</strong>.
      Each agon runs your decision through 2–5 frameworks — Newton's first-principles decomposition,
      Machiavelli's power analysis, Curie's evidence standards, and more.
      They disagree. That's the point.
    </p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 36px;">
      Bring a real decision. The harder the better.
    </p>

    <a href="${AGORA_URL}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Enter the Agora
    </a>

    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">

    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">
      You're receiving this because you created an account at consultthedead.com.
      Questions? Reply to this email or reach Edward directly at edwardyen724@gmail.com.
    </p>

  </div>
</body>
</html>`,
  })
}

export async function sendSubscriptionConfirmation(
  to: string,
  name: string,
  plan: string
): Promise<void> {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  const isAnnual = plan === 'annual'
  const planLabel = isAnnual ? 'Agora Pro — Annual' : 'Agora Pro — Monthly'
  const planDetail = isAnnual
    ? '$300/year, locked as founding-member pricing for life'
    : '$30/month'

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `You're on Pro`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${greeting}</p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Your Pro subscription is active. Here's what changed:
    </p>

    <ul style="margin:0 0 28px;padding-left:0;list-style:none;">
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;border-bottom:1px solid #1F1F22;">
        <strong style="color:#D4A574;">Plan</strong> — ${planLabel}
      </li>
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;border-bottom:1px solid #1F1F22;">
        <strong style="color:#D4A574;">Price</strong> — ${planDetail}
      </li>
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;border-bottom:1px solid #1F1F22;">
        <strong style="color:#D4A574;">Agons</strong> — 100 per month (up from 3/day)
      </li>
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;border-bottom:1px solid #1F1F22;">
        <strong style="color:#D4A574;">Council size</strong> — up to 5 minds per agon
      </li>
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;border-bottom:1px solid #1F1F22;">
        <strong style="color:#D4A574;">Synthesis</strong> — Opus (the strongest model) on final recommendations
      </li>
      <li style="font-size:1rem;line-height:1.7;padding:8px 0;">
        <strong style="color:#D4A574;">Founder support</strong> — reply to this email, 48h response from Edward
      </li>
    </ul>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 36px;">
      Manage or cancel your subscription anytime from your account page.
    </p>

    <a href="${AGORA_URL}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Enter the Agora
    </a>

    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">

    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">
      Receipt and billing details are available in your
      <a href="https://www.consultthedead.com/account" style="color:#8A8A88;">account page</a>.
      Questions? Reply here — this goes directly to Edward.
    </p>

  </div>
</body>
</html>`,
  })
}

export async function sendFirstAgonRecap(user: RecapEmailUser, agon: RecapEmailAgon): Promise<void> {
  const email =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('sendFirstAgonRecap: missing recipient email')
  }

  const greeting = user.firstName ? `Hi ${user.firstName},` : 'Hi,'
  const recapUrl = agon.share_id ? `${AGORA_URL}/a/${agon.share_id}` : AGORA_URL

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your first agon recap: ${agon.topic}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${greeting}</p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Your first agon has finished running. The council has prepared a recap for:
    </p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 28px;">
      <strong style="color:#D4A574;">${agon.topic}</strong>
    </p>

    <a href="${recapUrl}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      View the recap
    </a>

    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">

    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">
      You are receiving this because you ran an agon on consultthedead.com.
      Questions? Reply to this email or reach Edward directly at edwardyen724@gmail.com.
    </p>

  </div>
</body>
</html>`,
  })
}

export async function sendDay2Nudge(user: NudgeEmailUser): Promise<void> {
  const email =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('sendDay2Nudge: missing recipient email')
  }

  const greeting = user.firstName ? `Hi ${user.firstName},` : 'Hi,'
  const agoraUrl = `${AGORA_URL}?utm_source=email&utm_campaign=nudge&utm_content=day2_nudge_v1`

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'The council is ready for your first question',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${greeting}</p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      You signed up yesterday. The council — Newton, Machiavelli, Curie, and others — is still waiting
      for your first question.
    </p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 20px;">
      Bring a real decision. The Agora is built for the ones that keep you up at night.
    </p>

    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 36px;">
      Each agon runs your question through 2–5 frameworks. They disagree. You decide.
    </p>

    <a href="${agoraUrl}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;">
      Start your first agon
    </a>

    <hr style="border:none;border-top:1px solid #1F1F22;margin:48px 0 24px;">

    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">
      You are receiving this because you created an account at consultthedead.com.
      Questions? Reply to this email or reach Edward directly at edwardyen724@gmail.com.
    </p>

  </div>
</body>
</html>`,
  })
}

export type WeeklyDigestConfig = {
  featuredTopic: string
  featuredConsensus: string
  featuredShareId: string
  newMindName?: string | null
  newMindTagline?: string | null
  newMindHowArgues?: string | null
}

export async function sendWeeklyDigest(
  user: DigestEmailUser,
  config: WeeklyDigestConfig
): Promise<void> {
  const email =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('sendWeeklyDigest: missing recipient email')
  }

  const greeting = user.firstName ? `Hi ${user.firstName},` : 'Hi,'
  const featuredUrl = `${AGORA_URL}/a/${config.featuredShareId}?utm_source=email&utm_campaign=digest&utm_content=digest_v1`
  const agoraUrl = `${AGORA_URL}?utm_source=email&utm_campaign=digest&utm_content=digest_v1_cta`

  const newMindBlock =
    config.newMindName
      ? `
    <hr style="border:none;border-top:1px solid #1F1F22;margin:32px 0;">
    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 12px;">
      New mind
    </p>
    <p style="font-size:1.05rem;line-height:1.7;margin:0 0 8px;">
      <strong style="color:#D4A574;">${config.newMindName}</strong>${config.newMindTagline ? ` — ${config.newMindTagline}` : ''}
    </p>
    ${config.newMindHowArgues ? `<p style="font-size:0.95rem;line-height:1.7;color:#EDEDEC;margin:0 0 20px;">${config.newMindHowArgues}</p>` : ''}
`
      : ''

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'This week in the Agora',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Georgia,'Times New Roman',serif;color:#EDEDEC;">
  <div style="max-width:560px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 32px;">
      Consult The Dead — Weekly Digest
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 20px;">${greeting}</p>

    <p style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A8A88;margin:0 0 12px;">
      Featured debate this week
    </p>

    <p style="font-size:1.1rem;line-height:1.7;margin:0 0 12px;">
      <strong style="color:#D4A574;">${config.featuredTopic}</strong>
    </p>

    <p style="font-size:1rem;line-height:1.7;color:#EDEDEC;margin:0 0 24px;">
      ${config.featuredConsensus}
    </p>

    <a href="${featuredUrl}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;background:#D4A574;color:#0A0A0B;text-decoration:none;border-radius:4px;margin-bottom:32px;">
      Read the full debate
    </a>
    ${newMindBlock}
    <hr style="border:none;border-top:1px solid #1F1F22;margin:32px 0 24px;">

    <a href="${agoraUrl}"
       style="display:inline-block;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:10px 20px;border:1px solid #3A3A3D;color:#EDEDEC;text-decoration:none;border-radius:4px;">
      Run your own agon
    </a>

    <hr style="border:none;border-top:1px solid #1F1F22;margin:32px 0 24px;">

    <p style="font-size:0.8rem;line-height:1.6;color:#8A8A88;margin:0;">
      You are receiving this because you have an account at consultthedead.com.
      Questions? Reply to this email or reach Edward directly at edwardyen724@gmail.com.
    </p>

  </div>
</body>
</html>`,
  })
}
