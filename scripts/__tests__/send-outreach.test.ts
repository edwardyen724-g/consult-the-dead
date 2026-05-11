/**
 * Unit tests for scripts/send-outreach.ts — buildEmail() composition,
 * dry-run path, and missing-env friendly-error path.
 *
 * Mirrors the globals-or-shim pattern used in website/src/lib/share-id.test.ts
 * so the file is vitest-compatible AND runnable standalone via:
 *
 *   npx tsx scripts/__tests__/send-outreach.test.ts
 *
 * Why standalone-runnable: the script lives outside the website/ vitest
 * root and resend is only installed in website/node_modules; we need a
 * test path that doesn't require resend (the dry-run + missing-env
 * branches don't import it) so coverage is verifiable without a deps
 * install.
 */
import {
  buildEmail,
  fallbackSubject,
  firstName,
  makeResendModuleLoader,
  parseArgs,
  sendOutreach,
  formatDryRunSummary,
  formatSentSummary,
  formatHelp,
  cliMain,
  isDirectInvocation,
  __setResendModuleLoaderForTests,
  OutreachError,
  CAMPAIGN_TAG,
  FROM_ADDRESS,
  type ResendSender,
  type OutreachRecipient,
  type CliDeps,
  type SendResult,
} from "../send-outreach";
import { OUTREACH_LIST, findRecipient } from "../outreach-list";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Minimal vitest shim — engages only when running outside vitest.
// ---------------------------------------------------------------------------
type TestFn = () => void | Promise<void>;
type Suite = { name: string; tests: { name: string; fn: TestFn }[] };
const suites: Suite[] = [];
let currentSuite: Suite | null = null;

function describeFallback(name: string, body: () => void) {
  currentSuite = { name, tests: [] };
  body();
  suites.push(currentSuite);
  currentSuite = null;
}
function itFallback(name: string, fn: TestFn) {
  if (!currentSuite) throw new Error("it() called outside describe()");
  currentSuite.tests.push({ name, fn });
}
function expectFallback<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected ${String(actual)} to be truthy`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected ${String(actual)} to be falsy`);
    },
    toContain(needle: string) {
      if (typeof actual !== "string" || !actual.includes(needle)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(needle)}`,
        );
      }
    },
    toMatch(pattern: RegExp) {
      if (typeof actual !== "string" || !pattern.test(actual)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to match ${pattern}`,
        );
      }
    },
    toBeGreaterThan(min: number) {
      if (typeof actual !== "number" || actual <= min) {
        throw new Error(`Expected ${String(actual)} > ${min}`);
      }
    },
    toBeLessThanOrEqual(max: number) {
      if (typeof actual !== "number" || actual > max) {
        throw new Error(`Expected ${String(actual)} <= ${max}`);
      }
    },
  };
}

const g = globalThis as unknown as {
  describe?: typeof describeFallback;
  it?: typeof itFallback;
  expect?: typeof expectFallback;
};
const describe = g.describe ?? describeFallback;
const it = g.it ?? itFallback;
const expect = g.expect ?? expectFallback;

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const fixtureWithSubject: OutreachRecipient = {
  slug: "test-slug",
  name: "Test Person",
  email: "test@example.com",
  agon_url: "https://example.com/agora/a/test-slug?utm_source=outreach",
  topic_line: "whether to ship now or wait at $10K MRR",
  subject_line: "Custom subject line for the test",
};

const fixtureNoSubject: OutreachRecipient = {
  slug: "no-subject-slug",
  name: "Single",
  email: "single@example.com",
  agon_url: "https://example.com/agora/a/no-subject-slug?x=y",
  topic_line: "whether to A or B",
};

