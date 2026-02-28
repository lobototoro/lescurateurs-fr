import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useId } from "react";
import type { UpdatedUserValues } from "@/routes/editor/_layout/manageuser";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.email("Email invalide"),
  role: z.enum(["admin", "contributor"]),
  permissions: z.array(z.string()),
});

interface UpdateMarkupFormProps {
  user: UpdatedUserValues;
  className?: string;
  onSubmit?: (values: UpdatedUserValues) => void;
}

// Define permissions based on role
const rolePermissions: Record<string, string[]> = {
  admin: [
    "read:articles",
    "create:articles",
    "update:articles",
    "delete:articles",
    "validate:articles",
    "ship:articles",
    "create:user",
    "update:user",
    "delete:user",
    "enable:maintenance",
  ],
  contributor: ["read:articles", "create:articles", "update:articles", "validate:articles"],
};

export function UpdateMarkupForm({ user, className, onSubmit }: UpdateMarkupFormProps) {
  const formId = useId();
  const textareaId = useId();

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      // Check if values are equivalent to original user data
      const hasChanges = value.name !== user.name || value.email !== user.email || value.role !== user.role;

      if (!hasChanges) {
        toast.info("Aucune modification détectée");
        return;
      }

      const perms = rolePermissions[value.role] || rolePermissions.contributor;
      onSubmit?.({
        id: user.id,
        name: value.name,
        email: value.email,
        role: value.role,
        permissions: perms,
      });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Mettre à jour l'utilisateur</CardTitle>
          <CardDescription>Modifiez les informations de l'utilisateur ci-dessous</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={`update-user-form-${formId}`}
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="name">Nom</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Nom de l'utilisateur"
                        autoComplete="name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
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
                        placeholder="email@example.com"
                        autoComplete="email"
                        type="email"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="role"
                listeners={{
                  onChange: ({ value }) => {
                    const perms = rolePermissions[value] || rolePermissions.contributor;
                    form.setFieldValue("permissions", perms);
                  },
                }}
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="role">Rôle</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value as "admin" | "contributor");
                        }}
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="contributor">Contributor</SelectItem>
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="permissions"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="permissions">Permissions (lecture seule)</FieldLabel>
                      <Textarea id={`permissions-${textareaId}`} value={field.state.value} readOnly className="bg-muted" rows={4} />
                      <p className="text-xs text-muted-foreground mt-1">Les permissions sont automatiquement définies selon le rôle sélectionné</p>
                    </Field>
                  );
                }}
              />

              <Field>
                <Button type="submit" className="w-full">
                  Mettre à jour
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
