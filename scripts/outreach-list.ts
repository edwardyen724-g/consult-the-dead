/**
 * Static, typed mirror of marketing/output/outreach-send-list.csv enriched
 * with per-recipient subject lines and 1-sentence topic paraphrases from
 * the outreach-send-playbook.md (§2 + §3).
 *
 * The CSV in the marketing agent's output dir is the human-editable source
 * of truth for status (queued / sent / replied / converted). This TS file
 * is the deterministic input to scripts/send-outreach.ts: each record has
 * everything buildEmail() needs to compose subject + body without any
 * runtime CSV parsing, so the script stays single-file-runnable via
 * `tsx scripts/send-outreach.ts --slug <slug> [--dry-run]`.
 *
 * EMAIL ADDRESSES: the marketing CSV does not currently store recipient
 * emails (founder maintains them out-of-band for privacy). Before sending,
 * the founder can either:
 *   (a) edit the `email` field below for the recipient they're about to
 *       contact, or
 *   (b) pass `--to <email>` on the command line to override at send time.
 *
 * Either path keeps the dry-run flow functional without any email present.
 */

export type OutreachRecipient = {
  /** Stable URL slug — matches docs/outreach-debates/<slug>.md and the agons table share_id. */
  slug: string;
  /** Recipient display name (used in the email salutation). */
  name: string;
  /** Recipient email address. May be empty until the founder fills it in or passes --to. */
  email: string;
  /** Public agon URL with UTM tags pre-applied (per playbook §4). */
  agon_url: string;
  /** 1-sentence paraphrase of the debate topic (per playbook §3 per-recipient table). */
  topic_line: string;
  /**
   * Subject line override (per playbook §2 table). Optional — if absent,
   * buildEmail() falls back to an algorithmic subject derived from topic_line.
   */
  subject_line?: string;
};

const BASE_URL = "https://consultthedead.com/agora/a";
const CAMPAIGN = "founder-may26";

function agonUrl(slug: string): string {
  const params = new URLSearchParams({
    utm_source: "outreach",
    utm_medium: "email",
    utm_campaign: CAMPAIGN,
    utm_content: slug,
  });
  return `${BASE_URL}/${slug}?${params.toString()}`;
}

/**
 * The 30-recipient outreach roster for the founder-outreach-may26 batch.
 * Order matches the marketing CSV (alphabetical by slug).
 */
