import { buildQuizCompletionPayload } from "./quiz-completion"

describe("buildQuizCompletionPayload", () => {
  it("normalizes the completion event payload for the result CTA", () => {
    expect(
      buildQuizCompletionPayload({
        decisionType: "strategy",
        tensionLabel: "Attack or defend?",
        mindSlugs: ["sun-tzu", "alexander-the-great", "niccolo-machiavelli"],
      }),
    ).toEqual({
      event: "quiz_complete",
      decision_type: "strategy",
      result_label: "Attack or defend?",
      mind_slugs: ["sun-tzu", "alexander-the-great", "niccolo-machiavelli"],
      mind_count: 3,
      destination: "/agora?minds=sun-tzu,alexander-the-great,niccolo-machiavelli",
    })
  })
})
