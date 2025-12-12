import { fixedDb } from "db/drizzle";

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
