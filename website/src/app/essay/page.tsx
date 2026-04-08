import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulting the Dead, Not Distilling the Living — Consult The Dead",
  description: "The operation we are doing instead.",
};

// Minimal markdown renderer.
// Supports: # h1, ## h2, ### h3, paragraphs, [text](url) inline links, *italic*.
// react-markdown is not installed and the spec says do not add deps.
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split(/\r?\n/);
  const blocks: { type: string; content: string }[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (buf.length) {
      blocks.push({ type: "p", content: buf.join(" ") });
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

  return blocks.map((b, i) => {
    const inline = renderInline(b.content);
    if (b.type === "h1") {
      return (
        <h1
          key={i}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(32px, 4.5vw, 52px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginTop: "0",
            marginBottom: "48px",
          }}
        >
          {inline}
        </h1>
      );
    }
    if (b.type === "h2") {
      return (
        <h2
          key={i}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            marginTop: "64px",
            marginBottom: "20px",
          }}
        >
          {inline}
        </h2>
      );
    }
    if (b.type === "h3") {
      return (
        <h3
          key={i}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: "20px",
            marginTop: "40px",
            marginBottom: "16px",
          }}
        >
          {inline}
        </h3>
      );
    }
    return (
      <p
        key={i}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "19px",
          lineHeight: 1.7,
          marginBottom: "24px",
          maxWidth: "62ch",
        }}
      >
        {inline}
      </p>
    );
  });
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "120px 24px 128px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
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
            marginBottom: "64px",
          }}
        >
          &larr; Consult The Dead
        </Link>
        <article>{renderMarkdown(md)}</article>
      </div>
    </div>
  );
}
