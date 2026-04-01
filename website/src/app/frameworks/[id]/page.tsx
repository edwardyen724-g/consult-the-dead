import { notFound } from "next/navigation";
import {
  getFramework,
  getAllFrameworks,
  getArticlesForFramework,
} from "@/lib/content";
import { FrameworkDetailClient } from "@/components/FrameworkDetailClient";

export async function generateStaticParams() {
  const frameworks = getAllFrameworks();
  return frameworks.map((fw) => ({ id: fw.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const framework = getFramework(id);
  if (!framework) return {};
  return {
    title: `${framework.archetype_name} \u2014 ${framework.archetype_title}`,
    description: framework.perceptual_lens.statement,
  };
}

export default async function FrameworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const framework = getFramework(id);
  if (!framework) notFound();

  const articles = getArticlesForFramework(id);

  return <FrameworkDetailClient framework={framework} articles={articles} />;
}
