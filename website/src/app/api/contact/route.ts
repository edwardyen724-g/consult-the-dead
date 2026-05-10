import { NextResponse } from "next/server";

// Posts each contact submission to a Discord channel via webhook.
// Set DISCORD_WEBHOOK_URL in Vercel env vars (Production + Preview).
// If the env var is missing the route still returns ok and just logs to
// the function output, so the form keeps working during local dev.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      decision?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const decision = (body.decision ?? "").trim();

    if (!name || !email || !decision) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 },
      );
    }

    // Cheap length guards. The textarea is generous but Discord has a 2000
    // character total embed/content cap and we want to leave headroom.
    const safeName = name.slice(0, 200);
    const safeEmail = email.slice(0, 200);
    const safeDecision = decision.slice(0, 1500);

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (webhook) {
      // Discord webhook payload — uses an embed so the decision text is
      // formatted readably and the email is one click to copy.
      const payload = {
        username: "Consult The Dead",
        embeds: [
          {
            title: "New decision submitted",
            color: 0xd4a574, // amber
            fields: [
              { name: "Name", value: safeName, inline: true },
              { name: "Email", value: safeEmail, inline: true },
              { name: "Decision", value: safeDecision },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        const res = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error(
            "[contact] Discord webhook failed",
            res.status,
            await res.text().catch(() => ""),
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[contact] Discord webhook threw", err);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log("[contact] no DISCORD_WEBHOOK_URL set, submission:", {
        name: safeName,
        email: safeEmail,
        decision: safeDecision,
        receivedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
