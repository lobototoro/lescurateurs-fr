import { describe, it, expect, vi, beforeEach } from "vitest";
import * as articlesFunctions from "./articles-functions";
import { fixedDb } from "db/drizzle";
import type { Article } from "@/models/articles";
import type { Slugs } from "@/models/slugs";

// Mock the drizzle module
vi.mock("db/drizzle", () => ({
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
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => true),
}));

// Mock db/schema
vi.mock("db/schema", () => ({
  articles: {
    id: "id",
    slug: "slug",
  },
  slugs: {},
}));

describe("articles-functions", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("getAllArticles", () => {
    it("should return all articles when database query succeeds", async () => {
      const mockArticles: Article[] = [
        { id: 1, title: "Test Article 1", slug: "test-article-1" } as Article,
        { id: 2, title: "Test Article 2", slug: "test-article-2" } as Article,
      ];

      (fixedDb.query.articles.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticles);

      const result = await articlesFunctions.getAllArticles();

      expect(result).toEqual(mockArticles);
      expect(fixedDb.query.articles.findMany).toHaveBeenCalled();
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database error"));

      await expect(articlesFunctions.getAllArticles()).rejects.toThrow("Could not find any articles!");
    });
  });

  describe("getAllSlugs", () => {
    it("should return all slugs with validated property when database query succeeds", async () => {
      const mockSlugs: any[] = [
        { id: 1, slug: "test-slug-1", validated: true },
        { id: 2, slug: "test-slug-2", validated: null }, // null should become false
        { id: 3, slug: "test-slug-3" }, // undefined should become false
      ];

      (fixedDb.query.slugs.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockSlugs);

      const result = await articlesFunctions.getAllSlugs();

      expect(result).toEqual([
        { id: 1, slug: "test-slug-1", validated: true },
        { id: 2, slug: "test-slug-2", validated: false },
        { id: 3, slug: "test-slug-3", validated: false },
      ]);
      expect(fixedDb.query.slugs.findMany).toHaveBeenCalled();
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.slugs.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database error"));

      await expect(articlesFunctions.getAllSlugs()).rejects.toThrow("Could not find any slugs!");
    });
  });

  describe("fetchArticleById", () => {
    it("should return an article when found by ID", async () => {
      const mockArticle = { id: 1, title: "Test Article", slug: "test-article" } as Article;
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      const result = await articlesFunctions.fetchArticleById(1);

      expect(result).toEqual(mockArticle);
      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });

    it("should throw an error when article is not found by ID", async () => {
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(articlesFunctions.fetchArticleById(999)).rejects.toThrow("Could not find article with id 999");
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database error"));

      await expect(articlesFunctions.fetchArticleById(1)).rejects.toThrow("Could not find article with id 1");
    });
  });

  describe("fetchArticleBySlug", () => {
    it("should return an article when found by slug", async () => {
      const mockArticle = { id: 1, title: "Test Article", slug: "test-article" } as Article;
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      const result = await articlesFunctions.fetchArticleBySlug("test-article");

      expect(result).toEqual(mockArticle);
      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });

    it("should throw an error when article is not found by slug", async () => {
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(articlesFunctions.fetchArticleBySlug("non-existent")).rejects.toThrow("Could not find article with slug non-existent");
    });

    it("should throw an error when database query fails", async () => {
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Database error"));

      await expect(articlesFunctions.fetchArticleBySlug("test-article")).rejects.toThrow("Could not find article with slug test-article");
    });
  });

  describe("createSlug", () => {
    it("should create a slug and return success response", async () => {
      const slugObject: Omit<Slugs, "id"> = {
        slug: "new-slug",
        createdAt: new Date().toString(),
        articleId: 1,
        validated: true,
      };

      const mockInsertReturn = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 1, ...slugObject }]),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      const result = await articlesFunctions.createSlug(slugObject);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Slug created successfully",
      });
    });

    it("should return error response when slug creation fails", async () => {
      const slugObject: Omit<Slugs, "id"> = {
        slug: "new-slug",
        createdAt: new Date().toString(),
        articleId: 1,
        validated: true,
      };

      const mockInsertReturn = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      const result = await articlesFunctions.createSlug(slugObject);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not create slug:");
    });
  });

  describe("createArticle", () => {
    it("should create an article and return success response", async () => {
      const articleObject: Omit<Article, "id"> = {
        title: "New Article",
        slug: "new-article",
      } as Omit<Article, "id">;

      // Mock the article creation response
      const mockInsertReturn = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      // Since we can't easily spy on the internal createSlug call, we'll just verify the overall behavior
      const result = await articlesFunctions.createArticle(articleObject);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article created successfully",
      });
    });

    it("should return error response when article creation fails", async () => {
      const articleObject: Omit<Article, "id"> = {
        title: "New Article",
        slug: "new-article",
      } as Omit<Article, "id">;

      const mockInsertReturn = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };

      (fixedDb.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockInsertReturn);

      const result = await articlesFunctions.createArticle(articleObject);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not create article:");
    });
  });

  describe("updateArticle", () => {
    it("should update an article and return success response", async () => {
      const articleUpdateData: Omit<Article, "id" | "createdAt" | "title" | "slug"> = {
        main: "Updated content",
      } as Omit<Article, "id" | "createdAt" | "title" | "slug">;

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.updateArticle(1, articleUpdateData);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article updated successfully",
      });
    });

    it("should return error response when article update fails", async () => {
      const articleUpdateData: Omit<Article, "id" | "createdAt" | "title" | "slug"> = {
        main: "Updated content",
      } as Omit<Article, "id" | "createdAt" | "title" | "slug">;

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.updateArticle(1, articleUpdateData);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not update article:");
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article and return success response", async () => {
      const mockDeleteReturn = {
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockDeleteReturn);

      const result = await articlesFunctions.deleteArticle(1);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article deleted successfully",
      });
    });

    it("should return error response when article deletion fails", async () => {
      const mockDeleteReturn = {
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockDeleteReturn);

      const result = await articlesFunctions.deleteArticle(1);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not delete article:");
    });
  });

  describe("validateArticle", () => {
    it("should validate an article and return success response", async () => {
      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.validateArticle(1, true);

      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article validated successfully",
      });
    });

    it("should return error response when article validation fails", async () => {
      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.validateArticle(1, true);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not validate article:");
    });
  });

  describe("shipArticle", () => {
    it("should ship an article and return success response", async () => {
      // Mock the internal fetchArticleById call by mocking the database query
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        shipped: false,
      } as Article);

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.shipArticle(1, true);

      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(result).toEqual({
        isSuccess: true,
        status: 200,
        message: "Article shipped successfully",
      });
    });

    it("should return error response when article is not found", async () => {
      // Mock the internal fetchArticleById call to return null, which will cause fetchArticleById to throw
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await articlesFunctions.shipArticle(999, true);

      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      // The function catches the error from fetchArticleById and returns a 400 status with the error message
      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not ship article: Error: Could not find article with id 999");
    });

    it("should return error response when article already has the same shipping status", async () => {
      // Mock the internal fetchArticleById call to return an article with the same shipping status
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        shipped: true,
      } as Article);

      const result = await articlesFunctions.shipArticle(1, true);

      expect(fixedDb.query.articles.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(result).toEqual({
        isSuccess: false,
        status: 400,
        message: "Article already has the same shipping status",
      });
    });

    it("should return error response when shipping fails", async () => {
      // Mock the internal fetchArticleById call to return a valid article
      (fixedDb.query.articles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        shipped: false,
      } as Article);

      const mockUpdateReturn = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      };

      (fixedDb.update as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateReturn);

      const result = await articlesFunctions.shipArticle(1, true);

      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain("Could not ship article:");
    });
  });
});
