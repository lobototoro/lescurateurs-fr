import PostError from "@/components/postError";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ErrorComponentProps } from "@tanstack/react-router";

vi.mock("@tanstack/react-router", () => ({
  ErrorComponent: ({ error }: { error: ErrorComponentProps["error"] }) => (
    <div data-testid="error-component">
      <h1>Error</h1>
      <p>{error?.message || "An error occurred"}</p>
    </div>
  ),
}));

describe("PostError test suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockProps = (message: string): ErrorComponentProps => ({
    error: { message, name: "Error" } as ErrorComponentProps["error"],
    reset: vi.fn(),
  });

  it("Should render ErrorComponent with the provided error", () => {
    render(<PostError {...createMockProps("Something went wrong")} />);

    expect(screen.getByTestId("error-component")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("Should render ErrorComponent with default error message when no message provided", () => {
    render(<PostError {...createMockProps("")} />);

    expect(screen.getByTestId("error-component")).toBeInTheDocument();
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("Should render ErrorComponent with custom error object", () => {
    const props: ErrorComponentProps = {
      error: { message: "Custom error message", name: "CustomError" } as ErrorComponentProps["error"],
      reset: vi.fn(),
    };

    render(<PostError {...props} />);

    expect(screen.getByTestId("error-component")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("Should render PostError as default export", () => {
    expect(PostError).toBeDefined();
  });

  it("Should handle undefined error gracefully", () => {
    const props: ErrorComponentProps = {
      error: { message: undefined as unknown as string, name: "Error" } as ErrorComponentProps["error"],
      reset: vi.fn(),
    };

    render(<PostError {...props} />);

    expect(screen.getByTestId("error-component")).toBeInTheDocument();
  });

  it("Should render ErrorComponent with empty error message", () => {
    render(<PostError {...createMockProps("")} />);

    expect(screen.getByTestId("error-component")).toBeInTheDocument();
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });
});
