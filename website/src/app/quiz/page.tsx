import { getAllFrameworks } from "@/lib/frameworks";
import { QUIZ_ROUTE_GROUPS, buildQuizCouncilHref, buildQuizPackHref } from "@/lib/ctr-experiment";
import QuizFlow from "./QuizFlow";
import { buildQuizModel } from "./quiz-routing";

export const QUIZ_PAGE_ROUTE_GROUPS = QUIZ_ROUTE_GROUPS.map((group) => ({
  decisionType: group.decisionType,
  label: group.label,
  description: group.description,
  featuredPack: group.featuredPack,
  featuredPackHref: buildQuizPackHref(group.featuredPack.packId),
  routes: group.routes.map((route) => ({
    label: route.label,
    description: route.description,
    tagline: route.tagline,
    mindSlugs: route.mindSlugs,
    href: buildQuizCouncilHref(route.mindSlugs),
  })),
}));

export default function QuizPage() {
  const frameworks = getAllFrameworks();
  const quizModel = buildQuizModel(frameworks);

  return <QuizFlow quizModel={quizModel} />;
}
