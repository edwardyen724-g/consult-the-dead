'use client'
import { useState } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINK_STYLE = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: 'var(--fg-dim)',
  textDecoration: 'none',
};

export function Header() {
  const { isSignedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (
    <>
      <Link href="/agora" style={NAV_LINK_STYLE} onClick={() => setMobileOpen(false)}>
        The Agora
      </Link>
      <Link href="/frameworks" style={NAV_LINK_STYLE} onClick={() => setMobileOpen(false)}>
        The Council
      </Link>      {isSignedIn && (
        <Link href="/library" style={NAV_LINK_STYLE} onClick={() => setMobileOpen(false)}>
          Library
        </Link>
      )}
      <Link href="/pricing" style={NAV_LINK_STYLE} onClick={() => setMobileOpen(false)}>
        Pricing
      </Link>
      <Link href="/essay" style={NAV_LINK_STYLE} onClick={() => setMobileOpen(false)}>
        About
      </Link>
    </>
  )

  return (
    <header style={{
      borderBottom: '1px solid var(--hairline)',
      position: 'relative',
      zIndex: 50,
      background: 'var(--bg)',
    }}>
      <style>{`
        .gm-nav-desktop { display: flex; }
        .gm-nav-hamburger { display: none; }
        .gm-nav-mobile-overlay { display: none; }
        .gm-right-signin { display: inline; }        @media (max-width: 768px) {
          .gm-nav-desktop { display: none !important; }
          .gm-nav-hamburger { display: flex !important; }
          .gm-nav-mobile-overlay[data-open="true"] { display: flex !important; }
          .gm-right-signin { display: none !important; }
        }
      `}</style>
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
          </div>          <div style={{
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

        {/* Center: nav (desktop) */}
        <nav className="gm-nav-desktop" style={{
          alignItems: 'center',
          gap: '28px',
          flex: 1,
          justifyContent: 'center',
        }}>
          {navLinks}
        </nav>

        {/* Right: auth + CTA + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <span className="gm-right-signin">
            {!isSignedIn ? (
              <SignInButton mode="redirect">
                <button style={{                  fontFamily: 'var(--font-mono)',
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
          </span>
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
          </Link>          <ThemeToggle />

          {/* Hamburger button (mobile only) */}
          <button
            className="gm-nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--fg-dim)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <div
        className="gm-nav-mobile-overlay"
        data-open={mobileOpen ? "true" : "false"}
        style={{
          flexDirection: 'column',
          gap: '20px',
          padding: '24px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--hairline)',
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 49,
        }}
      >
        {navLinks}
        {!isSignedIn && (
          <SignInButton mode="redirect">            <button style={{
              ...NAV_LINK_STYLE,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
            }}>
              Sign in
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  )
}
