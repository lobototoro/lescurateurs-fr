import { createFileRoute, Link } from "@tanstack/react-router";

import { getAllSlugs } from "@/lib/articles/articles-functions";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await getAllSlugs(),
});

function App() {
  const slugs = Route.useLoaderData();

  return (
    <div>
      {slugs.map((slug) => {
        return (
          <div key={slug.id}>
            <Link to="/article/$slug" params={{ slug: slug.slug as string }}>
              {slug.slug}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
