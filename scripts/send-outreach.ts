#!/usr/bin/env -S npx tsx
/**
 * scripts/send-outreach.ts
 * -----------------------------------------------------------------------------
 * One-by-one founder-outreach send script per
 * marketing/output/outreach-send-playbook.md §1 Option B.
 *
 * Usage
 * -----
 *   # Preview a single recipient (no API calls, no install required):
 *   tsx scripts/send-outreach.ts --slug abhishek-chakravarty --dry-run
 *
 *   # Actually send via Resend (requires `resend` to be installed under
 *   # website/ and RESEND_API_KEY in env):
 *   RESEND_API_KEY=re_... tsx scripts/send-outreach.ts --slug abhishek-chakravarty
 *
 *   # Override the recipient email at send time (useful when the inline
 *   # `email` field in scripts/outreach-list.ts is empty):
 *   RESEND_API_KEY=re_... tsx scripts/send-outreach.ts \
 *     --slug abhishek-chakravarty --to abhishek@example.com
 *
 * Behaviour
 * ---------
 *  - One email per invocation. The playbook's §5 cadence (5/day for 6 days)
 *    is enforced by the founder running this script repeatedly.
 *  - Lazy-imports the Resend SDK inside the send code path so the script
 *    file can be imported, type-checked, and unit-tested without `resend`
 *    being installed at the repo root (mirrors the existing `getStripe()`
 *    lazy-init pattern in website/src/app/api/stripe/checkout/route.ts).
 *  - Tags every send with `campaign=founder-outreach-may26` and `slug=<slug>`
 *    so Resend's dashboard groups the batch and per-recipient analytics work.
 *  - `buildEmail()` is a pure helper — same input always yields the same
 *    {subject, html, text} — so it is fully exercised by the vitest
 *    sibling at scripts/__tests__/send-outreach.test.ts.
 *
 * Capsule scope: scripts/send-outreach.ts (this file) +
 *   scripts/outreach-list.ts + scripts/__tests__/send-outreach.test.ts.
 *   Does not touch website/* per task 9168c355 / capsule 1b2feb4a.
 */

import { OUTREACH_LIST, findRecipient, type OutreachRecipient } from "./outreach-list";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

export type { OutreachRecipient } from "./outreach-list";

// -----------------------------------------------------------------------------
// Pure helpers — exported so they can be tested without spawning the CLI.
// -----------------------------------------------------------------------------

export const CAMPAIGN_TAG = "founder-outreach-may26";
export const FROM_ADDRESS = "Haoting Yen <haoting@consultthedead.com>";

/** Pull the first name out of a display name (used in the salutation). */
export function firstName(displayName: string): string {
  const trimmed = (displayName ?? "").trim();
  if (!trimmed) return "there";
  const first = trimmed.split(/\s+/)[0];
  return first || "there";
}

/**
 * Build the algorithmic fallback subject when a recipient has no
 * `subject_line` override. Keeps the §2 "feel like a friend" voice.
 *
 * Capped at ~70 chars (mobile preview tolerance) per playbook §2 rules.
 */
export function fallbackSubject(topicLine: string): string {
  const lead = "3 dead strategists argued";
  const target = `${lead} ${topicLine}`;
  if (target.length <= 70) return target;
  // Truncate at the last whitespace before 67 chars and append an ellipsis.
  const truncated = target.slice(0, 67);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : 67)}…`;
}

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

/**
 * Pure email composer. Mirrors the §3 body template:
 *
 *   Hi <First name>,
 *   I built a tool called Consult The Dead — it lets you run debates...
 *   I ran your question through it: <topic_line>.
 *   Three minds argued it for 3 rounds. Here's the debate:
 *   → <agon_url>
 *   If it's useful, you can run your own agon at consultthedead.com/agora
 *   — Haoting
 */
export function buildEmail(recipient: OutreachRecipient): BuiltEmail {
  const subject =
    recipient.subject_line && recipient.subject_line.trim().length > 0
      ? recipient.subject_line
      : fallbackSubject(recipient.topic_line);

  const greeting = `Hi ${firstName(recipient.name)},`;
  const paragraphs = [
    "I built a tool called Consult The Dead — it lets you run debates about real decisions using historical thinkers as advisors.",
    `I ran your question through it: ${recipient.topic_line}.`,
    "Three minds argued it for 3 rounds. Here's the debate:",
  ];
  const linkLine = `→ ${recipient.agon_url}`;
  const ctaLine =
    "If it's useful, you can run your own agon at consultthedead.com/agora";
  const signoff = "— Haoting";

  const text = [
    greeting,
    "",
    paragraphs[0],
    "",
    paragraphs[1],
    "",
    paragraphs[2],
    linkLine,
    "",
    ctaLine,
    "",
    signoff,
  ].join("\n");

  // Minimal HTML — single font stack, no marketing chrome. The whole
  // point is to look like a personal note, not a product email.
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${escapeHtml(paragraphs[0])}</p>`,
    `<p>${escapeHtml(paragraphs[1])}</p>`,
    `<p>${escapeHtml(paragraphs[2])}<br>` +
      `→ <a href="${encodeURI(recipient.agon_url)}">${escapeHtml(recipient.agon_url)}</a></p>`,
    `<p>${escapeHtml(ctaLine)}</p>`,
    `<p>${escapeHtml(signoff)}</p>`,
  ].join("\n");

  return { subject, html, text };
}

