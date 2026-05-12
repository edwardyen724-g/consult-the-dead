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
  /**
   * 2-3 sentence excerpt from the ### Recommended Action section of the
   * debate's Council Consensus. When present, buildEmail() uses the
   * Variant A "The Gift" template — leading with the inline excerpt before
   * the debate link. When absent, falls back to the plain link-only template.
   */
  consensus_excerpt?: string;
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
    consensus_excerpt:
      "This quarter, identify your two or three highest-ROI customers, begin documenting their outcomes as case studies immediately, and raise prices on all new customers to at least $28K MRR within 30 days. Do not wait for the case studies to publish before changing the price — let the new price signal the repositioning and the published outcome make it credible.",
  },
  {
    slug: "alex-van-le",
    name: "Alex Van Le",
    email: "",
    agon_url: agonUrl("alex-van-le"),
    topic_line:
      "whether to raise funding again for your best AI app or stay bootstrapped with the portfolio",
    subject_line: "Your 'raise vs. stay bootstrapped' question, argued by 3 minds",
    consensus_excerpt:
      "Consolidate to your single highest-revenue app within the next two to four weeks by sunsetting all others, then run 90 days of clean single-app measurement before opening any funding conversation. Let the empirical result — unit economics, growth rate, churn, margin — determine whether capital would accelerate a proven engine or paper over an unproven one.",
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
    consensus_excerpt:
      "Install a fund operator and codify a written information barrier with LPs this week — then direct sixty percent of your personal working hours to VCSheet's distribution for the next twelve months, while reserving your own judgment for final investment decisions at the fund. The operator handles fund mechanics; your name and deliberative faculty remain on every investment call.",
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
    consensus_excerpt:
      "Publish a formal governance charter this week that installs independent maintainers, a public roadmap, and a clear feature boundary between open-source and paid tiers — on your terms, before critics weaponize the ambiguity further. Simultaneously instrument every conversion pathway to produce a hard dependency map within 30 days.",
  },
  {
    slug: "arjun-jain",
    name: "Arjun Jain",
    email: "",
    agon_url: agonUrl("arjun-jain"),
    topic_line:
      "when and how to shut down the agency and commit fully to the $500K ARR product",
    subject_line: "When to kill the agency (your $500K ARR question, argued)",
    consensus_excerpt:
      "Announce a six-month agency closure to all existing clients this week, stop accepting new engagements today with zero exceptions, and execute a full identity pivot simultaneously. Remove agency framing from every sales deck, conference bio, website, and content piece so the market begins updating its model of you before the legal closure date.",
  },
  {
    slug: "arsen-ibragimov",
    name: "Arsen Ibragimov",
    email: "",
    agon_url: agonUrl("arsen-ibragimov"),
    topic_line:
      "whether to fully decouple your SaaS from the agency or keep it as a distribution channel",
    subject_line: "Your agency-vs-product question: 3 minds, one debate",
    consensus_excerpt:
      "Immediately conduct a retrospective contact-level audit of every existing customer — trace each back to their first touchpoint and classify them as agency-referred, agency-adjacent, or fully independent. Decouple fully when the audit reveals that 40% or more of your customers arrived through zero agency contact.",
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
    consensus_excerpt:
      "Build a single-page causal map of the first failure — naming each broken mechanism (distribution, pricing, co-founder misalignment, pain severity) and whether it is present in your current build. Then immediately run a quantitative customer survey weighted by retention and expansion revenue before touching your roadmap.",
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
    consensus_excerpt:
      "In the next 90 days, before any enterprise pricing is public, create an independent open-source foundation with a contractually mandated percentage of enterprise revenue flowing into it — then invite your top contributors to co-design its governance charter. Launch the enterprise tier only after the foundation has a visible inflow and a public audit trail.",
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
    consensus_excerpt:
      "Launch a tightly instrumented, committed expansion to one adjacent platform — Twitter/X or Reddit professional communities — within thirty days, financed by LinkedIn revenue, explicitly designed to answer whether your mechanism is portable. Do not run a passive test; run a real product with real instrumentation so the result is an empirical fact.",
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
    consensus_excerpt:
      "Pause new deal evaluation for 45 days and build three explicit artifacts: a founder-signal taxonomy, a market-configuration thesis specifying which problem spaces you will and will not fund, and a written set of disqualification criteria you commit to honoring. Then return to full volume — treating any deviation from the pre-committed framework as a mandatory pause trigger.",
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
    consensus_excerpt:
      "Spend the next two weeks simultaneously instrumenting your highest-confidence customer outcomes and drafting your category framework — then publish both together as a single founding document before the end of this quarter. The document must contain specific, reproducible outcome data that competitors cannot replicate because they lack your longitudinal customer base.",
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
    consensus_excerpt:
      "Make the constitutional commitment this week — declare explicitly that you are building one load-bearing product, not a diversification portfolio — and run a tight 21-day instrumentation sprint across every tool using identical metrics. Once the data surfaces the anomalous tool, sunset or sell everything else within 90 days.",
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
    consensus_excerpt:
      "Spend exactly one week building a single measurement instrument — revenue per hour of maintenance attention per product, plus a growth trajectory score — then use that data to identify your top one or two products and eliminate everything else permanently. The measurement week is the difference between a cut you revisit in six months and a cut you never question again.",
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
    consensus_excerpt:
      "Audit your user base this week to isolate the cohort with the lowest churn, highest referral density, and strongest qualitative signal that they describe your absence as a professional loss. Within 60 days, embed at least two structural switching costs — data portability friction, workflow integration depth, or community lock-in.",
  },
  {
    slug: "jason-chapman",
    name: "Jason Chapman",
    email: "",
    agon_url: agonUrl("jason-chapman"),
    topic_line:
      "how to build systematic safeguards against blind spots when there's no investment committee",
    subject_line: "3 minds on blind-spot prevention as a solo GP",
    consensus_excerpt:
      "Complete a locked quantitative scorecard with pre-specified thresholds for gross margin, retention, and CAC immediately after your first founder meeting — before modeling any numbers — and treat any impulse to override those thresholds as a signal that bias has captured your judgment. Supplement this with one mandatory pre-term-sheet consultation with a person whose position was built on a thesis that contradicts yours.",
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
    consensus_excerpt:
      "This week, write down the single criterion — revenue per hour of your personal attention over the past eight months — and sign your name to it as the binding selector before you calculate the result. Then execute the shutdown of whichever business the criterion condemns within thirty days, with a clean termination and no gradual wind-down.",
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
    consensus_excerpt:
      "Block the first 2-3 hours of every working day as inviolable writing time, enforced as a fiduciary obligation before any board seat or deal is accepted. Apply a single hard filter to every new investment: does this company's core problem sit at the explicit intersection of topics your existing body of work already investigates? If not, decline regardless of the financial merit.",
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
    consensus_excerpt:
      "Spend this week instrumenting your codebase aggressively for observability, then produce a written failure-cascade document naming the specific three failure modes threatening your $20K MRR, in what sequence, and with what triggers. Authorize surgical rebuilds only of the components that appear on that document — ship all other features untouched.",
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
    consensus_excerpt:
      "Immediately freeze paid acquisition and implement precision retention instrumentation on your existing users for 30 days — identify the single interaction or feature loop that predicts long-term engagement with statistical confidence. Once that mechanism is identified, rebuild your onboarding around it and re-launch acquisition targeting only the user profile that activates that loop.",
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
    consensus_excerpt:
      "Within Fund I, build the demographic sub-thesis milestone dashboard and use it as a triage instrument — LPs who respond to superior evidence with continued NAV-only pressure are identified as structurally incompetent and must be managed toward passive status or exit. For Fund II, draft explicit LP agreement language stating that demographic thesis positions will not be modified in response to interim NAV pressure.",
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
    consensus_excerpt:
      "Identify the single portfolio company closest to a liquidity event and direct every resource toward closing a partial or full exit within the next 90 days. Once that verified DPI data point exists, immediately open anchor LP conversations using it as the load-bearing foundation — frame current positions as thesis validation in motion only after the verified return establishes your credibility.",
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
    consensus_excerpt:
      "Conduct a rigorous Fund III time-per-company audit this week before any LP outreach begins, then let that number set your hard ceiling. If bandwidth permits meaningful engagement with eight or more new companies, raise Fund IV at $10-11M with a contractually enforced eight-company cap — do not open a single LP conversation before the audit is complete.",
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
    consensus_excerpt:
      "Spend the next six months on two parallel workstreams: extract precise quantitative profiles for all three companies (churn rate, net margin, growth ceiling, inter-company subsidy effects) until a genuine anomaly surfaces; and delegate all daily operating decisions so your absence for ninety days produces no degradation. Only after both workstreams complete do you define an acquisition profile and act on it.",
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
    consensus_excerpt:
      "Spend exactly two weeks building three specific dashboards: revenue and return per hour of attention per product, support burden per customer segment, and growth sensitivity to your personal involvement. Then immediately hire an operator whose explicit ninety-day mandate is to own and extend those dashboards while absorbing all execution.",
  },
  {
    slug: "phuc-le",
    name: "Phuc Le",
    email: "",
    agon_url: agonUrl("phuc-le"),
    topic_line:
      "whether to pick one SaaS and invest everything or keep running both at $15.8K/mo",
    subject_line: "Pick one SaaS or keep both? 3 minds on your $15.8K/mo question",
    consensus_excerpt:
      "Pull the unsolicited expansion revenue ratio for both products from your billing system today — identify which product has customers upgrading without being asked — and within 30 days completely dissolve or sell the weaker product. Do not merely deprioritize it; eliminate it structurally, because a product you can still return to ensures you never fully commit to the one that matters.",
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
    consensus_excerpt:
      "Invest your engineering budget entirely in paid-tier capabilities that were never part of the open-source directory — enterprise integrations, support SLAs, workflow automation, team management tooling — and price them to reflect genuine new value. Hold the original open core inviolate; gate nothing that was previously free.",
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
    consensus_excerpt:
      "Spend 48 hours — with two people who know your partner's external situation — to determine whether they have independent financing or a quiet buyer relationship, then make a specific, written buyout offer this week. The written offer is the moment you stop being the custodian of an ambiguity and start being the custodian of what you actually built.",
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
    consensus_excerpt:
      "Before touching a dashboard or conducting any market analysis, write in explicit terms the specific conditions under which you would conclude the playbook must be abandoned — conditions harsh enough your proven-operator identity would resist signing them. Then instrument every acquisition and retention cohort this week, measuring the exact variables your falsification conditions named.",
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
    consensus_excerpt:
      "Audit your specific knowledge domain ruthlessly and identify exactly two companies where you can conduct diligence dense enough to genuinely revise your mental model — not confirm a thesis, but force a theoretical revision. Secure a board seat in each, deploy enough capital to own at least 10%, and execute at least two independently verifiable interventions per company within the first six months.",
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
    consensus_excerpt:
      "Instrument your product immediately to capture precise behavioral traces from every active user — which workflows they build around it, where they hit ceilings, what they work around — and simultaneously make your current customers structurally expensive to exit through deep integration hooks or multi-year commitments. Once behavioral data identifies the single function generating every unit of revenue, make that function dramatically more precise before touching anything adjacent.",
  },
];

/** Lookup helper used by the send script. Pure; safe to import in tests. */
export function findRecipient(slug: string): OutreachRecipient | undefined {
  return OUTREACH_LIST.find((r) => r.slug === slug);
}