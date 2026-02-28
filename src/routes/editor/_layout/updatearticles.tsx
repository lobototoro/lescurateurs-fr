import { updateArticle, fetchArticleById } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import slugify from "slugify";

import type { articles } from "db/schema";
import React, { useEffect, useCallback } from "react";
import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { PaginationSimple } from "@/components/searchComponents/paginationBar";
import { Button } from "@/components/ui/button";
import { preventClickActions } from "@/lib/utils/utils";
import { toast } from "sonner";
import { FormMarkup, type UrlsTypes } from "@/components/editor-components/formMarkup";
import { type FormValues, formSchema as formUpdateSchema } from "@/routes/editor/_layout/createarticles";
import { authClient } from "lib/auth/auth-client";

const fetchArticleServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const article = await fetchArticleById(data.id);
    if (!article) {
      throw new Error("Article not found");
    }
    return article as any;
  });

const updateArticleServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data }) => {
    return await updateArticle(data);
  });

export const box: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

export const Route = createFileRoute("/editor/_layout/updatearticles")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const userSessionInfos = {
    name: session?.user.name ?? "",
  };
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
      setArticlesList([]);
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
              <PaginationSimple
                itemsList={articlesList}
                selectedID={setSelectedArticleId}
                defaultPage={1}
                defaultLimit={5}
                triggerAnimation={setIsVisible}
              />
            ) : (
              <p>Aucun résultat trouvé. Essayez un autre terme de recherche.</p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Button
        variant={isVisible ? "outline" : "default"}
        className="mt-4 mb-4"
        disabled={isVisible}
        onClick={(e) => {
          preventClickActions(e);
          setArticleData(null);
          setSelectedArticleId(null);
          setArticlesList([]);
          setIsVisible((prev) => !prev);
        }}
      >
        Revenir à la recherche
      </Button>
      {articleData && (
        <FormMarkup
          defaultformValues={defaultformValues}
          formValidation={formUpdateSchema}
          submitAction={async (values) => {
            //check for changes in values compared to articleData, if no changes, show a toast and return
            const hasChanges = Object.keys(values).some((key) => {
              if (key === "urls") {
                return JSON.stringify(values[key]) !== JSON.stringify(articleData[key as keyof typeof articleData]);
              }
              return values[key] !== articleData[key as keyof typeof articleData];
            });

            if (!hasChanges) {
              toast.error("Aucun changement détecté. Veuillez modifier au moins un champ avant de soumettre.");
              return;
            }

            const formData = new FormData();
            formData.append("id", articleData.id);
            formData.append("title", values.title);
            formData.append("introduction", values.introduction);
            formData.append("main", values.main);
            formData.append("main_audio_url", values.main_audio_url);
            formData.append("url_to_main_illustration", values.url_to_main_illustration);
            formData.append("urls", JSON.stringify(values.urls));
            formData.append("updated_by", userSessionInfos.name);
            formData.append("updated_at", new Date().toISOString());
            // we only add slug to the update stack if there's a change in title
            if (articleData.title !== values.title) {
              formData.append("slug", slugify(values.title, { lower: true, remove: /[*+~.()'"!:@]/g }));
            }

            try {
              const updatearticleResponse = await updateArticleServerFn({ data: formData });
              if (updatearticleResponse.isSuccess) {
                setIsVisible(true);
                setArticleData(null);
              }
              toast.success("Article mis à jour avec succès !");
            } catch (error) {
              console.error("Error updating article:", error);
              toast.error("Erreur lors de la mise à jour de l'article. Veuillez réessayer.");
            }
          }}
        />
      )}
    </section>
  );
}
