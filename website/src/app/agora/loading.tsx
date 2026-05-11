const ritualSteps = [
  {
    title: "Inviting minds",
    detail: "Historical voices are being queued into the council.",
  },
  {
    title: "Aligning context",
    detail: "The topic, prior turns, and constraints are settling in.",
  },
  {
    title: "Opening the hall",
    detail: "The live consultation is about to render.",
  },
];

const consultedMinds = [
  {
    label: "Council memory",
    note: "Pulling prior decisions into view",
  },
  {
    label: "Contradiction",
    note: "Arranging the strongest objections",
  },
  {
    label: "Consensus",
    note: "Preparing the final thread",
  },
];

export default function AgoraLoading() {
  return (
    <main
      aria-busy={true}
      role="status"
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(201,102,78,0.12),transparent_40%),linear-gradient(180deg,var(--bg-deep),var(--bg))] text-[color:var(--fg)]"
    >
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(201,102,78,0.18),transparent)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 sm:px-8 lg:px-10">
        <section className="w-full border border-[color:var(--hairline)] bg-[color:var(--bg)]/88 shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:p-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[color:var(--fg-faint)]">
                  The Agora
                </p>
                <div className="space-y-3">
                  <h1 className="max-w-xl font-serif text-4xl leading-[0.95] text-[color:var(--fg)] sm:text-5xl lg:text-6xl">
                    Gathering the council
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[color:var(--fg-dim)] sm:text-lg">
                    Consulted minds are being arranged into a deliberate entry sequence.
                    The thread, the voices, and the consensus rail will open together.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {ritualSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="border border-[color:var(--hairline)] bg-[color:var(--surface)] p-4"
                    style={{
                      animation: "pulse 2.8s ease-in-out infinite",
                      animationDelay: `${index * 180}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center border border-[color:var(--hairline)] bg-[color:var(--bg-deep)] font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--amber)]">
                        {index + 1}
                      </span>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--fg-faint)]">
                        Step {index + 1}
                      </p>
                    </div>
                    <h2 className="mt-3 font-serif text-xl text-[color:var(--fg)]">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--fg-dim)]">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border border-[color:var(--hairline)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[color:var(--fg-faint)]">
                    Consulted minds
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-[color:var(--fg)]">
                    Three voices in motion
                  </h2>
                </div>
                <div className="rounded-full border border-[color:var(--hairline)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--fg-dim)]">
                  loading
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="h-2 overflow-hidden border border-[color:var(--hairline)] bg-[color:var(--bg-deep)]">
                  <div
                    className="h-full w-1/2 bg-[linear-gradient(90deg,var(--amber),rgba(201,102,78,0.15),var(--amber))] [background-size:200%_100%]"
                    style={{
                      animation: "pulse 2.4s ease-in-out infinite",
                    }}
                  />
                </div>

                <div className="grid gap-3">
                  {consultedMinds.map((mind, index) => (
                    <div
                      key={mind.label}
                      className="flex items-center gap-4 border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-3"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            index === 0 ? "var(--amber)" : index === 1 ? "var(--fg-dim)" : "var(--green)",
                          boxShadow:
                            index === 0
                              ? "0 0 0 4px rgba(201, 102, 78, 0.1)"
                              : index === 1
                                ? "0 0 0 4px rgba(255, 255, 255, 0.05)"
                                : "0 0 0 4px rgba(90, 138, 90, 0.12)",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg text-[color:var(--fg)]">{mind.label}</p>
                        <p className="text-sm leading-6 text-[color:var(--fg-dim)]">{mind.note}</p>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--fg-faint)]">
                        queued
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-[color:var(--hairline)] pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[color:var(--fg-faint)]">
                  Transition cue
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--fg-dim)]">
                  The chamber is not blank. It is being composed, voice by voice, before the council opens.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
