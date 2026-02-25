import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authClient } from "lib/auth/auth-client";
import { useId } from "react";

const formSchema = z.object({
  email: z.email("Email invalide"),
});

export const Route = createFileRoute("/requestResetPassword")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: "/",
        },
        {
          onSuccess: () => {
            toast.success("Un email de réinitialisation a été envoyé à votre adresse");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Une erreur s'est produite");
          },
        },
      );
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Réinitialisez votre mot de passe</CardTitle>
            <CardDescription>Entrez votre mail pour recevoir un email qui va vous rediriger vers la page de reset password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id={`request-reset-password-form-${useId()}`}
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="m@example.com"
                          autoComplete="email"
                          type="email"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />
                <Field>
                  <Button type="submit" className="w-full">
                    Envoyer le lien de réinitialisation
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
