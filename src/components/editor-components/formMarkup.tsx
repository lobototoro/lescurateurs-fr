import { FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import RTE from "@/components/editor-components/rte";
import { AddUrlsObjects } from "./addUrls";
import { addRemoveInputsFactory } from "@/lib/utils/addUrlsUtils";
import { preventClickActions } from "@/lib/utils/utils";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const errors = field.state.meta.errors.map((error: string, index: number) => {
    return (
      <p key={`error-${field.name}-${index}`} className="text-red-500">
        <em>{error}</em>
      </p>
    );
  });

  return (
    <>
      {field.state.meta.isTouched && errors.length > 0 && errors}
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

export const FormMarkup = ({
  defaultformValues,
  formValidation,
  submitAction,
}: {
  defaultformValues: Record<string, any>;
  formValidation: z.ZodObject<any>;
  submitAction: (value: Record<string, any>) => void;
}) => {
  const form = useForm({
    defaultValues: defaultformValues,
    onSubmit: ({ value }) => {
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
            validators={{
              onChange: ({ value }) => {
                const result = (formValidation.shape as any).title.safeParse(value);
                if (!result.success) {
                  return result.error.issues.map((issue: any) => issue.message);
                }
                return undefined;
              },
            }}
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
            validators={{
              onChange: ({ value }) => {
                const result = (formValidation.shape as any).introduction.safeParse(value);
                if (!result.success) {
                  return result.error.issues.map((issue: any) => issue.message);
                }
                return undefined;
              },
            }}
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
            validators={{
              onChange: ({ value }) => {
                const result = (formValidation.shape as any).main.safeParse(value);
                if (!result.success) {
                  return result.error.issues.map((issue: any) => issue.message);
                }
                return undefined;
              },
            }}
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
            validators={{
              onChange: ({ value }) => {
                const result = (formValidation.shape as any).main_audio_url.safeParse(value);
                if (!result.success) {
                  return result.error.issues.map((issue: any) => issue.message);
                }
                return undefined;
              },
            }}
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
            validators={{
              onChange: ({ value }) => {
                const result = (formValidation.shape as any).url_to_main_illustration.safeParse(value);
                if (!result.success) {
                  return result.error.issues.map((issue: any) => issue.message);
                }
                return undefined;
              },
            }}
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

          <FieldSeparator />
          <FieldDescription className="text-md font-semibold">Ajouter un ou des urls à votre article</FieldDescription>
          <form.Field
            name="urls"
            children={(field) => {
              const [addInputs, removeInputs, updateUrls] = addRemoveInputsFactory(field.state.value, field.handleChange);

              return <AddUrlsObjects urls={field.state.value} updateUrls={updateUrls} addInputs={addInputs} removeInputs={removeInputs} />;
            }}
          />

          <FieldSeparator />
          <div className="flex justify-between mt-6">
            <Button
              variant="destructive"
              onClick={(e) => {
                preventClickActions(e);
                form.reset();
              }}
            >
              Effacez
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  onClick={(e) => {
                    preventClickActions(e);
                    form.handleSubmit();
                  }}
                >
                  {isSubmitting ? "..." : "Soumettre"}
                </Button>
              )}
            />
          </div>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};
