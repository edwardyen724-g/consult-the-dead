"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "22px",
          lineHeight: 1.5,
          marginTop: "48px",
        }}
      >
        Noted. Reply within 48 hours.
      </p>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--hairline)",
    color: "var(--fg)",
    fontFamily: "var(--font-serif)",
    fontSize: "18px",
    padding: "12px 0",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--fg-dim)",
    display: "block",
    marginBottom: "4px",
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: "48px" }}>
      <div style={{ marginBottom: "32px" }}>
        <label htmlFor="name" style={labelStyle}>
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "32px" }}>
        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <label htmlFor="message" style={labelStyle}>
          The figure and the decision context
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", paddingTop: "16px" }}
        />
      </div>

      {error && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "15px",
            color: "var(--fg-dim)",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: "var(--amber)",
          color: "var(--bg)",
          border: "none",
          padding: "14px 28px",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Sending" : "Send"}
      </button>
    </form>
  );
}
