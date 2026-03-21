import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddUrlsObjects } from "@/components/editor-components/addUrls";
import type { UrlsTypes } from "@/components/editor-components/formMarkup";

// Mock UrlObjectItem component
vi.mock("@/components/editor-components/addUrlsItem", () => ({
  UrlObjectItem: ({ type, url, credits, index, addUrls }: any) => (
    <div data-testid={`url-item-${index}`}>
      <span data-testid={`url-type-${index}`}>{type}</span>
      <span data-testid={`url-value-${index}`}>{url}</span>
      {credits && <span data-testid={`url-credits-${index}`}>{credits}</span>}
      <button onClick={() => addUrls({ type, url, credits }, index)}>Update</button>
    </div>
  ),
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant = "default", onClick, className }: any) => (
    <button data-variant={variant} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Plus: ({ color, size }: any) => <div data-testid="plus-icon" data-color={color} data-size={size}>Plus</div>,
  Minus: ({ color, size }: any) => <div data-testid="minus-icon" data-color={color} data-size={size}>Minus</div>,
}));

// Mock preventClickActions utility
vi.mock("@/lib/utils/utils", () => ({
  preventClickActions: vi.fn(),
}));

describe("AddUrlsObjects", () => {
  const mockUpdateUrls = vi.fn();
  const mockAddInputs = vi.fn();
  const mockRemoveInputs = vi.fn();

  const sampleUrls: { type: UrlsTypes; url: string; credits?: string }[] = [
    { type: "website" as UrlsTypes, url: "https://example.com", credits: "Example Credit" },
    { type: "videos" as UrlsTypes, url: "https://youtube.com/watch?v=123" },
    { type: "audio" as UrlsTypes, url: "https://example.com/audio.mp3", credits: "Audio Credit" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the container with data-testid", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-inputs-container")).toBeInTheDocument();
    });

    it("should render all URL items when urls array is provided", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-item-0")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-2")).toBeInTheDocument();
    });

    it("should render empty container when urls array is empty", () => {
      render(
        <AddUrlsObjects urls={[]} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-inputs-container")).toBeInTheDocument();
      expect(screen.queryByTestId("url-item-0")).not.toBeInTheDocument();
    });

    it("should render empty container when urls is null or undefined", () => {
      render(
        <AddUrlsObjects urls={null as any} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-inputs-container")).toBeInTheDocument();
    });

    it("should render Add and Remove buttons", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
      expect(screen.getByTestId("minus-icon")).toBeInTheDocument();
    });

    it("should render Add button with outline variant", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const addButton = screen.getByTestId("plus-icon").closest("button");
      expect(addButton).toHaveAttribute("data-variant", "outline");
    });

    it("should render Remove button with outline variant", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const removeButton = screen.getByTestId("minus-icon").closest("button");
      expect(removeButton).toHaveAttribute("data-variant", "outline");
    });

    it("should render Add button with Plus icon", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const plusIcon = screen.getByTestId("plus-icon");
      expect(plusIcon).toHaveAttribute("data-color", "white");
      expect(plusIcon).toHaveAttribute("data-size", "24");
    });

    it("should render Remove button with Minus icon", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const minusIcon = screen.getByTestId("minus-icon");
      expect(minusIcon).toHaveAttribute("data-color", "white");
      expect(minusIcon).toHaveAttribute("data-size", "24");
    });

    it("should render Add button with mr-7 className", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const addButton = screen.getByTestId("plus-icon").closest("button");
      expect(addButton).toHaveClass("mr-7");
    });
  });

  describe("URL Items Rendering", () => {
    it("should pass correct props to UrlObjectItem components", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      // Check first item
      expect(screen.getByTestId("url-type-0")).toHaveTextContent("website");
      expect(screen.getByTestId("url-value-0")).toHaveTextContent("https://example.com");
      expect(screen.getByTestId("url-credits-0")).toHaveTextContent("Example Credit");

      // Check second item (without credits)
      expect(screen.getByTestId("url-type-1")).toHaveTextContent("videos");
      expect(screen.getByTestId("url-value-1")).toHaveTextContent("https://youtube.com/watch?v=123");
      expect(screen.queryByTestId("url-credits-1")).not.toBeInTheDocument();

      // Check third item
      expect(screen.getByTestId("url-type-2")).toHaveTextContent("audio");
      expect(screen.getByTestId("url-value-2")).toHaveTextContent("https://example.com/audio.mp3");
      expect(screen.getByTestId("url-credits-2")).toHaveTextContent("Audio Credit");
    });

    it("should use url as fallback key when url is missing", () => {
      const urlsWithMissingUrl = [
        { type: "website" as UrlsTypes, url: "", credits: "Test" },
        { type: "videos" as UrlsTypes, url: "https://test.com" },
      ];

      render(
        <AddUrlsObjects urls={urlsWithMissingUrl} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-item-0")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-1")).toBeInTheDocument();
    });
  });

  describe("Add Button Functionality", () => {
    it("should call addInputs when Add button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const addButton = screen.getByTestId("plus-icon").closest("button");
      await user.click(addButton!);

      expect(mockAddInputs).toHaveBeenCalledTimes(1);
    });

    it("should call preventClickActions when Add button is clicked", async () => {
      const user = userEvent.setup();
      const { preventClickActions } = await import("@/lib/utils/utils");

      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const addButton = screen.getByTestId("plus-icon").closest("button");
      await user.click(addButton!);

      expect(preventClickActions).toHaveBeenCalledTimes(1);
    });
  });

  describe("Remove Button Functionality", () => {
    it("should call removeInputs when Remove button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const removeButton = screen.getByTestId("minus-icon").closest("button");
      await user.click(removeButton!);

      expect(mockRemoveInputs).toHaveBeenCalledTimes(1);
    });

    it("should call preventClickActions when Remove button is clicked", async () => {
      const user = userEvent.setup();
      const { preventClickActions } = await import("@/lib/utils/utils");

      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const removeButton = screen.getByTestId("minus-icon").closest("button");
      await user.click(removeButton!);

      expect(preventClickActions).toHaveBeenCalledTimes(1);
    });
  });

  describe("Update URLs Functionality", () => {
    it("should pass updateUrls function to UrlObjectItem components", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      // Click the update button in the first UrlObjectItem
      const updateButton = screen.getAllByText("Update")[0];
      updateButton.click();

      expect(mockUpdateUrls).toHaveBeenCalledWith(
        { type: "website", url: "https://example.com", credits: "Example Credit" },
        0,
      );
    });

    it("should handle update for URL without credits", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      // Click the update button in the second UrlObjectItem (no credits)
      const updateButton = screen.getAllByText("Update")[1];
      updateButton.click();

      expect(mockUpdateUrls).toHaveBeenCalledWith(
        { type: "videos", url: "https://youtube.com/watch?v=123" },
        1,
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle single URL item", () => {
      const singleUrl = [{ type: "website" as UrlsTypes, url: "https://single.com" }];

      render(
        <AddUrlsObjects urls={singleUrl} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-item-0")).toBeInTheDocument();
      expect(screen.queryByTestId("url-item-1")).not.toBeInTheDocument();
    });

    it("should handle URLs with all UrlsTypes", () => {
      const allTypesUrls: { type: UrlsTypes; url: string; credits?: string }[] = [
        { type: "website" as UrlsTypes, url: "https://website.com" },
        { type: "videos" as UrlsTypes, url: "https://videos.com" },
        { type: "audio" as UrlsTypes, url: "https://audio.com" },
        { type: "social" as UrlsTypes, url: "https://social.com" },
        { type: "image" as UrlsTypes, url: "https://image.com" },
      ];

      render(
        <AddUrlsObjects urls={allTypesUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-item-0")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-2")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-3")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-4")).toBeInTheDocument();
    });

    it("should handle URLs with empty strings", () => {
      const emptyUrls = [
        { type: "website" as UrlsTypes, url: "", credits: "" },
        { type: "videos" as UrlsTypes, url: "" },
      ];

      render(
        <AddUrlsObjects urls={emptyUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-item-0")).toBeInTheDocument();
      expect(screen.getByTestId("url-item-1")).toBeInTheDocument();
    });

    it("should handle URLs with special characters", () => {
      const specialUrls = [
        { type: "website" as UrlsTypes, url: "https://example.com?param=value&other=test", credits: "Test & Test" },
      ];

      render(
        <AddUrlsObjects urls={specialUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-value-0")).toHaveTextContent("https://example.com?param=value&other=test");
      expect(screen.getByTestId("url-credits-0")).toHaveTextContent("Test & Test");
    });
  });

  describe("Accessibility", () => {
    it("should have proper button elements", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have container with proper data-testid for testing", () => {
      render(
        <AddUrlsObjects urls={sampleUrls} updateUrls={mockUpdateUrls} addInputs={mockAddInputs} removeInputs={mockRemoveInputs} />,
      );

      expect(screen.getByTestId("url-inputs-container")).toBeInTheDocument();
    });
  });
});
