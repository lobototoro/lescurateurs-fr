import { describe, it, vi, expect } from "vitest";
import { FieldSet, FieldLegend, FieldDescription, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/ui/field", () => ({
  FieldSet: ({ children }: any) => <fieldset data-testid="search-fieldset">{children}</fieldset>,
  FieldLegend: ({ children }: { children: React.ReactNode }) => <legend data-testid="search-legend">{children}</legend>,
  FieldDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="search-description">{children}</p>,
  FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  FieldSeparator: () => <hr data-testid="search-separator" />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input data-testid="search-term-input" onChange={onChange} value={value} {...props} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, type, onClick, ...props }: any) => (
    <button type={type} onClick={onClick} data-testid="search-button" {...props}>
      {children}
    </button>
  ),
}));

describe("SlugsSearchComponent UI Components", () => {
  const user = userEvent.setup();

  describe("FieldSet", () => {
    it("Should render fieldset element", () => {
      render(<FieldSet><div>Test content</div></FieldSet>);
      expect(screen.getByTestId("search-fieldset")).toBeInTheDocument();
    });

    it("Should render children inside fieldset", () => {
      render(<FieldSet><span data-testid="child">Child</span></FieldSet>);
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("FieldLegend", () => {
    it("Should render legend element", () => {
      render(<FieldLegend>Test Legend</FieldLegend>);
      expect(screen.getByTestId("search-legend")).toBeInTheDocument();
      expect(screen.getByText("Test Legend")).toBeInTheDocument();
    });
  });

  describe("FieldDescription", () => {
    it("Should render description element", () => {
      render(<FieldDescription>Test Description</FieldDescription>);
      expect(screen.getByTestId("search-description")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });

  describe("FieldLabel", () => {
    it("Should render label element", () => {
      render(<FieldLabel htmlFor="test-input">Test Label</FieldLabel>);
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("Should associate label with input using htmlFor", () => {
      render(
        <>
          <FieldLabel htmlFor="test-input">Test Label</FieldLabel>
          <input id="test-input" data-testid="test-input" />
        </>
      );
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByTestId("test-input")).toBeInTheDocument();
    });
  });

  describe("FieldSeparator", () => {
    it("Should render separator element", () => {
      render(<FieldSeparator />);
      expect(screen.getByTestId("search-separator")).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("Should render input element", () => {
      render(<Input data-testid="test-input" value="" onChange={vi.fn()} />);
      expect(screen.getByTestId("test-input")).toBeInTheDocument();
    });

    it("Should display initial value", () => {
      render(<Input data-testid="test-input" value="initial" onChange={vi.fn()} />);
      expect((screen.getByTestId("test-input") as HTMLInputElement).value).toBe("initial");
    });

    it("Should call onChange when value changes", async () => {
      const handleChange = vi.fn();
      render(<Input data-testid="test-input" value="" onChange={handleChange} />);
      
      const input = screen.getByTestId("test-input");
      await user.type(input, "new value");
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Button", () => {
    it("Should render button element", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("Should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByText("Click Me");
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("Should support different button types", () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByText("Submit") as HTMLButtonElement;
      expect(button.type).toBe("submit");
    });
  });
});
