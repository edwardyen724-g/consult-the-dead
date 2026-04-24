'use client'
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { isSignedIn } = useAuth()

  return (
    <header
      style={{
        borderBottom: "1px solid var(--hairline)",
        background: "var(--bg)",
      }}
      className="relative z-50"
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="group hover:opacity-75 transition-opacity"
          style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
        >
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "18px",
              letterSpacing: "0.01em",
              color: "var(--fg)",
              fontWeight: 400,
            }}
          >
            Consult The Dead
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/essay"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              fontVariant: "small-caps",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
          >
            Essay
          </Link>
          <Link
            href="/frameworks"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              fontVariant: "small-caps",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
          >
            Frameworks
          </Link>
          <Link
            href="/insights"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              fontVariant: "small-caps",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
          >
            Insights
          </Link>
          <Link
            href="/pricing"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              fontVariant: "small-caps",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              textDecoration: "none",
              transition: "color 200ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
          >
            Pricing
          </Link>
          {isSignedIn && (
            <Link
              href="/library"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "13px",
                fontVariant: "small-caps",
                letterSpacing: "0.08em",
                color: "var(--fg-dim)",
                textDecoration: "none",
                transition: "color 200ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
            >
              Library
            </Link>
          )}
          <Link
            href="/agora"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "0.04em",
              padding: "6px 16px",
              background: "var(--amber)",
              color: "var(--bg)",
              textDecoration: "none",
              border: "1px solid var(--amber)",
              transition: "opacity 150ms ease-out",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Enter the Agora
          </Link>
          {!isSignedIn ? (
            <SignInButton mode="redirect">
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--font-serif)",
                  fontSize: "13px",
                  fontVariant: "small-caps",
                  letterSpacing: "0.08em",
                  color: "var(--fg-dim)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 200ms ease-out",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-dim)"; }}
              >
                Sign in
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
