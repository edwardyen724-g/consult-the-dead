import {
  chooseSampleQuestion,
  EXAMPLE_TOPICS,
  SAMPLE_QUESTION_LABEL_ID,
} from "./agora-sample-questions"

describe("agora-sample-questions", () => {
  it("keeps the published sample questions and label id stable", () => {
    expect(EXAMPLE_TOPICS).toEqual([
      "Should I raise VC or bootstrap?",
      "Should we open-source our core product?",
      "My industry is being automated — pivot into AI, or double down on domain depth?",
    ])
    expect(SAMPLE_QUESTION_LABEL_ID).toBe("agora-sample-question-label")
  })

  it("sets the topic and returns focus to the textarea when a sample is chosen", () => {
    let topic = ""
    let focused = 0

    chooseSampleQuestion(
      (next) => {
        topic = next
      },
      {
        current: {
          focus: () => {
            focused += 1
          },
        },
      },
      EXAMPLE_TOPICS[0],
    )

    expect(topic).toBe(EXAMPLE_TOPICS[0])
    expect(focused).toBe(1)
  })

  it("still updates the topic when no textarea ref is available", () => {
    let topic = ""

    chooseSampleQuestion(
      (next) => {
        topic = next
      },
      { current: null },
      EXAMPLE_TOPICS[1],
    )

    expect(topic).toBe(EXAMPLE_TOPICS[1])
  })
})
