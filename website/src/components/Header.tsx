import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
