#!/usr/bin/env -S npx tsx
/**
 * Pricing contract verifier.
 *
 * Compares the live `/pricing` and `/agora` surfaces against the canonical
 * contract in `docs/pricing.md` plus the pricing metadata fragments in
 * `website/src/lib/pricing-copy.ts`.
 *
 * Intended run mode:
 *   BASE_URL=https://www.consultthedead.com \
 *   npx tsx scripts/pricing-contract-verifier.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPricingMetadataDescription,
  getPricingMetadataTitle,
  getPricingSharePreviewCard,
} from "../website/src/lib/pricing-copy";

export interface PricingDocContract {
  freeDailyAgons: string;
  freeCouncilSize: string;
  freeModel: string;
  byoKey: string;
  proMonthlyPrice: string;
  proAnnualPrice: string;
  proAnnualEquivalent: string;
  proAgonsPerMonth: string;
  proCouncilSize: string;
  proModel: string;
  proTrial: string;
  founderSupport: string;
  foundingMemberDeadline: string;
  foundingMemberFuturePrice: string;
}

export interface PricingCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface PricingContractReport {
  baseUrl: string;
  docsPath: string;
  contract: PricingDocContract;
  checks: PricingCheck[];
}

export interface PricingVerifierOptions {
  baseUrl?: string;
  docsPath?: string;
  fetchImpl?: typeof fetch;
  readFileImpl?: typeof readFileSync;
}

export interface PricingCliOptions {
  baseUrl: string;
  docsPath: string;
  json: boolean;
  help: boolean;
}

const DEFAULT_BASE_URL = "https://www.consultthedead.com";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMatch(text: string, regex: RegExp, label: string): string {
  const match = text.match(regex);
  if (!match) {
    throw new Error(`Unable to parse ${label} from docs/pricing.md`);
  }
  return match[1].trim();
}

function normalizeContractValue(value: string): string {
  return value.replace(/\s*\(.*?\)\s*$/, "").trim();
}

function extractSection(docText: string, heading: string): string {
  const headingRegex = new RegExp(`^##+\\s+${escapeRegExp(heading)}\\s*$`, "m");
  const match = headingRegex.exec(docText);
  if (!match || typeof match.index !== "number") {
    throw new Error(`Unable to locate "${heading}" section in docs/pricing.md`);
  }
  const sectionStart = match.index + match[0].length;
  const remainder = docText.slice(sectionStart);
  const nextHeading = remainder.search(/\n##+\s+/);
  return (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim();
}

export function parsePricingDoc(docText: string): PricingDocContract {
  const freeSection = extractSection(docText, "Free — always free, no signup");
  const proSection = extractSection(docText, "Pro — $30/mo or $25/mo billed annually");
  const foundingSection = extractSection(docText, "Founding-Member Pricing");

  const freeDailyAgons = normalizeContractValue(
    extractMatch(freeSection, /\*\*Agons per period\*\*\s*\|\s*([^\n|]+)/i, "free agons"),
  );
  const freeCouncilSize = normalizeContractValue(
    extractMatch(freeSection, /\*\*Council size\*\*\s*\|\s*([^\n|]+)/i, "free council size"),
  );
  const freeModel = normalizeContractValue(
    extractMatch(freeSection, /\*\*Synthesis model\*\*\s*\|\s*([^\n|]+)/i, "free synthesis model"),
  );
  const byoKey = normalizeContractValue(
    extractMatch(freeSection, /\*\*Bring your own key\*\*\s*\|\s*([^\n|]+)/i, "BYO key"),
  );
  const proPriceLine = extractMatch(proSection, /\*\*Price\*\*\s*\|\s*([^\n]+)/i, "Pro price");
  const proMonthlyPrice = extractMatch(
    proPriceLine,
    /(\$30\/month)/i,
    "Pro monthly price",
  );
  const proAnnualEquivalent = extractMatch(
    proPriceLine,
    /(\$300\/year)/i,
    "Pro annual price",
  );
  const proAnnualEquivalentMonthly = extractMatch(
    proPriceLine,
    /(\$25\/month)/i,
    "Pro annual equivalent monthly price",
  );
  const proAgonsPerMonth = normalizeContractValue(
    extractMatch(proSection, /\*\*Agons per period\*\*\s*\|\s*([^\n|]+)/i, "Pro agons"),
  );
  const proCouncilSize = normalizeContractValue(
    extractMatch(proSection, /\*\*Council size\*\*\s*\|\s*([^\n|]+)/i, "Pro council size"),
  );
  const proModel = normalizeContractValue(
    extractMatch(proSection, /\*\*Synthesis model\*\*\s*\|\s*([^\n|]+)/i, "Pro synthesis model"),
  );
  const proTrial = normalizeContractValue(
    extractMatch(proSection, /\*\*(7-day free trial)\*\*/i, "Pro trial"),
  );
  const founderSupport = normalizeContractValue(
    extractMatch(proSection, /\*\*Founder support\*\*\s*\|\s*([^\n|]+)/i, "Founder support"),
  );
  const foundingMemberDeadline = extractMatch(
    foundingSection,
    /(Q3 2026)/i,
    "founding-member deadline",
  );
  const foundingMemberFuturePrice = extractMatch(
    foundingSection,
    /(\$360\/year)/i,
    "founding-member future price",
  );

  return {
    freeDailyAgons,
    freeCouncilSize,
    freeModel,
    byoKey,
    proMonthlyPrice,
    proAnnualPrice: proAnnualEquivalent,
    proAnnualEquivalent: proAnnualEquivalentMonthly,
    proAgonsPerMonth,
    proCouncilSize,
    proModel,
    proTrial,
    founderSupport,
    foundingMemberDeadline,
    foundingMemberFuturePrice,
  };
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTagAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function findTagAttributes(
  html: string,
  tagName: "meta" | "link",
  predicate: (attrs: Record<string, string>) => boolean,
): Record<string, string> | null {
  const tagRegex = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html))) {
    const attrs = parseTagAttributes(match[0]);
    if (predicate(attrs)) {
      return attrs;
    }
  }
  return null;
}

