import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FormMarkup } from "@/components/editor-components/formMarkup";
import { createArticle } from "@/lib/articles/articles-functions";
import { createServerFn } from "@tanstack/react-start";
import { authClient } from "lib/auth/auth-client";

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
  urls: string[];
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

  return (
    <section className="w-3/4 mx-auto">
      <FormMarkup
        defaultformValues={formDefaultValues}
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
