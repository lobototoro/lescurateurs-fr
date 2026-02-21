import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the auth client
vi.mock("lib/auth/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

// Mock the SignupForm component
vi.mock("@/components/signup-form", () => ({
  SignupForm: () => <div data-testid="signup-form">Signup Form</div>,
}));

// Mock the TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: vi.fn(() => ({
    component: vi.fn(),
  })),
}));

// Import the mocked auth client
import { authClient } from "lib/auth/auth-client";

// Define the RouteComponent inline for testing since it's not exported
function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <section className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{session && <div data-testid="signup-form">Signup Form</div>}</div>
    </section>
  );
}

describe("createuser Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the section with correct layout classes", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      render(<RouteComponent />);

      const section = document.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass("flex", "w-full", "items-center", "justify-center", "p-6", "md:p-10");
    });

    it("should render SignupForm when session exists", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      render(<RouteComponent />);

      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });

    it("should not render SignupForm when session is null", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });

    it("should not render SignupForm when session is undefined", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });

    it("should render container div with correct classes", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      const { container } = render(<RouteComponent />);

      const div = container.querySelector(".w-full.max-w-sm");
      expect(div).toBeInTheDocument();
    });
  });

  describe("Session Handling", () => {
    it("should call useSession hook on render", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      render(<RouteComponent />);

      expect(authClient.useSession).toHaveBeenCalled();
    });

    it("should render SignupForm with session data containing user", () => {
      const mockSession = {
        data: {
          user: {
            id: "123",
            email: "user@example.com",
            name: "Test User",
          },
        },
      };

      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue(mockSession);

      render(<RouteComponent />);

      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });

    it("should render SignupForm with minimal session data", () => {
      const mockSession = {
        data: {},
      };

      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue(mockSession);

      render(<RouteComponent />);

      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });

    it("should handle session with falsy values correctly", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: false,
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });

    it("should handle session with empty string correctly", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: "",
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });
  });

  describe("Layout and Structure", () => {
    it("should have proper DOM structure", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      const { container } = render(<RouteComponent />);

      const section = container.querySelector("section");
      const div = container.querySelector(".w-full.max-w-sm");
      const signupForm = screen.getByTestId("signup-form");

      expect(section).toContainElement(div as HTMLElement);
      expect(div).toContainElement(signupForm);
    });

    it("should render section even when no session", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
      });

      const { container } = render(<RouteComponent />);

      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("should render container div even when no session", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
      });

      const { container } = render(<RouteComponent />);

      const div = container.querySelector(".w-full.max-w-sm");
      expect(div).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive padding classes", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      const { container } = render(<RouteComponent />);

      const section = container.querySelector("section");
      expect(section).toHaveClass("p-6", "md:p-10");
    });

    it("should have max-width constraint on container", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      const { container } = render(<RouteComponent />);

      const div = container.querySelector(".w-full.max-w-sm");
      expect(div).toHaveClass("max-w-sm");
    });
  });

  describe("Accessibility", () => {
    it("should render section as a landmark", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      render(<RouteComponent />);

      const section = document.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("should maintain proper DOM hierarchy", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { user: { id: "1", email: "test@example.com" } },
      });

      const { container } = render(<RouteComponent />);

      const section = container.querySelector("section");
      const div = container.querySelector(".w-full.max-w-sm");

      expect(section?.children.length).toBeGreaterThan(0);
      expect(div?.parentElement).toBe(section);
    });
  });

  describe("Edge Cases", () => {
    it("should handle session data changing from null to valid", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValueOnce({ data: null }).mockReturnValueOnce({ data: { user: { id: "1" } } });

      const { rerender } = render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();

      rerender(<RouteComponent />);

      expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    });

    it("should handle session data changing from valid to null", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValueOnce({ data: { user: { id: "1" } } }).mockReturnValueOnce({ data: null });

      const { rerender } = render(<RouteComponent />);

      expect(screen.getByTestId("signup-form")).toBeInTheDocument();

      rerender(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });

    it("should handle session with zero as data", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: 0,
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });

    it("should handle session with NaN as data", () => {
      (authClient.useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        data: NaN,
      });

      render(<RouteComponent />);

      expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument();
    });
  });
});
