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
    <section className="flex flex-col p-6 lg:p-12">
      <h1 className="text-4xl font-bold font-titles text-center w-full mb-3 lg:mb-9">Les Curateurs</h1>
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
    </section>
  );
}
