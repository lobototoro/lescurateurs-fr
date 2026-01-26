import { FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import RTE from "@/components/editor-components/rte";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const errors = field.state.meta.errors.map((error: any, index: number) => {
    return (
      <p key={`${field.name}-${index}`} className="text-red-500">
        {error?.message as string}
      </p>
    );
  });

  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid && field.state.meta.errors.length > 0 && errors}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export enum UrlsTypes {
  WEBSITE = "website",
  VIDEOS = "videos",
  AUDIO = "audio",
  SOCIAL = "social",
  IMAGE = "image",
}

const formSchema = z.object({
  title: z.string().min(10, { error: "Title must be at least 10 characters" }).max(100, { error: "Title must be at most 100 characters" }),
  introduction: z.string().min(10, { error: "Introduction must be at least 10 characters" }).max(500, { error: "Introduction must be at most 500 characters" }),
  main: z.string().min(200, "Main content must be at least 200 characters"),
  main_audio_url: z.url("You must enter a real url"),
  url_to_main_illustration: z.url("You must enter a real url"),
  urls: z
    .array(
      z.object({
        type: z.enum(UrlsTypes),
        url: z.url("You must enter a real url"),
        credits: z.string().max(100, { error: "Credits must be at most 100 characters" }).optional(),
      }),
    )
    .optional(),
});

export const FormMarkup = ({ defaultformValues, submitAction }: { defaultformValues: Record<string, any>; submitAction: (value: Record<string, any>) => void }) => {
  const form = useForm({
    defaultValues: defaultformValues,

    validators: {
      onChangeAsyncDebounceMs: 500,
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(">>>>>>> ", value);
      submitAction(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Créer un nouvel article</FieldLegend>
          <FieldDescription>Remplissez tous les champs pour avant de soumettre ce formulaire</FieldDescription>
          <FieldSeparator />

          <form.Field
            name="title"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          <form.Field
            name="introduction"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>Introduction</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="Type your introduction here."
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          <form.Field
            name="main"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>corps de l'article</FieldLabel>
                <RTE
                  field-id={field.name}
                  className="rte"
                  data-testid={field.name}
                  value={field.state.value}
                  onChange={(mainstate: string) => {
                    field.handleChange(mainstate);
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          <form.Field
            name="main_audio_url"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>Main Audio URL</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="Type your main audio URL here."
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          <form.Field
            name="url_to_main_illustration"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>URL to Main Illustration</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="Type your URL to main illustration here."
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </FieldSet>
        <FieldSeparator />

        <Button type="submit" onClick={() => form.handleSubmit()}>
          Soumettre
        </Button>
      </FieldGroup>
    </form>
  );
};
