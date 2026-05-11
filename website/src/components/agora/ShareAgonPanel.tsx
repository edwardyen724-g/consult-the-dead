"use client";

/**
 * <ShareAgonPanel> — conversion-loop closer for the Agora.
 *
 * Surfaces a Share button on a completed agon. Clicking it:
 *   1. POSTs the agon to /api/library (anonymous-save path is open per
 *      capsule 0dc03930 — no Clerk session required for the share-only flow),
 *   2. obtains a `shareId`,
 *   3. renders the absolute /agora/a/<shareId> URL with copy-to-clipboard,
 *   4. opens the native Web Share API sheet on devices that support it.
 *
 * If the parent already has a `shareId` (e.g. a Pro user just saved to
 * library), pass it as `existingShareId` and the component skips the POST.
 *
 * The component is intentionally self-contained: AgoraApp.tsx hands it an
 * agon record plus the optional already-saved id, and renders it inside
 * the existing action-button row in the consensus stage. All POST/share/
 * copy state lives here so AgoraApp.tsx stays focused on the agon engine.
 *
 * Network contract: POST /api/library returns `{ id, shareId, url }`. We
 * only need `shareId` — the URL builder reconstructs the public link from
 * the canonical SITE_ORIGIN so we never accidentally surface a relative
 * path or a preview-deploy origin.
 */
import { useCallback, useMemo, useState } from "react";
import type { ConsensusResult } from "@/lib/agon/types";
import {
  buildSharePayload,
  buildShareUrl,
} from "@/lib/share-url";

export interface ShareAgonInput {
  topic: string;
  mindSlugs: string[];
  rounds: number;
  turns: unknown;
  consensus: ConsensusResult | null;
  research?: string | null;
}

export interface ShareAgonPanelProps {
  agon: ShareAgonInput;
  /**
   * If the agon has already been persisted (e.g. a Pro user clicked "Save
   * to Library" first), pass the share id here so we skip the POST.
   */
  existingShareId?: string | null;
  /**
   * Called once when the agon is first persisted via this component, so
   * the parent can avoid double-saving on subsequent clicks.
   */
  onSaved?: (shareId: string) => void;
  /** Disable the Share button when the parent hasn't finished the agon. */
  disabled?: boolean;
}

export function buildShareAgonRequestBody(agon: ShareAgonInput) {
  return {
    topic: agon.topic,
    mindSlugs: agon.mindSlugs,
    rounds: agon.rounds,
    turns: agon.turns,
    consensus: agon.consensus,
    research: agon.research ?? null,
  };
}

