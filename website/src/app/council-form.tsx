"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function CouncilForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [decision, setDecision] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, decision }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "22px",
          lineHeight: 1.5,
          maxWidth: "62ch",
          fontStyle: "italic",
        }}
      >
        Noted. The council will convene. Edward will reply within 24 hours to
        the email you provided.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <label style={{ display: "block" }}>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Your name
          </span>
          <input
            className="gm-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label style={{ display: "block" }}>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Your email
          </span>
          <input
            className="gm-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label style={{ display: "block" }}>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--fg-dim)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            The decision
          </span>
          <textarea
            className="gm-textarea"
            required
            rows={7}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="What's in front of you? What are the stakes? What are you considering? What keeps you up at night?"
          />
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          <button
            type="submit"
            className="gm-submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : "Send it to the council"}
          </button>
          {status === "error" && errorMsg && (
            <span
              className="font-mono"
              style={{
                fontSize: "12px",
                color: "var(--color-machiavelli)",
                letterSpacing: "0.04em",
              }}
            >
              {errorMsg}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
