import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import {
  SIGN_UP_TIER_COPY,
  buildSignUpUnsafeMetadata,
  type SignUpRouteSearchParams,
} from "./utm-stamper";

type PageProps = {
  searchParams: Promise<SignUpRouteSearchParams>;
};

const ACCENT = "var(--red)";

export default async function SignUpPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const unsafeMetadata = buildSignUpUnsafeMetadata(sp);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(165, 42, 42, 0.08), transparent 34%), var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "56px 24px 88px",
        }}
      >
        <Link
          href="/agora"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          <span aria-hidden="true">←</span>
          Return to Agora
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <section
            style={{
              padding: "32px 0 0",
              maxWidth: "560px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--fg-faint)",
                marginBottom: "18px",
              }}
            >
              Sign up
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                lineHeight: 1.04,
                fontWeight: 400,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Start with 3 free agons today.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                lineHeight: 1.65,
                color: "var(--fg-dim)",
                marginTop: "24px",
                maxWidth: "50ch",
              }}
            >
              Create an account only if you want to save your work, keep your
              place, or move from Free to BYO key or Pro later. Free stays
              lightweight: no card required, 3 debates a day, and 2–3 minds.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "14px",
                marginTop: "32px",
              }}
            >
              {SIGN_UP_TIER_COPY.map((tier) => (
                <article
                  key={tier.name}
                  style={{
                    border: "1px solid var(--hairline)",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "18px 16px 16px",
                    minHeight: "156px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: tier.color ?? "var(--fg-dim)",
                      marginBottom: "12px",
                    }}
                  >
                    {tier.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.98rem",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {tier.copy}
                  </p>
                </article>
              ))}
            </div>

            <div
              style={{
                marginTop: "28px",
                paddingTop: "24px",
                borderTop: "1px solid var(--hairline)",
                display: "grid",
                gap: "10px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-faint)",
                }}
              >
                What happens next
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                If you came from a free-flow gate, you will drop back into the
                Agora after signup. If you arrived with utm_source and
                utm_campaign, we stamp them into Clerk&apos;s unsafe metadata so
                the user.created webhook can attribute the signup cleanly.
              </p>
            </div>
          </section>

          <section
            style={{
              position: "relative",
              border: "1px solid var(--hairline)",
              borderRadius: "18px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
              padding: "22px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--fg-faint)",
                  margin: 0,
                }}
              >
                Account creation
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: ACCENT,
                  margin: 0,
                }}
              >
                Free signup
              </p>
            </div>

            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/agora"
              signInFallbackRedirectUrl="/agora"
              unsafeMetadata={unsafeMetadata}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
