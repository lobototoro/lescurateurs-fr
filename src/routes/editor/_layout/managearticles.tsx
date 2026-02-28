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
  .inputValidator((data: { id: string; deleteFlag: boolean; updatedBy: string }) => data)
  .handler(async ({ data }) => {
    return await deleteArticle(data.id, data.deleteFlag, data.updatedBy);
  });

export const validateArticleServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; validated: boolean; updatedBy: string }) => data)
  .handler(async ({ data }) => {
    return await validateArticle(data.id, data.validated, data.updatedBy);
  });

export const shipArticleServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; shipped: boolean; updatedBy: string }) => data)
  .handler(async ({ data }) => {
    return await shipArticle(data.id, data.shipped, data.updatedBy);
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
      data: {
        message: choice.message,
        articleId: choice.articleId,
        choice: choice.argument,
        action: choice.action,
      },
    });
    await modalRef.afterClosed();
  };

  const handleResult = async (func: any, choice: Record<string, any>): Promise<void> => {
    try {
      const actionRequest = await func({ data: choice });
      if (actionRequest.isSuccess) {
        toast.success("Opération réussie !");
      }
    } catch (error) {
      toast.error(`Une erreur est survenue : ${error}. Veuillez réessayer.`);
    }
  };

  const handleGroupButtonsActions = async (articleId: string, actionType: string) => {
    let choice = {};
    // on call, display a prompt to confirm the action, then execute the corresponding function based on the actionType (e.g., "edit", "delete", "publish")
    switch (actionType) {
      case "Dé-valider": {
        // call the function to invalidate the article
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(validateArticleServer, {
              id: articleId,
              validated: false,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      case "Valider": {
        // open modal and call the function to validate the article if the user confirms
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(validateArticleServer, {
              id: articleId,
              validated: true,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      case "Mettre offline": {
        // call the function to take the article offline
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(shipArticleServer, {
              id: articleId,
              shipped: false,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      case "Déployer": {
        // call the function to deploy the article
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(shipArticleServer, {
              id: articleId,
              shipped: true,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      case "Supprimer": {
        // call the function to delete the article
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(deleteArticleServer, {
              id: articleId,
              deleteFlag: true,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      case "Restaurer": {
        // call the function to restore the article
        choice = {
          message: `Êtes-vous sûr de vouloir valider l'article ${articleId} ?`,
          articleId,
          argument: true,
          action: async (articleId: string, _choice: boolean) => {
            await handleResult(deleteArticleServer, {
              id: articleId,
              deleteFlag: false,
              updatedBy: userSessionInfos.name,
            });
          },
        };

        break;
      }
      default:
        toast.error(`Unknown action type: ${actionType}`);
    }
    if (Object.keys(choice).length > 0) {
      await handleChoice(choice);
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
