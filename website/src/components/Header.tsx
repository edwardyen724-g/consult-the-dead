import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-ink dark:text-ink-light hover:text-accent transition-colors"
        >
          Great Minds
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
