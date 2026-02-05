import { FieldDescription, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugsTermSearch } from "@/lib/search/search-functions";
import { useForm } from "@tanstack/react-form";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

const slugsSearchServerfn = createServerFn({ method: "POST" })
  .inputValidator((data: { searchTerm: string }) => {
    if (!data.searchTerm || data.searchTerm.trim() === "") {
      throw new Error("Le terme de recherche est requis.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    return slugsTermSearch(data.searchTerm);
  });

export const SlugsSearchComponent = ({ setArticlesList }: { setArticlesList: (value: any[]) => void }) => {
  const form = useForm({
    defaultValues: {
      searchTerm: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.searchTerm || value.searchTerm.trim() === "") {
        toast.error("Le terme de recherche est requis.");
        return;
      }
      // Call the search function with the search term
      // Here you would typically call your search function and update the state with the results
      try {
        const articlesList = await slugsSearchServerfn({ data: { searchTerm: value.searchTerm } });
        console.info("articles list ", articlesList);
        if (Array.isArray(articlesList) && articlesList.length > 0) {
          setArticlesList(articlesList);
        } else {
          toast.error("Aucun résultat trouvé pour ce terme de recherche.");
        }
      } catch (error) {
        console.error("Error during search:", error);
        toast.error("Erreur lors de la recherche. ${error instanceof Error ? error.message : 'Unknown error'}");
      }
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
          <FieldDescription>Entrez un terme de recherche</FieldDescription>
          <div className="flex flex-row w-full">
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
            <Button
              type="submit"
              className="ml-4"
              // onClick={() => {
              //   form.handleSubmit();
              // }}
            >
              Rechercher
            </Button>
          </div>
          <FieldSeparator />
        </FieldSet>
      </form>
    </section>
  );
};
