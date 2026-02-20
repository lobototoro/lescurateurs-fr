import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import * as articlesFunctions from "./articles-functions";
import { fixedDb } from "db/drizzle";

// Mock the drizzle module
vi.mock("db/drizzle", () => {
  // Create mock functions inside the mock factory to maintain references
  const mockReturning = vi.fn();
  const mockOnConflictDoNothing = vi.fn(() => ({ returning: mockReturning }));
  const mockValues = vi.fn(() => ({ onConflictDoNothing: mockOnConflictDoNothing }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockSelect = vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }));

  return {
    fixedDb: {
      query: {
        articles: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
        },
        slugs: {
          findMany: vi.fn(),
        },
      },
      insert: mockInsert,
      update: vi.fn(),
      delete: vi.fn(),
      select: mockSelect,
    },
    // Export the mock functions so tests can access them
    mockReturning,
    mockOnConflictDoNothing,
    mockValues,
    mockInsert,
  };
});

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn().mockImplementation((column, value) => ({ column, value })),
}));

// Mock db/schema
vi.mock("db/schema", () => ({
  articles: {
    id: "id",
    slug: "slug",
  },
  slugs: {
    id: "id",
    slug: "slug",
    createdAt: "createdAt",
    articleId: "articleId",
    validated: "validated",
  },
}));

