import { currentUser } from "@clerk/nextjs/server";
import { getAllFrameworks, SLUG_COLOR_VAR, type FrameworkSlug } from "@/lib/frameworks";
import { getPacksForMind, PACKS, type PackId } from "@/lib/packs";
import { AgoraApp, type MindOption } from "./AgoraApp";

const VALID_PACK_IDS = new Set<PackId>(PACKS.map((p) => p.id));

export default async function AgoraPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string; minds?: string }>;
}) {
  const user = await currentUser();
  const isPro = user?.publicMetadata?.subscription_tier === "pro";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Consult The Dead — Agora",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://www.consultthedead.com/agora",
            description:
              "Run multi-round debates with historical minds on your real decisions. Pick a council of up to 5 historical figures and pose any decision — they argue across three rounds from their own cognitive frameworks.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "First 3 debates free, no signup required.",
            },
            publisher: {
              "@type": "Organization",
              name: "Consult The Dead",
              url: "https://www.consultthedead.com",
            },
          }),
        }}
      />
      <AgoraApp
        minds={minds}
        isPro={isPro}
        initialPack={initialPack}
        initialMinds={initialMinds}
      />
    </>
  );
}
