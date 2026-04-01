"""Behavioral Divergence Predictions.

Generates testable predictions about how the subject's perceptual lens would
cause them to respond differently from a competent peer in specific situation
types. These predictions form the empirical backbone of framework validation —
a framework is only useful if it predicts divergent behavior.
"""

from dataclasses import dataclass, asdict
from typing import Any

from framework_forge.llm import LLMClient
from framework_forge.extraction.constructs import BipolarConstruct
from framework_forge.extraction.lens import PerceptualLens


@dataclass
class DivergencePrediction:
    """A prediction of how the subject would diverge from ordinary response.

    Each prediction specifies a situation type, the ordinary (baseline) response,
    the framework-predicted response, the causal explanation linking lens to
    behavior, and a confidence level.
    """

    situation_type: str
    ordinary_response: str
    framework_response: str
    because: str
    confidence: float

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


DIVERGENCE_SYSTEM = """\
You are an expert in behavioral prediction and cognitive task analysis. Your
task is to generate testable divergence predictions from a perceptual lens
and set of bipolar constructs.

A DIVERGENCE PREDICTION answers the question:
"In situation type X, what would this person do differently from a competent
peer, and WHY does their perceptual lens cause that difference?"

Requirements for each prediction:
1. SITUATION TYPE — A specific, recognizable category of situation (not a
   single historical event). It must be a type the subject could plausibly
   encounter again.

2. ORDINARY RESPONSE — What a competent, well-informed peer would do in this
   situation. This is the baseline — the "normal" expert response.

3. FRAMEWORK RESPONSE — What the subject would do instead, as predicted by
   their perceptual lens and constructs. This must be DIFFERENT from the
   ordinary response in a specific, observable way.

4. BECAUSE — The causal chain linking the perceptual lens to the divergent
   behavior. Format: "Because [person]'s lens causes them to [perceive X],
   they [do Y] instead of [ordinary Z]."

5. CONFIDENCE — A calibrated probability (0.0 to 1.0) that this prediction
   would hold in a new instance of this situation type. Higher confidence for
   predictions grounded in multiple incidents; lower for extrapolations.

Generate predictions that are:
- TESTABLE: An observer could verify whether the prediction holds
- DIVERGENT: The framework response must differ meaningfully from ordinary
- GROUNDED: Each prediction must trace back to specific constructs and incidents
- NON-TRIVIAL: Avoid predictions that anyone could make without the framework

Return ONLY valid JSON with no additional commentary.\
"""

DIVERGENCE_PROMPT = """\
Generate behavioral divergence predictions for {person} based on the following
perceptual lens and bipolar constructs.

Perceptual Lens:
{lens_statement}
- Notices first: {notices_first}
- Ignores: {ignores}

Bipolar Constructs:
{constructs_json}

For each prediction, specify what {person} would do differently from a
competent peer in a specific situation type, and explain the causal link
from lens to behavior.

Return a JSON object with this structure:
{{
  "predictions": [
    {{
      "situation_type": "A recognizable category of situation",
      "ordinary_response": "What a competent peer would do",
      "framework_response": "What {person} would do instead",
      "because": "Causal chain from lens to divergent behavior",
      "confidence": 0.85
    }}
  ]
}}\
"""


def generate_predictions(
    lens: PerceptualLens,
    constructs: list[BipolarConstruct],
    person: str,
    client: LLMClient | Any | None = None,
) -> list[DivergencePrediction]:
    """Generate behavioral divergence predictions from a lens and constructs.

    Produces testable predictions about how the subject's perceptual framework
    would cause them to respond differently from a competent peer in specific
    situation types.

    Args:
        lens: The derived PerceptualLens.
        constructs: List of BipolarConstruct objects.
        person: Name of the person being studied.
        client: An LLMClient instance (or mock). Created if not provided.

    Returns:
        A list of DivergencePrediction objects.
    """
    if client is None:
        client = LLMClient()

    constructs_json = "\n".join(
        f"- {c.construct}: (+) {c.positive_pole} / (-) {c.negative_pole} "
        f"=> {c.behavioral_implication}"
        for c in constructs
    )

    user_prompt = DIVERGENCE_PROMPT.format(
        person=person,
        lens_statement=lens.statement,
        notices_first=lens.what_they_notice_first,
        ignores=lens.what_they_ignore,
        constructs_json=constructs_json,
    )

    data = client.prompt_json(system=DIVERGENCE_SYSTEM, user=user_prompt)

    predictions = []
    for item in data.get("predictions", []):
        predictions.append(
            DivergencePrediction(
                situation_type=item["situation_type"],
                ordinary_response=item["ordinary_response"],
                framework_response=item["framework_response"],
                because=item["because"],
                confidence=item.get("confidence", 0.5),
            )
        )
    return predictions
