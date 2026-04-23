'use client'
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { isSignedIn } = useAuth()

  return (
    <header className="border-b border-border relative z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
          style={{ minHeight: "44px" }}
        >
          <span
            className="font-mono text-xs uppercase tracking-widest text-ink"
            style={{ letterSpacing: "0.18em" }}
          >
            Consult The Dead
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/essay"
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Essay
          </Link>
          <Link
            href="/frameworks"
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Frameworks
          </Link>
          <Link
            href="/insights"
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Insights
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/agora"
            className="font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 rounded transition-colors"
            style={{
              background: "var(--amber)",
              color: "var(--bg)",
              letterSpacing: "0.14em",
            }}
          >
            Enter The Agora
          </Link>
          {!isSignedIn ? (
            <SignInButton mode="redirect">
              <button className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-ink transition-colors">
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
