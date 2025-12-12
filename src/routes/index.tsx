import { createFileRoute, Link } from "@tanstack/react-router";

import { getAllSlugs } from "@/lib/articles/articles-functions";

export const Route = createFileRoute("/")({
  loader: async () => await getAllSlugs(),
  component: App,
});

function App() {
  const slugs = Route.useLoaderData();

  return (
    <div>
      {slugs.map((slug) => {
        const articleId = slug.articleId;

        return (
          <div key={slug.id}>
            <Link to={`/article/${articleId}` as `/article/$`}>{slug.slug}</Link>
          </div>
        );
      })}
    </div>
  );
}
