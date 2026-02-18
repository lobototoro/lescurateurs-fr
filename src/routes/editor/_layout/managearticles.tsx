import React, { useEffect, useTransition } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ModalManager } from "shadcn-modal-manager";

import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { PaginationWithOptions } from "@/components/searchComponents/paginationWithOptions";
import { searchArticleById } from "@/lib/search/search-functions";
import { authClient } from "lib/auth/auth-client";
import type { articles } from "db/schema";
import { FillPopover } from "@/components/searchComponents/fillPopover";
import { ModalComponent } from "@/components/modal/modalComponent";

import { deleteArticle, validateArticle, shipArticle } from "@/lib/articles/articles-functions";

export const deleteArticleServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return await deleteArticle(data.id);
  });

export const validateArticleServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; validatedBy: boolean }) => data)
  .handler(async ({ data }) => {
    return await validateArticle(data.id, data.validatedBy);
  });

export const shipArticleServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; shippedBy: boolean }) => data)
  .handler(async ({ data }) => {
    return await shipArticle(data.id, data.shippedBy);
  });

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

  const handleChoice = async (choice: Record<string, any>) => {
    const modalRef = ModalManager.open(ModalComponent, {
      data: { message: choice.message, articleId: choice.articleId, choice: choice.argument, action: choice.action },
    });
    const result = await modalRef.afterClosed();

    return result;
  };

  const handleGroupButtonsActions = async (articleId: string, actionType: string) => {
    console.info(`Action "${actionType}" triggered for article ID: ${articleId}`);
    // on call, display a prompt to confirm the action, then execute the corresponding function based on the actionType (e.g., "edit", "delete", "publish")
    switch (actionType) {
      case "Dé-valider":
        // call the function to invalidate the article
        break;
      case "Valider": {
        // open modal and call the function to validate the article if the user confirms
        const handleresult = async (id: string, choice: boolean) => {
          try {
            const actionRequest = await validateArticleServer({ data: { id, validatedBy: choice } });
            console.info("in handleresult func ", actionRequest);
            if (actionRequest.isSuccess) {
              toast.success("Opération réussie !");
            }
          } catch (error) {
            toast.error(`Une erreur est survenue : ${error}. Veuillez réessayer.`);
          }
        };
        const choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: handleresult,
        };
        await handleChoice(choice);
        break;
      }
      case "Mettre offline":
        // call the function to take the article offline
        break;
      case "Déployer":
        // call the function to deploy the article
        break;
      case "Supprimer":
        // call the function to delete the article
        break;
      case "Restaurer":
        // call the function to restore the article
        break;
      default:
        toast.error(`Unknown action type: ${actionType}`);
    }
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
        <PaginationWithOptions itemsList={articlesList} selectedID={setSelectedArticleId} defaultPage={1} defaultLimit={5} isPending={isPending}>
          <FillPopover articleData={selectedArticle} handleGroupButtonsActions={handleGroupButtonsActions} />
        </PaginationWithOptions>
      )}
    </section>
  );
}