describe("articles-functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("getAllArticles", () => {
    it("should return all articles when database query succeeds", async () => {
      const mockArticles = [
        { id: 1, title: "Test Article 1", slug: "test-article-1" },
        { id: 2, title: "Test Article 2", slug: "test-article-2" },
      ];

      (fixedDb.query.articles.findMany as Mock).mockResolvedValue(mockArticles);

      const result = await articlesFunctions.getAllArticles();

      expect(fixedDb.query.articles.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockArticles);
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findMany as Mock).mockRejectedValue(new Error());

      await expect(articlesFunctions.getAllArticles()).rejects.toThrow("Could not find any articles!");
    });
  });

  describe("getAllSlugs", () => {
    it("should return all slugs with validated property when database query succeeds", async () => {
      const mockSlugs = [
        { id: 1, slug: "test-slug-1", validated: true },
        { id: 2, slug: "test-slug-2", validated: false },
        { id: 3, slug: "test-slug-3" }, // validated is undefined
      ];

      (fixedDb.query.slugs.findMany as Mock).mockResolvedValue(mockSlugs);

      const result = await articlesFunctions.getAllSlugs();

      expect(fixedDb.query.slugs.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, slug: "test-slug-1", validated: true },
        { id: 2, slug: "test-slug-2", validated: false },
        { id: 3, slug: "test-slug-3", validated: false }, // validated should default to false
      ]);
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.slugs.findMany as Mock).mockRejectedValue(new Error());

      await expect(articlesFunctions.getAllSlugs()).rejects.toThrow("Could not find any slugs!");
    });
  });

  describe("fetchArticleById", () => {
    it("should return an article when found by ID", async () => {
      const mockArticle = { id: "123", title: "Test Article", slug: "test-article" };

      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(mockArticle);

      const result = await articlesFunctions.fetchArticleById("123");

      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
      expect(result).toEqual(mockArticle);
    });

    it("should throw an error when article is not found by ID", async () => {
      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(null);

      await expect(articlesFunctions.fetchArticleById("123")).rejects.toThrow("Could not find article with id 123");
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findFirst as Mock).mockRejectedValue(new Error());

      await expect(articlesFunctions.fetchArticleById("123")).rejects.toThrow("Could not find article with id 123");
    });
  });

  describe("fetchArticleBySlug", () => {
    it("should return an article when found by slug", async () => {
      const mockArticle = { id: "123", title: "Test Article", slug: "test-article" };

      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(mockArticle);

      const result = await articlesFunctions.fetchArticleBySlug("test-article");

      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
      expect(result).toEqual(mockArticle);
    });

    it("should throw an error when article is not found by slug", async () => {
      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(null);

      await expect(articlesFunctions.fetchArticleBySlug("test-article")).rejects.toThrow("Could not find article with slug test-article");
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findFirst as Mock).mockRejectedValue(new Error());

      await expect(articlesFunctions.fetchArticleBySlug("test-article")).rejects.toThrow("Could not find article with slug test-article");
    });
  });

  describe("createSlug", () => {
    it("should create a slug and return success response", async () => {
      const slugObject = {
        id: "a",
        slug: "new-slug",
        createdAt: new Date().toISOString(),
        articleId: "1",
        validated: true,
      };

      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      // Override the fixedDb.insert for this test
      Object.defineProperty(fixedDb, "insert", { value: mockInsert, writable: true });

      const result = await articlesFunctions.createSlug(slugObject);

      expect(mockInsert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockValues).toHaveBeenCalledWith({
        id: "a",
        slug: "new-slug",
        createdAt: expect.any(String),
        articleId: "1",
        validated: true,
      });
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Slug created successfully",
      });
    });

    it("should return error response when slug creation fails", async () => {
      const slugObject = {
        id: "a",
        slug: "new-slug",
        createdAt: new Date().toISOString(),
        articleId: "1",
        validated: true,
      };

      const mockReturning = vi.fn().mockRejectedValue(new Error("Database error"));
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      // Override the fixedDb.insert for this test
      Object.defineProperty(fixedDb, "insert", { value: mockInsert, writable: true });

      const result = await articlesFunctions.createSlug(slugObject);

      expect(mockInsert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockValues).toHaveBeenCalledWith({
        id: "a",
        slug: "new-slug",
        createdAt: expect.any(String),
        articleId: "1",
        validated: true,
      });
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not create slug:"),
      });
    });
  });

  describe("createArticle", () => {
    it("should return error response when article creation fails", async () => {
      const articleObject = new FormData();
      articleObject.set("title", "Test Title");
      articleObject.set("introduction", "Test Introduction");
      articleObject.set("main", "Test Main Content");
      articleObject.set("urls", JSON.stringify([]));
      articleObject.set("main_audio_url", "");
      articleObject.set("url_to_main_illustration", "");
      articleObject.set("author", "Test Author");
      articleObject.set("author_email", "test@example.com");

      const mockReturning = vi.fn().mockRejectedValue(new Error("Database error"));
      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      // Override the fixedDb.insert for this test
      Object.defineProperty(fixedDb, "insert", { value: mockInsert, writable: true });

      const result = await articlesFunctions.createArticle(articleObject);

      expect(mockInsert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Title",
          introduction: "Test Introduction",
          main: "Test Main Content",
          urls: [],
          main_audio_url: "",
          url_to_main_illustration: "",
          author: "Test Author",
          author_email: "test@example.com",
        }),
      );
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not create article:"),
      });
    });
  });

  describe("updateArticle", () => {
    it("should return error when id is missing", async () => {
      const data = new FormData();
      data.set("introduction", "Updated introduction");
      data.set("urls", JSON.stringify([]));

      const result = await articlesFunctions.updateArticle(data);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Article ID is required",
      });
    });

    it("should return error when urls JSON is invalid", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("introduction", "Updated introduction");
      data.set("urls", "invalid json");

      const result = await articlesFunctions.updateArticle(data);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Invalid JSON in URLs field"),
      });
    });

    it("should update article successfully without slug change", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("introduction", "Updated introduction");
      data.set("main", "Updated main content");
      data.set("main_audio_url", "http://example.com/audio.mp3");
      data.set("url_to_main_illustration", "http://example.com/image.jpg");
      data.set("updated_at", new Date().toISOString());
      data.set("updated_by", "admin");
      data.set("urls", JSON.stringify([]));

      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.updateArticle(data);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article updated successfully.",
      });
    });

    it("should update both slug and article successfully", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("slug", "new-slug");
      data.set("introduction", "Updated introduction");
      data.set("main", "Updated main content");
      data.set("main_audio_url", "http://example.com/audio.mp3");
      data.set("url_to_main_illustration", "http://example.com/image.jpg");
      data.set("updated_at", new Date().toISOString());
      data.set("updated_by", "admin");
      data.set("urls", JSON.stringify([]));

      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.updateArticle(data);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Slug updated successfully. Article updated successfully.",
      });
    });

    it("should return partial success when slug update fails but article update succeeds", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("slug", "new-slug");
      data.set("introduction", "Updated introduction");
      data.set("main", "Updated main content");
      data.set("main_audio_url", "http://example.com/audio.mp3");
      data.set("url_to_main_illustration", "http://example.com/image.jpg");
      data.set("updated_at", new Date().toISOString());
      data.set("updated_by", "admin");
      data.set("urls", JSON.stringify([]));

      let callIndex = 0;
      const mockUpdate = vi.fn();

      mockUpdate.mockImplementation(() => {
        callIndex++;
        return {
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue(callIndex === 1 ? [] : [{ id: "123" }]),
        };
      });

      (fixedDb.update as Mock).mockImplementation(mockUpdate);

      const result = await articlesFunctions.updateArticle(data);

      expect(result.isSuccess).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toContain("Slug update failed - no rows affected");
      expect(result.message).toContain("Article updated successfully");
    });

    it("should return error when article update fails", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("introduction", "Updated introduction");
      data.set("main", "Updated main content");
      data.set("main_audio_url", "http://example.com/audio.mp3");
      data.set("url_to_main_illustration", "http://example.com/image.jpg");
      data.set("updated_at", new Date().toISOString());
      data.set("updated_by", "admin");
      data.set("urls", JSON.stringify([]));

      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      });

      const result = await articlesFunctions.updateArticle(data);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Article update failed:"),
      });
    });

    it("should return error when slug update throws an exception", async () => {
      const data = new FormData();
      data.set("id", "123");
      data.set("slug", "new-slug");
      data.set("introduction", "Updated introduction");
      data.set("urls", JSON.stringify([]));

      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Slug constraint violation")),
      });

      const result = await articlesFunctions.updateArticle(data);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Slug update failed");
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article and return success response", async () => {
      (fixedDb.delete as Mock).mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.deleteArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article deleted successfully",
      });
    });

    it("should return error response when article deletion fails", async () => {
      (fixedDb.update as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.deleteArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not delete article:"),
      });
    });
  });

  describe("validateArticle", () => {
    it("should validate an article and return success response", async () => {
      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.validateArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article validated successfully",
      });
    });

    it("should return error response when article validation fails", async () => {
      (fixedDb.update as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.validateArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not validate article:"),
      });
    });
  });

  describe("shipArticle", () => {
    it("should ship an article and return success response", async () => {
      const mockArticle = { id: "123", shipped: false, validated: true };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockArticle]),
      };

      (fixedDb.select as Mock).mockReturnValue(mockSelectChain);
      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ count: 1 }),
      });

      const result = await articlesFunctions.shipArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article shipped successfully",
      });
    });

    it("should return error response when article is not found", async () => {
      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      (fixedDb.select as Mock).mockReturnValue(mockSelectChain);

      const result = await articlesFunctions.shipArticle("999", true, "admin");

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(404);
      expect(result.message).toBe("Article not found for the given ID");
    });

    it("should return error response when article is not validated", async () => {
      const mockArticle = { id: "123", shipped: false, validated: false };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockArticle]),
      };

      (fixedDb.select as Mock).mockReturnValue(mockSelectChain);

      const result = await articlesFunctions.shipArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Article must be validated before it can be shipped",
      });
    });

    it("should return error response when shipping fails", async () => {
      const mockArticle = { id: "123", shipped: false, validated: true };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockArticle]),
      };

      (fixedDb.select as Mock).mockReturnValue(mockSelectChain);
      (fixedDb.update as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.shipArticle("123", true, "admin");

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not ship article:"),
      });
    });
  });
});
