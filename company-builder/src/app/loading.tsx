import type { ReactNode } from 'react';

/**
 * Next.js app-router loading.tsx — rendered automatically while the
 * page.tsx server component suspends or before the client shell hydrates.
 *
 * Shows a three-column skeleton that mirrors the real app-shell layout
 * (Mind Library | Canvas | Panels) so the page feels instantaneous on cold
 * load rather than showing a blank screen.
 */
export default function Loading() {
  return (
    <main
      className="h-screen w-screen overflow-hidden"
      aria-label="Loading company builder"
      style={{
        background:
          'radial-gradient(circle at top, rgba(120, 200, 160, 0.07), transparent 30%), linear-gradient(180deg, #0a0a0f 0%, #090910 100%)',
      }}
    >
      <div className="h-full w-full grid grid-cols-[280px_minmax(0,1fr)_340px] gap-0">
        <ShellPane title="Mind Library" className="border-r border-white/5">
          <LoadingBars count={6} />
        </ShellPane>
        <ShellPane title="Canvas" className="border-r border-white/5">
          <CanvasLoader />
        </ShellPane>
        <ShellPane title="Panels">
          <LoadingBars count={4} />
        </ShellPane>
      </div>
    </main>
  );
}

function ShellPane({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col p-5 ${className}`}>
      <div
        className="mb-4 text-[10px] uppercase tracking-[0.18em]"
        style={{
          color: 'rgba(255,255,255,0.25)',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
        }}
      >
        {title}
      </div>
      <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        {children}
      </div>
    </section>
  );
}

function LoadingBars({ count }: { count: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-10 rounded-xl animate-pulse"
          style={{
            background:
              index % 2 === 0
                ? 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(120, 200, 160, 0.05), rgba(255,255,255,0.04))'
                : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        />
      ))}
    </div>
  );
}

function CanvasLoader() {
  return (
    <div
      className="relative flex h-full min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0f]"
      role="status"
      aria-label="Initializing canvas"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 20%, rgba(120, 200, 160, 0.15) 0, transparent 18%), radial-gradient(circle at 75% 30%, rgba(244, 67, 54, 0.12) 0, transparent 20%), radial-gradient(circle at 50% 75%, rgba(255, 255, 255, 0.06) 0, transparent 18%)',
        }}
      />
      <div className="relative text-center">
        <div
          className="mb-3 text-[10px] uppercase tracking-[0.22em]"
          style={{
            color: 'rgba(255,255,255,0.24)',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
          }}
        >
          Initializing command center
        </div>
        <div
          className="text-[13px] italic"
          style={{
            color: 'rgba(255,255,255,0.56)',
            fontFamily: 'var(--font-newsreader), serif',
          }}
        >
          Loading company memory, panels, and canvas state...
        </div>
      </div>
    </div>
  );
}