/** Minimal HTML-escape — only chars that break inside <p> / attribute values. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -----------------------------------------------------------------------------
// CLI argument parsing — also exported for unit tests.
// -----------------------------------------------------------------------------

export type ParsedArgs = {
  slug?: string;
  to?: string;
  dryRun: boolean;
  help: boolean;
};

export function parseArgs(argv: readonly string[]): ParsedArgs {
  const out: ParsedArgs = { dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--slug") out.slug = argv[++i];
    else if (arg === "--to") out.to = argv[++i];
    else if (arg.startsWith("--slug=")) out.slug = arg.slice("--slug=".length);
    else if (arg.startsWith("--to=")) out.to = arg.slice("--to=".length);
  }
  return out;
}

// -----------------------------------------------------------------------------
// Send orchestration. Test-friendly (returns a result object instead of
// process.exit'ing), with a thin CLI wrapper at the bottom of the file.
// -----------------------------------------------------------------------------

export type SendOptions = {
  slug: string;
  /** Override the recipient.email field at send time. */
  to?: string;
  /** When true, no Resend SDK call is made and no API key is required. */
  dryRun: boolean;
  /** Injected for tests. Defaults to process.env. */
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  /** Injected for tests. Defaults to dynamic import('resend'). */
  resendSender?: ResendSender;
};

/** Minimal type covering the surface of resend.emails.send used here. */
export type ResendSender = (input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  tags: { name: string; value: string }[];
}) => Promise<{ data?: { id?: string } | null; error?: { message: string } | null }>;

export type SendResult = {
  status: "sent" | "dry-run" | "error";
  recipient: OutreachRecipient;
  to: string;
  subject: string;
  /** Resend message id when status === "sent". */
  messageId?: string;
  /** Error message when status === "error". */
  errorMessage?: string;
};

export class OutreachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutreachError";
  }
}

/**
 * Send (or dry-run) one outreach email. Pure, async, deterministic when
 * `resendSender` is injected. Throws OutreachError on user-facing errors
 * (unknown slug, missing env, missing email) so the CLI can render a
 * single friendly message.
 */
export async function sendOutreach(opts: SendOptions): Promise<SendResult> {
  const env = opts.env ?? process.env;

  const recipient = findRecipient(opts.slug);
  if (!recipient) {
    throw new OutreachError(
      `Unknown slug: '${opts.slug}'. Run with --help to list available slugs.`,
    );
  }

  const to = (opts.to ?? recipient.email ?? "").trim();
  if (!opts.dryRun && !to) {
    throw new OutreachError(
      `No email for slug '${opts.slug}'. Either fill in the 'email' field in scripts/outreach-list.ts or pass --to <email> on the command line.`,
    );
  }

  const { subject, html, text } = buildEmail(recipient);

  if (opts.dryRun) {
    return {
      status: "dry-run",
      recipient,
      to: to || "(no email yet — pass --to or fill in outreach-list.ts before sending)",
      subject,
    };
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    throw new OutreachError(
      "RESEND_API_KEY is not set. Either run with --dry-run to preview the email, " +
        "or set RESEND_API_KEY=re_... before sending. (See marketing/output/outreach-send-playbook.md §1 for setup.)",
    );
  }

  const send = opts.resendSender ?? (await loadResendSender(apiKey));

  const result = await send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text,
    tags: [
      { name: "campaign", value: CAMPAIGN_TAG },
      { name: "slug", value: recipient.slug },
    ],
  });

  if (result.error) {
    return {
      status: "error",
      recipient,
      to,
      subject,
      errorMessage: result.error.message,
    };
  }

  return {
    status: "sent",
    recipient,
    to,
    subject,
    messageId: result.data?.id,
  };
}

/**
 * Test seam for the dynamic resend import. Default implementation does
 * the real import; tests override with a stub that throws / returns a
 * fake module so the error-message contract can be verified deterministically.
 *
 * Why a seam: the resend package is intentionally only installed in
 * website/node_modules, so the production import branch is exercised
 * end-to-end by the founder's actual run, not by CI.
 */
type ResendModuleLoader = () => Promise<{
  Resend: new (key: string) => { emails: { send: ResendSender } };
}>;

type RequireLike = {
  resolve(specifier: string): string;
};

const websiteRequire: RequireLike = createRequire(
  new URL("../website/package.json", import.meta.url),
);

export function makeResendModuleLoader(
  resolver: RequireLike = websiteRequire,
): ResendModuleLoader {
  return async () => {
    const modulePath = resolver.resolve("resend");
    return (await import(pathToFileURL(modulePath).href)) as Awaited<
      ReturnType<ResendModuleLoader>
    >;
  };
}

