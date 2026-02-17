import React, { useEffect, useTransition } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { PaginationWithOptions } from "@/components/searchComponents/paginationWithOptions";
import { searchArticleById } from "@/lib/search/search-functions";
import { authClient } from "lib/auth/auth-client";
import type { articles } from "db/schema";

export const searchByIdServer = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const article = await searchArticleById(data.id);
    if (!article) {
      throw new Error("Article not found");
    }

    return article as any;
  });

export const Route = createFileRoute("/editor/_layout/managearticles")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isPending, startTransition] = useTransition();
  const { data: session } = authClient.useSession();
  const userSessionInfos = {
    name: session?.user.name ?? "",
  };
  const [articlesList, setArticlesList] = React.useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<typeof articles.$inferSelect | null>(null);

  const handleGroupButtonsActions = async (articleId: string, actionType: string) => {
    console.info(`Action "${actionType}" triggered for article ID: ${articleId}`);
  };

  // Fetch article data when selectedArticleId changes
  useEffect(() => {
    startTransition(() => {
      if (selectedArticleId) {
        searchByIdServer({ data: { id: selectedArticleId } })
          .then((article) => {
            setSelectedArticle(article);
          })
          .catch((error) => {
            console.error("Failed to fetch article:", error);
            toast.error("Failed to load article");
            setSelectedArticle(null);
          });
      } else {
        setSelectedArticle(null);
      }
    });
  }, [selectedArticleId]);

  /*
   * feed the result display and pagination with dynamic values: articleList, selectedArticle, handleGroupButtonsActions, isPending
   * - articleList: the list of articles to display in the pagination component, which should be updated based on the search results or any changes made to the articles.
   * - selectedArticle: the currently selected article whose details are displayed, which should be updated when a user selects an article from the list.
   * - handleGroupButtonsActions: the function that handles actions triggered by buttons in the UI, which should be passed down to the relevant components to ensure that user interactions are properly handled.
   * - isPending: a boolean value indicating whether a data fetching operation is in progress, which can be used to show loading indicators or disable certain UI elements while waiting for data to load.
   */
  return (
    <section className="w-3/4 mx-auto">
      <SlugsSearchComponent setArticlesList={setArticlesList} />
      {articlesList.length > 0 && (
        <PaginationWithOptions
          itemsList={articlesList}
          selectedID={setSelectedArticleId}
          defaultPage={1}
          defaultLimit={5}
          groupButtonsActions={handleGroupButtonsActions}
          isPending={isPending}
          articleData={selectedArticle}
        />
      )}
    </section>
  );
}
