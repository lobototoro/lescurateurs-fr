import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UrlObjectItem } from "@/components/editor-components/addUrlsItem";
import { UrlsTypes } from "@/components/editor-components/formMarkup";

// Mock UI components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, ...props }: any) => (
    <select {...props} value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectGroup: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectLabel: ({ children }: any) => <label>{children}</label>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, name, id }: any) => <input data-testid={name || id} value={value} onChange={onChange} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, onClick, className }: any) => (
    <button data-testid="button" data-variant={variant} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/lib/utils/utils", () => ({
  preventClickActions: vi.fn(),
}));

describe("UrlObjectItem", () => {
  const mockAddUrls = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all form elements", () => {
      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="https://example.com" credits="Example credit" index={0} addUrls={mockAddUrls} />);

      expect(screen.getByTestId("select-type")).toBeInTheDocument();
      expect(screen.getByTestId("url-0")).toBeInTheDocument();
      expect(screen.getByTestId("credits-0")).toBeInTheDocument();
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });

    it("should render with initial values", () => {
      render(<UrlObjectItem type={UrlsTypes.VIDEOS} url="https://video.com" credits="Video credit" index={1} addUrls={mockAddUrls} />);

      expect(screen.getByTestId("select-type")).toHaveValue("videos");
      expect(screen.getByTestId("url-1")).toHaveValue("https://video.com");
      expect(screen.getByTestId("credits-1")).toHaveValue("Video credit");
    });
  });

  describe("User Interactions", () => {
    it("should update state when type is changed", async () => {
      const user = userEvent.setup();

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="" credits="" index={0} addUrls={mockAddUrls} />);

      const select = screen.getByTestId("select-type");
      await user.selectOptions(select, "audio");

      expect(select).toHaveValue("audio");
    });

    it("should update state when URL is changed", async () => {
      const user = userEvent.setup();

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="" credits="" index={0} addUrls={mockAddUrls} />);

      const urlInput = screen.getByTestId("url-0");
      await user.type(urlInput, "https://newurl.com");

      expect(urlInput).toHaveValue("https://newurl.com");
    });

    it("should update state when credits are changed", async () => {
      const user = userEvent.setup();

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="" credits="" index={0} addUrls={mockAddUrls} />);

      const creditsInput = screen.getByTestId("credits-0");
      await user.type(creditsInput, "New credits");

      expect(creditsInput).toHaveValue("New credits");
    });

    it("should call addUrls with updated values when button is clicked", async () => {
      const user = userEvent.setup();

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="https://oldurl.com" credits="Old credits" index={0} addUrls={mockAddUrls} />);

      // Change values
      const urlInput = screen.getByTestId("url-0");
      await user.clear(urlInput);
      await user.type(urlInput, "https://newurl.com");

      const creditsInput = screen.getByTestId("credits-0");
      await user.clear(creditsInput);
      await user.type(creditsInput, "New credits");

      const button = screen.getByTestId("button");
      await user.click(button);

      expect(mockAddUrls).toHaveBeenCalledWith(
        {
          type: UrlsTypes.WEBSITE,
          url: "https://newurl.com",
          credits: "New credits",
        },
        0,
      );
    });

    it("should call preventClickActions when button is clicked", async () => {
      const user = userEvent.setup();
      const { preventClickActions } = await import("@/lib/utils/utils");

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="" credits="" index={0} addUrls={mockAddUrls} />);

      const button = screen.getByTestId("button");
      await user.click(button);

      expect(preventClickActions).toHaveBeenCalledTimes(1);
    });
  });

  describe("Button State", () => {
    it("should show 'ajouté' when no changes have been made", () => {
      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="https://example.com" credits="Example credit" index={0} addUrls={mockAddUrls} />);

      const button = screen.getByTestId("button");
      expect(button).toHaveTextContent("ajouté");
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("should show 'Ajoutez ?' when changes have been made", async () => {
      const user = userEvent.setup();

      render(<UrlObjectItem type={UrlsTypes.WEBSITE} url="https://example.com" credits="Example credit" index={0} addUrls={mockAddUrls} />);

      // Make a change
      const urlInput = screen.getByTestId("url-0");
      await user.type(urlInput, "extra");

      const button = screen.getByTestId("button");
      expect(button).toHaveTextContent("Ajoutez ?");
      expect(button).toHaveAttribute("data-variant", "destructive");
    });
  });
});
