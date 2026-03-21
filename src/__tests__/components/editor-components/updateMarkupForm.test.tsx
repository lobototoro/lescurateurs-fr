import { UpdateMarkupForm } from "@/components/editor-components/updateMarkupForm";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, beforeEach, expect } from "vitest";
import type { UpdatedUserValues } from "@/routes/editor/_layout/manageuser";

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useId: () => "test-id-123",
  };
});

vi.mock("@/lib/utils/utils", () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/field", () => ({
  Field: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  FieldError: ({ errors }: { errors: string[] }) => (
    <div data-testid="field-error">{errors.map((e) => e).join(", ")}</div>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, onBlur, ...props }: any) => (
    <input {...props} onChange={onChange} onBlur={onBlur} value={value} />
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, ...props }: any) => <textarea {...props} value={value} />,
}));

let selectedValue = "contributor";
const onValueChangeCallbacks: ((value: string) => void)[] = [];
const onValueChangeCalls: string[] = [];

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => {
    if (onValueChange) {
      onValueChangeCallbacks.push(onValueChange);
    }
    return (
      <div data-testid="select" data-value={value || selectedValue}>
        {children}
      </div>
    );
  },
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button
      data-testid={`select-item-${value}`}
      data-value={value}
      onClick={() => {
        selectedValue = value;
        onValueChangeCalls.push(value);
        onValueChangeCallbacks.forEach((cb) => cb(value));
      }}
    >
      {children}
    </button>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button {...props} data-testid="select-trigger">
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder || selectedValue || "Select value"}</span>,
}));

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("UpdateMarkupForm", () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();

  const defaultUser: UpdatedUserValues = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "contributor",
    permissions: ["read:articles", "create:articles", "update:articles", "validate:articles"],
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    vi.clearAllMocks();
    selectedValue = "contributor";
    onValueChangeCallbacks.length = 0;
    onValueChangeCalls.length = 0;
  });

  describe("Rendering", () => {
    it("Should render the form with user data", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Mettre à jour l'utilisateur")).toBeInTheDocument();
      expect(screen.getByText("Modifiez les informations de l'utilisateur ci-dessous")).toBeInTheDocument();
    });

    it("Should display all form fields with correct labels", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Nom")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Rôle")).toBeInTheDocument();
      expect(screen.getByText("Permissions (lecture seule)")).toBeInTheDocument();
      expect(screen.getByText("Mettre à jour")).toBeInTheDocument();
    });

    it("Should render submit button", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Initial Values", () => {
    it("Should display user name in name field", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.value).toBe("John Doe");
    });

    it("Should display user email in email field", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      expect(emailInput).toBeInTheDocument();
      expect(emailInput.value).toBe("john@example.com");
    });

    it("Should display user role", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const roleSelect = document.querySelector('[data-testid="select"]') as HTMLElement;
      expect(roleSelect).toBeInTheDocument();
    });

    it("Should display user permissions in readonly textarea", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const permissionsTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
      expect(permissionsTextarea).toBeInTheDocument();
      expect(permissionsTextarea.readOnly).toBe(true);
    });

    it("Should display permissions helper text", () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      expect(
        screen.getByText("Les permissions sont automatiquement définies selon le rôle sélectionné")
      ).toBeInTheDocument();
    });
  });

  describe("Form Field Updates", () => {
    it("Should allow updating the name field", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Doe");

      expect(nameInput.value).toBe("Jane Doe");
    });

    it("Should allow updating the email field", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      await user.clear(emailInput);
      await user.type(emailInput, "jane@example.com");

      expect(emailInput.value).toBe("jane@example.com");
    });
  });

  describe("Role Change", () => {
    it("Should call onValueChange with admin when admin role is selected", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const adminItem = screen.getByTestId("select-item-admin");
      await user.click(adminItem);

      await waitFor(() => {
        expect(onValueChangeCalls).toContain("admin");
      });
    });

    it("Should call onValueChange with contributor when contributor role is selected", async () => {
      const adminUser: UpdatedUserValues = {
        ...defaultUser,
        role: "admin",
        permissions: [
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
      };

      render(<UpdateMarkupForm user={adminUser} onSubmit={mockOnSubmit} />);

      const contributorItem = screen.getByTestId("select-item-contributor");
      await user.click(contributorItem);

      await waitFor(() => {
        expect(onValueChangeCalls).toContain("contributor");
      });
    });
  });

  describe("Validation", () => {
    it("Should not call onSubmit when name is too short", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "J");

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("Should call onSubmit when name is valid", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "Jane");

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it("Should call onSubmit with updated values when form is valid and changed", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Doe");

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: "user-123",
          name: "Jane Doe",
          email: "john@example.com",
          role: "contributor",
          permissions: ["read:articles", "create:articles", "update:articles", "validate:articles"],
        });
      });
    });

    it("Should show info toast when no changes detected", async () => {
      const { toast } = await import("sonner");
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Aucune modification détectée");
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("Should submit with admin permissions when role is changed to admin", async () => {
      render(<UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} />);

      const adminItem = screen.getByTestId("select-item-admin");
      await user.click(adminItem);

      await waitFor(() => {
        expect(onValueChangeCalls).toContain("admin");
      });

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: "user-123",
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
          permissions: expect.arrayContaining(["read:articles", "create:articles", "update:articles"]),
        });
      });
    });

    it("Should include user id in submitted values", async () => {
      const userWithId: UpdatedUserValues = {
        ...defaultUser,
        id: "custom-id-456",
      };

      render(<UpdateMarkupForm user={userWithId} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "custom-id-456",
          })
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("Should handle empty user name", () => {
      const emptyNameUser: UpdatedUserValues = {
        ...defaultUser,
        name: "",
      };

      render(<UpdateMarkupForm user={emptyNameUser} onSubmit={mockOnSubmit} />);

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      expect(nameInput.value).toBe("");
    });

    it("Should handle user with admin role", () => {
      const adminUser: UpdatedUserValues = {
        ...defaultUser,
        role: "admin",
        permissions: [
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
      };

      render(<UpdateMarkupForm user={adminUser} onSubmit={mockOnSubmit} />);

      const roleSelect = document.querySelector('[data-testid="select"]') as HTMLElement;
      expect(roleSelect).toBeInTheDocument();
    });

    it("Should render with custom className", () => {
      const { container } = render(
        <UpdateMarkupForm user={defaultUser} onSubmit={mockOnSubmit} className="custom-class" />
      );

      const formContainer = container.firstChild as HTMLElement;
      expect(formContainer.className).toContain("custom-class");
    });

    it("Should work without onSubmit callback", async () => {
      render(<UpdateMarkupForm user={defaultUser} />);

      const submitButton = screen.getByRole("button", { name: "Mettre à jour" });
      expect(submitButton).toBeInTheDocument();

      await user.click(submitButton);
    });
  });
});
