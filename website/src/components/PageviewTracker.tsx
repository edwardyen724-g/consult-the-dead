"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Client-side pageview beacon. Fires on initial mount and on every
   SPA route change. Deduplicates rapid-fire calls for the same path
   (Next's usePathname can fire twice during hydration). */

const DEDUPE_MS = 1000;

function sendBeacon(path: string, referrer: string | null) {
  try {
    const body = JSON.stringify({ path, referrer });
    const blob = new Blob([body], { type: "application/json" });

    // Prefer sendBeacon — reliable on page-unload. Falls back to fetch
    // when navigator.sendBeacon isn't available (old browsers, SSR).
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const ok = navigator.sendBeacon("/api/ingest/pageview", blob);
      if (ok) return;
    }

    void fetch("/api/ingest/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow — metrics must never break UX */
    });
  } catch {
    /* swallow */
  }
}

export function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Dedupe same-path fires within a short window.
    const key = `__ctd_pv_${pathname}`;
    const last = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
    const now = Date.now();
    if (last && now - parseInt(last, 10) < DEDUPE_MS) return;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(key, String(now));
    }

    const referrer =
      typeof document !== "undefined" ? document.referrer || null : null;
    sendBeacon(pathname, referrer);
  }, [pathname]);

  return null;
}
