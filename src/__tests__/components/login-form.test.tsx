import { LoginForm } from "@/components/login-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, beforeEach, expect } from "vitest";

vi.mock("@/lib/utils/utils", () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("lib/auth/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

describe("LoginForm test suite", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should render the login form with all required elements", () => {
    render(<LoginForm />);

    expect(screen.getByText("Login to your account")).toBeInTheDocument();
    expect(screen.getByText("Enter your email below to login to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Mot de passe oublié ?")).toBeInTheDocument();
  });

  it("Should have empty initial values for email and password", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("Should allow email input to be updated", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("Should allow password input to be updated", async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");
  });

  it("Should have email input with correct type and autocomplete", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "on");
  });

  it("Should have password input with correct type and autocomplete", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autoComplete", "off");
  });

  it("Should have placeholder text for email input", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("placeholder", "m@example.com");
  });

  it("Should have placeholder text for password input", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("placeholder", "*******");
  });

  it("Should have a submit button", () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: "Login" });
    expect(submitButton).toBeInTheDocument();
  });

  it("Should call authClient.signIn.email when form is submitted", async () => {
    const { authClient } = await import("lib/auth/auth-client");
    (authClient.signIn.email as ReturnType<typeof vi.fn>).mockResolvedValue({});

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
          callbackURL: "/editor",
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });
  });

  it("Should have forgot password link pointing to requestResetPassword", () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByText("Mot de passe oublié ?");
    expect(forgotPasswordLink).toHaveAttribute("href", "/requestResetPassword");
  });

  it("Should handle blur events on email input", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.click(emailInput);
    await user.tab();

    expect(emailInput).toHaveAttribute("name", "email");
  });

  it("Should handle blur events on password input", async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    await user.click(passwordInput);
    await user.tab();

    expect(passwordInput).toHaveAttribute("name", "password");
  });

  it("Should update input values when user types", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });
});
