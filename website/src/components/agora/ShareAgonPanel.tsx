"use client";

/**
 * <ShareAgonPanel> is the share/save surface for a completed agon.
 *
 * It persists the agon to /api/library on first share, exposes the public
 * /agora/a/<shareId> URL, offers copy-to-clipboard, and uses the native
 * Web Share sheet when available.
 */
import { useCallback, useMemo, useState } from "react";
import type { ConsensusResult } from "../../lib/agon/types";
import {
  buildSharePayload,
  buildShareUrl,
} from "../../lib/share-url";

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
  existingShareId?: string | null;
  onSaved?: (shareId: string) => void;
  disabled?: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function buildShareRequestBody(agon: ShareAgonInput) {
  return {
    topic: agon.topic,
    mindSlugs: agon.mindSlugs,
    rounds: agon.rounds,
    turns: agon.turns,
    consensus: agon.consensus,
    research: agon.research ?? null,
  };
}

export function getShareButtonLabel(saveState: SaveState, hasShareId: boolean) {
  if (saveState === "saving") return "Sharing…";
  if (saveState === "error") return "Share failed — retry";
  return hasShareId ? "Share" : "Share this agon";
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

export async function copyShareUrl(
  target: string,
  clipboard:
    | {
        writeText: (value: string) => Promise<void>;
      }
    | null
    | undefined,
): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(target);
    return true;
  } catch {
    return false;
  }
}

export async function persistShareAgon(
  agon: ShareAgonInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; shareId: string } | { ok: false; errorMsg: string }> {
  try {
    const res = await fetchImpl("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildShareRequestBody(agon)),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        ok: false,
        errorMsg: body.error ?? `Save failed (${res.status})`,
      };
    }

    const body = (await res.json()) as { shareId?: string };
    if (!body.shareId) {
      return { ok: false, errorMsg: "Save returned no shareId" };
    }

    return { ok: true, shareId: body.shareId };
  } catch (error) {
    return {
      ok: false,
      errorMsg: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function shareAgonLink(input: {
  shareId: string;
  topic: string;
  navigatorLike?:
    | {
        share?: (data: ShareData) => Promise<void>;
        clipboard?: {
          writeText: (value: string) => Promise<void>;
        };
      }
    | null;
}): Promise<"shared" | "copied" | "aborted" | "unavailable"> {
  const shareInput = buildSharePayload({
    shareId: input.shareId,
    topic: input.topic,
  });

  if (input.navigatorLike?.share) {
    try {
      await input.navigatorLike.share(shareInput);
      return "shared";
    } catch (error) {
      if (isAbortError(error)) {
        return "aborted";
      }
    }
  }

  const copied = await copyShareUrl(
    shareInput.url,
    input.navigatorLike?.clipboard ?? undefined,
  );
  return copied ? "copied" : "unavailable";
}

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

  const url = useMemo(
    () => (shareId ? buildShareUrl(shareId) : null),
    [shareId],
  );
  const payload = useMemo(
    () => (shareId ? buildSharePayload({ shareId, topic: agon.topic }) : null),
    [shareId, agon.topic],
  );

  const persist = useCallback(async (): Promise<string | null> => {
    setSaveState("saving");
    setErrorMsg(null);

    const result = await persistShareAgon(agon);
    if (!result.ok) {
      setSaveState("error");
      setErrorMsg(result.errorMsg);
      return null;
    }

    setShareId(result.shareId);
    setSaveState("saved");
    onSaved?.(result.shareId);
    return result.shareId;
  }, [agon, onSaved]);

  const handleCopy = useCallback(async (target: string) => {
    const copiedNow = await copyShareUrl(
      target,
      typeof navigator !== "undefined" ? navigator.clipboard : undefined,
    );
    if (copiedNow) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (disabled) return;

    let id = shareId;
    if (!id) {
      id = await persist();
      if (!id) return;
    }

    const outcome = await shareAgonLink({
      shareId: id,
      topic: agon.topic,
      navigatorLike:
        typeof navigator !== "undefined"
          ? (navigator as Navigator & {
              share?: (data: ShareData) => Promise<void>;
            })
          : null,
    });

    if (outcome === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [agon.topic, disabled, persist, shareId]);

  const buttonDisabled = disabled || saveState === "saving";
  const buttonLabel = getShareButtonLabel(saveState, Boolean(shareId));

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
