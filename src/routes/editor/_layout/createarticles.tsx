import { createFileRoute } from "@tanstack/react-router";

import { FormMarkup } from "@/components/editor-components/formMarkup";

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
  return (
    <section className="w-3/4 mx-auto">
      <FormMarkup
        defaultformValues={formDefaultValues}
        submitAction={async (values) => {
          console.log(values);
        }}
      />
    </section>
  );
}
