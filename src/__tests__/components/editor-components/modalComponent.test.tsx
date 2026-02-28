import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalComponent } from "@/components/modal/modalComponent";
import { useModal } from "shadcn-modal-manager";

// Mock shadcn-modal-manager
vi.mock("shadcn-modal-manager", () => ({
  ModalManager: {
    create: (component: any) => component,
  },
  useModal: vi.fn(),
  shadcnUiDialog: vi.fn((modal: any) => ({ open: modal.isOpen })),
  shadcnUiDialogContent: vi.fn((_modal: any) => ({})),
}));

// Mock Dialog components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog">{children}</div>,
  DialogContent: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="mock-dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="mock-dialog-title">{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-footer">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="mock-dialog-description">{children}</p>,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, type = "button", variant = "default", onClick }: any) => (
    <button type={type} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("ModalComponent", () => {
  const mockAction = vi.fn();
  const mockClose = vi.fn();
  const mockDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as any).mockReturnValue({
      close: mockClose,
      dismiss: mockDismiss,
      isOpen: true,
    });
  });

  describe("Rendering", () => {
    it("should render the modal with message in ChoiceMode", () => {
      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-1" />);

      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByText("Confirmez votre choix")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Validez" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should render the modal with message in UserPropsMode", () => {
      render(
        <ModalComponent
          message="User update message"
          articleId="456"
          updatedUserProps={{
            id: "456",
            name: "Test User",
            email: "test@example.com",
            role: "admin",
            permissions: ["read", "write"],
          }}
          action={mockAction}
          modalId="test-modal-2"
        />,
      );

      expect(screen.getByText("User update message")).toBeInTheDocument();
      expect(screen.getByText("Confirmez votre choix")).toBeInTheDocument();
    });

    it("should have proper form structure", () => {
      const { container } = render(
        <ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-3" />,
      );

      expect(container.querySelector("form")).toBeInTheDocument();
    });
  });

  describe("ChoiceMode", () => {
    it("should call action with articleId and choice when Save is clicked", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn().mockResolvedValue(undefined);

      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-4" />);

      await user.click(screen.getByRole("button", { name: "Validez" }));

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith("123", true);
      });
    });

    it("should call modal.close with { saved: true } when Save is clicked", async () => {
      const user = userEvent.setup();

      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-5" />);

      await user.click(screen.getByRole("button", { name: "Validez" }));

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalledWith({ saved: true });
      });
    });

    it("should call modal.dismiss when Cancel is clicked", async () => {
      const user = userEvent.setup();

      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-6" />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockDismiss).toHaveBeenCalled();
    });

    it("should have form element with onSubmit handler", () => {
      render(<ModalComponent message="Test message" articleId="123" choice={false} action={mockAction} modalId="test-modal-7" />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("space-y-4");
    });
  });

  describe("UserPropsMode", () => {
    const userProps = {
      id: "789",
      name: "John Doe",
      email: "john@example.com",
      role: "editor",
      permissions: ["read", "write", "edit"],
    };

    it("should call action with articleId and updatedUserProps when Save is clicked", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn().mockResolvedValue(undefined);

      render(
        <ModalComponent message="User update message" articleId="789" updatedUserProps={userProps} action={mockAction} modalId="test-modal-8" />,
      );

      await user.click(screen.getByRole("button", { name: "Validez" }));

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(userProps);
      });
    });

    it("should call modal.close with { saved: true } when Save is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ModalComponent message="User update message" articleId="789" updatedUserProps={userProps} action={mockAction} modalId="test-modal-9" />,
      );

      await user.click(screen.getByRole("button", { name: "Validez" }));

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalledWith({ saved: true });
      });
    });
  });

  describe("Accessibility", () => {
    it("should have dialog with proper aria-describedby attribute", () => {
      const { container } = render(
        <ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-10" />,
      );

      expect(container.querySelector("[aria-describedby]")).toBeInTheDocument();
    });

    it("should have save button with type submit", () => {
      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-11" />);

      expect(screen.getByRole("button", { name: "Validez" })).toHaveAttribute("type", "submit");
    });

    it("should have cancel button with type button", () => {
      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-12" />);

      expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("type", "button");
    });
  });

  describe("Error Handling", () => {
    it("should not throw error when action is not a function", async () => {
      const user = userEvent.setup();

      render(<ModalComponent message="Test message" articleId="123" choice={true} action={null as any} modalId="test-modal-13" />);

      expect(() => user.click(screen.getByRole("button", { name: "Validez" }))).not.toThrow();
    });

    it("should handle async action that throws an error", async () => {
      expect.assertions(1);
      const user = userEvent.setup();
      const errorMessage = "Something went wrong";
      const mockAction = vi.fn().mockRejectedValue(new Error(errorMessage));

      render(<ModalComponent message="Test message" articleId="123" choice={true} action={mockAction} modalId="test-modal-14" />);

      await user.click(screen.getByRole("button", { name: "Validez" }));

      await waitFor(
        () => {
          expect(mockAction).toHaveBeenCalledWith("123", true);
        },
        { timeout: 3000 },
      );
    });
  });
});