function getMetaContent(
  html: string,
  key: "property" | "name",
  value: string,
): string | null {
  const attrs = findTagAttributes(html, "meta", (candidate) => candidate[key] === value);
  return attrs?.content ?? null;
}

function getCanonicalHref(html: string): string | null {
  const attrs = findTagAttributes(html, "link", (candidate) => candidate.rel === "canonical");
  return attrs?.href ?? null;
}

function addCheck(checks: PricingCheck[], name: string, passed: boolean, details: string) {
  checks.push({ name, passed, details });
}

function expectText(
  checks: PricingCheck[],
  surface: string,
  text: string,
  label: string,
  expected: string | RegExp,
) {
  const passed =
    typeof expected === "string" ? text.includes(expected) : expected.test(text);
  addCheck(
    checks,
    `${surface}: ${label}`,
    passed,
    passed
      ? `matched ${typeof expected === "string" ? JSON.stringify(expected) : expected}`
      : `missing ${typeof expected === "string" ? JSON.stringify(expected) : expected}`,
  );
}

function checkMeta(
  checks: PricingCheck[],
  html: string,
  key: "property" | "name",
  value: string,
  expected: string,
  label: string,
) {
  const actual = getMetaContent(html, key, value);
  const passed = actual === expected;
  addCheck(
    checks,
    label,
    passed,
    passed ? `matched ${value}` : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

async function fetchHtml(fetchImpl: typeof fetch, url: string): Promise<string> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export async function buildPricingContractReport(
  options: PricingVerifierOptions = {},
): Promise<PricingContractReport> {
  const baseUrl = (options.baseUrl ?? process.env.BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const docsPath =
    options.docsPath ?? resolve(fileURLToPath(import.meta.url), "..", "..", "docs", "pricing.md");
  const readFile = options.readFileImpl ?? readFileSync;
  const fetchImpl = options.fetchImpl ?? fetch;

  const docText = readFile(docsPath, "utf8");
  const contract = parsePricingDoc(docText);

  const pricingHtml = await fetchHtml(fetchImpl, `${baseUrl}/pricing`);
  const agoraHtml = await fetchHtml(fetchImpl, `${baseUrl}/agora`);
  const pricingText = htmlToText(pricingHtml);
  const agoraText = htmlToText(agoraHtml);
  const checks: PricingCheck[] = [];

  expectText(checks, "/pricing", pricingText, "shows Free tier label", /\bFree\b/);
  expectText(checks, "/pricing", pricingText, "shows BYO key label", /\bBYO key\b/);
  expectText(checks, "/pricing", pricingText, "shows Pro label", /\bPro\b/);
  expectText(
    checks,
    "/pricing",
    pricingText,
    "states the free daily cap",
    /3\s*(?:\/\s*day|agons per day|free agons\/day|free agons per day)/i,
  );
  expectText(checks, "/pricing", pricingText, "states the free council size", /2–3 minds/i);
  expectText(checks, "/pricing", pricingText, "states the free synthesis model", /Sonnet/i);
  expectText(checks, "/pricing", pricingText, "states the BYO key contract", /your own Anthropic key|BYO key/i);
  expectText(checks, "/pricing", pricingText, "states the Pro monthly price", /\$30(?:\/mo|\/month)/i);
  expectText(checks, "/pricing", pricingText, "states the Pro annual price", /\$300\/year/i);
  expectText(
    checks,
    "/pricing",
    pricingText,
    "states the annual-equivalent monthly price",
    /\$25(?:\/mo|\/month)/i,
  );
  expectText(checks, "/pricing", pricingText, "states the Pro agons per month", /100\s*(?:\/\s*month|agons\/month)/i);
  expectText(checks, "/pricing", pricingText, "states the Pro council size", /5 minds/i);
  expectText(checks, "/pricing", pricingText, "states the Pro synthesis model", /Opus/i);
  expectText(checks, "/pricing", pricingText, "mentions the trial", /7-day trial|7-day free trial/i);
  expectText(checks, "/pricing", pricingText, "mentions founder support", /48-hour email/i);
  expectText(
    checks,
    "/pricing",
    pricingText,
    "mentions founding-member pricing",
    /founding-member pricing|founding member pricing|\$300\/year/i,
  );
  expectText(
    checks,
    "/pricing",
    pricingText,
    "mentions the Q3 2026 annual-price change",
    /Q3 2026/i,
  );

  checkMeta(
    checks,
    pricingHtml,
    "property",
    "og:title",
    getPricingMetadataTitle(),
    "pricing metadata: og:title",
  );
  checkMeta(
    checks,
    pricingHtml,
    "property",
    "og:description",
    getPricingMetadataDescription(),
    "pricing metadata: og:description",
  );
  checkMeta(
    checks,
    pricingHtml,
    "name",
    "twitter:card",
    getPricingSharePreviewCard(),
    "pricing metadata: twitter:card",
  );
  checkMeta(
    checks,
    pricingHtml,
    "name",
    "twitter:title",
    getPricingMetadataTitle(),
    "pricing metadata: twitter:title",
  );
  checkMeta(
    checks,
    pricingHtml,
    "name",
    "twitter:description",
    getPricingMetadataDescription(),
    "pricing metadata: twitter:description",
  );

  const canonicalHref = getCanonicalHref(pricingHtml);
  addCheck(
    checks,
    "pricing metadata: canonical",
    canonicalHref === `${baseUrl}/pricing`,
    `expected ${JSON.stringify(`${baseUrl}/pricing`)}, got ${JSON.stringify(canonicalHref)}`,
  );

  expectText(checks, "/agora", agoraText, "mentions the free daily cap", /3 agons \/ day|3 agons\/day|3 free agons/i);
  expectText(checks, "/agora", agoraText, "mentions the BYO key escape hatch", /BYO key for unlimited|unlimited.*BYO key/i);
  expectText(checks, "/agora", agoraText, "mentions the Pro council size", /5 minds/i);
  expectText(checks, "/agora", agoraText, "mentions the Pro synthesis model", /Opus/i);
  expectText(checks, "/agora", agoraText, "mentions the Pro monthly cap", /100 agons\/month|100.*month/i);
  expectText(checks, "/agora", agoraText, "mentions upgrade language", /upgrade/i);

  return { baseUrl, docsPath, contract, checks };
}

export function formatPricingContractReport(report: PricingContractReport): string {
  const failed = report.checks.filter((check) => !check.passed);
  const lines = [
    `Pricing contract report for ${report.baseUrl}`,
    `Docs: ${report.docsPath}`,
    `Checks: ${report.checks.filter((check) => check.passed).length}/${report.checks.length} passed`,
  ];
  if (failed.length > 0) {
    lines.push("Failures:");
    for (const check of failed) {
      lines.push(`- ${check.name}: ${check.details}`);
    }
  }
  return lines.join("\n");
}

export function assertPricingContractReport(report: PricingContractReport): void {
  const failed = report.checks.filter((check) => !check.passed);
  if (failed.length === 0) {
    return;
  }
  throw new Error(
    `Pricing contract verification failed (${failed.length} checks).\n${failed
      .map((check) => `- ${check.name}: ${check.details}`)
      .join("\n")}`,
  );
}

export function parsePricingCliArgs(argv: string[]): PricingCliOptions {
  const options: PricingCliOptions = {
    baseUrl: process.env.BASE_URL ?? DEFAULT_BASE_URL,
    docsPath: resolve(fileURLToPath(import.meta.url), "..", "..", "docs", "pricing.md"),
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--base-url") {
      options.baseUrl = argv[++i] ?? options.baseUrl;
      continue;
    }
    if (arg.startsWith("--base-url=")) {
      options.baseUrl = arg.slice("--base-url=".length);
      continue;
    }
    if (arg === "--doc-path") {
      options.docsPath = argv[++i] ?? options.docsPath;
      continue;
    }
    if (arg.startsWith("--doc-path=")) {
      options.docsPath = arg.slice("--doc-path=".length);
    }
  }

  return options;
}

export function printPricingUsage(): string {
  return [
    "Usage: tsx scripts/pricing-contract-verifier.ts [--base-url <url>] [--doc-path <path>] [--json]",
    "",
    "Defaults:",
    `  --base-url  ${process.env.BASE_URL ?? DEFAULT_BASE_URL}`,
    "  --doc-path  docs/pricing.md",
  ].join("\n");
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const options = parsePricingCliArgs(argv);
  if (options.help) {
    process.stdout.write(`${printPricingUsage()}\n`);
    return 0;
  }

  try {
    const report = await buildPricingContractReport({
      baseUrl: options.baseUrl,
      docsPath: options.docsPath,
    });
    assertPricingContractReport(report);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      process.stdout.write(`${formatPricingContractReport(report)}\n`);
    }
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 1;
  }
}

function isDirectInvocation(): boolean {
  const invoked = process.argv[1] ? resolve(process.argv[1]) : "";
  return fileURLToPath(import.meta.url) === invoked;
}

if (isDirectInvocation()) {
  main().then((code) => process.exit(code));
}
