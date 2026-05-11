import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

const ESSAY_OG_IMAGE_URL = "https://www.consultthedead.com/essay/opengraph-image";

export const metadata: Metadata = {
  title: "Consulting the Dead, Not Distilling the Living — Consult The Dead",
  description: "The operation we are doing instead.",
  openGraph: {
    title: "Consulting the Dead, Not Distilling the Living",
    description: "The operation we are doing instead.",
    url: "https://www.consultthedead.com/essay",
    images: [
      {
        url: ESSAY_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Consulting the Dead, Not Distilling the Living — Consult The Dead",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulting the Dead, Not Distilling the Living",
    description: "The operation we are doing instead.",
    images: [ESSAY_OG_IMAGE_URL],
  },
};

// Minimal markdown renderer.
// Supports: # h1, ## h2, ### h3, paragraphs, [text](url) inline links, *italic*.
// react-markdown is not installed and the spec says do not add deps.
function renderMarkdown(md: string): { blocks: ParsedBlock[]; firstPara: string } {
  const lines = md.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];
  let buf: string[] = [];
  let firstPara = "";

  const flush = () => {
    if (buf.length) {
      const content = buf.join(" ");
      if (!firstPara && blocks.some((b) => b.type === "h1")) {
        firstPara = content;
      }
      blocks.push({ type: "p", content });
      buf = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", content: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", content: line.slice(3) });
    } else if (line.startsWith("# ")) {
      flush();
      blocks.push({ type: "h1", content: line.slice(2) });
    } else if (line.trim() === "") {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();

  return { blocks, firstPara };
}

interface ParsedBlock {
  type: string;
  content: string;
}

function renderInline(text: string): React.ReactNode[] {
  // Tokenize for [text](url) and *em* and `code`.
  const out: React.ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;
  const flushBuf = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === "[") {
      const closeBracket = text.indexOf("]", i);
      if (closeBracket > -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen > -1) {
          flushBuf();
          const label = text.slice(i + 1, closeBracket);
          const url = text.slice(closeBracket + 2, closeParen);
          out.push(
            <a
              key={`l${key++}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--fg)",
                textDecoration: "underline",
                textDecorationColor: "var(--fg-dim)",
                textUnderlineOffset: "3px",
              }}
            >
              {label}
            </a>,
          );
          i = closeParen + 1;
          continue;
        }
      }
    }
    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      if (close > -1) {
        flushBuf();
        out.push(
          <code
            key={`c${key++}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.92em",
              color: "var(--fg-dim)",
            }}
          >
            {text.slice(i + 1, close)}
          </code>,
        );
        i = close + 1;
        continue;
      }
    }
    if (ch === "*") {
      const close = text.indexOf("*", i + 1);
      if (close > -1) {
        flushBuf();
        out.push(
          <em key={`e${key++}`} style={{ fontStyle: "italic" }}>
            {text.slice(i + 1, close)}
          </em>,
        );
        i = close + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flushBuf();
  return out;
}

/**
 * Pull-quote candidates: first sentence of h2 sections.
 * We surface at most 3 pull-quotes at the h2 positions in the text.
 */
function extractPullQuotes(blocks: ParsedBlock[]): Map<number, string> {
  const quotes = new Map<number, string>();
  let count = 0;
  for (let i = 0; i < blocks.length && count < 3; i++) {
    if (blocks[i]!.type === "h2") {
      // Look for the next paragraph to pull a quote from
      for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[j]!.type === "p") {
          // Take first sentence (up to 90 chars)
          const full = blocks[j]!.content;
          const sentence = full.split(/(?<=[.!?])\s/)[0] ?? full;
          const trimmed = sentence.length > 100 ? sentence.slice(0, 97) + "…" : sentence;
          quotes.set(i, trimmed);
          count++;
          break;
        }
      }
    }
  }
  return quotes;
}

