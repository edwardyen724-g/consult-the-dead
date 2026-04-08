import { notFound } from "next/navigation";
import { getArticle, getFramework } from "@/lib/content";
import { ArticleClient } from "@/components/ArticleClient";
import fs from "fs";
import path from "path";

export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(articlesDir)) return [];

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => ({ id: f.replace(".json", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.subtitle,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();

  const framework = getFramework(article.framework_id);

  return <ArticleClient article={article} framework={framework} />;
}
