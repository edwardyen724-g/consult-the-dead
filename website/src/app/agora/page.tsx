import { auth } from "@clerk/nextjs/server";
import { getAllFrameworks, SLUG_COLOR_VAR, type FrameworkSlug } from "@/lib/frameworks";
import { getPacksForMind, PACKS, type PackId } from "@/lib/packs";
import { AgoraApp, type MindOption } from "./AgoraApp";

const VALID_PACK_IDS = new Set<PackId>(PACKS.map((p) => p.id));

export default async function AgoraPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string; minds?: string }>;
}) {
  const { sessionClaims } = await auth();
  const publicMetadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const isPro = publicMetadata?.subscription_tier === "pro";

  const frameworks = getAllFrameworks();
  const validSlugs = new Set<string>(frameworks.map((f) => f.slug));

  const minds: MindOption[] = frameworks.map((f) => ({
    slug: f.slug,
    name: f.meta.person,
    era: f.era,
    domain: f.meta.domain,
    lens: f.perceptual_lens.statement,
    incidentCount: f.incidents.length,
    colorVar: SLUG_COLOR_VAR[f.slug as FrameworkSlug],
    packIds: getPacksForMind(f.slug).map((p) => p.id),
  }));

  const sp = await searchParams;
  const initialPack: PackId | null =
    sp?.pack && VALID_PACK_IDS.has(sp.pack as PackId)
      ? (sp.pack as PackId)
      : null;

  // Parse ?minds=slug1,slug2,slug3 from quiz results
  const initialMinds: string[] | null =
    sp?.minds
      ? sp.minds.split(",").filter((s): s is string => validSlugs.has(s))
      : null;

  return <AgoraApp minds={minds} isPro={isPro} initialPack={initialPack} initialMinds={initialMinds} />;
}
