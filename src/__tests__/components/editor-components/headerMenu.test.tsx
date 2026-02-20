import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HeaderMenu from "@/components/editor-components/headerMenu";

// Mock the navigate function
const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the iconMapper
vi.mock("@/lib/iconManager", () => ({
  iconMapper: vi.fn(() => null),
}));

describe("HeaderMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header menu with role", () => {
    const role = "contributor";
    const permissions = ["read:articles", "create:articles", "update:articles"];

    render(<HeaderMenu role={role} permissions={permissions} logoutAction={() => {}} />);

    expect(screen.getByText(/Role : contributor/)).toBeInTheDocument();
  });

  it("does not render if permissions are empty", () => {
    const { container } = render(<HeaderMenu role="user" permissions={[]} logoutAction={() => {}} />);

    expect(container.firstChild).toBeNull();
  });

  it("filters out read:articles permission", () => {
    const role = "contributor";
    const permissions = ["read:articles", "create:articles", "update:articles"];

    render(<HeaderMenu role={role} permissions={permissions} logoutAction={() => {}} />);

    expect(screen.queryByText("read articles")).not.toBeInTheDocument();
    expect(screen.getByText("create articles")).toBeInTheDocument();
    expect(screen.getByText("update articles")).toBeInTheDocument();
  });

  it("renders correct menu items for admin role with modified permissions", () => {
    const adminPermissions = [
      "create:articles",
      "update:articles",
      "delete:articles",
      "validate:articles",
      "ship:articles",
      "create:user",
      "update:user",
      "delete:user",
      "enable:maintenance",
    ];

    render(<HeaderMenu role="admin" permissions={adminPermissions} logoutAction={() => {}} />);

    // For admin:
    // 1. Filter out specific permissions: delete:articles, validate:articles, ship:articles, update:user, delete:user
    // 2. Remaining: create:articles, update:articles, create:user, enable:maintenance
    // 3. Add "manage:articles" at index 3 and "manage:user" before last item
    // 4. Final array: create:articles, update:articles, create:user, manage:articles, manage:user, enable:maintenance
    // 5. All items are shown except "read:articles" which isn't in the list anyway

    expect(screen.getByText("create articles")).toBeInTheDocument();
    expect(screen.getByText("update articles")).toBeInTheDocument();
    expect(screen.getByText("create user")).toBeInTheDocument();
    expect(screen.getByText("manage articles")).toBeInTheDocument();
    expect(screen.getByText("manage user")).toBeInTheDocument();
    expect(screen.getByText("enable maintenance")).toBeInTheDocument();
  });

  it("renders correct menu items for non-admin role with modified permissions", () => {
    const permissions = ["create:articles", "update:articles", "delete:articles", "validate:articles", "ship:articles"];

    render(<HeaderMenu role="contributor" permissions={permissions} logoutAction={() => {}} />);

    // For non-admin:
    // 1. No filtering happens since it's not admin
    // 2. splice(3, 1, "manage:articles") replaces element at index 3 with "manage:articles"
    // 3. Original: [create:articles, update:articles, delete:articles, validate:articles, ship:articles]
    // 4. After splice: [create:articles, update:articles, delete:articles, manage:articles, ship:articles]
    // 5. All items are shown except "read:articles" which isn't in the list anyway

    expect(screen.getByText("create articles")).toBeInTheDocument();
    expect(screen.getByText("update articles")).toBeInTheDocument();
    expect(screen.getByText("delete articles")).toBeInTheDocument();
    expect(screen.getByText("manage articles")).toBeInTheDocument();
    expect(screen.getByText("ship articles")).toBeInTheDocument();
  });

  it("navigates to correct route when clicking menu item", () => {
    const permissions = ["create:articles", "update:articles"];

    render(<HeaderMenu role="contributor" permissions={permissions} logoutAction={() => {}} />);

    const createButton = screen.getByText("create articles");
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/editor/createarticles",
      replace: true,
    });
  });

  it("renders buttons with correct titles", () => {
    const permissions = ["create:articles"];

    render(<HeaderMenu role="contributor" permissions={permissions} logoutAction={() => {}} />);

    const createButton = screen.getByText("create articles");
    expect(createButton).toHaveAttribute("title", " create articles");
  });

  it("handles empty permissions gracefully", () => {
    // When permissions are empty, the component should return null
    const { container } = render(<HeaderMenu role="contributor" permissions={[]} logoutAction={() => {}} />);

    expect(container.firstChild).toBeNull();
  });
});
