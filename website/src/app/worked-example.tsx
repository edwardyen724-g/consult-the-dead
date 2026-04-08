"use client";

import { useEffect, useRef } from "react";

interface Speaker {
  name: string;
  tag: string;
  body: string;
}

const speakers: Speaker[] = [
  {
    name: "SUN TZU",
    tag: "what terrain the fight is being decided on",
    body:
      "The rival faction committed to cloning living creators and their labor. That terrain is already on fire with backlash. Our terrain — frameworks extracted from the public-domain dead — is empty. Ship what you have, open source, with no roadmap. Let them burn themselves out on ground we do not need to hold.",
  },
  {
    name: "MACHIAVELLI",
    tag: "where fortuna's wind is blowing",
    body:
      "Neutrality is death. A narrative window opened when the backlash began; it closes in weeks. Ship the one working mode this week as a capability demonstration, not a moral appeal. Display the contrast. Let readers draw the conclusion themselves.",
  },
  {
    name: "LEONARDO",
    tag: "what the dissection reveals",
    body:
      "My single most expensive lesson: private investigation does not compound until it touches other minds. I died with notebooks that nobody read for three hundred years. The constraint — one working mode — is not a weakness to hide. It is the underpainting of the Last Supper. Ship it.",
  },
];

const synthesisBody =
  "Three independent frameworks converge: ship debate mode open source this week, frame the constraint as positioning, do not attack the clones — stand orthogonal. The money is downstream of the position, and the position only exists if you ship now.";

export function WorkedExample() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(".gm-fade"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const idx = Number(el.dataset.idx ?? 0);
            window.setTimeout(() => {
              el.classList.add("gm-visible");
            }, idx * 150);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mx-auto" style={{ maxWidth: "880px" }}>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: "12px",
          letterSpacing: "0.08em",
          color: "var(--fg-dim)",
        }}
      >
        The decision
      </div>
      <p
        className="mt-4"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(24px, 3vw, 32px)",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
        }}
      >
        Should we launch our half-built product open source now, or keep
        building before we ship?
      </p>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--hairline)",
          margin: "48px 0",
        }}
      />

      <div className="space-y-16">
        {speakers.map((s, i) => (
          <div key={s.name} className="gm-fade" data-idx={i}>
            <div
              className="font-mono uppercase"
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                color: "var(--fg-dim)",
              }}
            >
              {s.name}
            </div>
            <div
              className="mt-2 italic"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--fg-dim)",
              }}
            >
              {s.tag}
            </div>
            <p
              className="mt-4"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "19px",
                lineHeight: 1.65,
                maxWidth: "62ch",
              }}
            >
              {s.body}
            </p>
          </div>
        ))}

        <div className="gm-fade" data-idx={speakers.length}>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "var(--amber)",
            }}
          >
            Synthesis
          </div>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: 1.65,
              maxWidth: "62ch",
            }}
          >
            {synthesisBody}
          </p>
        </div>
      </div>
    </div>
  );
}
