import { PaginationWithOptions } from "@/components/searchComponents/paginationWithOptions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, beforeEach, expect } from "vitest";

vi.mock("@/components/ui/pagination", () => ({
  Pagination: ({ children }: { children: React.ReactNode }) => <div data-testid="pagination">{children}</div>,
  PaginationContent: ({ children }: { children: React.ReactNode }) => <div data-testid="pagination-content">{children}</div>,
  PaginationItem: ({ children }: { children: React.ReactNode }) => <div data-testid="pagination-item">{children}</div>,
  PaginationLink: ({ children, onClick, isActive, ...props }: any) => (
    <button onClick={onClick} data-active={isActive} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
  PopoverDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-description">{children}</div>,
  PopoverHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-header">{children}</div>,
  PopoverTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-title">{children}</div>,
  PopoverTrigger: ({ children, asChild }: any) => (asChild ? children : <div data-testid="popover-trigger">{children}</div>),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/ui/field", () => ({
  FieldSeparator: ({ className }: { className?: string }) => <hr data-testid="separator" className={className} />,
}));

vi.mock("@/lib/utils/utils", () => ({
  preventClickActions: vi.fn(),
}));

describe("PaginationWithOptions", () => {
  const user = userEvent.setup();
  const mockSelectedID = vi.fn();

  const defaultItemsList = [
    { id: "1", slug: "article-1", articleId: "art-1" },
    { id: "2", slug: "article-2", articleId: "art-2" },
    { id: "3", slug: "article-3", articleId: "art-3" },
    { id: "4", slug: "article-4", articleId: "art-4" },
    { id: "5", slug: "article-5", articleId: "art-5" },
    { id: "6", slug: "article-6", articleId: "art-6" },
    { id: "7", slug: "article-7", articleId: "art-7" },
    { id: "8", slug: "article-8", articleId: "art-8" },
    { id: "9", slug: "article-9", articleId: "art-9" },
    { id: "10", slug: "article-10", articleId: "art-10" },
    { id: "11", slug: "article-11", articleId: "art-11" },
  ];

  const mockChildren = <div data-testid="popover-children">Popover Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("Should render the component", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("Should render the separator", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });

    it("Should render first page items by default", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByText("article-1")).toBeInTheDocument();
      expect(screen.getByText("article-10")).toBeInTheDocument();
    });
  });

  describe("Popover", () => {
    it("Should render popover trigger for each item", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      const popovers = screen.getAllByTestId("popover");
      expect(popovers).toHaveLength(10);
    });

    it("Should render children content in popover", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList.slice(0, 1)}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByTestId("popover-children")).toBeInTheDocument();
    });

    it("Should show spinner when isPending is true", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList.slice(0, 1)}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={true}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("Should render pagination when total pages > 1", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("Should render two page links for 11 items with limit 10", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      const pageLinks = screen.getAllByTestId("pagination-item");
      expect(pageLinks).toHaveLength(2);
    });

    it("Should not render pagination when total pages = 1", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList.slice(0, 5)}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  describe("Item Selection", () => {
    it("Should call selectedID when an item button is clicked", async () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      const articleButton = screen.getByText("article-1");
      await user.click(articleButton);

      expect(mockSelectedID).toHaveBeenCalledWith("art-1");
    });
  });

  describe("Page Navigation", () => {
    it("Should navigate to second page when page 2 is clicked", async () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      const page2Button = screen.getByText("2");
      await user.click(page2Button);

      await vi.waitFor(() => {
        expect(screen.getByText("article-11")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("Should handle empty items list", () => {
      render(
        <PaginationWithOptions
          itemsList={[]}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });

    it("Should handle custom defaultPage", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={2}
          defaultLimit={10}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByText("article-11")).toBeInTheDocument();
    });

    it("Should handle custom defaultLimit", () => {
      render(
        <PaginationWithOptions
          itemsList={defaultItemsList}
          selectedID={mockSelectedID}
          defaultPage={1}
          defaultLimit={5}
          isPending={false}
        >
          {mockChildren}
        </PaginationWithOptions>
      );

      expect(screen.getByText("article-1")).toBeInTheDocument();
      expect(screen.getByText("article-5")).toBeInTheDocument();
      expect(screen.queryByText("article-6")).not.toBeInTheDocument();

      const pageLinks = screen.getAllByTestId("pagination-item");
      expect(pageLinks).toHaveLength(3);
    });
  });
});
