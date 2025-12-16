import { fetchArticleBySlug } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/article/$slug")({
  component: RouteComponent,
  loader: async ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const article = await fetchArticleBySlug(slug);

    // Fixing the type incompatibility by ensuring `urls` is either an object or undefined
    const fixedArticle = {
      ...article,
      urls: article.urls ?? [],
    };

    return fixedArticle;
  },
});

function RouteComponent() {
  const article = Route.useLoaderData();

  return <p>{article.main}</p>;
}
