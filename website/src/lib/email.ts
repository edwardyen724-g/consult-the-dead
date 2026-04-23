import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'onboarding@resend.dev'
const AGORA_URL = 'https://www.consultthedead.com/agora'

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const greeting = name ? `Hi ${name},` : 'Hi,'

  await resend.emails.send({
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

  await resend.emails.send({
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
