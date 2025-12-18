import { describe, it, expect, vi, beforeEach } from "vitest";
import * as usersFunctions from "./users-functions";
import { fixedDb } from "db/drizzle";

// Mock the drizzle module
vi.mock("db/drizzle", () => ({
  fixedDb: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => true),
}));

// Mock db/schema
vi.mock("db/schema", () => ({
  user: {},
}));

describe("users-functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user and return success response", async () => {
      const userObject = {
        id: "user_123",
        name: "John Doe",
        email: "john@example.com",
      };

      const mockInsertReturn = {
        values: vi.fn().mockReturnThis(),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      const result = await usersFunctions.createUser(userObject);

      expect(result).toEqual({
        isSuccess: true,
        status: 201,
        message: "User created successfully",
      });
    });

    it("should return error response when user creation fails", async () => {
      const userObject = {
        id: "user_123",
        name: "John Doe",
        email: "john@example.com",
      };

      const mockInsertReturn = {
        values: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      const result = await usersFunctions.createUser(userObject);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Failed to create user",
      });
    });
  });

  describe("updateUser", () => {
    it("should update a user and return success response", async () => {
      const userId = "user_123";
      const userChanges = {
        name: "Jane Doe",
        updated_at: new Date(),
      };

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await usersFunctions.updateUser(userId, userChanges);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "User updated successfully",
      });
    });

    it("should return error response when user update fails", async () => {
      const userId = "user_123";
      const userChanges = {
        name: "Jane Doe",
      };

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await usersFunctions.updateUser(userId, userChanges);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Failed to update user",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return success response", async () => {
      const userId = "user_123";

      const mockDeleteReturn = {
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockDeleteReturn);

      const result = await usersFunctions.deleteUser(userId);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "User deleted successfully",
      });
    });

    it("should return error response when user deletion fails", async () => {
      const userId = "user_123";

      const mockDeleteReturn = {
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockDeleteReturn);

      const result = await usersFunctions.deleteUser(userId);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Failed to delete user",
      });
    });
  });

  describe("getAllUsers", () => {
    it("should return all users when database query succeeds", async () => {
      const mockUsers = [
        { id: "user_1", name: "John Doe", email: "john@example.com" },
        { id: "user_2", name: "Jane Smith", email: "jane@example.com" },
      ];

      const mockSelectReturn = {
        from: vi.fn().mockResolvedValue(mockUsers),
      };

      (fixedDb.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectReturn);

      const result = await usersFunctions.getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it("should return error response when fetching users fails", async () => {
      const mockSelectReturn = {
        from: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.select as ReturnType<typeof vi.fn>).mockReturnValue(mockSelectReturn);

      const result = await usersFunctions.getAllUsers();

      expect(result).toEqual({
        isSuccess: false,
        status: 500,
        message: "Failed to fetch users",
      });
    });
  });
});
