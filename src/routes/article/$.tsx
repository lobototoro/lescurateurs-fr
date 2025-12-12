import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchArticleById } from "@/lib/articles/articles-functions";

export const Route = createFileRoute("/article/$")({
  loader: async ({ params }) => {
    if (!params._splat) {
      throw new Error("Article ID is required");
    }
    const article = await fetchArticleById({ articleId: params._splat });
    return {
      ...article,
      urls: article.urls || "",
    };
  },
  component: RouteComponent,
});
function RouteComponent() {
  const article = Route.useLoaderData();

  return (
    <>
      <p>{article.main}</p>
      <br />
      <Link to={"/"}>Retour</Link>
    </>
  );
}
