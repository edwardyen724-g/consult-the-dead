'use client'

/**
 * ShareTranscriptButton — a copy-to-clipboard share button for transcript excerpts.
 *
 * Wraps `buildTranscriptShareText` from `@/lib/share-transcript` to format
 * a pull-quote from a mind's response into a ready-to-share text blob, then
 * copies it to the clipboard via the Clipboard API.
 *
 * Disabled contract:
 *   - The button is disabled whenever the share payload is incomplete.
 *     "Incomplete" means `shareId` is absent/null/empty, because without a
 *     canonical URL the share text has nowhere to point.
 *
 * className passthrough:
 *   - Any `className` prop is merged onto the root `<button>` element so
 *     callers can apply Tailwind/utility classes without needing a wrapper.
 *
 * The component has no routing or navigation side-effects — it only writes to
 * the clipboard and updates its own `copied` state for a brief visual confirmation.
 */

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { buildTranscriptShareText, type TranscriptShareInput } from '@/lib/share-transcript'

// ──────────────────────────────────────────────────────────────────────────
//  Public constants
// ──────────────────────────────────────────────────────────────────────────

/** Milliseconds the "Copied!" label stays visible after a successful copy. */
export const COPIED_RESET_MS = 2000

/** Label shown in the default idle state. */
export const LABEL_IDLE = 'Share excerpt'

/** Label shown briefly after a successful clipboard write. */
export const LABEL_COPIED = 'Copied!'

// ──────────────────────────────────────────────────────────────────────────
//  Props
// ──────────────────────────────────────────────────────────────────────────

export interface ShareTranscriptButtonProps {
  /** Share payload input — forwarded verbatim to buildTranscriptShareText(). */
  shareInput: TranscriptShareInput
  /**
   * Optional extra class names merged onto the root <button>.
   * Follows the codebase convention of a plain `className` string
   * (no cx/clsx dependency).
   */
  className?: string
  /**
   * Override the Clipboard API for testing. Defaults to navigator.clipboard.
   * Passing a custom implementation lets tests assert what was written without
   * needing a real browser environment.
   */
  clipboard?: { writeText: (text: string) => Promise<void> }
  /**
   * Override the copy-confirmation reset timer. Defaults to setTimeout.
   * Useful for synchronous tests: pass a spy that calls its callback immediately.
   */
  onCopied?: () => void
}

// ──────────────────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * A share payload is considered complete (button enabled) when shareId is
 * present, non-null, and non-empty after trimming.
 */
export function isSharePayloadComplete(input: TranscriptShareInput): boolean {
  return Boolean(input.shareId && input.shareId.trim().length > 0)
}

// ──────────────────────────────────────────────────────────────────────────
//  Styles
// ──────────────────────────────────────────────────────────────────────────

const buttonBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '8px 16px',
  border: '1px solid var(--hairline)',
  borderRadius: '4px',
  background: 'transparent',
  color: 'var(--fg)',
  cursor: 'pointer',
  transition: 'opacity 150ms',
}

const disabledStyle: CSSProperties = {
  ...buttonBaseStyle,
  opacity: 0.4,
  cursor: 'not-allowed',
}

const copiedStyle: CSSProperties = {
  ...buttonBaseStyle,
  color: 'var(--accent, #b8956a)',
}

// ──────────────────────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────────────────────

/**
 * Share-transcript copy button. Disabled when shareId is absent/empty.
 * Shows "Copied!" for 2 s after a successful clipboard write.
 */
export function ShareTranscriptButton({
  shareInput,
  className,
  clipboard,
  onCopied,
}: ShareTranscriptButtonProps) {
  const [copied, setCopied] = useState(false)

  const enabled = isSharePayloadComplete(shareInput)

  async function handleClick() {
    if (!enabled) return

    const { text } = buildTranscriptShareText(shareInput)
    const clipboardApi = clipboard ?? (typeof navigator !== 'undefined' ? navigator.clipboard : null)

    if (clipboardApi) {
      await clipboardApi.writeText(text)
    }

    setCopied(true)

    if (onCopied) {
      onCopied()
    } else {
      setTimeout(() => setCopied(false), COPIED_RESET_MS)
    }
  }

  const resolvedStyle = !enabled ? disabledStyle : copied ? copiedStyle : buttonBaseStyle

  return (
    <button
      type="button"
      data-testid="share-transcript-button"
      disabled={!enabled}
      onClick={handleClick}
      className={className}
      style={resolvedStyle}
      aria-label={copied ? LABEL_COPIED : LABEL_IDLE}
    >
      {copied ? LABEL_COPIED : LABEL_IDLE}
    </button>
  )
}

export default ShareTranscriptButton
