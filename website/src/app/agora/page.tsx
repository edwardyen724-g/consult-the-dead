import { auth } from "@clerk/nextjs/server";
import { getAllFrameworks, SLUG_COLOR_VAR, type FrameworkSlug } from "@/lib/frameworks";
import { AgoraApp, type MindOption } from "./AgoraApp";

export default async function AgoraPage() {
  const { sessionClaims } = await auth();
  const publicMetadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const isPro = publicMetadata?.subscription_tier === "pro";

  const frameworks = getAllFrameworks();

  const minds: MindOption[] = frameworks.map((f) => ({
    slug: f.slug,
    name: f.meta.person,
    era: f.era,
    domain: f.meta.domain,
    lens: f.perceptual_lens.statement,
    incidentCount: f.incidents.length,
    colorVar: SLUG_COLOR_VAR[f.slug as FrameworkSlug],
  }));

  return <AgoraApp minds={minds} isPro={isPro} />;
}
