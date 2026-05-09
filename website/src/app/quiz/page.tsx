import { getAllFrameworks } from "@/lib/frameworks";
import QuizFlow from "./QuizFlow";
import { buildQuizModel } from "./quiz-routing";

export default function QuizPage() {
  const frameworks = getAllFrameworks();
  const quizModel = buildQuizModel(frameworks);

  return <QuizFlow quizModel={quizModel} />;
}
