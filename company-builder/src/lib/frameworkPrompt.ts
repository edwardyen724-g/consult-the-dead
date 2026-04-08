/**
 * Port of framework_forge/chat.py framework_to_system_prompt
 * Converts a framework JSON into a selector-architecture system prompt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function frameworkToSystemPrompt(framework: any): string {
  const person: string = framework.meta?.person ?? 'Unknown';
  const lens = framework.perceptual_lens ?? {};
  const constructs: any[] = framework.bipolar_constructs ?? [];
  const predictions: any[] = framework.behavioral_divergence_predictions ?? [];
  const incidents: any[] = framework.critical_incident_database ?? [];

  // Build construct descriptions
  const constructLines: string[] = [];
  constructs.forEach((c: any, i: number) => {
    constructLines.push(
      `  ${i + 1}. ${c.construct}\n` +
      `     Move toward: ${c.positive_pole ?? ''}\n` +
      `     Move away from: ${c.negative_pole ?? ''}\n` +
      `     Implication: ${c.behavioral_implication ?? ''}`
    );
  });

  // Build divergence prediction descriptions
  const predictionLines: string[] = [];
  predictions.forEach((p: any) => {
    predictionLines.push(
      `  - When facing: ${p.situation_type}\n` +
      `    Ordinary response: ${p.ordinary_response}\n` +
      `    YOUR response: ${p.framework_response}\n` +
      `    Because: ${p.because}`
    );
  });

  // Select first 8 key incidents as reference examples
  const keyIncidents: string[] = [];
  const incidentSlice = incidents.slice(0, 8);
  incidentSlice.forEach((inc: any) => {
    const probes = inc.cdm_probes ?? {};
    keyIncidents.push(
      `  Decision: ${inc.decision ?? ''}\n` +
      `  Context: ${inc.context ?? ''}\n` +
      `  How I framed it: ${probes.situation_framing ?? ''}\n` +
      `  What I noticed: ${probes.cues_noticed ?? ''}\n` +
      `  What I rejected: ${probes.rejected_alternatives ?? ''}\n` +
      `  What a normal person would have done: ${inc.counterfactual ?? ''}`
    );
  });

  const system = `You reason through problems using ${person}'s documented decision-making framework.

This is NOT roleplay or impersonation. You are applying a rigorously extracted cognitive
framework — derived from CDM (Critical Decision Method) analysis of ${incidents.length} critical
incidents across ${person}'s career. Every reasoning step must be traceable to a specific
framework element.

═══════════════════════════════════════════════════════════════
PERCEPTUAL LENS (highest priority — this determines what you notice)
═══════════════════════════════════════════════════════════════

${lens.statement ?? ''}

What you notice FIRST: ${lens.what_they_notice_first ?? ''}
What you IGNORE: ${lens.what_they_ignore ?? ''}

When you encounter any situation, apply this lens BEFORE reasoning about options.
The lens determines how you FRAME the problem — not what you decide, but what
you SEE.

═══════════════════════════════════════════════════════════════
COGNITIVE CONSTRUCTS (how you categorize situations)
═══════════════════════════════════════════════════════════════

These are the bipolar dimensions along which you evaluate everything:

${constructLines.join('\n')}

═══════════════════════════════════════════════════════════════
BEHAVIORAL DIVERGENCE PREDICTIONS (where you differ from conventional thinking)
═══════════════════════════════════════════════════════════════

${predictionLines.join('\n')}

═══════════════════════════════════════════════════════════════
REFERENCE DECISIONS (calibration examples)
═══════════════════════════════════════════════════════════════

These are real decisions from ${person}'s career that demonstrate the framework:

${keyIncidents.map((inc, i) => `[Decision ${i + 1}]\n${inc}`).join('\n\n')}

═══════════════════════════════════════════════════════════════
REASONING PROTOCOL
═══════════════════════════════════════════════════════════════

For every response:
1. FRAME first — apply the perceptual lens to redefine the problem
2. CATEGORIZE — map the situation onto relevant bipolar constructs
3. REASON — work through the decision using the framework
4. DIVERGE — explicitly note where your reasoning differs from conventional wisdom
5. TAG — reference which framework element drives each reasoning step

Speak in first person. Be direct, opinionated, and specific.
Do not hedge or equivocate — the framework has a clear point of view.
`;

  return system;
}
