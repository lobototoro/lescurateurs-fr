import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HeaderMenu from "@/components/editor-components/headerMenu";

const headerData = {
  role: "contributor",
  permissions: ["read:articles", "create:articles", "update:articles", "validate:articles"],
};

const setMenuSelection = vi.fn();

describe("HeaderMenu", () => {
  it("renders the header menu", () => {
    const { getByText, getAllByRole } = render(<HeaderMenu role={headerData.role} permissions={headerData.permissions} setSelection={setMenuSelection} selection="" />);
    expect(getByText("Role : contributor")).toBeDefined();

    const menuItems = getAllByRole("button");
    expect(menuItems.length).toBe(3);
  });
  it("does not render if permissions are empty", () => {
    const { container } = render(<HeaderMenu role="user" permissions={[]} setSelection={setMenuSelection} selection="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correct menu items for admin role", () => {
    const adminPermissions = [
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
    ];
    const { getAllByRole, getByText } = render(<HeaderMenu role="admin" permissions={adminPermissions} setSelection={setMenuSelection} selection="" />);
    const menuItems = getAllByRole("button");
    // Logic trace for admin:
    // 1. Filter: remove specific exclusions (none here).
    // 2. Splice(3, 0, "manage:articles") -> inserts at index 3.
    // 3. Splice(-1, 0, "manage:user") -> inserts at end.
    // 4. Map: filter "read:articles".
    // Input: [read, create, update, validate]
    // After splices: [read, create, update, manage:articles, manage:user, validate]
    // After map filter: [create, update, manage:articles, manage:user, validate]
    // Total: 5 buttons.
    expect(menuItems.length).toBe(6);
    expect(getByText("manage user")).toBeDefined();
    expect(getByText("manage articles")).toBeDefined();
  });

  it("filters out read:articles permission", () => {
    const { queryByText } = render(<HeaderMenu role={headerData.role} permissions={headerData.permissions} setSelection={setMenuSelection} selection="" />);
    expect(queryByText("read articles")).toBeNull();
  });

  it("calls setSelection with transformed permission on click", () => {
    const { getByText } = render(<HeaderMenu role={headerData.role} permissions={headerData.permissions} setSelection={setMenuSelection} selection="" />);
    const createButton = getByText("create articles");
    createButton.click();
    expect(setMenuSelection).toHaveBeenCalledWith("createarticles");
  });
});
