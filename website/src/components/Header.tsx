import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border dark:border-border-dark">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {/* Monogram mark */}
          <span className="relative w-8 h-8 flex items-center justify-center">
            <span className="absolute inset-0 border border-ink/20 dark:border-ink-light/20 rounded-sm rotate-45 group-hover:rotate-[50deg] transition-transform duration-500" />
            <span className="font-serif text-sm font-semibold text-ink dark:text-ink-light tracking-tight relative z-10">
              Gm
            </span>
          </span>
          {/* Wordmark */}
          <span className="font-serif text-lg text-ink dark:text-ink-light" style={{ letterSpacing: "0.08em" }}>
            <span className="font-semibold">Great</span>
            <span className="font-light ml-0.5">Minds</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
