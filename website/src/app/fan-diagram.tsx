"use client";

import { useEffect, useRef, useState } from "react";

export function FanDiagram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setPlay(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlay(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const stroke = "var(--fg)";

  return (
    <div ref={wrapRef}>
      <svg
        viewBox="0 0 720 360"
        width="100%"
        height="auto"
        role="img"
        aria-label="Five frameworks fanning into one decision node"
        className={`gm-fan ${play ? "gm-fan-play" : ""}`}
        style={{ display: "block", margin: "0 auto", maxWidth: "560px" }}
      >
        {/* central decision circle, slightly wobbly */}
        <path
          className="gm-fan-node"
          d="M 372 282 C 396 280, 414 296, 412 318 C 410 338, 388 348, 368 344 C 346 340, 336 320, 342 302 C 346 290, 358 282, 372 282 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Machiavelli (far left) */}
        <path
          className="gm-fan-line gm-line-1"
          d="M 72 56 C 130 110, 220 200, 348 304"
          fill="none"
          stroke="var(--color-machiavelli)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="gm-fan-line gm-line-1"
          d="M 340 296 L 360 308 L 338 312"
          fill="none"
          stroke="var(--color-machiavelli)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sun Tzu (left) */}
        <path
          className="gm-fan-line gm-line-2"
          d="M 200 36 C 232 110, 282 200, 360 296"
          fill="none"
          stroke="var(--color-suntzu)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="gm-fan-line gm-line-2"
          d="M 352 286 L 368 302 L 348 304"
          fill="none"
          stroke="var(--color-suntzu)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Leonardo (center top) */}
        <path
          className="gm-fan-line gm-line-3"
          d="M 372 28 C 374 100, 376 184, 378 290"
          fill="none"
          stroke="var(--color-leonardo)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="gm-fan-line gm-line-3"
          d="M 370 280 L 378 298 L 388 282"
          fill="none"
          stroke="var(--color-leonardo)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Newton (right) */}
        <path
          className="gm-fan-line gm-line-4"
          d="M 540 38 C 506 112, 458 198, 392 296"
          fill="none"
          stroke="var(--color-newton)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="gm-fan-line gm-line-4"
          d="M 400 286 L 388 302 L 408 304"
          fill="none"
          stroke="var(--color-newton)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Curie (far right) */}
        <path
          className="gm-fan-line gm-line-5"
          d="M 668 60 C 612 116, 522 204, 404 304"
          fill="none"
          stroke="var(--color-curie)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          className="gm-fan-line gm-line-5"
          d="M 412 296 L 400 312 L 422 312"
          fill="none"
          stroke="var(--color-curie)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* labels — mono, small, in framework colors */}
        <g
          fontFamily="var(--font-mono)"
          fontSize="11"
          style={{ letterSpacing: "0.08em" }}
        >
          <text
            className="gm-fan-label gm-label-1"
            x="40"
            y="46"
            textAnchor="start"
            fill="var(--color-machiavelli)"
          >
            MACHIAVELLI
          </text>
          <text
            className="gm-fan-label gm-label-2"
            x="200"
            y="22"
            textAnchor="middle"
            fill="var(--color-suntzu)"
          >
            SUN TZU
          </text>
          <text
            className="gm-fan-label gm-label-3"
            x="372"
            y="18"
            textAnchor="middle"
            fill="var(--color-leonardo)"
          >
            LEONARDO
          </text>
          <text
            className="gm-fan-label gm-label-4"
            x="540"
            y="24"
            textAnchor="middle"
            fill="var(--color-newton)"
          >
            NEWTON
          </text>
          <text
            className="gm-fan-label gm-label-5"
            x="680"
            y="50"
            textAnchor="end"
            fill="var(--color-curie)"
          >
            CURIE
          </text>
        </g>
      </svg>

      <div
        className="font-mono uppercase"
        style={{
          fontSize: "11px",
          letterSpacing: "0.18em",
          color: "var(--fg-dim)",
          textAlign: "center",
          marginTop: "32px",
        }}
      >
        Five frameworks. One decision. Yours.
      </div>
    </div>
  );
}
