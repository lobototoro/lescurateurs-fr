import { fetchArticleBySlug } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/article/$slug")({
  component: RouteComponent,
  loader: async ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    try {
      const article = await fetchArticleBySlug(slug);

      // Fixing the type incompatibility by ensuring `urls` is either an object or undefined
      const fixedArticle = {
        ...article,
        urls: article.urls ?? [],
      };

      return fixedArticle;
    } catch (error) {
      console.error(error);
    }
  },
});

function RouteComponent() {
  const article = Route.useLoaderData();
  console.log("in RouteComponent of /article/$slug", article);

  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <div>
        <h1>{article?.title}</h1>
        <p>{article?.main}</p>
      </div>
    </Suspense>
  );
}
