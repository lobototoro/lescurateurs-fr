import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { FieldSeparator } from "@/components/ui/field";

import { preventClickActions } from "@/lib/utils/utils";

export const PaginationWithOptions = ({
  itemsList,
  selectedID,
  defaultPage = 1,
  defaultLimit = 10,
  isPending,
  children,
}: {
  itemsList: any[];
  selectedID: React.Dispatch<React.SetStateAction<string | null>>;
  defaultPage: number;
  defaultLimit: number;
  isPending: boolean;
  children: React.ReactNode;
}): React.ReactElement => {
  const [activePage, setActivePage] = useState<number>(Number(defaultPage));
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const totalPages = Math.ceil(itemsList.length / Number(defaultLimit));
  const offset = Number(defaultLimit) * (activePage - 1);
  const paginatedItems = itemsList.slice(offset, Number(defaultLimit) * activePage);
  const handleChangePage = (page: number) => {
    setActivePage(page);
  };

  useEffect(() => {
    if (selectedArticle) {
      selectedID(selectedArticle);
    }
  }, [selectedArticle, selectedID]);

  /*
   * Popover and Pagination are from shadcn UI.
   * FillPopover is a custom component that displays the groupped buttons to manage an article
   */
  return (
    <section className="w-full my-6">
      <div role="listbox" aria-label="pagination content" className="w-full ml-25 ">
        <ol className="list-decimal list-inside">
          {paginatedItems.map((item) => (
            <li
              key={item.id}
              className="cursor-pointer"
              // onKeyDown={() => setSelectedArticle(item.articleId)}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedArticle(item.articleId);
                    }}
                  >
                    {item.slug}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverHeader>
                    <PopoverTitle>Actions</PopoverTitle>
                    <PopoverDescription className="mb-6">Choisissez une action à effectuer sur l'article sélectionné.</PopoverDescription>
                  </PopoverHeader>
                  {isPending ? <Spinner /> : children}
                </PopoverContent>
              </Popover>
            </li>
          ))}
        </ol>
      </div>
      <FieldSeparator className="mt-3" />
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === activePage}
                    onClick={(e) => {
                      preventClickActions(e);
                      handleChangePage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
};
