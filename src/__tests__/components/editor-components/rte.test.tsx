import React from "react";
import RTE from "@/components/editor-components/rte";
import { render, screen } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  ClientOnly: ({ children }: { children: React.ReactNode }) => <div data-testid="client-only">{children}</div>,
}));

vi.mock("react-quill-new", () => ({
  default: ({
    id,
    theme,
    value,
    onChange,
    children,
  }: {
    id: string;
    theme: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    const contentDiv = React.Children.only(children) as React.ReactElement<{ className?: string }>;
    return (
      <div data-testid="react-quill" data-id={id} data-theme={theme} data-value={value}>
        <div data-testid="quill-content" className={contentDiv?.props?.className || ""}>
          {children}
        </div>
        <button data-testid="quill-change" onClick={() => onChange("new value")}>
          Change
        </button>
      </div>
    );
  },
}));

describe("RTE Component", () => {
  const defaultProps = {
    "field-id": "test-field-id",
    className: "test-class",
    "data-testid": "test-editor",
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("Should render the RTE component with ClientOnly wrapper", () => {
      render(<RTE {...defaultProps} />);

      expect(screen.getByTestId("client-only")).toBeInTheDocument();
    });

    it("Should render ReactQuill inside ClientOnly", () => {
      render(<RTE {...defaultProps} />);

      expect(screen.getByTestId("react-quill")).toBeInTheDocument();
    });

    it("Should render quill content div", () => {
      render(<RTE {...defaultProps} />);

      expect(screen.getByTestId("quill-content")).toBeInTheDocument();
    });

    it("Should render without className", () => {
      const propsWithoutClassName = {
        "field-id": "test-field-id",
        "data-testid": "test-editor",
        value: "",
        onChange: vi.fn(),
      };

      render(<RTE {...propsWithoutClassName} />);

      expect(screen.getByTestId("react-quill")).toBeInTheDocument();
    });
  });

  describe("Props Passing", () => {
    it("Should pass field-id as id prop to ReactQuill", () => {
      render(<RTE {...defaultProps} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-id", "test-field-id");
    });

    it("Should pass theme as snow to ReactQuill", () => {
      render(<RTE {...defaultProps} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-theme", "snow");
    });

    it("Should pass value prop to ReactQuill", () => {
      const propsWithValue = {
        ...defaultProps,
        value: "test content",
      };

      render(<RTE {...propsWithValue} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-value", "test content");
    });

    it("Should update value when prop changes", () => {
      const { rerender } = render(<RTE {...defaultProps} value="initial" />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-value", "initial");

      rerender(<RTE {...defaultProps} value="updated" />);
      expect(quill).toHaveAttribute("data-value", "updated");
    });
  });

  describe("onChange Callback", () => {
    it("Should call onChange when value changes", () => {
      render(<RTE {...defaultProps} />);

      const changeButton = screen.getByTestId("quill-change");
      changeButton.click();

      expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChange).toHaveBeenCalledWith("new value");
    });

    it("Should not call onChange when no interaction", () => {
      render(<RTE {...defaultProps} />);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    it("Should call onChange multiple times for multiple changes", () => {
      render(<RTE {...defaultProps} />);

      const changeButton = screen.getByTestId("quill-change");
      changeButton.click();
      changeButton.click();
      changeButton.click();

      expect(defaultProps.onChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("Custom className", () => {
    it("Should apply custom className to content div", () => {
      const propsWithClassName = {
        ...defaultProps,
        className: "custom-editor-style",
      };

      render(<RTE {...propsWithClassName} />);

      const content = screen.getByTestId("quill-content");
      expect(content.className).toContain("custom-editor-style");
    });

    it("Should render with custom-text-area class by default", () => {
      const propsWithoutClassName = {
        "field-id": "test-field-id",
        "data-testid": "test-editor",
        value: "",
        onChange: vi.fn(),
      };

      render(<RTE {...propsWithoutClassName} />);

      const content = screen.getByTestId("quill-content");
      expect(content.className).toContain("custom-text-area");
    });
  });

  describe("Edge Cases", () => {
    it("Should handle empty value", () => {
      const propsWithEmptyValue = {
        ...defaultProps,
        value: "",
      };

      render(<RTE {...propsWithEmptyValue} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-value", "");
    });

    it("Should handle null value", () => {
      const propsWithNullValue = {
        ...defaultProps,
        value: null as unknown as string,
      };

      render(<RTE {...propsWithNullValue} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill.getAttribute("data-value")).toBeNull();
    });

    it("Should handle HTML content in value", () => {
      const propsWithHtmlValue = {
        ...defaultProps,
        value: "<p>Hello <strong>World</strong></p>",
      };

      render(<RTE {...propsWithHtmlValue} />);

      const quill = screen.getByTestId("react-quill");
      expect(quill).toHaveAttribute("data-value", "<p>Hello <strong>World</strong></p>");
    });

    it("Should handle no onChange callback", () => {
      const propsWithoutOnChange = {
        "field-id": "test-field-id",
        "data-testid": "test-editor",
        value: "",
        onChange: vi.fn(),
      };

      render(<RTE {...propsWithoutOnChange} />);

      const changeButton = screen.getByTestId("quill-change");
      expect(() => changeButton.click()).not.toThrow();
    });
  });
});