export const OUTREACH_LIST: OutreachRecipient[] = [
  {
    slug: "abhishek-chakravarty",
    name: "Abhishek Chakravarty",
    email: "",
    agon_url: agonUrl("abhishek-chakravarty"),
    topic_line:
      "whether to keep competing on price at Youform or reposition as premium at $18K MRR",
    subject_line: "3 dead strategists argued your Youform pricing question",
  },
  {
    slug: "alex-van-le",
    name: "Alex Van Le",
    email: "",
    agon_url: agonUrl("alex-van-le"),
    topic_line:
      "whether to raise funding again for your best AI app or stay bootstrapped with the portfolio",
    subject_line: "Your 'raise vs. stay bootstrapped' question, argued by 3 minds",
  },
  {
    slug: "ali-rohde",
    name: "Ali Rohde",
    email: "",
    agon_url: agonUrl("ali-rohde"),
    topic_line:
      "whether Outset Capital and VCSheet should merge or stay separate entities",
    subject_line:
      "Machiavelli + Sun Tzu on running Outset Capital AND VCSheet simultaneously",
  },
  {
    slug: "andris-reinman",
    name: "Andris Reinman",
    email: "",
    agon_url: agonUrl("andris-reinman"),
    topic_line:
      "how to scale the paid product without alienating the open-source community behind it",
    subject_line:
      "3 minds on monetizing open-source without losing your community",
  },
  {
    slug: "arjun-jain",
    name: "Arjun Jain",
    email: "",
    agon_url: agonUrl("arjun-jain"),
    topic_line:
      "when and how to shut down the agency and commit fully to the $500K ARR product",
    subject_line: "When to kill the agency (your $500K ARR question, argued)",
  },
  {
    slug: "arsen-ibragimov",
    name: "Arsen Ibragimov",
    email: "",
    agon_url: agonUrl("arsen-ibragimov"),
    topic_line:
      "whether to fully decouple your SaaS from the agency or keep it as a distribution channel",
    subject_line: "Your agency-vs-product question: 3 minds, one debate",
  },
  {
    slug: "brennan-dunn",
    name: "Brennan Dunn",
    email: "",
    agon_url: agonUrl("brennan-dunn"),
    topic_line:
      "how to decide what to build next without letting the trauma of the previous failure distort you",
    subject_line:
      "Marcus Aurelius on building after a co-founder buyout + a prior flop",
  },
  {
    slug: "caleb-porzio",
    name: "Caleb Porzio",
    email: "",
    agon_url: agonUrl("caleb-porzio"),
    topic_line:
      "whether to introduce an enterprise tier or stay accessible and protect the open-source community",
    subject_line:
      "Your OSS enterprise tier question — Marcus Aurelius, Machiavelli, Sun Tzu weighed in",
  },
  {
    slug: "cameron-trew",
    name: "Cameron Trew",
    email: "",
    agon_url: agonUrl("cameron-trew"),
    topic_line:
      "whether to diversify away from LinkedIn now or keep riding the platform at $62K MRR",
    subject_line:
      "Sun Tzu on riding LinkedIn vs. diversifying after $62K MRR",
  },
  {
    slug: "charles-hudson",
    name: "Charles Hudson",
    email: "",
    agon_url: agonUrl("charles-hudson"),
    topic_line:
      "whether 75-100 bets per fund is the right pre-seed strategy or if you should reduce volume for quality",
    subject_line:
      "75-100 bets per fund — Marie Curie + 2 others argued the tradeoffs",
  },
  {
    slug: "daniel-peris",
    name: "Daniel Peris",
    email: "",
    agon_url: agonUrl("daniel-peris"),
    topic_line:
      "whether to define the GEO category aggressively now or wait for it to mature",
    subject_line:
      "3 minds on defining the GEO category vs. waiting for it to mature",
  },
  {
    slug: "dmytro-krasun",
    name: "Dmytro Krasun",
    email: "",
    agon_url: agonUrl("dmytro-krasun"),
    topic_line:
      "whether to consolidate the screenshot tools portfolio or keep making small diversified bets",
    subject_line:
      "Consolidate or keep diversifying? 3 minds on your screenshot portfolio",
  },
  {
    slug: "fernando-pessagno",
    name: "Fernando Pessagno",
    email: "",
    agon_url: agonUrl("fernando-pessagno"),
    topic_line:
      "whether to prune the design portfolio aggressively or maintain diversification after $500K",
    subject_line:
      "3 minds argued your product pruning question (post-$500K)",
  },
  {
    slug: "harry-brodsky",
    name: "Harry Brodsky",
    email: "",
    agon_url: agonUrl("harry-brodsky"),
    topic_line:
      "whether to keep expanding the market at $500K ARR or re-niche before a bigger competitor squeezes you",
    subject_line:
      "Sun Tzu + Machiavelli on re-niching at $500K ARR before you get squeezed",
  },
  {
    slug: "jason-chapman",
    name: "Jason Chapman",
    email: "",
    agon_url: agonUrl("jason-chapman"),
    topic_line:
      "how to build systematic safeguards against blind spots when there's no investment committee",
    subject_line: "3 minds on blind-spot prevention as a solo GP",
  },
  {
    slug: "jonathan-chan",
    name: "Jonathan Chan",
    email: "",
    agon_url: agonUrl("jonathan-chan"),
    topic_line:
      "whether to kill the weaker business and go all-in or keep both for safety at $30K/mo",
    subject_line:
      "Kill the weaker business or keep both? 3 minds argued your $30K/mo question",
  },
  {
    slug: "julian-shapiro",
    name: "Julian Shapiro",
    email: "",
    agon_url: agonUrl("julian-shapiro"),
    topic_line:
      "how to balance content creation with active investing without letting one hollow out the other",
    subject_line:
      "Marcus Aurelius on writing vs. investing — can you protect both?",
  },
  {
    slug: "louis-pereira",
    name: "Louis Pereira",
    email: "",
    agon_url: agonUrl("louis-pereira"),
    topic_line:
      "whether to rebuild the $20K MRR product from scratch or keep shipping on the hackathon codebase",
    subject_line:
      "Rebuild from scratch vs. ship on a shaky foundation? 3 minds debated it",
  },
  {
    slug: "mattia-pomelli",
    name: "Mattia Pomelli",
    email: "",
    agon_url: agonUrl("mattia-pomelli"),
    topic_line:
      "whether to double down on marketing to capture the launch wave or invest in product depth",
    subject_line:
      "3 minds on what to do after an explosive launch at $10K MRR",
  },
  {
    slug: "monique-woodard",
    name: "Monique Woodard",
    email: "",
    agon_url: agonUrl("monique-woodard"),
    topic_line:
      "how to balance long-term demographic thesis plays with LP pressure for near-term returns",
    subject_line:
      "Long-term thesis vs. LP return pressure — 3 minds on Cake Ventures' question",
  },
  {
    slug: "natty-zola",
    name: "Natty Zola",
    email: "",
    agon_url: agonUrl("natty-zola"),
    topic_line:
      "whether to start raising Fund II now while momentum is fresh or wait for the portfolio to mature",
    subject_line:
      "Raise Fund II now or wait for returns? Machiavelli + 2 others debated it",
  },
  {
    slug: "neil-murray",
    name: "Neil Murray",
    email: "",
    agon_url: agonUrl("neil-murray"),
    topic_line:
      "whether to raise a larger Fund IV or keep Nordic Web Ventures deliberately small",
    subject_line:
      "3 minds on keeping Nordic Web Ventures deliberately small vs. raising a larger Fund IV",
  },
  {
    slug: "pascal-levy-garboua",
    name: "Pascal Levy-Garboua",
    email: "",
    agon_url: agonUrl("pascal-levy-garboua"),
    topic_line:
      "whether to keep acquiring micro-SaaS companies or consolidate and optimize the $120K MRR portfolio",
    subject_line:
      "Acquire more or consolidate the $120K MRR portfolio? 3 minds argued it",
  },
  {
    slug: "pauline-clavelloux",
    name: "Pauline Clavelloux",
    email: "",
    agon_url: agonUrl("pauline-clavelloux"),
    topic_line:
      "when to hire the first person and for which role — or stay solo and cap growth",
    subject_line:
      "Your first hire timing question argued by Machiavelli, Aurelius + Curie",
  },
  {
    slug: "phuc-le",
    name: "Phuc Le",
    email: "",
    agon_url: agonUrl("phuc-le"),
    topic_line:
      "whether to pick one SaaS and invest everything or keep running both at $15.8K/mo",
    subject_line: "Pick one SaaS or keep both? 3 minds on your $15.8K/mo question",
  },
  {
    slug: "piotr-kulpinski",
    name: "Piotr Kulpinski",
    email: "",
    agon_url: agonUrl("piotr-kulpinski"),
    topic_line:
      "whether to gate more features behind the paid tier or protect the open-source goodwill driving distribution",
    subject_line:
      "3 minds on gating OSS features vs. keeping the community open",
  },
  {
    slug: "rob-hallam",
    name: "Rob Hallam",
    email: "",
    agon_url: agonUrl("rob-hallam"),
    topic_line:
      "whether to buy out your partner, compromise on vision, or split the $23K MRR product",
    subject_line:
      "Buy out, compromise, or split? 3 minds on your $23K MRR partnership decision",
  },
  {
    slug: "rom-n-czerny",
    name: "Romàn Czerny",
    email: "",
    agon_url: agonUrl("rom-n-czerny"),
    topic_line:
      "whether to keep running the proven playbook or innovate on your approach at $27K MRR",
    subject_line:
      "3 minds on repeating your old playbook vs. innovating at $27K MRR",
  },
  {
    slug: "sarah-chen",
    name: "Sarah Chen",
    email: "",
    agon_url: agonUrl("sarah-chen"),
    topic_line:
      "whether to diversify Banana Capital's portfolio or concentrate in fewer companies",
    subject_line:
      "Diversify or concentrate? 3 minds on your Banana Capital portfolio question",
  },
  {
    slug: "val-sopi",
    name: "Val Sopi",
    email: "",
    agon_url: agonUrl("val-sopi"),
    topic_line:
      "whether to invest in features to compete or stay lean and own a niche at 5-figure ARR",
    subject_line:
      "3 minds on staying lean vs. feature-competing after your 20-hour build",
  },
];

/** Lookup helper used by the send script. Pure; safe to import in tests. */
export function findRecipient(slug: string): OutreachRecipient | undefined {
  return OUTREACH_LIST.find((r) => r.slug === slug);
}
