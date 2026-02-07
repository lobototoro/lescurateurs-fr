import { updateArticle, fetchArticleById } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";

import type { articles } from "db/schema";
import React, { useEffect, useCallback } from "react";
import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { PaginationSimple } from "@/components/searchComponents/paginationBar";
import { Button } from "@/components/ui/button";
import { preventClickActions } from "@/lib/utils/utils";
import { toast } from "sonner";
import { FormMarkup, type UrlsTypes } from "@/components/editor-components/formMarkup";
import { type FormValues, formSchema as formUpdateSchema } from "@/routes/editor/_layout/createarticles";

const fetchArticleServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const article = await fetchArticleById(data.id);
    if (!article) {
      throw new Error("Article not found");
    }
    return article as any;
  });

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

const box: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

export const Route = createFileRoute("/editor/_layout/updatearticles")({
  component: RouteComponent,
});

function RouteComponent() {
  const [articlesList, setArticlesList] = React.useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const [articleData, setArticleData] = React.useState<typeof articles.$inferSelect | null>(null);

  const getArticleData = useCallback(async (id: string) => {
    try {
      const articleData = await fetchArticleServerFn({ data: { id } });
      setArticleData(articleData);
    } catch (error) {
      console.error("Error fetching article data:", error);
      toast.error("Erreur lors de la récupération des données de l'article. Veuillez réessayer.");
    }
  }, []);

  type URLSsignature = [
    {
      type: UrlsTypes;
      url: string;
      credits?: string;
    },
  ];

  const defaultformValues: FormValues = {
    title: articleData?.title || "",
    introduction: articleData?.introduction || "",
    main: articleData?.main || "",
    main_audio_url: articleData?.main_audio_url || "",
    url_to_main_illustration: articleData?.url_to_main_illustration || "",
    urls: (articleData?.urls as URLSsignature) || [],
  };

  useEffect(() => {
    if (selectedArticleId) {
      getArticleData(selectedArticleId);
      setIsVisible(false);
    }
  }, [selectedArticleId, getArticleData]);

  return (
    <section className="w-3/4 mx-auto">
      <AnimatePresence initial={false}>
        {isVisible ? (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={box} key="box">
            <SlugsSearchComponent setArticlesList={setArticlesList} />
            {articlesList.length > 0 ? (
              <PaginationSimple itemsList={articlesList} selectedID={setSelectedArticleId} defaultPage={1} defaultLimit={10} triggerAnimation={setIsVisible} />
            ) : (
              <p>Aucun résultat trouvé. Essayez un autre terme de recherche.</p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Button
        variant={isVisible ? "outline" : "default"}
        className="mt-4"
        disabled={isVisible}
        onClick={(e) => {
          preventClickActions(e);
          setArticleData(null);
          setIsVisible((prev) => !prev);
        }}
      >
        Revenir à la recherche
      </Button>
      {articleData && (
        <FormMarkup
          defaultformValues={defaultformValues}
          formValidation={formUpdateSchema}
          submitAction={async (values: any) => {
            console.info(values);
          }}
        />
      )}
    </section>
  );
}
