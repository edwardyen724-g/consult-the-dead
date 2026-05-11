'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[company-builder/app]', error);
  }, [error]);

  return (
    <main
      className="flex h-screen w-screen items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at top, rgba(244, 67, 54, 0.08), transparent 28%), linear-gradient(180deg, #0a0a0f 0%, #090910 100%)',
      }}
    >
      <section
        className="glass-panel w-full max-w-xl rounded-3xl px-8 py-7 text-center"
        role="alert"
        aria-live="assertive"
      >
        <div
          className="mb-3 text-[10px] uppercase tracking-[0.22em]"
          style={{
            color: '#F44336',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
          }}
        >
          Command center fault
        </div>
        <h1
          className="mb-3 text-2xl italic"
          style={{
            color: '#e4e4e7',
            fontFamily: 'var(--font-newsreader), serif',
          }}
        >
          The shell hit an unexpected runtime error.
        </h1>
        <p
          className="mx-auto max-w-lg text-[13px] leading-relaxed"
          style={{
            color: 'rgba(255,255,255,0.58)',
            fontFamily: 'var(--font-newsreader), serif',
          }}
        >
          The workspace is still intact. Retry the route or reload the app if the failure persists.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-white/5"
            style={{
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            Retry route
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-white/5"
            style={{
              color: '#71717a',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            Reload app
          </button>
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {error.digest ? `Digest ${error.digest}` : error.message}
        </div>
      </section>
    </main>
  );
}
