import { fetchArticleBySlug } from "@/lib/articles/articles-functions";
import { Article } from "@/models/articles";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/article/$slug")({
  component: RouteComponent,
  loader: async ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const article = await fetchArticleBySlug(slug);

    return article;
  },
});

function RouteComponent() {
  const article = Route.useLoaderData() as Article;
  console.info(article);

  return <p>{article.main}</p>;
}
