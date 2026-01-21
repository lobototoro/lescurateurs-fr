import { fetchArticleBySlug } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import z from "zod";

const slugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const fetcharticleServer = createServerFn({ method: "GET" })
  .inputValidator(slugSchema)
  .handler(async ({ data }) => {
    const article = await fetchArticleBySlug(data.slug);
    // Ensure urls property is properly typed as {} | undefined to match expected type
    if (article && "urls" in article && typeof article.urls !== "undefined" && article.urls !== null) {
      return { ...article, urls: article.urls as {} | undefined };
    }
    return { ...article, urls: undefined };
  });

export const Route = createFileRoute("/article/$slug")({
  component: RouteComponent,
  loader: async ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    return await fetcharticleServer({ data: { slug } });
  },
});

function RouteComponent() {
  const article = Route.useLoaderData();

  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <div>
        <h1>{article?.title}</h1>
        <p>{article?.main}</p>
      </div>
    </Suspense>
  );
}
