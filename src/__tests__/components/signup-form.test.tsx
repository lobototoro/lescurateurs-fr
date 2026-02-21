import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/components/signup-form";

// Mock the auth client
vi.mock("lib/auth/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the signup form with all fields", () => {
      render(<SignupForm />);

      expect(screen.getByText("Signup for an account")).toBeInTheDocument();
      expect(screen.getByText("Enter your email below to signup for an account")).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Signup" })).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(<SignupForm className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should render input fields with correct attributes", () => {
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      expect(nameInput).toHaveAttribute("placeholder", "votre nom");
      expect(nameInput).toHaveAttribute("autoComplete", "off");

      const emailInput = screen.getByLabelText("Email");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "m@example.com");
      expect(emailInput).toHaveAttribute("autoComplete", "on");

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("placeholder", "*******");
      expect(passwordInput).toHaveAttribute("autoComplete", "off");
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for name when less than 2 characters", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(nameInput, "a");
      await user.tab(); // Trigger blur
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Le nom doit avoir au moins 2 caractères/)).toBeInTheDocument();
      });
    });

    it("should show validation error for password when less than 8 characters", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(passwordInput, "short");
      await user.tab(); // Trigger blur
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Le mot de passe doit avoir au moins 8 caractères/)).toBeInTheDocument();
      });
    });

    it("should not show validation errors initially", () => {
      render(<SignupForm />);

      expect(screen.queryByText(/Le nom doit avoir au moins 2 caractères/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Email invalide/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Le mot de passe doit avoir au moins 8 caractères/)).not.toBeInTheDocument();
    });

    it("should show multiple validation errors when form is submitted with invalid data", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const submitButton = screen.getByRole("button", { name: "Signup" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Le nom doit avoir au moins 2 caractères/)).toBeInTheDocument();
        expect(screen.getByText(/Email invalide/)).toBeInTheDocument();
        expect(screen.getByText(/Le mot de passe doit avoir au moins 8 caractères/)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const { authClient } = await import("lib/auth/auth-client");
      (authClient.signUp.email as ReturnType<typeof vi.fn>).mockResolvedValue({});

      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(authClient.signUp.email).toHaveBeenCalledWith(
          {
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    it("should show success toast on successful signup", async () => {
      const user = userEvent.setup();
      const { authClient } = await import("lib/auth/auth-client");
      const { toast } = await import("sonner");
      (authClient.signUp.email as ReturnType<typeof vi.fn>).mockImplementation((_, options) => {
        options?.onSuccess?.();
        return Promise.resolve({});
      });

      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Signup successfully");
      });
    });

    it("should show error toast on signup failure", async () => {
      const user = userEvent.setup();
      const { authClient } = await import("lib/auth/auth-client");
      const { toast } = await import("sonner");
      const errorMessage = "Email already exists";
      (authClient.signUp.email as ReturnType<typeof vi.fn>).mockImplementation((_, options) => {
        options?.onError?.({ error: { message: errorMessage } });
        return Promise.resolve({});
      });

      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("should show generic error toast when error message is not provided", async () => {
      const user = userEvent.setup();
      const { authClient } = await import("lib/auth/auth-client");
      const { toast } = await import("sonner");
      (authClient.signUp.email as ReturnType<typeof vi.fn>).mockImplementation((_, options) => {
        options?.onError?.({ error: {} });
        return Promise.resolve({});
      });

      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Somethinig went wrong");
      });
    });
  });

  describe("User Interactions", () => {
    it("should update input values when user types", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

      await user.type(nameInput, "John Doe");
      await user.type(emailInput, "john@example.com");
      await user.type(passwordInput, "password123");

      expect(nameInput.value).toBe("John Doe");
      expect(emailInput.value).toBe("john@example.com");
      expect(passwordInput.value).toBe("password123");
    });

    it("should clear validation error when user starts typing", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const submitButton = screen.getByRole("button", { name: "Signup" });

      // Trigger validation error
      await user.type(nameInput, "a");
      await user.tab();
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Le nom doit avoir au moins 2 caractères/)).toBeInTheDocument();
      });

      // Clear error by typing more characters
      await user.click(nameInput);
      await user.type(nameInput, "bc");

      await waitFor(() => {
        expect(screen.queryByText(/Le nom doit avoir au moins 2 caractères/)).not.toBeInTheDocument();
      });
    });

    it("should not mark field as invalid when not touched", () => {
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");

      expect(nameInput).not.toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      render(<SignupForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should have proper labels associated with inputs", () => {
      render(<SignupForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(nameInput).toHaveAttribute("id", "name");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("should have submit button with type submit", () => {
      render(<SignupForm />);

      const submitButton = screen.getByRole("button", { name: "Signup" });
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });
});
