import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as articlesFunctions from "./articles-functions";
import { fixedDb } from "db/drizzle";

// Mock the drizzle module
vi.mock("db/drizzle", () => {
  // Create mock functions inside the mock factory to maintain references
  const mockReturning = vi.fn();
  const mockOnConflictDoNothing = vi.fn(() => ({ returning: mockReturning }));
  const mockValues = vi.fn(() => ({ onConflictDoNothing: mockOnConflictDoNothing }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

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
    beforeEach(() => {
      // Reset all mocks before each test
      // Access the actual mock functions that were created in the vi.mock factory
      const mockInsert = fixedDb.insert;
      const mockValues = mockInsert().values;
      const mockOnConflictDoNothing = mockValues().onConflictDoNothing;
      const mockReturning = mockOnConflictDoNothing().returning;

      mockInsert.mockClear();
      mockValues.mockClear();
      mockOnConflictDoNothing.mockClear();
      mockReturning.mockClear();
    });

    it("should create a slug and return success response", async () => {
      const slugObject = {
        id: "a",
        slug: "new-slug",
        createdAt: new Date().toISOString(),
        articleId: "1",
        validated: true,
      };

      // Get references to the actual mock instances that will be called
      const mockValues = fixedDb.insert().values;
      const mockOnConflictDoNothing = mockValues().onConflictDoNothing;
      const mockReturning = mockOnConflictDoNothing().returning;

      // Set up the mock to resolve successfully
      mockReturning.mockResolvedValue([]);

      const result = await articlesFunctions.createSlug(slugObject);

      expect(fixedDb.insert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockValues).toHaveBeenCalledWith({
        id: "a",
        slug: "new-slug",
        createdAt: expect.any(String),
        articleId: "1",
        validated: true,
      });
      // Check that onConflictDoNothing was called (the exact args depend on the implementation)
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

      // Get references to the actual mock instances that will be called
      const mockValues = fixedDb.insert().values;
      const mockOnConflictDoNothing = mockValues().onConflictDoNothing;
      const mockReturning = mockOnConflictDoNothing().returning;

      // Set up the mock to reject
      mockReturning.mockRejectedValue(new Error("Database error"));

      const result = await articlesFunctions.createSlug(slugObject);

      expect(fixedDb.insert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockValues).toHaveBeenCalledWith({
        id: "a",
        slug: "new-slug",
        createdAt: expect.any(String),
        articleId: "1",
        validated: true,
      });
      // Check that onConflictDoNothing was called (the exact args depend on the implementation)
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
      articleObject.set("urls", "[]");
      articleObject.set("main_audio_url", "");
      articleObject.set("url_to_main_illustration", "");
      articleObject.set("author", "Test Author");
      articleObject.set("author_email", "test@example.com");

      // Get references to the actual mock instances that will be called
      const mockValues = fixedDb.insert().values;
      const mockOnConflictDoNothing = mockValues().onConflictDoNothing;
      const mockReturning = mockOnConflictDoNothing().returning;

      // Set up the mock to reject
      mockReturning.mockRejectedValue(new Error("Database error"));

      const result = await articlesFunctions.createArticle(articleObject);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not create article:"),
      });
    });
  });

  describe("updateArticle", () => {
    it("should update an article and return success response", async () => {
      const articleUpdateData = {
        introduction: "Updated introduction",
        main: "Updated main content",
        main_audio_url: "http://example.com/audio.mp3",
        url_to_main_illustration: "http://example.com/image.jpg",
        updated_at: new Date().toISOString(),
        updated_by: "admin",
        published_at: new Date().toISOString(),
        urls: [],
        validated: true,
        shipped: false,
        author: "Updated Author",
        author_email: "updated@example.com",
        created_at: new Date().toISOString(),
      };

      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.updateArticle("123", articleUpdateData);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article updated successfully",
      });
    });

    it("should return error response when article update fails", async () => {
      const articleUpdateData = {
        introduction: "Updated introduction",
        main: "Updated main content",
        main_audio_url: "http://example.com/audio.mp3",
        url_to_main_illustration: "http://example.com/image.jpg",
        updated_at: new Date().toISOString(),
        updated_by: "admin",
        published_at: new Date().toISOString(),
        urls: [],
        validated: true,
        shipped: false,
        author: "Updated Author",
        author_email: "updated@example.com",
        created_at: new Date().toISOString(),
      };

      (fixedDb.update as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.updateArticle("123", articleUpdateData);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not update article:"),
      });
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article and return success response", async () => {
      (fixedDb.delete as Mock).mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.deleteArticle("123");

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article deleted successfully",
      });
    });

    it("should return error response when article deletion fails", async () => {
      (fixedDb.delete as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.deleteArticle("123");

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

      const result = await articlesFunctions.validateArticle("123", true);

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

      const result = await articlesFunctions.validateArticle("123", true);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not validate article:"),
      });
    });
  });

  describe("shipArticle", () => {
    it("should ship an article and return success response", async () => {
      const mockArticle = { id: "123", shipped: false };

      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(mockArticle);
      (fixedDb.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "123" }]),
      });

      const result = await articlesFunctions.shipArticle("123", true);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article shipped successfully",
      });
    });

    it("should return error response when article is not found", async () => {
      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(null);

      const result = await articlesFunctions.shipArticle("999", true);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not find article with id 999");
    });

    it("should return error response when article already has the same shipping status", async () => {
      const mockArticle = { id: "123", shipped: true }; // already shipped

      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(mockArticle);

      const result = await articlesFunctions.shipArticle("123", true); // trying to ship again

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Article already has the same shipping status",
      });
    });

    it("should return error response when shipping fails", async () => {
      const mockArticle = { id: "123", shipped: false };

      (fixedDb.query.articles.findFirst as Mock).mockResolvedValue(mockArticle);
      (fixedDb.update as Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await articlesFunctions.shipArticle("123", true);

      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: expect.stringContaining("Could not ship article:"),
      });
    });
  });
});
