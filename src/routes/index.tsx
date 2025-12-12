import { createFileRoute } from "@tanstack/react-router";

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
        return <div key={slug.id}>{slug.slug}</div>;
      })}
    </div>
  );
}