export function getShareAgonButtonLabel(input: {
  disabled: boolean;
  saveState: SaveState;
  shareId: string | null;
}) {
  if (input.saveState === "saving") return "Sharing…";
  if (input.saveState === "error") return "Share failed — retry";
  if (input.shareId) return "Share";
  if (input.disabled) return "Share this agon";
  return "Share this agon";
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ShareAgonPanel({
  agon,
  existingShareId = null,
  onSaved,
  disabled = false,
}: ShareAgonPanelProps) {
  const [shareId, setShareId] = useState<string | null>(existingShareId);
  const [saveState, setSaveState] = useState<SaveState>(
    existingShareId ? "saved" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive the share URL + native-share payload from the (possibly null)
  // share id. Memoised so the buttons don't rebuild on every keystroke.
  const url = useMemo(
    () => (shareId ? buildShareUrl(shareId) : null),
    [shareId],
  );
  const payload = useMemo(
    () =>
      shareId
        ? buildSharePayload({ shareId, topic: agon.topic })
        : null,
    [shareId, agon.topic],
  );

  const persist = useCallback(async (): Promise<string | null> => {
    setSaveState("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildShareAgonRequestBody(agon)),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setSaveState("error");
        setErrorMsg(body.error ?? `Save failed (${res.status})`);
        return null;
      }
      const body = (await res.json()) as { shareId?: string };
      if (!body.shareId) {
        setSaveState("error");
        setErrorMsg("Save returned no shareId");
        return null;
      }
      setShareId(body.shareId);
      setSaveState("saved");
      onSaved?.(body.shareId);
      return body.shareId;
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      return null;
    }
  }, [agon, onSaved]);

  const handleCopy = useCallback(async (target: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      // Re-arm the label after a short beat so users can copy twice in a row.
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Browsers without clipboard permission silently fail — the URL
      // is still visible in the input next to the button so the user
      // can long-press / cmd+C manually.
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (disabled) return;

    // Resolve a shareId — either reuse what we have, or persist now.
    let id = shareId;
    if (!id) {
      id = await persist();
      if (!id) return; // persist() already surfaced the error
    }

    // Try the native share sheet first (mobile + Safari desktop).
    const shareInput = buildSharePayload({
      shareId: id,
      topic: agon.topic,
    });
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            share?: (data: ShareData) => Promise<void>;
          })
        : null;
    if (nav?.share) {
      try {
        await nav.share(shareInput);
        return;
      } catch (err) {
        // AbortError = user cancelled. Anything else falls through to
        // clipboard so the user always ends up with a usable link.
        if ((err as { name?: string })?.name === "AbortError") return;
      }
    }

    // Fallback: copy the URL straight to the clipboard.
    await handleCopy(shareInput.url);
  }, [agon.topic, disabled, handleCopy, persist, shareId]);

  // ─────────────────── Rendering ───────────────────

  const buttonDisabled = disabled || saveState === "saving";
  const buttonLabel = getShareAgonButtonLabel({
    disabled,
    saveState,
    shareId,
  });

  return (
    <div
      data-testid="share-agon-panel"
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleShare}
          disabled={buttonDisabled}
          className="font-mono"
          aria-label={buttonLabel}
          style={{
            background: buttonDisabled ? "transparent" : "var(--amber)",
            color: buttonDisabled ? "var(--fg-dim)" : "var(--bg)",
            border: buttonDisabled
              ? "1px solid var(--hairline)"
              : "1px solid var(--amber)",
            borderRadius: "4px",
            fontSize: "12px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: buttonDisabled ? "not-allowed" : "pointer",
            transition: "all 200ms ease-out",
          }}
        >
          {buttonLabel}
        </button>

        {url && (
          <button
            type="button"
            onClick={() => handleCopy(url)}
            className="font-mono"
            aria-label="Copy share link to clipboard"
            style={{
              background: copied ? "var(--surface)" : "transparent",
              color: copied ? "var(--amber)" : "var(--fg)",
              border: `1px solid ${copied ? "var(--amber)" : "var(--hairline)"}`,
              borderRadius: "4px",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "14px 24px",
              cursor: "pointer",
              transition: "all 200ms ease-out",
            }}
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        )}
      </div>

      {url && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 12px",
            border: "1px solid var(--hairline)",
            borderRadius: "4px",
            background: "var(--surface)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--fg)",
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden="true"
            className="font-mono"
            style={{
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--fg-faint)",
              flexShrink: 0,
            }}
          >
            URL
          </span>
          {/*
            Read-only input lets users tap-to-select on mobile without us
            having to wire focus/selection logic — the long URL would
            otherwise overflow a plain <span>.
           */}
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Public share URL"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              outline: "none",
              padding: 0,
            }}
          />
        </div>
      )}

      {saveState === "error" && errorMsg && (
        <div
          role="alert"
          className="font-mono"
          style={{
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "var(--red)",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* The native-share availability hint helps mobile users discover
          that tapping Share opens the system sheet. We only show it
          before the first share so the URL field doesn't get crowded. */}
      {!shareId && saveState !== "error" && payload === null && (
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.08em",
            color: "var(--fg-faint)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Saves the agon and copies the public link. On mobile, opens the
          system share sheet.
        </p>
      )}
    </div>
  );
}
