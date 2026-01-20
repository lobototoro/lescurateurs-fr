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
    const { getByText, debug } = render(<HeaderMenu role={headerData.role} permissions={headerData.permissions} setSelection={setMenuSelection} selection="" />);
    debug();
    expect(getByText("Role : contributor")).toBeDefined();
  });
});
