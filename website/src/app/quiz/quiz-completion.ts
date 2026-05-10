export interface QuizCompletionInput {
  decisionType: string
  tensionLabel: string
  mindSlugs: readonly string[]
}

export interface QuizCompletionPayload {
  event: "quiz_complete"
  decision_type: string
  result_label: string
  mind_slugs: string[]
  mind_count: number
  destination: string
}

export function buildQuizCompletionPayload({
  decisionType,
  tensionLabel,
  mindSlugs,
}: QuizCompletionInput): QuizCompletionPayload {
  const destination = `/agora?minds=${mindSlugs.join(",")}`

  return {
    event: "quiz_complete",
    decision_type: decisionType,
    result_label: tensionLabel,
    mind_slugs: [...mindSlugs],
    mind_count: mindSlugs.length,
    destination,
  }
}
