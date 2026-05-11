export const EXAMPLE_TOPICS = [
  "Should I raise VC or bootstrap?",
  "Should we open-source our core product?",
  "My industry is being automated — pivot into AI, or double down on domain depth?",
]

export const SAMPLE_QUESTION_LABEL_ID = "agora-sample-question-label"

type SampleQuestionRef = {
  current: { focus: () => void } | null
}

export function chooseSampleQuestion(
  setTopic: (topic: string) => void,
  topicRef: SampleQuestionRef,
  example: string,
): void {
  setTopic(example)
  topicRef.current?.focus()
}
