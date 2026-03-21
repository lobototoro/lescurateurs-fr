import { describe, it, vi, beforeEach, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("shadcn-modal-manager", () => {
  const mockModal = {
    open: true,
    close: vi.fn(),
    dismiss: vi.fn(),
  };
  return {
    ModalManager: {
      create: (component: (props: any) => React.ReactElement) => {
        return component;
      },
    },
    useModal: () => mockModal,
    shadcnUiDialog: () => ({}),
    shadcnUiDialogContent: () => ({}),
  };
});

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

describe("ModalComponent", () => {
  const user = userEvent.setup();
  const mockAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("Should render the dialog", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      render(
        <ModalComponent
          message="Êtes-vous sûr?"
          articleId="123"
          choice={true}
          action={mockAction}
          modalId="test-modal"
        />
      );

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("Should display the message", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      render(
        <ModalComponent
          message="Êtes-vous sûr de vouloir supprimer cet article?"
          articleId="123"
          choice={true}
          action={mockAction}
          modalId="test-modal"
        />
      );

      expect(screen.getByText("Êtes-vous sûr de vouloir supprimer cet article?")).toBeInTheDocument();
    });

    it("Should render dialog title", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      render(
        <ModalComponent message="Test" articleId="123" choice={true} action={mockAction} modalId="test-modal" />
      );

      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByText("Confirmez votre choix")).toBeInTheDocument();
    });

    it("Should render Cancel and Validez buttons", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      render(
        <ModalComponent message="Confirmation requise" articleId="123" choice={true} action={mockAction} modalId="test-modal" />
      );

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Validez" })).toBeInTheDocument();
    });
  });

  describe("User Props Mode", () => {
    it("Should handle user props mode", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const userProps = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        permissions: ["read:articles", "write:articles"],
      };

      render(
        <ModalComponent
          message="Mettre à jour l'utilisateur?"
          articleId="123"
          updatedUserProps={userProps}
          action={mockAction}
          modalId="test-modal"
        />
      );

      expect(screen.getByText("Mettre à jour l'utilisateur?")).toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    it("Should call dismiss when Cancel is clicked", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const { useModal } = await import("shadcn-modal-manager");
      const modal = useModal();

      render(
        <ModalComponent message="Test" articleId="123" choice={true} action={mockAction} modalId="test-modal" />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(modal.dismiss).toHaveBeenCalledTimes(1);
    });

    it("Should call action and close when Validez is clicked", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const { useModal } = await import("shadcn-modal-manager");
      const modal = useModal();
      mockAction.mockResolvedValue(undefined);

      render(
        <ModalComponent
          message="Test"
          articleId="article-123"
          choice={true}
          action={mockAction}
          modalId="test-modal"
        />
      );

      const submitButton = screen.getByRole("button", { name: "Validez" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith("article-123", true);
        expect(modal.close).toHaveBeenCalledWith({ saved: true });
      });
    });

    it("Should call action with updatedUserProps when provided", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const { useModal } = await import("shadcn-modal-manager");
      const modal = useModal();
      mockAction.mockResolvedValue(undefined);

      const userProps = {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        permissions: ["read:articles"],
      };

      render(
        <ModalComponent
          message="Test"
          articleId="123"
          updatedUserProps={userProps}
          action={mockAction}
          modalId="test-modal"
        />
      );

      const submitButton = screen.getByRole("button", { name: "Validez" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(userProps);
        expect(modal.close).toHaveBeenCalledWith({ saved: true });
      });
    });
  });

  describe("Error Handling", () => {
    it("Should handle action that throws an error", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const { useModal } = await import("shadcn-modal-manager");
      const modal = useModal();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockAction.mockRejectedValue(new Error("Something went wrong"));

      render(
        <ModalComponent
          message="Test"
          articleId="123"
          choice={true}
          action={mockAction}
          modalId="test-modal"
        />
      );

      const submitButton = screen.getByRole("button", { name: "Validez" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error executing action:", expect.any(Error));
        expect(modal.close).toHaveBeenCalledWith({ saved: true });
      });

      consoleErrorSpy.mockRestore();
    });

    it("Should handle action when action is provided but not called", async () => {
      const { ModalComponent } = await import("@/components/modal/modalComponent");

      const { useModal } = await import("shadcn-modal-manager");
      const modal = useModal();

      render(
        <ModalComponent
          message="Test with choice"
          articleId="123"
          choice={false}
          action={vi.fn()}
          modalId="test-modal"
        />
      );

      const submitButton = screen.getByRole("button", { name: "Validez" });
      await user.click(submitButton);

      expect(modal.close).toHaveBeenCalledWith({ saved: true });
    });
  });
});
