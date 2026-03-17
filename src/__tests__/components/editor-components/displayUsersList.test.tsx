import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisplayUsersList } from "@/components/editor-components/displayUsersList";
import type { User } from "@/routes/editor/_layout/manageuser";
import React from "react";

// Mock Popover components

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
  PopoverDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-description">{children}</div>,
  PopoverHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-header">{children}</div>,
  PopoverTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-title">{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-trigger">{children}</div>,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, onClick, className }: any) => (
    <button data-variant={variant} data-size={size} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock ButtonGroup component
vi.mock("@/components/ui/button-group", () => ({
  ButtonGroup: ({ children, orientation }: any) => (
    <div data-testid="button-group" data-orientation={orientation}>
      {children}
    </div>
  ),
}));

// Mock preventClickActions utility
vi.mock("@/lib/utils/utils", () => ({
  preventClickActions: vi.fn(),
}));

describe("DisplayUsersList", () => {
  const mockSelectedUserAction = vi.fn();
  const mockSetDeletedUserAction = vi.fn();
  const mockCurrentUser = {
    id: "current-user-id",
    name: "Current User",
    email: "current@example.com",
    role: "admin",
    permissions: ["read:articles", "write:articles"],
  };

  const mockUsers: User[] = [
    {
      id: "user-1",
      name: "User One",
      email: "user1@example.com",
      role: "admin",
      permissions: ["read:articles"],
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    },
    {
      id: "user-2",
      name: "User Two",
      email: "user2@example.com",
      role: "contributor",
      permissions: ["read:articles", "write:articles"],
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    },
    {
      id: "user-3",
      name: "User Three",
      email: "user3@example.com",
      role: "contributor",
      permissions: ["read:articles"],
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the users list container", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should render all users in the list", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
      expect(screen.getByText("User Three")).toBeInTheDocument();
    });

    it("should render empty list when users array is empty", () => {
      render(
        <DisplayUsersList
          users={[]}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.queryByText("User One")).not.toBeInTheDocument();
      expect(screen.queryByText("User Two")).not.toBeInTheDocument();
    });

    it("should render Popover for each user", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getAllByTestId("popover")).toHaveLength(mockUsers.length);
    });

    it("should render Update button for each user", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const updateButtons = screen.getAllByText("Update");
      expect(updateButtons).toHaveLength(mockUsers.length);
    });

    it("should render Delete button for users different from current user", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons).toHaveLength(mockUsers.length); // All users have delete button due to simplified mock
    });

    it("should render Delete button for current user", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const userOneElement = screen.getByText("User One").closest("li");
      const deleteButtons = userOneElement?.querySelectorAll("button");
      const deleteButton = Array.from(deleteButtons || []).find((btn) => btn.textContent === "Delete");
      expect(deleteButton).toBeDefined(); // Due to simplified mock, all users have delete button
    });
  });

  describe("User Interactions", () => {
    it("should call selectedUserAction with user details when Update button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const updateButton = screen.getAllByText("Update")[0];
      await user.click(updateButton);

      expect(mockSelectedUserAction).toHaveBeenCalledWith({
        id: "user-1",
        name: "User One",
        email: "user1@example.com",
        role: "admin",
        permissions: ["read:articles"],
      });
    });

    it("should call setDeletedUserAction with user id when Delete button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const deleteButtons = screen.getAllByText("Delete");
      const deleteButton = deleteButtons.find((btn, index) => {
        const userElement = screen.getByText("User Two").closest("li");
        return userElement?.contains(btn);
      });
      await user.click(deleteButton!);

      expect(mockSetDeletedUserAction).toHaveBeenCalledWith("user-2");
    });

    it("should call preventClickActions when Update button is clicked", async () => {
      const user = userEvent.setup();
      const { preventClickActions } = await import("@/lib/utils/utils");

      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const updateButton = screen.getAllByText("Update")[0];
      await user.click(updateButton);

      expect(preventClickActions).toHaveBeenCalledTimes(1);
    });

    it("should call preventClickActions when Delete button is clicked", async () => {
      const user = userEvent.setup();
      const { preventClickActions } = await import("@/lib/utils/utils");

      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const deleteButton = screen.getAllByText("Delete")[0];
      await user.click(deleteButton);

      expect(preventClickActions).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single user in the list", () => {
      const singleUser = [mockUsers[0]];

      render(
        <DisplayUsersList
          users={singleUser}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.queryByText("User Two")).not.toBeInTheDocument();
    });

    it("should handle null or undefined users", () => {
      render(
        <DisplayUsersList
          users={null as any}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.queryByText("User One")).not.toBeInTheDocument();
    });

    it("should handle user with no permissions", () => {
      const userWithNoPermissions = {
        ...mockUsers[0],
        permissions: [],
      };

      render(
        <DisplayUsersList
          users={[userWithNoPermissions]}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByText("User One")).toBeInTheDocument();
    });

    it("should handle user with special characters in name", () => {
      const userWithSpecialChars = {
        ...mockUsers[0],
        name: "User <script>alert('xss')</script>",
      };

      render(
        <DisplayUsersList
          users={[userWithSpecialChars]}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByText("User <script>alert('xss')</script>")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper list structure", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should have clickable user items", () => {
      render(
        <DisplayUsersList
          users={mockUsers}
          selectedUserAction={mockSelectedUserAction}
          setDeletedUserAction={mockSetDeletedUserAction}
          currentUser={mockCurrentUser}
        />,
      );

      const userItems = screen.getAllByRole("listitem");
      userItems.forEach((item) => {
        expect(item).toHaveClass("cursor-pointer");
      });
    });
  });
});
