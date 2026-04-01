export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        {/* Subtle horizontal rule */}
        <div className="border-t border-border dark:border-border-dark" />

        <div className="py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Site identity */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-muted dark:text-muted-dark" style={{ letterSpacing: "0.06em" }}>
              <span className="font-medium">Great</span>
              <span className="font-light ml-0.5">Minds</span>
            </span>
            <span className="text-border dark:text-border-dark mx-1">/</span>
            <span className="text-[11px] text-muted/60 dark:text-muted-dark/60 italic">
              A Library of Living Minds
            </span>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] leading-[1.7] text-muted/70 dark:text-muted-dark/70 max-w-lg" style={{ letterSpacing: "0.01em" }}>
            The frameworks presented on this site are analytical models derived
            from publicly available information. They represent one
            interpretation of documented decisions and behaviors, not definitive
            psychological profiles. Not affiliated with, endorsed by, or
            connected to any individual whose public decisions may have informed
            these frameworks.
          </p>
        </div>
      </div>
    </footer>
  );
}
