#!/usr/bin/env node
/**
 * Runs personalized Agora debates for each person on the Phase 0 target list.
 * Calls the Anthropic API directly (no web server needed).
 * Saves each debate output to docs/outreach-debates/<name>.md
 *
 * Usage: node scripts/run-outreach-debates.mjs
 * Requires: ANTHROPIC_API_KEY in .env or environment
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load API key from .env
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY not found in .env or environment");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: API_KEY });

// Model config
const TURN_MODEL = "claude-sonnet-4-6";
const CONVERGENCE_MODEL = "claude-sonnet-4-6";
const TURN_MAX_TOKENS = 600;
const CONVERGENCE_MAX_TOKENS = 2000;

// Load framework
function loadFramework(slug) {
  const fwPath = path.join(ROOT, "frameworks", slug, "framework.json");
  if (!fs.existsSync(fwPath)) return null;
  return JSON.parse(fs.readFileSync(fwPath, "utf-8"));
}

// Convert framework to system prompt (simplified version of frameworkPrompt.ts)
function frameworkToSystemPrompt(fw) {
  const meta = fw.meta || {};
  const lens = fw.perceptual_lens || {};
  const constructs = fw.bipolar_constructs || [];
  const predictions = fw.behavioral_divergence_predictions || [];
  const incidents = fw.critical_incident_database || [];

  let prompt = `You reason through problems using ${meta.person}'s documented decision-making framework.\n\n`;
  prompt += `═══════════════════════════════════════\nPERCEPTUAL LENS (highest priority)\n═══════════════════════════════════════\n`;
  prompt += `${lens.statement || ""}\n`;
  if (lens.what_they_notice_first) prompt += `What you notice FIRST: ${lens.what_they_notice_first}\n`;
  if (lens.what_they_ignore) prompt += `What you IGNORE: ${lens.what_they_ignore}\n`;

  if (constructs.length > 0) {
    prompt += `\n═══════════════════════════════════════\nCOGNITIVE CONSTRUCTS\n═══════════════════════════════════════\n`;
    for (const c of constructs.slice(0, 10)) {
      prompt += `\n• ${c.construct}\n  + ${c.positive_pole}\n  − ${c.negative_pole}\n  → ${c.behavioral_implication}\n`;
    }
  }

  if (predictions.length > 0) {
    prompt += `\n═══════════════════════════════════════\nBEHAVIORAL DIVERGENCE PREDICTIONS\n═══════════════════════════════════════\n`;
    for (const p of predictions.slice(0, 6)) {
      prompt += `\nWhen facing: ${p.situation_type}\nOrdinary response: ${p.ordinary_response}\nYOUR response: ${p.framework_response}\nBecause: ${p.because}\n`;
    }
  }

  if (incidents.length > 0) {
    prompt += `\n═══════════════════════════════════════\nREFERENCE DECISIONS (calibration examples)\n═══════════════════════════════════════\n`;
    for (const inc of incidents.slice(0, 8)) {
      prompt += `\nDECISION: ${inc.decision}\nCONTEXT: ${inc.context}\n`;
      if (inc.cdm_probes?.situation_framing) prompt += `FRAMING: ${inc.cdm_probes.situation_framing}\n`;
    }
  }

  prompt += `\n═══════════════════════════════════════\nREASONING PROTOCOL\n═══════════════════════════════════════\n`;
  prompt += `1. FRAME — apply the perceptual lens\n2. CATEGORIZE — map onto bipolar constructs\n3. REASON — work through the decision using the framework\n4. DIVERGE — note where reasoning differs from conventional wisdom\n5. TAG — reference which framework element drives each step\n\nSpeak in first person. Be direct, opinionated, and specific.\n`;

  return prompt;
}

const MIND_NAMES = {
  "niccolo-machiavelli": "Niccolò Machiavelli",
  "marie-curie": "Marie Curie",
  "sun-tzu": "Sun Tzu",
  "isaac-newton": "Isaac Newton",
  "nikola-tesla": "Nikola Tesla",
  "leonardo-da-vinci": "Leonardo da Vinci",
  "marcus-aurelius": "Marcus Aurelius",
};

// Build turn prompt
function buildTurnPrompt({ topic, selfName, others, round, totalRounds, priorTurns }) {
  const otherNames = others.map((o) => o.name).join(", ");

  let priorTranscript = "";
  if (priorTurns.length > 0) {
    priorTranscript = "\n\nWHAT HAS BEEN SAID SO FAR:\n" +
      priorTurns.map((t) => `[${t.mindName} — Round ${t.round}]\n${t.content}`).join("\n\n");
  }

  let roundRules = "";
  if (round === 1) {
    roundRules = `This is ROUND 1 — you are establishing your opening position. The other minds have not spoken yet, so do not engage with them.

Write 150–250 words of flowing prose covering, in order:
- One sentence stating your stance on this exact decision.
- Two to three sentences justifying that stance via your framework. You MUST name a specific construct, perceptual cue, or documented incident from your framework. If the justification could be pasted into another mind's mouth without edits, it is too generic — rewrite it.
- One closing sentence on what the user should actually do if your logic wins.`;
  } else if (round === totalRounds) {
    roundRules = `This is ROUND ${round} — the final round. The full prior transcript is below.

Write 150–250 words of flowing prose covering, in order:
- One sentence naming a specific point from another mind (by name) that you now concede or have updated on.
- Two to three sentences sharpening the disagreement that remains — what do you still hold firm on, and why?
- One closing sentence on the single most important thing the user should take away from this entire agon.`;
  } else {
    roundRules = `This is ROUND ${round} of ${totalRounds}. The prior transcript is below.

Write 150–250 words of flowing prose covering, in order:
- One sentence naming ${otherNames} by name and addressing a specific claim one of them made.
- Two to three sentences developing your own position further, citing a specific framework element (construct, incident, or perceptual cue) that the prior round surfaced.
- One sentence on what the user should actually do if your updated logic wins.`;
  }

  return `You are ${selfName}. You are in an agon (structured contest of reasoning) with: ${otherNames}.

TOPIC — the decision the user is struggling with:
${topic}
${priorTranscript}

${roundRules}

CRITICAL RULES:
- Write flowing prose, not bullet points or labeled sections.
- Never hedge with "it depends" — commit to a position.
- Stay in 150–250 words. Going over is a failure.`;
}

// Build convergence prompt
function buildConvergencePrompt({ topic, council, turns }) {
  const transcript = turns.map((t) => `[${t.mindName} — Round ${t.round}]\n${t.content}`).join("\n\n---\n\n");
  const names = council.map((c) => c.name).join(", ");

  return `TOPIC: ${topic}

COUNCIL: ${names}

FULL DEBATE TRANSCRIPT:
${transcript}

---

Produce a JSON object with these exact keys. Every value must be a non-empty string (or string array for "steps"). Be decisive — recommend, don't just summarize.

{
  "points": "What did all minds agree on? 2-3 sentences.",
  "pointsSummary": "One-line summary for a hover tooltip.",
  "tensions": "Where do they fundamentally disagree, and why? 2-3 sentences.",
  "tensionsSummary": "One-line summary.",
  "action": "Single best path forward. Be specific and actionable. 2-3 sentences.",
  "actionSummary": "One-line summary.",
  "steps": ["Step 1 — concrete action this week", "Step 2", "Step 3"],
  "stepsSummary": "One-line summary.",
  "risks": "What could go wrong? Which mind raised the most important warning? 2-3 sentences.",
  "risksSummary": "One-line summary."
}

Return ONLY the JSON object. No surrounding prose, no code fences.`;
}

// Run a single agon
async function runAgon(topic, mindSlugs) {
  const council = mindSlugs.map((slug) => ({
    slug,
    name: MIND_NAMES[slug] || slug,
  }));

  const systemPrompts = new Map();
  for (const slug of mindSlugs) {
    const fw = loadFramework(slug);
    if (fw) {
      systemPrompts.set(slug, frameworkToSystemPrompt(fw));
    } else {
      systemPrompts.set(slug, `You reason as ${MIND_NAMES[slug]}. Speak in their documented voice.`);
    }
  }

  const allTurns = [];
  const rounds = 3;

  for (let round = 1; round <= rounds; round++) {
    for (const mind of council) {
      const others = council.filter((c) => c.slug !== mind.slug);
      const userPrompt = buildTurnPrompt({
        topic,
        selfName: mind.name,
        others,
        round,
        totalRounds: rounds,
        priorTurns: allTurns,
      });

      process.stdout.write(`  Round ${round}, ${mind.name}... `);

      const msg = await anthropic.messages.create({
        model: TURN_MODEL,
        max_tokens: TURN_MAX_TOKENS,
        system: systemPrompts.get(mind.slug),
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = msg.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      allTurns.push({ mindSlug: mind.slug, mindName: mind.name, round, content });
      console.log(`✓ (${msg.usage?.input_tokens || "?"}/${msg.usage?.output_tokens || "?"} tokens)`);
    }
  }

  // Convergence
  process.stdout.write("  Consensus... ");
  const convPrompt = buildConvergencePrompt({ topic, council, turns: allTurns });
  const convMsg = await anthropic.messages.create({
    model: CONVERGENCE_MODEL,
    max_tokens: CONVERGENCE_MAX_TOKENS,
    system: "You are a strategic synthesis analyst. You distill multi-perspective debates into structured, actionable JSON. You never hedge. You always return valid JSON with no surrounding prose.",
    messages: [{ role: "user", content: convPrompt }],
  });

  const rawText = convMsg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let consensus;
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    consensus = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    consensus = { raw: rawText, error: "Failed to parse consensus JSON" };
  }

  console.log(`✓ (${convMsg.usage?.input_tokens || "?"}/${convMsg.usage?.output_tokens || "?"} tokens)`);

  return { turns: allTurns, consensus };
}

// Format debate as markdown
function formatDebate(name, company, topic, pastDecision, result, minds) {
  const mindNames = minds.map((s) => MIND_NAMES[s] || s);
  let md = `# Agora Debate: ${name}\n`;
  md += `**For:** ${name} (${company})\n`;
  md += `**Topic:** ${topic}\n`;
  md += `**Council:** ${mindNames.join(", ")}\n`;
  md += `**Generated:** ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `---\n\n`;

  // Group turns by round
  for (let round = 1; round <= 3; round++) {
    md += `## Round ${round}\n\n`;
    const roundTurns = result.turns.filter((t) => t.round === round);
    for (const turn of roundTurns) {
      md += `### ${turn.mindName}\n\n${turn.content}\n\n`;
    }
  }

  md += `---\n\n## Council Consensus\n\n`;

  const c = result.consensus;
  if (c.error) {
    md += `*Consensus parsing failed. Raw output:*\n\n${c.raw}\n`;
  } else {
    md += `### Consensus Points\n${c.points}\n\n`;
    md += `### Key Tensions\n${c.tensions}\n\n`;
    md += `### Recommended Action\n${c.action}\n\n`;
    md += `### Immediate Next Steps\n`;
    if (Array.isArray(c.steps)) {
      for (const s of c.steps) md += `- ${s}\n`;
    }
    md += `\n### Risk Factors\n${c.risks}\n`;
  }

  md += `\n---\n\n*Generated by [Consult The Dead — The Agora](https://consultthedead.com/agora)*\n`;
  return md;
}

// ─── TARGET LIST ─────────────────────────────────────────────
// Each entry: { name, company, topic (decision to debate), minds (3 slugs) }
// Topics are framed as the decision they're facing NOW (inferred from their IH article context)

const TARGETS = [
  // SOLO FOUNDERS (22)
  {
    name: "Abhishek Chakravarty",
    company: "Youform ($18K MRR)",
    topic: "I've been competing on price in a crowded form-builder market. My product is gaining traction at $18K MRR, but I'm worried that price competition is a race to the bottom. Should I start raising prices and repositioning as a premium product, or keep the low-price strategy that's working?",
    minds: ["niccolo-machiavelli", "marie-curie", "sun-tzu"],
  },
  {
    name: "Dmytro Krasun",
    company: "Screenshot tools portfolio ($25K+ MRR)",
    topic: "I've hit $25K MRR by deliberately building small, unglamorous tools instead of chasing big ideas. But I'm now running a portfolio of these tools solo. Should I consolidate into fewer products and go deeper, or keep diversifying with more small bets?",
    minds: ["sun-tzu", "marcus-aurelius", "marie-curie"],
  },
  {
    name: "Jonathan Chan",
    company: "Portfolio ($30K/mo)",
    topic: "I quit my $420K/year job eight months ago and my portfolio of two businesses is at $30K/month. But the two businesses compete for my attention. Should I kill the weaker one and go all-in on the stronger, or keep both running since the combined revenue provides safety?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marcus-aurelius"],
  },
  {
    name: "Phuc Le",
    company: "Two SaaS products ($15.8K/mo)",
    topic: "I'm running two SaaS products at a combined $15.8K/month. Both are growing slowly but neither is breaking out. Should I pick one and invest everything in growth, or keep both as a diversified portfolio at the cost of slower growth on each?",
    minds: ["marie-curie", "niccolo-machiavelli", "marcus-aurelius"],
  },
  {
    name: "Arsen Ibragimov",
    company: "SaaS tool ($10K+/mo)",
    topic: "I built a SaaS tool on top of my agency's workflows and it's now at $10K/month. But I'm still running the agency alongside it. When is the right time to fully decouple the product from the agency and go standalone — or should I keep the agency as a built-in distribution channel?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marie-curie"],
  },
  {
    name: "Alex Van Le",
    company: "AI app portfolio ($20K/mo)",
    topic: "My VC-backed startup failed and I pivoted to bootstrapping a portfolio of AI apps. I'm at $20K/month across multiple apps. But I'm spread thin. Should I raise funding again for the best-performing app, or stay bootstrapped and keep the portfolio approach?",
    minds: ["marcus-aurelius", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Louis Pereira",
    company: "AI tool ($20K MRR)",
    topic: "I built my product in a half-day hackathon and it's now at $20K MRR after two years. But the codebase reflects its hackathon origins — it's fragile. Should I rebuild the product from scratch with proper architecture, or keep shipping features on the shaky foundation while revenue is growing?",
    minds: ["leonardo-da-vinci", "marie-curie", "sun-tzu"],
  },
  {
    name: "Piotr Kulpinski",
    company: "Open-source directory + boilerplate ($13K/mo)",
    topic: "I turned an open-source directory into a paid boilerplate product at $13K/month. But my community expects things to stay free. Should I gate more features behind the paid tier to grow revenue, or keep the open-source goodwill that drives my distribution?",
    minds: ["niccolo-machiavelli", "marcus-aurelius", "sun-tzu"],
  },
  {
    name: "Rob Hallam",
    company: "Leadgen tool ($23K MRR)",
    topic: "After five failures, my leadgen tool hit $23K MRR in six months. I built it by spotting a pattern in my agency's workflows and partnering up. Now my partner wants to go in a different direction with the product. Should I buy them out, compromise on vision, or split the product?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marcus-aurelius"],
  },
  {
    name: "Andris Reinman",
    company: "Open-source monetized product ($13K MRR)",
    topic: "I maintained a well-known open-source project for years on donations. Now I've built a paid product on top of it at $13K MRR. But some community members feel betrayed by the monetization. How do I scale the paid product without losing the open-source community that gives me credibility and distribution?",
    minds: ["marcus-aurelius", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Val Sopi",
    company: "First SaaS (5-figure ARR)",
    topic: "I left my service company to build a product. I built it in 20 hours and it's now at a 5-figure ARR. But it's still bare-bones. Should I invest heavily in features to compete with established players, or stay lean and find a niche where the minimal product is enough?",
    minds: ["sun-tzu", "leonardo-da-vinci", "marie-curie"],
  },
  {
    name: "Pauline Clavelloux",
    company: "Product portfolio ($100K+/yr)",
    topic: "After nearly 10 years of not building, I finally took the leap and now have a portfolio generating over $100K/year. But I'm a solo operator managing multiple products. At what point do I hire my first person — and for which role? Or do I stay solo and cap my growth?",
    minds: ["niccolo-machiavelli", "marcus-aurelius", "marie-curie"],
  },
  {
    name: "Romàn Czerny",
    company: "Growth tool ($27K MRR)",
    topic: "I had a successful exit before and used the same growth tactic to build a new product to $27K MRR. But I'm essentially repeating my old playbook. Should I keep running the proven playbook even though the market has changed, or innovate on my approach at the risk of breaking what works?",
    minds: ["sun-tzu", "marie-curie", "marcus-aurelius"],
  },
  {
    name: "Mattia Pomelli",
    company: "AI design tool ($10K MRR)",
    topic: "I built my AI design tool in 3 weeks and hit $10K MRR in 6 weeks. The explosive launch is over and growth is normalizing. Should I double down on marketing to capture more of this initial wave, or invest in product depth and retention before the hype fades?",
    minds: ["sun-tzu", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Brennan Dunn",
    company: "Rebuilt SaaS ($30K MRR)",
    topic: "My original tool flopped and I bought out my co-founder and rebuilt from scratch. Now I'm at $30K MRR. But I'm carrying the psychological weight of the previous failure. How do I decide which features to build next without letting the trauma of the flop make me too conservative or too reactive?",
    minds: ["marcus-aurelius", "marie-curie", "leonardo-da-vinci"],
  },
  {
    name: "Daniel Peris",
    company: "GEO tool ($30K-$50K MRR)",
    topic: "I built a GEO (generative engine optimization) tool and it's growing fast — mid-five-figure MRR within a year. But GEO is an emerging category. Should I define the category aggressively and risk being wrong about the market, or wait for the category to mature and risk competitors catching up?",
    minds: ["sun-tzu", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Fernando Pessagno",
    company: "Design products portfolio",
    topic: "I got fired from my corporate job and built a portfolio of design products that's generated $500K over three years. But some products in the portfolio are underperforming. Should I prune aggressively and focus on the top 1-2, or maintain the full portfolio since the diversification protects me from single-product risk?",
    minds: ["marcus-aurelius", "sun-tzu", "marie-curie"],
  },
  {
    name: "Harry Brodsky",
    company: "SaaS tool ($500K ARR)",
    topic: "We pivoted from a niche market to a wider audience and hit $500K ARR. But going broad means we're now competing with bigger, better-funded tools. Should we keep expanding the addressable market, or re-niche into a defensible segment before a well-funded competitor squeezes us out?",
    minds: ["sun-tzu", "niccolo-machiavelli", "marcus-aurelius"],
  },
  {
    name: "Cameron Trew",
    company: "Kleo ($62K MRR)",
    topic: "I rebuilt my product from scratch after LinkedIn sent a cease-and-desist on v1. The rebuild worked — $62K MRR. But I'm still dependent on LinkedIn's platform. Should I diversify to other platforms now while I have momentum, or keep riding LinkedIn since that's where the proven demand is?",
    minds: ["sun-tzu", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Arjun Jain",
    company: "Agentic engineer tool ($500K ARR)",
    topic: "I spun my internal dev agency tool out as a standalone product and it's at $500K ARR. But I'm still running the agency alongside it. The agency funds the product but also distracts from it. When and how do I shut down the agency and go full product?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marcus-aurelius"],
  },
  {
    name: "Pascal Levy-Garboua",
    company: "Micro-SaaS portfolio ($120K MRR)",
    topic: "I've acquired 6 micro-SaaS companies. I shut one down, sold two, and run three at $120K MRR combined. I have capital to acquire more. Should I keep acquiring and growing the portfolio, or consolidate and optimize what I have? Each acquisition adds management complexity as a solo operator.",
    minds: ["niccolo-machiavelli", "marcus-aurelius", "marie-curie"],
  },
  {
    name: "Caleb Porzio",
    company: "Open-source ecosystem (5-figure MRR)",
    topic: "I've built a five-figure MRR business around an open-source ecosystem. My community is my moat. But open-source contributors expect transparency and low prices. Should I introduce a higher-priced enterprise tier that might alienate the community, or stay accessible and grow slower?",
    minds: ["marcus-aurelius", "niccolo-machiavelli", "sun-tzu"],
  },

  // SOLO GP / MICRO-VC (8)
  {
    name: "Neil Murray",
    company: "Nordic Web Ventures (Fund III, $6M)",
    topic: "I deliberately capped my Fund III at $6M instead of raising a much larger fund. Bigger fund means more management fees but also more portfolio companies to manage solo. As a solo GP, should I raise a larger Fund IV to capture more of the Nordic opportunity, or keep funds deliberately small to maintain quality and personal bandwidth?",
    minds: ["marcus-aurelius", "niccolo-machiavelli", "sun-tzu"],
  },
  {
    name: "Ali Rohde",
    company: "Outset Capital / VCSheet",
    topic: "I'm running both a VC fund (Outset Capital) and a platform business (VCSheet). Both are growing but competing for my time. Should I merge them into one entity where the platform feeds the fund, or keep them separate so each can optimize independently? And which deserves more of my attention right now?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marcus-aurelius"],
  },
  {
    name: "Julian Shapiro",
    company: "Julian Capital",
    topic: "I'm known primarily as a writer and educator, but I also run Julian Capital as a solo GP. The writing builds my brand and deal flow, but the investing takes time away from creating content. How should I balance content creation (which feeds deal flow) with active investing (which requires deep engagement with portfolio companies)?",
    minds: ["marcus-aurelius", "leonardo-da-vinci", "niccolo-machiavelli"],
  },
  {
    name: "Monique Woodard",
    company: "Cake Ventures",
    topic: "My fund thesis is built around demographic shifts — aging population, gen Z, changing consumer behavior. These trends play out over decades, but fund cycles are 7-10 years. How do I balance investing in truly long-term demographic thesis plays with the pressure to show near-term portfolio returns to LPs?",
    minds: ["marie-curie", "sun-tzu", "marcus-aurelius"],
  },
  {
    name: "Sarah Chen",
    company: "Banana Capital",
    topic: "As a solo GP running a small emerging fund, I'm trying to build a track record with limited capital. Should I make more, smaller bets to diversify my portfolio, or concentrate in fewer companies where I can add the most value and own more of the outcome?",
    minds: ["sun-tzu", "niccolo-machiavelli", "marie-curie"],
  },
  {
    name: "Charles Hudson",
    company: "Precursor Ventures",
    topic: "I make 75-100 investment decisions per fund as a solo GP. Each decision gets less time and attention than it would at a multi-partner firm. Should I reduce my deal volume to increase decision quality per investment, or is the high-volume approach the correct strategy at pre-seed where outcomes are inherently more random?",
    minds: ["marie-curie", "marcus-aurelius", "sun-tzu"],
  },
  {
    name: "Jason Chapman",
    company: "Solo GP / Early-stage",
    topic: "As a solo GP, I don't have partners to challenge my thinking on deals. I rely on my own judgment for every investment decision. How do I build systematic safeguards against my own blind spots and confirmation bias when there's no investment committee to push back?",
    minds: ["marie-curie", "marcus-aurelius", "niccolo-machiavelli"],
  },
  {
    name: "Natty Zola",
    company: "Solo GP / Early-stage",
    topic: "I'm an emerging manager trying to build a track record and raise from LPs who are skeptical of solo GPs. Should I focus on proving returns from my current fund before raising the next, or start fundraising for Fund II now while momentum is fresh — even if the portfolio hasn't had time to mature?",
    minds: ["niccolo-machiavelli", "sun-tzu", "marcus-aurelius"],
  },
];

// ─── MAIN ────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(ROOT, "docs", "outreach-debates");

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Check for already-completed debates (resume support)
  const completed = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""))
  );

  console.log(`\n🏛️  Agora Outreach Debate Generator`);
  console.log(`   ${TARGETS.length} targets, 3 rounds each, 3 minds per debate`);
  console.log(`   Output: ${OUTPUT_DIR}/\n`);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let i = 0; i < TARGETS.length; i++) {
    const target = TARGETS[i];
    const slug = target.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

    if (completed.has(slug)) {
      console.log(`[${i + 1}/${TARGETS.length}] ${target.name} — already done, skipping`);
      continue;
    }

    console.log(`\n[${i + 1}/${TARGETS.length}] ${target.name} (${target.company})`);
    console.log(`  Topic: ${target.topic.slice(0, 80)}...`);

    try {
      const result = await runAgon(target.topic, target.minds);

      const md = formatDebate(
        target.name,
        target.company,
        target.topic,
        "",
        result,
        target.minds
      );

      const outPath = path.join(OUTPUT_DIR, `${slug}.md`);
      fs.writeFileSync(outPath, md, "utf-8");
      console.log(`  ✅ Saved: ${slug}.md`);

    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);

      // Check for rate limiting
      if (err.status === 429 || err.message?.includes("rate")) {
        console.log("\n⏳ Rate limited. Checking reset time...");

        // Extract retry-after if available
        const retryAfter = err.headers?.["retry-after"];
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

        console.log(`   Waiting ${Math.ceil(waitMs / 1000)} seconds before retrying...`);
        await new Promise((r) => setTimeout(r, waitMs));

        // Retry this target
        i--;
        continue;
      }

      // For other errors, log and continue
      const errPath = path.join(OUTPUT_DIR, `${slug}-error.txt`);
      fs.writeFileSync(errPath, `Error: ${err.message}\n\n${err.stack || ""}`, "utf-8");
    }
  }

  console.log(`\n✅ All debates complete.`);
  console.log(`   Output directory: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
