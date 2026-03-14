import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import { preventClickActions } from "@/lib/utils/utils";
import { FieldSeparator } from "@/components/ui/field";

export const PaginationSimple = ({
  itemsList,
  selectedID,
  defaultPage = 1,
  defaultLimit = 10,
  triggerAnimation,
}: {
  itemsList: any[];
  selectedID: React.Dispatch<React.SetStateAction<string | null>>;
  defaultPage: number;
  defaultLimit: number;
  triggerAnimation: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactElement => {
  const [activePage, setActivePage] = useState<number>(Number(defaultPage));
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [triggerHide, setTriggerHide] = useState<boolean>(false);
  const totalPages = Math.ceil(itemsList.length / Number(defaultLimit));
  const offset = Number(defaultLimit) * (activePage - 1);
  const paginatedItems = itemsList.slice(offset, Number(defaultLimit) * activePage);
  const handleChangePage = (page: number) => {
    setActivePage(page);
  };

  useEffect(() => {
    if (selectedArticle && selectedArticle !== null) {
      selectedID(selectedArticle);
    }
    if (triggerHide) {
      triggerAnimation(false);
    }
  }, [selectedArticle, selectedID, triggerAnimation, triggerHide]);

  return (
    <section className="w-full my-6">
      <div role="listbox" aria-label="pagination content" className="w-full ml-25 ">
        <ol className="list-disc list-inside">
          {paginatedItems.map((item) => (
            <li
              key={item.id}
              className="cursor-pointer bg-black hover:bg-gray-700 focus:outline-4 focus:outline-offset-4 focus:outline-bg-gray-700 active:bg-bg-gray-300 p-2"
              onKeyDown={() => setSelectedArticle(item.articleId)}
              onClick={(e) => {
                preventClickActions(e);
                setSelectedArticle(item.articleId);
                setTriggerHide(true);
              }}
            >
              {item.slug}
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
