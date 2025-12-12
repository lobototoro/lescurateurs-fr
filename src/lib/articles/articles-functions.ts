import { fixedDb } from "db/drizzle";
import { articles } from "db/schema";
import { eq } from "drizzle-orm";

/*
 * Module for article and slug database operations.
 * Provides functions to retrieve all articles and all slugs
 * from the database.
 */

/**
 * Retrieves all articles from the database.
 * @returns {Promise<Article[]>} A promise that resolves to an array of all articles.
 * @throws {Error} If articles cannot be retrieved from the database.
 */

export const getAllArticles = async () => {
  try {
    const articles = await fixedDb.query.articles.findMany();

    return articles;
  } catch (_error) {
    throw new Error("Could not find any articles!");
  }
};

export const getAllSlugs = async () => {
  try {
    const slugs = await fixedDb.query.slugs.findMany();

    return slugs;
  } catch (_error) {
    throw new Error("Could not find any slugs!");
  }
};

export const fetchArticleById = async ({ articleId }: { articleId: string }) => {
  try {
    const article = await fixedDb.query.articles.findFirst({
      where: eq(articles.id, parseInt(articleId, 10)),
    });

    if (!article) {
      throw new Error(`Article with id ${articleId} not found`);
    }

    return article;
  } catch (_error) {
    throw new Error(`Could not find article with id ${articleId}`);
  }
};
