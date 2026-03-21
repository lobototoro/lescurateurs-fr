import { FillPopover } from "@/components/searchComponents/fillPopover";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, beforeEach, expect } from "vitest";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/button-group", () => ({
  ButtonGroup: ({ children, orientation }: any) => (
    <div data-testid="button-group" data-orientation={orientation}>
      {children}
    </div>
  ),
}));

vi.mock("@/lib/utils/utils", () => ({
  preventClickActions: vi.fn(),
}));

describe("FillPopover", () => {
  const user = userEvent.setup();
  const mockHandleGroupButtonsActions = vi.fn();

  const defaultArticleData = {
    id: "article-123",
    slug: "test-article",
    validated: false,
    shipped: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("Should render the component", () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByTestId("button-group")).toBeInTheDocument();
    });

    it("Should render three buttons", () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("Button Labels", () => {
    it("Should show Valider when article is not validated", () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Valider")).toBeInTheDocument();
    });

    it("Should show Dé-valider when article is validated", () => {
      const validatedArticle = { ...defaultArticleData, validated: true };

      render(<FillPopover articleData={validatedArticle} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Dé-valider")).toBeInTheDocument();
    });

    it("Should show Déployer when article is not shipped", () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Déployer")).toBeInTheDocument();
    });

    it("Should show Mettre offline when article is shipped", () => {
      const shippedArticle = { ...defaultArticleData, shipped: true };

      render(<FillPopover articleData={shippedArticle} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Mettre offline")).toBeInTheDocument();
    });

    it("Should show Supprimer when article is not marked for deletion", () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Supprimer")).toBeInTheDocument();
    });

    it("Should show Restaurer when article is marked for deletion", () => {
      const deletedArticle = { ...defaultArticleData, id: "markfordeletion|article-123" };

      render(<FillPopover articleData={deletedArticle} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByText("Restaurer")).toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    it("Should call handleGroupButtonsActions with correct parameters when Valider is clicked", async () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      const validateButton = screen.getByText("Valider");
      await user.click(validateButton);

      expect(mockHandleGroupButtonsActions).toHaveBeenCalledWith("article-123", "Valider");
    });

    it("Should call handleGroupButtonsActions with correct parameters when Déployer is clicked", async () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      const deployButton = screen.getByText("Déployer");
      await user.click(deployButton);

      expect(mockHandleGroupButtonsActions).toHaveBeenCalledWith("article-123", "Déployer");
    });

    it("Should call handleGroupButtonsActions with correct parameters when Supprimer is clicked", async () => {
      render(<FillPopover articleData={defaultArticleData} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      const deleteButton = screen.getByText("Supprimer");
      await user.click(deleteButton);

      expect(mockHandleGroupButtonsActions).toHaveBeenCalledWith("article-123", "Supprimer");
    });

    it("Should call handleGroupButtonsActions with correct parameters when Dé-valider is clicked", async () => {
      const validatedArticle = { ...defaultArticleData, validated: true };

      render(<FillPopover articleData={validatedArticle} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      const unvalidateButton = screen.getByText("Dé-valider");
      await user.click(unvalidateButton);

      expect(mockHandleGroupButtonsActions).toHaveBeenCalledWith("article-123", "Dé-valider");
    });
  });

  describe("Edge Cases", () => {
    it("Should handle missing articleData", () => {
      render(<FillPopover articleData={null as any} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByTestId("button-group")).toBeInTheDocument();
    });

    it("Should handle undefined articleData", () => {
      render(<FillPopover articleData={undefined as any} handleGroupButtonsActions={mockHandleGroupButtonsActions} />);

      expect(screen.getByTestId("button-group")).toBeInTheDocument();
    });
  });
});