// ---------------------------------------------------------------------------
// buildEmail()
// ---------------------------------------------------------------------------
describe("buildEmail", () => {
  it("uses subject_line override when present", () => {
    const { subject } = buildEmail(fixtureWithSubject);
    expect(subject).toBe("Custom subject line for the test");
  });

  it("falls back to algorithmic subject when subject_line is absent", () => {
    const { subject } = buildEmail(fixtureNoSubject);
    expect(subject).toContain("3 dead strategists argued");
    expect(subject).toContain("whether to A or B");
  });

  it("composes a body that contains greeting, topic, URL, CTA, signoff", () => {
    const { text } = buildEmail(fixtureWithSubject);
    expect(text).toContain("Hi Test,");
    expect(text).toContain("Consult The Dead");
    expect(text).toContain(fixtureWithSubject.topic_line);
    expect(text).toContain(fixtureWithSubject.agon_url);
    expect(text).toContain("consultthedead.com/agora");
    expect(text).toContain("— Haoting");
  });

  it("emits HTML with a clickable link to the agon URL", () => {
    const { html } = buildEmail(fixtureWithSubject);
    expect(html).toContain("<p>");
    expect(html).toContain(`href="${encodeURI(fixtureWithSubject.agon_url)}"`);
    expect(html).toContain("Hi Test,");
  });

  it("HTML-escapes hostile name input so a recipient name cannot inject markup", () => {
    const evil: OutreachRecipient = {
      ...fixtureWithSubject,
      name: "<script>alert(1)</script> Bobby",
    };
    const { html } = buildEmail(evil);
    expect(html).toContain("&lt;script&gt;");
    // The literal <script> open tag must NOT appear unescaped in HTML.
    expect(html.includes("<script>")).toBe(false);
  });

  it("produces a stable subject for every shipped recipient (no empty subjects)", () => {
    for (const r of OUTREACH_LIST) {
      const { subject, text, html } = buildEmail(r);
      expect(subject.length).toBeGreaterThan(0);
      expect(text.length).toBeGreaterThan(0);
      expect(html.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// fallbackSubject()
// ---------------------------------------------------------------------------
describe("fallbackSubject", () => {
  it("keeps short topics under the 70-char preview cap", () => {
    const subject = fallbackSubject("a tiny question");
    expect(subject.length).toBeLessThanOrEqual(70);
  });

  it("truncates very long topics with an ellipsis at a word boundary", () => {
    const long =
      "whether the Council should debate a very long topic that absolutely cannot fit in 70 characters because it goes on and on about strategy";
    const subject = fallbackSubject(long);
    expect(subject.length).toBeLessThanOrEqual(70);
    expect(subject.endsWith("…")).toBe(true);
    // No partial word at the truncation boundary (last char before … is not whitespace).
    expect(/\s…$/.test(subject)).toBe(false);
  });

  it("handles a single long token by falling back to the hard cutoff branch", () => {
    const subject = fallbackSubject("x".repeat(80));
    expect(subject.length).toBeLessThanOrEqual(70);
    expect(subject.endsWith("…")).toBe(true);
  });

  it("starts with the '3 dead strategists argued' lead", () => {
    expect(fallbackSubject("foo")).toMatch(/^3 dead strategists argued/);
  });
});

// ---------------------------------------------------------------------------
// firstName()
// ---------------------------------------------------------------------------
describe("firstName", () => {
  it("extracts the first whitespace-delimited token", () => {
    expect(firstName("Abhishek Chakravarty")).toBe("Abhishek");
    expect(firstName("Pascal Levy-Garboua")).toBe("Pascal");
  });
  it("falls back to 'there' for empty / whitespace input", () => {
    expect(firstName("")).toBe("there");
    expect(firstName("   ")).toBe("there");
  });
  it("treats undefined display names as absent at runtime", () => {
    expect(firstName(undefined as unknown as string)).toBe("there");
  });
  it("collapses multi-whitespace correctly", () => {
    expect(firstName("  Foo   Bar")).toBe("Foo");
  });
});

// ---------------------------------------------------------------------------
// parseArgs()
// ---------------------------------------------------------------------------
describe("parseArgs", () => {
  it("parses --slug and --dry-run", () => {
    const a = parseArgs(["--slug", "abhishek-chakravarty", "--dry-run"]);
    expect(a.slug).toBe("abhishek-chakravarty");
    expect(a.dryRun).toBe(true);
    expect(a.help).toBe(false);
  });
  it("parses --slug=value form", () => {
    const a = parseArgs(["--slug=julian-shapiro"]);
    expect(a.slug).toBe("julian-shapiro");
  });
  it("parses --to override (space form)", () => {
    const a = parseArgs(["--slug", "x", "--to", "founder@example.com"]);
    expect(a.to).toBe("founder@example.com");
  });
  it("parses --to=value form", () => {
    const a = parseArgs(["--to=fb@example.com"]);
    expect(a.to).toBe("fb@example.com");
  });
  it("recognises --help and -h", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
    expect(parseArgs(["-h"]).help).toBe(true);
  });
  it("returns sensible defaults when no args", () => {
    const a = parseArgs([]);
    expect(a.dryRun).toBe(false);
    expect(a.help).toBe(false);
    expect(a.slug).toBe(undefined as unknown as string);
  });
});

// ---------------------------------------------------------------------------
// findRecipient() — sanity check on the static roster
// ---------------------------------------------------------------------------
describe("OUTREACH_LIST roster", () => {
  it("contains 30 unique slugs", () => {
    expect(OUTREACH_LIST.length).toBe(30);
    const slugs = new Set(OUTREACH_LIST.map((r) => r.slug));
    expect(slugs.size).toBe(30);
  });
  it("findRecipient returns the matching record", () => {
    expect(findRecipient("abhishek-chakravarty")?.name).toBe("Abhishek Chakravarty");
  });
  it("findRecipient returns undefined for unknown slug", () => {
    expect(findRecipient("nope-not-a-real-slug")).toBe(
      undefined as unknown as OutreachRecipient,
    );
  });
  it("every URL carries the documented UTM tags", () => {
    for (const r of OUTREACH_LIST) {
      expect(r.agon_url).toContain("utm_source=outreach");
      expect(r.agon_url).toContain("utm_medium=email");
      expect(r.agon_url).toContain("utm_campaign=founder-may26");
      expect(r.agon_url).toContain(`utm_content=${r.slug}`);
    }
  });
});

// ---------------------------------------------------------------------------
// sendOutreach() — dry-run path
// ---------------------------------------------------------------------------
describe("sendOutreach dry-run", () => {
  it("returns dry-run result without invoking Resend", async () => {
    let senderCalled = false;
    const sender: ResendSender = async () => {
      senderCalled = true;
      return { data: { id: "should-not-happen" } };
    };
    const result = await sendOutreach({
      slug: "abhishek-chakravarty",
      dryRun: true,
      env: {}, // no RESEND_API_KEY — must NOT error in dry-run.
      resendSender: sender,
    });
    expect(result.status).toBe("dry-run");
    expect(senderCalled).toBe(false);
    expect(result.subject.length).toBeGreaterThan(0);
  });

  it("formatDryRunSummary includes the slug, subject, URL, and topic", async () => {
    const result = await sendOutreach({
      slug: "julian-shapiro",
      dryRun: true,
      env: {},
    });
    const out = formatDryRunSummary(result);
    expect(out).toContain("DRY RUN");
    expect(out).toContain("julian-shapiro");
    expect(out).toContain(result.subject);
    expect(out).toContain("utm_content=julian-shapiro");
  });

  it("dry-run tolerates an empty email field on the recipient", async () => {
    // The shipped roster has email: "" by default; dry-run must work anyway.
    const r = await sendOutreach({
      slug: "ali-rohde",
      dryRun: true,
      env: {},
    });
    expect(r.status).toBe("dry-run");
  });

  it("falls back to the empty-string branch when a roster email becomes nullish", async () => {
    const recipient = OUTREACH_LIST.find((r) => r.slug === "abhishek-chakravarty");
    if (!recipient) {
      throw new Error("missing expected outreach recipient");
    }

    const originalEmail = recipient.email;
    try {
      recipient.email = undefined as unknown as string;
      const result = await sendOutreach({
        slug: recipient.slug,
        dryRun: true,
        env: {},
      });

      expect(result.to).toBe(
        "(no email yet — pass --to or fill in outreach-list.ts before sending)",
      );
      expect(result.subject).toContain("3 dead strategists argued");
    } finally {
      recipient.email = originalEmail;
    }
  });

  it("rejects unknown slugs with OutreachError", async () => {
    let caught: unknown = null;
    try {
      await sendOutreach({ slug: "definitely-not-a-slug", dryRun: true });
    } catch (e) {
      caught = e;
    }
    expect(caught instanceof OutreachError).toBe(true);
    expect((caught as Error).message).toContain("Unknown slug");
  });
});

// ---------------------------------------------------------------------------
// sendOutreach() — missing-env path
// ---------------------------------------------------------------------------
describe("sendOutreach missing-env", () => {
  it("throws a friendly OutreachError when RESEND_API_KEY is unset (non-dry-run)", async () => {
    let caught: unknown = null;
    try {
      await sendOutreach({
        slug: "abhishek-chakravarty",
        to: "founder@example.com",
        dryRun: false,
        env: {}, // explicitly no RESEND_API_KEY
      });
    } catch (e) {
      caught = e;
    }
    expect(caught instanceof OutreachError).toBe(true);
    expect((caught as Error).message).toContain("RESEND_API_KEY");
    // Friendly error must point the founder at --dry-run as the alternative.
    expect((caught as Error).message).toContain("--dry-run");
  });

  it("throws OutreachError when no email is available (no --to and roster.email empty)", async () => {
    let caught: unknown = null;
    try {
      await sendOutreach({
        slug: "abhishek-chakravarty",
        dryRun: false,
        env: { RESEND_API_KEY: "re_test" },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught instanceof OutreachError).toBe(true);
    expect((caught as Error).message).toContain("No email for slug");
  });
});

// ---------------------------------------------------------------------------
// sendOutreach() — happy send path with an injected Resend sender
// ---------------------------------------------------------------------------
describe("sendOutreach send path", () => {
  it("calls the injected sender with the documented tags + from address", async () => {
    let observed:
      | {
          from: string;
          to: string;
          subject: string;
          tags: { name: string; value: string }[];
        }
      | null = null;
    const sender: ResendSender = async (input) => {
      observed = {
        from: input.from,
        to: input.to,
        subject: input.subject,
        tags: input.tags,
      };
      return { data: { id: "msg_abc123" } };
    };
    const result = await sendOutreach({
      slug: "caleb-porzio",
      to: "caleb@example.com",
      dryRun: false,
      env: { RESEND_API_KEY: "re_test" },
      resendSender: sender,
    });

    expect(result.status).toBe("sent");
    expect(result.messageId).toBe("msg_abc123");
    expect(observed).toBeTruthy();
    const obs = observed!;
    expect(obs.from).toBe(FROM_ADDRESS);
    expect(obs.to).toBe("caleb@example.com");
    expect(obs.tags.find((t) => t.name === "campaign")?.value).toBe(CAMPAIGN_TAG);
    expect(obs.tags.find((t) => t.name === "slug")?.value).toBe("caleb-porzio");
  });

  it("returns status='error' (not throw) when Resend reports a delivery error", async () => {
    const sender: ResendSender = async () => ({
      error: { message: "domain not verified" },
    });
    const result = await sendOutreach({
      slug: "brennan-dunn",
      to: "brennan@example.com",
      dryRun: false,
      env: { RESEND_API_KEY: "re_test" },
      resendSender: sender,
    });
    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("domain not verified");
  });

  it("formatSentSummary surfaces the message id and slug", async () => {
    const sender: ResendSender = async () => ({ data: { id: "msg_zz" } });
    const result = await sendOutreach({
      slug: "natty-zola",
      to: "natty@example.com",
      dryRun: false,
      env: { RESEND_API_KEY: "re_test" },
      resendSender: sender,
    });
    const out = formatSentSummary(result);
    expect(out).toContain("msg_zz");
    expect(out).toContain("natty-zola");
    expect(out).toContain("Sent via Resend");
  });

  it("formatSentSummary falls back to '(none returned)' when Resend omits id", async () => {
    const sender: ResendSender = async () => ({ data: null });
    const result = await sendOutreach({
      slug: "harry-brodsky",
      to: "harry@example.com",
      dryRun: false,
      env: { RESEND_API_KEY: "re_test" },
      resendSender: sender,
    });
    expect(result.messageId).toBe(undefined as unknown as string);
    expect(formatSentSummary(result)).toContain("(none returned)");
  });

  it("uses the recipient.email when --to is not provided", async () => {
    const observedToRef: { value: string | null } = { value: null };
    const sender: ResendSender = async (input) => {
      observedToRef.value = input.to;
      return { data: { id: "msg_x" } };
    };
    const recipient = OUTREACH_LIST.find((r) => r.slug === "sarah-chen");
    if (!recipient) throw new Error("missing fixture recipient");
    const originalEmail = recipient.email;
    try {
      recipient.email = "  sarah@example.com  ";
      await sendOutreach({
        slug: "sarah-chen",
        dryRun: false,
        env: { RESEND_API_KEY: "re_test" },
        resendSender: sender,
      });
    } finally {
      recipient.email = originalEmail;
    }
    expect(observedToRef.value).toBe("sarah@example.com");
  });
});

// ---------------------------------------------------------------------------
// makeResendModuleLoader() — resolution helper
// ---------------------------------------------------------------------------
describe("makeResendModuleLoader", () => {
  it("imports resend from the path returned by the provided resolver", async () => {
    const dir = mkdtempSync(join(tmpdir(), "send-outreach-loader-"));
    const modulePath = join(dir, "resend.mjs");
    writeFileSync(
      modulePath,
      [
        "export class Resend {",
        "  constructor(key) {",
        "    this.key = key;",
        "    this.emails = {",
        "      send: async (input) => ({ data: { id: `msg-${key}`, to: input.to } }),",
        "    };",
        "  }",
        "}",
      ].join("\n"),
    );

    const loader = makeResendModuleLoader({
      resolve(specifier: string) {
        expect(specifier).toBe("resend");
        return modulePath;
      },
    });
    const mod = await loader();
    const client = new mod.Resend("re_test");
    const result = await client.emails.send({
      from: FROM_ADDRESS,
      to: "test@example.com",
      subject: "hello",
      html: "<p>hello</p>",
      text: "hello",
      tags: [],
    });

    expect(typeof mod.Resend).toBe("function");
    expect(result.data?.id).toBe("msg-re_test");
  });
});

// ---------------------------------------------------------------------------
// formatHelp() / isDirectInvocation()
// ---------------------------------------------------------------------------
describe("formatHelp", () => {
  it("lists every available slug", () => {
    const help = formatHelp();
    for (const r of OUTREACH_LIST) {
      expect(help).toContain(r.slug);
    }
    expect(help).toContain("--slug");
    expect(help).toContain("--dry-run");
    expect(help).toContain("--to");
  });
});

describe("isDirectInvocation", () => {
  it("matches typical tsx invocation paths", () => {
    expect(isDirectInvocation("/abs/path/scripts/send-outreach.ts")).toBe(true);
    expect(isDirectInvocation("scripts/send-outreach.ts")).toBe(true);
    expect(isDirectInvocation("send-outreach.ts")).toBe(true);
    expect(isDirectInvocation("send-outreach.mjs")).toBe(true);
    expect(isDirectInvocation("C:\\\\repo\\\\scripts\\\\send-outreach.js")).toBe(true);
  });
  it("rejects unrelated entry paths", () => {
    expect(isDirectInvocation("")).toBe(false);
    expect(isDirectInvocation("/some/other/file.ts")).toBe(false);
    expect(isDirectInvocation("send-outreach.test.ts")).toBe(false);
    expect(isDirectInvocation("vitest")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// cliMain() — full CLI orchestration, tested via injected deps.
// ---------------------------------------------------------------------------
function makeCliCapture(): {
  deps: Omit<CliDeps, "send" | "argv">;
  out: string[];
  err: string[];
  exitCode: number | null;
} {
  const out: string[] = [];
  const err: string[] = [];
  let exit: number | null = null;
  return {
    out,
    err,
    get exitCode() {
      return exit;
    },
    deps: {
      stdout: (s: string) => out.push(s),
      stderr: (s: string) => err.push(s),
      setExitCode: (code: number) => {
        exit = code;
      },
    },
  };
}

describe("cliMain", () => {
  it("prints help and sets exit code 1 when --slug is missing", async () => {
    const cap = makeCliCapture();
    await cliMain({ argv: [], ...cap.deps });
    expect(cap.out.length).toBeGreaterThan(0);
    expect(cap.out[0]).toContain("Usage:");
    expect(cap.exitCode).toBe(1);
  });

  it("prints help WITHOUT setting exit code when --help is passed", async () => {
    const cap = makeCliCapture();
    await cliMain({ argv: ["--help"], ...cap.deps });
    expect(cap.out[0]).toContain("Usage:");
    expect(cap.exitCode).toBe(null);
  });

  it("prints dry-run summary on the dry-run path", async () => {
    const cap = makeCliCapture();
    await cliMain({
      argv: ["--slug", "abhishek-chakravarty", "--dry-run"],
      ...cap.deps,
    });
    expect(cap.out.join("\n")).toContain("DRY RUN");
    expect(cap.exitCode).toBe(null);
  });

  it("prints sent summary on the happy send path (with stub sender)", async () => {
    const cap = makeCliCapture();
    const stubSend: typeof sendOutreach = async () => ({
      status: "sent",
      recipient: OUTREACH_LIST[0],
      to: "x@example.com",
      subject: "stub",
      messageId: "msg_stub",
    });
    await cliMain({
      argv: ["--slug", "abhishek-chakravarty", "--to", "x@example.com"],
      send: stubSend,
      ...cap.deps,
    });
    expect(cap.out.join("\n")).toContain("Sent via Resend");
    expect(cap.out.join("\n")).toContain("msg_stub");
    expect(cap.exitCode).toBe(null);
  });

  it("prints stderr + exit 1 when sender returns status=error", async () => {
    const cap = makeCliCapture();
    const stubSend: typeof sendOutreach = async () => ({
      status: "error",
      recipient: OUTREACH_LIST[0],
      to: "x@example.com",
      subject: "stub",
      errorMessage: "explosive failure",
    });
    await cliMain({
      argv: ["--slug", "abhishek-chakravarty", "--to", "x@example.com"],
      send: stubSend,
      ...cap.deps,
    });
    expect(cap.err.join("\n")).toContain("explosive failure");
    expect(cap.exitCode).toBe(1);
  });

  it("prints '(no message)' when Resend reports an error without details", async () => {
    const cap = makeCliCapture();
    const stubSend: typeof sendOutreach = async () => ({
      status: "error",
      recipient: OUTREACH_LIST[0],
      to: "x@example.com",
      subject: "stub",
    });
    await cliMain({
      argv: ["--slug", "abhishek-chakravarty", "--to", "x@example.com"],
      send: stubSend,
      ...cap.deps,
    });
    expect(cap.err.join("\n")).toContain("(no message)");
    expect(cap.exitCode).toBe(1);
  });

  it("renders a friendly error and exit 1 when sendOutreach throws OutreachError", async () => {
    const cap = makeCliCapture();
    const stubSend: typeof sendOutreach = async () => {
      throw new OutreachError("RESEND_API_KEY is not set. Pass --dry-run.");
    };
    await cliMain({
      argv: ["--slug", "abhishek-chakravarty"],
      send: stubSend,
      ...cap.deps,
    });
    expect(cap.err.join("\n")).toContain("RESEND_API_KEY");
    expect(cap.exitCode).toBe(1);
  });

  it("re-throws non-OutreachError exceptions so unexpected bugs aren't swallowed", async () => {
    const cap = makeCliCapture();
    const stubSend: typeof sendOutreach = async () => {
      throw new TypeError("totally unexpected");
    };
    let caught: unknown = null;
    try {
      await cliMain({
        argv: ["--slug", "abhishek-chakravarty"],
        send: stubSend,
        ...cap.deps,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught instanceof TypeError).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Resend module loader seam — verifies friendly-error wrapping and
// happy-path import indirection.
// ---------------------------------------------------------------------------
describe("__setResendModuleLoaderForTests", () => {
  it("handles a loader that throws a non-Error value (defensive String() path)", async () => {
    __setResendModuleLoaderForTests(async () => {
      // Some loaders/bundlers throw bare strings or numbers — make sure
      // the error message still surfaces a useful next step.
      throw "weird string failure" as unknown as Error;
    });
    let caught: unknown = null;
    try {
      await sendOutreach({
        slug: "abhishek-chakravarty",
        to: "x@example.com",
        dryRun: false,
        env: { RESEND_API_KEY: "re_test" },
      });
    } catch (e) {
      caught = e;
    }
    __setResendModuleLoaderForTests(undefined);
    expect(caught instanceof OutreachError).toBe(true);
    expect((caught as Error).message).toContain("weird string failure");
    expect((caught as Error).message).toContain("website/");
    expect((caught as Error).message).toContain("npm install");
  });

  it("rewraps a loader failure into an OutreachError pointing at website install", async () => {
    __setResendModuleLoaderForTests(async () => {
      throw new Error("Cannot find module 'resend'");
    });
    let caught: unknown = null;
    try {
      await sendOutreach({
        slug: "abhishek-chakravarty",
        to: "x@example.com",
        dryRun: false,
        env: { RESEND_API_KEY: "re_test" },
        // intentionally no resendSender — exercises the dynamic-import path
      });
    } catch (e) {
      caught = e;
    }
    __setResendModuleLoaderForTests(undefined); // reset
    expect(caught instanceof OutreachError).toBe(true);
    expect((caught as Error).message).toContain("website/");
    expect((caught as Error).message).toContain("npm install");
    expect((caught as Error).message).toContain("Could not load");
  });

  it("uses the loader's Resend class on the happy path", async () => {
    const observed: {
      key: string | null;
      from: string | null;
      to: string | null;
    } = { key: null, from: null, to: null };
    class FakeResend {
      emails: { send: ResendSender };
      constructor(key: string) {
        observed.key = key;
        this.emails = {
          send: async (input) => {
            observed.from = input.from;
            observed.to = input.to;
            return { data: { id: "msg_loader" } };
          },
        };
      }
    }
    __setResendModuleLoaderForTests(async () => ({
      Resend: FakeResend as unknown as new (k: string) => {
        emails: { send: ResendSender };
      },
    }));
    const result = await sendOutreach({
      slug: "abhishek-chakravarty",
      to: "x@example.com",
      dryRun: false,
      env: { RESEND_API_KEY: "re_loader" },
    });
    __setResendModuleLoaderForTests(undefined); // reset
    expect(result.status).toBe("sent");
    expect((result as SendResult).messageId).toBe("msg_loader");
    expect(observed.key).toBe("re_loader");
    expect(observed.from).toBe(FROM_ADDRESS);
    expect(observed.to).toBe("x@example.com");
  });
});

// ---------------------------------------------------------------------------
// Standalone runner — no-op under vitest, executes suites under tsx.
// ---------------------------------------------------------------------------
if (typeof g.expect === "undefined" && typeof process !== "undefined") {
  void (async () => {
    let passed = 0;
    let failed = 0;
    for (const suite of suites) {
      for (const t of suite.tests) {
        try {
          await t.fn();
          passed++;
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`✗ ${suite.name} > ${t.name}: ${msg}`);
        }
      }
    }
    if (failed === 0) {
      console.log(`✓ send-outreach: ${passed} tests passed`);
    } else {
      console.error(`✗ send-outreach: ${failed} failed, ${passed} passed`);
      process.exit(1);
    }
  })();
}
