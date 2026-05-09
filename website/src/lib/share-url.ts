import { looksLikeShareId } from "./share-id";

export const SITE_ORIGIN = "https://www.consultthedead.com";

export function buildShareUrlPath(shareId: string): string {
  if (!looksLikeShareId(shareId)) {
    throw new Error(`invalid shareId: ${JSON.stringify(shareId)}`);
  }
  return `/agora/a/${shareId}`;
}

export function buildShareUrl(
  shareId: string,
  options: { origin?: string } = {},
): string {
  const origin = (options.origin ?? SITE_ORIGIN).replace(/\/+$/, "");
  return `${origin}${buildShareUrlPath(shareId)}`;
}

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

const DEFAULT_TITLE = "Consult The Dead — The Agora";
const MAX_TEXT_LENGTH = 200;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const slice = value.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed = lastSpace > max / 2 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}

export function buildSharePayload(input: {
  shareId: string;
  topic: string;
  origin?: string;
}): SharePayload {
  const url = buildShareUrl(input.shareId, { origin: input.origin });
  const trimmedTopic = (input.topic ?? "").trim();
  if (!trimmedTopic) {
    return {
      title: DEFAULT_TITLE,
      text: "A council of dead minds debated this question. See the result.",
      url,
    };
  }

  const safeTopic = truncate(trimmedTopic, MAX_TEXT_LENGTH - 60);
  return {
    title: DEFAULT_TITLE,
    text: `A council of dead minds debated: "${safeTopic}"`,
    url,
  };
}
