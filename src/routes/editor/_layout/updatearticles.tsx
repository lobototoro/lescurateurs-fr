import { updateArticle } from "@/lib/articles/articles-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { articles } from "db/schema";

const updateArticleServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async (data: any) => {
    // Extract id from FormData since it's not being passed as a separate parameter
    const id = data.id as string;
    if (!id) {
      throw new Error("ID is required");
    }
    return await updateArticle(id, data);
  });

export const Route = createFileRoute("/editor/_layout/updatearticles")({
  component: RouteComponent,
});

export type UFormValues = {
  id: string;
  slug: string;
  title: string;
  introduction: string;
  main: string;
  main_audio_url: string;
  url_to_main_illustration: string;
  urls: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  author: string;
  author_email: string;
  validated: boolean;
  shipped: boolean;
};

export const updateArticleFormValues = {
  id: "",
  slug: "",
  title: "",
  introduction: "",
  main: "",
  main_audio_url: "",
  url_to_main_illustration: "",
  urls: [],
  published_at: "",
  created_at: "",
  updated_at: "",
  updated_by: "",
  author: "",
  author_email: "",
  validated: false,
  shipped: false,
};

function RouteComponent() {
  return <section className="w-3/4 mx-auto"></section>;
}
