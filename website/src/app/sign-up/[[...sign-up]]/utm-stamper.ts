export type SignUpRouteSearchParams = {
  utm_source?: string | string[];
  utm_campaign?: string | string[];
};

type SpValue = string | string[] | null | undefined;

function firstString(value: SpValue): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : "";
  }
  return typeof value === "string" ? value : "";
}

export interface SignUpUnsafeMetadata {
  [key: string]: string | undefined;
  utm_source?: string;
  utm_campaign?: string;
  [key: string]: unknown;
}

export interface SignUpTierCopy {
  name: string;
  copy: string;
  color?: string;
}

export const SIGN_UP_TIER_COPY: SignUpTierCopy[] = [
  {
    name: "Free",
    copy: "3 agons per day, 2–3 minds, Sonnet, and no card required.",
    color: "var(--red)",
  },
  {
    name: "BYO key",
    copy: "Unlimited agons on your own Anthropic quota, with the same core experience.",
    color: "var(--orange)",
  },
  {
    name: "Pro",
    copy: "100 agons a month, up to 5 minds, Opus consensus, and a private library.",
    color: "var(--yellow)",
  },
];

export function buildSignUpUnsafeMetadata(
  searchParams: SignUpRouteSearchParams | null | undefined,
): SignUpUnsafeMetadata | undefined {
  const utmSource = firstString(searchParams?.utm_source).trim();
  const utmCampaign = firstString(searchParams?.utm_campaign).trim();

  const metadata: SignUpUnsafeMetadata = {};
  if (utmSource) metadata.utm_source = utmSource;
  if (utmCampaign) metadata.utm_campaign = utmCampaign;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
