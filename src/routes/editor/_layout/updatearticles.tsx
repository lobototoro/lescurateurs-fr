// import { updateArticle } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
// import { createServerFn } from "@tanstack/react-start";

// import type { FormValues } from "@/routes/editor/_layout/createarticles";

// import { articles } from "db/schema";
import React from "react";
import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { PaginationSimple } from "@/components/searchComponents/paginationBar";

// import items from "@/__tests__/json/slugs.json";

// const updateArticleServerFn = createServerFn({ method: "POST" })
//   .inputValidator((data: any) => data)
//   .handler(async (data: any) => {
//     // Extract id from FormData since it's not being passed as a separate parameter
//     const id = data.id as string;
//     if (!id) {
//       throw new Error("ID is required");
//     }
//     return await updateArticle(id, data);
//   });

export const Route = createFileRoute("/editor/_layout/updatearticles")({
  component: RouteComponent,
});

function RouteComponent() {
  const [articlesList, setArticlesList] = React.useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);

  console.info("selected article id ", selectedArticleId);

  return (
    <section className="w-3/4 mx-auto">
      <SlugsSearchComponent setArticlesList={setArticlesList} />
      {articlesList.length > 0 ? (
        <PaginationSimple itemsList={articlesList} selectedID={setSelectedArticleId} defaultPage={1} defaultLimit={10} />
      ) : (
        <p>Aucun résultat trouvé. Essayez un autre terme de recherche.</p>
      )}
    </section>
  );
}
