import { FieldDescription, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";

export const GlobalSearchComponent = ({ term, setTerm }: { term: string; setTerm: (value: string) => void }) => {
  const form = useForm({
    defaultValues: {
      searchTerm: term,
    },
    onSubmit: ({ value }) => {
      setTerm(value.searchTerm);
    },
  });

  return (
    <section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldSet>
          <FieldLegend>Rechercher un article</FieldLegend>
          <FieldDescription>entrez un terme de recherche :</FieldDescription>
          <form.Field
            name="searchTerm"
            children={(field) => (
              <>
                <FieldLabel htmlFor={field.name}>Terme de recherche</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
              </>
            )}
          />
          <FieldSeparator />
        </FieldSet>
      </form>
    </section>
  );
};
