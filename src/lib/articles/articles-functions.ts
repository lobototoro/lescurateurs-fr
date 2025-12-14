import { fixedDb } from "db/drizzle";
import { eq } from "drizzle-orm";

import { articles } from "db/schema";
import type { Article } from "@/models/articles";
import type { Slugs } from "@/models/slugs";

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

export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const articles = await fixedDb.query.articles.findMany();

    return articles as Article[];
  } catch (_error) {
    throw new Error("Could not find any articles!");
  }
};

export const getAllSlugs = async (): Promise<Slugs[]> => {
  try {
    const slugs = await fixedDb.query.slugs.findMany();

    return slugs.map((slug) => ({
      ...slug,
      validated: slug.validated ?? false,
    }));
  } catch (_error) {
    throw new Error("Could not find any slugs!");
  }
};

export const fetchArticleById = async ({ articleId }: { articleId: string }): Promise<Article> => {
  try {
    const article = await fixedDb.query.articles.findFirst({
      where: eq(articles.id, parseInt(articleId, 10)),
    });

    if (!article) {
      throw new Error(`Article with id ${articleId} not found`);
    }

    return article as Article;
  } catch (_error) {
    throw new Error(`Could not find article with id ${articleId}`);
  }
};

export const fetchArticleBySlug = async (slug: string): Promise<Article> => {
  try {
    const article = await fixedDb.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (!article) {
      throw new Error(`Article with id ${slug} not found`);
    }

    return article as Article;
  } catch (_error) {
    throw new Error(`Could not find article with slug ${slug}`);
  }
};