const realResendLoader: ResendModuleLoader = makeResendModuleLoader();

let _resendModuleLoader: ResendModuleLoader = realResendLoader;

/** Test-only: override the resend module loader. Pass `undefined` to reset. */
export function __setResendModuleLoaderForTests(
  loader: ResendModuleLoader | undefined,
): void {
  _resendModuleLoader = loader ?? realResendLoader;
}

async function loadResendSender(apiKey: string): Promise<ResendSender> {
  let mod: Awaited<ReturnType<ResendModuleLoader>>;
  try {
    mod = await _resendModuleLoader();
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    throw new OutreachError(
      `Could not load the Resend SDK (${why}). From website/, run: npm install`,
    );
  }
  const client = new mod.Resend(apiKey);
  return (input) => client.emails.send(input);
}

// -----------------------------------------------------------------------------
// Stdout summary helpers — exported so tests can assert against the
// formatted output without parsing the CLI.
// -----------------------------------------------------------------------------

export function formatDryRunSummary(result: SendResult): string {
  const r = result.recipient;
  return [
    `[DRY RUN] would send via Resend (campaign=${CAMPAIGN_TAG}, slug=${r.slug})`,
    `  To:      ${result.to}`,
    `  Subject: ${result.subject}`,
    `  URL:     ${r.agon_url}`,
    `  Topic:   ${r.topic_line}`,
  ].join("\n");
}

export function formatSentSummary(result: SendResult): string {
  return [
    `Sent via Resend (campaign=${CAMPAIGN_TAG}, slug=${result.recipient.slug})`,
    `  To:        ${result.to}`,
    `  Subject:   ${result.subject}`,
    `  MessageID: ${result.messageId ?? "(none returned)"}`,
  ].join("\n");
}

export function formatHelp(): string {
  const slugs = OUTREACH_LIST.map((r) => `    ${r.slug}`).join("\n");
  return [
    "Usage: tsx scripts/send-outreach.ts --slug <slug> [--dry-run] [--to <email>]",
    "",
    "Flags:",
    "  --slug <slug>     Required. Recipient slug (e.g. abhishek-chakravarty).",
    "  --dry-run         Preview the email without sending. No RESEND_API_KEY needed.",
    "  --to <email>      Override the recipient email (otherwise uses outreach-list.ts).",
    "  --help, -h        Show this help.",
    "",
    "Available slugs:",
    slugs,
  ].join("\n");
}

// -----------------------------------------------------------------------------
// CLI entry point. Exported so the wrapper can be unit-tested with stub
// argv / console / sendOutreach impls. The bottom-of-file invocation guard
// runs the real CLI when this module is executed directly via tsx.
// -----------------------------------------------------------------------------

export type CliDeps = {
  argv: readonly string[];
  /** Captures stdout (e.g. console.log). */
  stdout: (line: string) => void;
  /** Captures stderr (e.g. console.error). */
  stderr: (line: string) => void;
  /** Sets process.exitCode (or equivalent). */
  setExitCode: (code: number) => void;
  /** Runs the actual send. Defaults to the real sendOutreach. */
  send?: typeof sendOutreach;
};

export async function cliMain(deps: CliDeps): Promise<void> {
  const args = parseArgs(deps.argv);
  const send = deps.send ?? sendOutreach;

  if (args.help || !args.slug) {
    deps.stdout(formatHelp());
    if (!args.help && !args.slug) deps.setExitCode(1);
    return;
  }

  try {
    const result = await send({
      slug: args.slug,
      to: args.to,
      dryRun: args.dryRun,
    });
    if (result.status === "dry-run") {
      deps.stdout(formatDryRunSummary(result));
    } else if (result.status === "sent") {
      deps.stdout(formatSentSummary(result));
    } else {
      deps.stderr(
        `Resend reported an error for slug=${result.recipient.slug}: ${result.errorMessage ?? "(no message)"}`,
      );
      deps.setExitCode(1);
    }
  } catch (err) {
    if (err instanceof OutreachError) {
      deps.stderr(err.message);
      deps.setExitCode(1);
    } else {
      throw err;
    }
  }
}

/**
 * True when this file is being executed directly (not imported by a test
 * or another module). Exported for testability — tests pass arbitrary
 * entrypoint strings to verify the regex without relying on process.argv.
 */
export function isDirectInvocation(entrypoint: string): boolean {
  return /(?:^|[\\/])send-outreach\.(?:ts|mjs|js)$/.test(entrypoint);
}

/* c8 ignore start -- direct-execution guard; only fires when run via tsx. */
if (
  typeof process !== "undefined" &&
  isDirectInvocation(process.argv[1] ?? "")
) {
  void cliMain({
    argv: process.argv.slice(2),
    stdout: (line) => console.log(line),
    stderr: (line) => console.error(line),
    setExitCode: (code) => {
      process.exitCode = code;
    },
  });
}
/* c8 ignore stop */
