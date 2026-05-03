'use client'
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { isSignedIn } = useAuth()

  return (
    <header style={{
      borderBottom: '1px solid var(--hairline)',
      position: 'relative',
      zIndex: 50,
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>

        {/* Left: brand */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            fontWeight: 400,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}>
            The Agora
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginTop: '2px',
          }}>
            Consult the Dead
          </div>
        </Link>

        {/* Center: nav */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          flex: 1,
          justifyContent: 'center',
        }}>
          <Link href="/agora" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
          }}>
            The Agora
          </Link>
          <Link href="/frameworks" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
          }}>
            The Council
          </Link>
          {isSignedIn && (
            <Link href="/library" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              textDecoration: 'none',
            }}>
              Library
            </Link>
          )}
          <Link href="/pricing" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
          }}>
            Pricing
          </Link>
          <Link href="/essay" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            textDecoration: 'none',
          }}>
            About
          </Link>
        </nav>

        {/* Right: auth + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {!isSignedIn ? (
            <SignInButton mode="redirect">
              <button style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}>
                Sign in
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
          <Link href="/agora" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            borderRadius: '4px',
            background: 'var(--amber)',
            color: 'var(--bg)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Enter
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
