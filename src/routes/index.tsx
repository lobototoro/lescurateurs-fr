import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";

import { getAllSlugs } from "@/lib/articles/articles-functions";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => await getAllSlugs(),
});

function App() {
  const slugs = Route.useLoaderData();

  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      {slugs.map((slug) => {
        return (
          <div key={slug.id}>
            <Link to="/article/$slug" params={{ slug: slug.slug as string }}>
              {slug.slug}
            </Link>
          </div>
        );
      })}
    </Suspense>
  );
}