export default function EssayPage() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "consulting-the-dead.md",
  );
  let md = "";
  try {
    md = fs.readFileSync(filePath, "utf-8");
  } catch {
    md = "# Essay not found\n\nThe essay markdown file is missing.";
  }

  const { blocks } = renderMarkdown(md);
  const pullQuotes = extractPullQuotes(blocks);

  // Approximate reading time
  const wordCount = md.trim().split(/\s+/).length;
  const readMins = Math.max(3, Math.round(wordCount / 200));

  return (
    <>
      {/* Reading-progress bar — sticky to top, CSS-only via scroll-driven */}
      <style>{`
        @supports (animation-timeline: scroll()) {
          .essay-progress {
            animation: essay-progress-grow linear;
            animation-timeline: scroll(root block);
          }
          @keyframes essay-progress-grow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
          }
        }

        /* Drop cap on the very first paragraph */
        .essay-first-para::first-letter {
          float: left;
          font-family: var(--font-serif);
          font-size: 4.2em;
          line-height: 0.82;
          padding-right: 0.08em;
          padding-top: 0.05em;
          color: var(--fg);
          font-weight: 400;
        }

        /* Annotation gutter pull-quotes */
        .essay-pull-quote {
          position: absolute;
          left: calc(100% + 28px);
          width: 180px;
          top: 0;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13px;
          line-height: 1.5;
          color: var(--fg-dim);
          border-left: 2px solid var(--amber);
          padding-left: 12px;
        }

        @media (max-width: 1000px) {
          .essay-pull-quote { display: none; }
          .essay-layout { max-width: 680px !important; }
        }

        @media print {
          .essay-progress { display: none !important; }
          .essay-pull-quote {
            position: static !important;
            width: 100% !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>

      {/* Reading progress bar */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--hairline)",
          zIndex: 100,
        }}
      >
        <div
          className="essay-progress"
          style={{
            height: "100%",
            background: "var(--amber)",
            transformOrigin: "left",
            transform: "scaleX(0)",
          }}
        />
      </div>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--fg)",
          padding: "112px 24px 144px",
        }}
      >
        {/* Outer wrapper — wider than text col to allow gutter */}
        <div
          className="essay-layout"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Back link */}
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "56px",
            }}
          >
            &larr; Consult The Dead
          </Link>

          {/* Reading time meta */}
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              marginBottom: "24px",
            }}
          >
            Essay &middot; {readMins} min read
          </p>

          {/* Text column + gutter layout */}
          <div style={{ position: "relative" }}>
            <article
              style={{
                maxWidth: "640px",
              }}
            >
              {blocks.map((b, i) => {
                const inline = renderInline(b.content);
                const pullQuote = pullQuotes.get(i);

                if (b.type === "h1") {
                  return (
                    <h1
                      key={i}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 400,
                        fontSize: "clamp(32px, 4.5vw, 54px)",
                        lineHeight: 1.08,
                        letterSpacing: "-0.025em",
                        marginTop: "0",
                        marginBottom: "52px",
                        color: "var(--fg)",
                      }}
                    >
                      {inline}
                    </h1>
                  );
                }
                if (b.type === "h2") {
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      {pullQuote && (
                        <aside
                          className="essay-pull-quote"
                          aria-hidden
                        >
                          {pullQuote}
                        </aside>
                      )}
                      <h2
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontWeight: 400,
                          fontSize: "22px",
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                          marginTop: "72px",
                          marginBottom: "20px",
                          color: "var(--fg)",
                          borderLeft: "2px solid var(--amber)",
                          paddingLeft: "16px",
                        }}
                      >
                        {inline}
                      </h2>
                    </div>
                  );
                }
                if (b.type === "h3") {
                  return (
                    <h3
                      key={i}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        fontSize: "11px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--fg-dim)",
                        marginTop: "40px",
                        marginBottom: "16px",
                      }}
                    >
                      {inline}
                    </h3>
                  );
                }

                // Paragraphs — first one gets a drop-cap treatment
                const isFirst = blocks.slice(0, i).filter((bb) => bb.type === "p").length === 0
                  && blocks.slice(0, i).some((bb) => bb.type === "h1");

                return (
                  <p
                    key={i}
                    className={isFirst ? "essay-first-para" : undefined}
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "19px",
                      lineHeight: 1.78,
                      marginBottom: "28px",
                      color: "var(--fg)",
                      letterSpacing: "0.005em",
                    }}
                  >
                    {inline}
                  </p>
                );
              })}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
