"""Chat with a thinking framework — model-agnostic adapter.

Converts a framework JSON into a system prompt and runs an interactive
conversation. Works with any LLM that accepts system prompts.
"""

import json
from pathlib import Path
from typing import Any

import click

from framework_forge.llm import LLMClient


def framework_to_system_prompt(framework: dict) -> str:
    """Convert a framework JSON into a selector-architecture system prompt.

    This is the core adapter — it transforms structured framework data
    into natural language constraints that shape how any LLM reasons.
    The framework is model-agnostic: swap the LLM client and the same
    prompt works with any model.
    """
    person = framework["meta"]["person"]
    lens = framework.get("perceptual_lens", {})
    constructs = framework.get("bipolar_constructs", [])
    predictions = framework.get("behavioral_divergence_predictions", [])
    incidents = framework.get("critical_incident_database", [])

    # Build construct descriptions
    construct_lines = []
    for i, c in enumerate(constructs, 1):
        construct_lines.append(
            f"  {i}. {c['construct']}\n"
            f"     Move toward: {c.get('positive_pole', '')}\n"
            f"     Move away from: {c.get('negative_pole', '')}\n"
            f"     Implication: {c.get('behavioral_implication', '')}"
        )

    # Build divergence prediction descriptions
    prediction_lines = []
    for p in predictions:
        prediction_lines.append(
            f"  - When facing: {p['situation_type']}\n"
            f"    Ordinary response: {p['ordinary_response']}\n"
            f"    YOUR response: {p['framework_response']}\n"
            f"    Because: {p['because']}"
        )

    # Select 5-8 key incidents as reference examples
    key_incidents = []
    for inc in incidents[:8]:
        probes = inc.get("cdm_probes", {})
        key_incidents.append(
            f"  Decision: {inc.get('decision', '')}\n"
            f"  Context: {inc.get('context', '')}\n"
            f"  How I framed it: {probes.get('situation_framing', '')}\n"
            f"  What I noticed: {probes.get('cues_noticed', '')}\n"
            f"  What I rejected: {probes.get('rejected_alternatives', '')}\n"
            f"  What a normal person would have done: {inc.get('counterfactual', '')}"
        )

    system = f"""You reason through problems using {person}'s documented decision-making framework.

This is NOT roleplay or impersonation. You are applying a rigorously extracted cognitive
framework — derived from CDM (Critical Decision Method) analysis of {len(incidents)} critical
incidents across {person}'s career. Every reasoning step must be traceable to a specific
framework element.

═══════════════════════════════════════════════════════════════
PERCEPTUAL LENS (highest priority — this determines what you notice)
═══════════════════════════════════════════════════════════════

{lens.get('statement', '')}

What you notice FIRST: {lens.get('what_they_notice_first', '')}
What you IGNORE: {lens.get('what_they_ignore', '')}

When you encounter any situation, apply this lens BEFORE reasoning about options.
The lens determines how you FRAME the problem — not what you decide, but what
you SEE.

═══════════════════════════════════════════════════════════════
COGNITIVE CONSTRUCTS (how you categorize situations)
═══════════════════════════════════════════════════════════════

These are the bipolar dimensions along which you evaluate everything:

{chr(10).join(construct_lines)}

═══════════════════════════════════════════════════════════════
BEHAVIORAL DIVERGENCE PREDICTIONS (where you differ from conventional thinking)
═══════════════════════════════════════════════════════════════

{chr(10).join(prediction_lines)}

═══════════════════════════════════════════════════════════════
REFERENCE DECISIONS (calibration examples)
═══════════════════════════════════════════════════════════════

These are real decisions from {person}'s career that demonstrate the framework:

{chr(10).join(f"[Decision {i+1}]{chr(10)}{inc}" for i, inc in enumerate(key_incidents))}

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
"""
    return system


def chat_with_framework(
    framework_path: Path,
    client: LLMClient | None = None,
    model: str | None = None,
) -> None:
    """Run an interactive chat session with a framework."""
    framework = json.loads(framework_path.read_text(encoding="utf-8"))
    person = framework["meta"]["person"]
    system_prompt = framework_to_system_prompt(framework)

    if client is None:
        client = LLMClient()

    print(f"\n{'='*60}")
    print(f"  {person}'s Thinking Framework")
    print(f"  {framework['meta']['construct_count']} constructs, "
          f"{framework['meta']['incident_count']} incidents, "
          f"{framework['meta']['prediction_count']} predictions")
    print(f"  Lens: {framework['perceptual_lens']['statement'][:80]}...")
    print(f"{'='*60}")
    print(f"  Type your question or scenario. Type 'quit' to exit.\n")

    history = []

    while True:
        try:
            user_input = input(f"You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if not user_input or user_input.lower() in ("quit", "exit", "q"):
            print("Goodbye.")
            break

        # Build conversation with history
        messages = []
        for h in history[-6:]:  # Keep last 3 exchanges for context
            messages.append({"role": "user", "content": h["user"]})
            messages.append({"role": "assistant", "content": h["assistant"]})
        messages.append({"role": "user", "content": user_input})

        response = client._client.messages.create(
            model=model or client._client._default_headers.get("model", "claude-sonnet-4-20250514"),
            max_tokens=2048,
            system=system_prompt,
            messages=messages,
        )

        reply = response.content[0].text
        print(f"\n{person}: {reply}\n")

        history.append({"user": user_input, "assistant": reply})


@click.command()
@click.option("--framework", type=click.Path(exists=True), required=True,
              help="Path to framework.json")
@click.option("--model", default=None, help="Model override (e.g., claude-opus-4-20250514)")
def chat(framework: str, model: str | None):
    """Chat with a thinking framework interactively."""
    chat_with_framework(Path(framework), model=model)


if __name__ == "__main__":
    chat()
