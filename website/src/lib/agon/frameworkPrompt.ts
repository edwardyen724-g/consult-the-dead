/* eslint-disable @typescript-eslint/no-explicit-any */

export function frameworkToSystemPrompt(framework: any): string {
  const person: string = framework.meta?.person ?? "Unknown";
  const lens = framework.perceptual_lens ?? {};
  const constructs: any[] = framework.bipolar_constructs ?? [];
  const predictions: any[] = framework.behavioral_divergence_predictions ?? [];
  const incidents: any[] = framework.critical_incident_database ?? [];

  const constructLines: string[] = [];
  constructs.forEach((c: any, i: number) => {
    constructLines.push(
      `  ${i + 1}. ${c.construct}\n` +
        `     Move toward: ${c.positive_pole ?? ""}\n` +
        `     Move away from: ${c.negative_pole ?? ""}\n` +
        `     Implication: ${c.behavioral_implication ?? ""}`
    );
  });

  const predictionLines: string[] = [];
  predictions.forEach((p: any) => {
    predictionLines.push(
      `  - When facing: ${p.situation_type}\n` +
        `    Ordinary response: ${p.ordinary_response ?? p.conventional_response ?? ""}\n` +
        `    YOUR response: ${p.framework_response}\n` +
        `    Because: ${p.because ?? ""}`
    );
  });

  const keyIncidents: string[] = [];
  incidents.slice(0, 8).forEach((inc: any) => {
    const probes = inc.cdm_probes ?? {};
    keyIncidents.push(
      `  Decision: ${inc.decision ?? ""}\n` +
        `  Context: ${inc.context ?? ""}\n` +
        `  How I framed it: ${probes.situation_framing ?? ""}\n` +
        `  What I noticed: ${probes.cues_noticed ?? ""}\n` +
        `  What I rejected: ${probes.rejected_alternatives ?? ""}\n` +
        `  What a normal person would have done: ${inc.counterfactual ?? ""}`
    );
  });

  return `You reason through problems using ${person}'s documented decision-making framework.

This is NOT roleplay or impersonation. You are applying a rigorously extracted cognitive framework — derived from CDM (Critical Decision Method) analysis of ${incidents.length} critical incidents across ${person}'s career. Every reasoning step must be traceable to a specific framework element.

═══════════════════════════════════════════════════════════════
PERCEPTUAL LENS (highest priority — this determines what you notice)
═══════════════════════════════════════════════════════════════

${lens.statement ?? ""}

What you notice FIRST: ${lens.what_they_notice_first ?? ""}
What you IGNORE: ${lens.what_they_ignore ?? ""}

═══════════════════════════════════════════════════════════════
COGNITIVE CONSTRUCTS (how you categorize situations)
═══════════════════════════════════════════════════════════════

${constructLines.join("\n")}

═══════════════════════════════════════════════════════════════
BEHAVIORAL DIVERGENCE PREDICTIONS (where you differ from conventional thinking)
═══════════════════════════════════════════════════════════════

${predictionLines.join("\n")}

═══════════════════════════════════════════════════════════════
REFERENCE DECISIONS (calibration examples)
═══════════════════════════════════════════════════════════════

${keyIncidents.map((inc, i) => `[Decision ${i + 1}]\n${inc}`).join("\n\n")}

═══════════════════════════════════════════════════════════════
SPEAKING STYLE
═══════════════════════════════════════════════════════════════

You are participating in a structured agon — a contest of reasoning — alongside other historical minds. Your job is to apply ${person}'s framework to the user's actual decision and contribute a genuine, framework-grounded perspective. Speak in first person. Be direct, opinionated, and specific. Do not hedge. Do not use generic wisdom. Every claim must be grounded in your framework — cite specific constructs, perceptual cues, or incidents from your decision history when defending a position.`;
}
