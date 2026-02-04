import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FormMarkup } from "@/components/editor-components/formMarkup";
import { createArticle } from "@/lib/articles/articles-functions";
import { createServerFn } from "@tanstack/react-start";
import { authClient } from "lib/auth/auth-client";
import { z } from "zod";
import { UrlsTypes } from "@/components/editor-components/formMarkup";

const createArticleServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data }) => {
    return await createArticle(data);
  });

export const Route = createFileRoute("/editor/_layout/createarticles")({
  component: RouteComponent,
});

export type FormValues = {
  title: string;
  introduction: string;
  main: string;
  main_audio_url: string;
  url_to_main_illustration: string;
  urls: Array<{
    type: UrlsTypes;
    url: string;
    credits?: string;
  }>;
};

export const formDefaultValues: FormValues = {
  title: "",
  introduction: "",
  main: "",
  main_audio_url: "",
  url_to_main_illustration: "",
  urls: [],
};

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const userSessionInfos = {
    email: session?.user.email ?? "",
    name: session?.user.name ?? "",
  };
  const formSchema = z.object({
    title: z.string().min(10, { error: "Title must be at least 10 characters" }).max(100, { error: "Title must be at most 100 characters" }),
    introduction: z.string().min(10, { error: "Introduction must be at least 10 characters" }).max(500, { error: "Introduction must be at most 500 characters" }),
    main: z.string().min(200, "Main content must be at least 200 characters"),
    main_audio_url: z.url("You must enter a real url"),
    url_to_main_illustration: z.url("You must enter a real url"),
    urls: z
      .array(
        z.object({
          type: z.enum([UrlsTypes.WEBSITE, UrlsTypes.VIDEOS, UrlsTypes.AUDIO, UrlsTypes.SOCIAL, UrlsTypes.IMAGE]),
          url: z.url("You must enter a real url"),
          credits: z.string().max(100, { error: "Credits must be at most 100 characters" }).optional(),
        }),
      )
      .optional(),
  });

  return (
    <section className="w-3/4 mx-auto">
      <FormMarkup
        defaultformValues={formDefaultValues}
        formValidation={formSchema}
        submitAction={async (values) => {
          // console.log(values);
          const formData = new FormData();
          formData.append("title", values.title);
          formData.append("introduction", values.introduction);
          formData.append("main", values.main);
          formData.append("main_audio_url", values.main_audio_url);
          formData.append("url_to_main_illustration", values.url_to_main_illustration);
          formData.append("urls", JSON.stringify(values.urls));
          formData.append("author_email", userSessionInfos.email);
          formData.append("author", userSessionInfos.name);

          const response = await createArticleServerFn({ data: formData });
          if (!response.isSuccess) {
            console.error("server-side error ", response.message);
            toast.error("Failed to create article and the corresponding slug");
          } else {
            toast.success("Article and slug created successfully!");
          }
        }}
      />
    </section>
  );
}
