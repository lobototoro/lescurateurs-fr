import { fixedDb } from "db/drizzle";
import { eq } from "drizzle-orm";
import slugify from "slugify";

import type { Json } from "db/schema";
import { articles, slugs } from "db/schema";
import { ulid } from "ulid";

/**
 * Module for article and slug database operations.
 * Provides functions to retrieve, create, update, and delete articles and slugs from the database.
 * @packageDocumentation
 */

/**
 * Response object for create/update/delete operations.
 *
 * @interface CustomResponseT
 */
export interface CustomResponseT {
  /**
   * Indicates if the operation was successful.
   */
  isSuccess: boolean;

  /**
   * HTTP status code of the operation.
   */
  status: number;

  /**
   * Message describing the result of the operation.
   */
  message: string;
}

/**
 * Retrieves all articles from the database.
 *
 * This function queries the database for all articles and returns them as an array.
 *
 * @returns {Promise<Article[]>} A promise that resolves to an array of all articles.
 * @throws {Error} If articles cannot be retrieved from the database.
 *
 * @example
 * ```typescript
 * const allArticles = await getAllArticles();
 * console.log(allArticles.length);
 * ```
 */
export const getAllArticles = async (): Promise<(typeof articles.$inferInsert)[]> => {
  try {
    const articles = await fixedDb.query.articles.findMany();

    return articles;
  } catch (_error) {
    throw new Error("Could not find any articles!");
  }
};

/**
 * Retrieves all slugs from the database.
 *
 * This function queries the database for all slugs and ensures each slug has a validated property,
 * defaulting to false if not set.
 *
 * @returns {Promise<Slugs[]>} A promise that resolves to an array of all slugs with validated properties.
 * @throws {Error} If slugs cannot be retrieved from the database.
 *
 * @example
 * ```typescript
 * const allSlugs = await getAllSlugs();
 * console.log(allSlugs.length);
 * ```
 */
export const getAllSlugs = async (): Promise<(typeof slugs.$inferInsert)[]> => {
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

/**
 * Fetches a single article by its ID.
 *
 * This function queries the database for an article with the specified ID.
 *
 * @param articleId - The ID of the article to fetch.
 * @returns {Promise<Article>} A promise that resolves to the requested article.
 * @throws {Error} If the article cannot be found or if there's a database error.
 *
 * @example
 * ```typescript
 * const article = await fetchArticleById(123);
 * console.log(article.title);
 * ```
 */
export const fetchArticleById = async (articleId: string): Promise<typeof articles.$inferInsert> => {
  try {
    const article = await fixedDb.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!article) {
      throw new Error(`Article with id ${articleId} not found`);
    }

    return article;
  } catch (_error) {
    throw new Error(`Could not find article with id ${articleId}`);
  }
};

/**
 * Fetches a single article by its slug.
 *
 * This function queries the database for an article with the specified slug.
 *
 * @param slug - The slug of the article to fetch.
 * @returns {Promise<Article>} A promise that resolves to the requested article.
 * @throws {Error} If the article cannot be found or if there's a database error.
 *
 * @example
 * ```typescript
 * const article = await fetchArticleBySlug("my-article-slug");
 * console.log(article.title);
 * ```
 */
export const fetchArticleBySlug = async (slug: string): Promise<typeof articles.$inferInsert> => {
  try {
    const article = await fixedDb.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (!article) {
      throw new Error(`Article with id ${slug} not found`);
    }

    return article;
  } catch (_error) {
    throw new Error(`Could not find article with slug ${slug}`);
  }
};

// following functions should server-side only

/**
 * Creates a new slug in the database.
 *
 * This function inserts a new slug record into the database with the provided data.
 * Note: This function should only be used server-side.
 *
 * @param slugObject - The slug data to insert, excluding the ID which is auto-generated.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await createSlug({
 *   slug: "my-new-slug",
 *   createdAt: new Date().toString(),
 *   articleId: 123,
 *   validated: true
 * });
 * if (response.isSuccess) {
 *   console.log("Slug created successfully");
 * }
 * ```
 */
export const createSlug = async (slugObject: typeof slugs.$inferInsert): Promise<CustomResponseT> => {
  try {
    const { id, slug, createdAt, articleId, validated } = slugObject;

    await fixedDb
      .insert(slugs)
      .values({
        id,
        slug,
        createdAt,
        articleId,
        validated,
      })
      .onConflictDoNothing({
        target: slugs.id,
      })
      .returning();

    return {
      isSuccess: true,
      status: 200,
      message: "Slug created successfully",
    };
  } catch (error) {
    const errMessage = `Could not create slug: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};

/**
 * Creates a new article in the database.
 *
 * This function inserts a new article record into the database with the provided data.
 * It also automatically creates a corresponding slug entry.
 * Note: This function should only be used server-side.
 *
 * @param articleObject - The article data to insert, excluding the ID which is auto-generated.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await createArticle({
 *   title: "My New Article",
 *   content: "Article content here...",
 *   slug: "my-new-article",
 *   // ... other article properties
 * });
 * if (response.isSuccess) {
 *   console.log("Article created successfully");
 * }
 * ```
 */
export const createArticle = async (articleObject: FormData): Promise<CustomResponseT> => {
  const article = {
    title: articleObject.get("title") as string,
    introduction: articleObject.get("introduction") as string,
    main: articleObject.get("main"),
    urls: JSON.parse(articleObject.get("urls") as string) as Json,
    main_audio_url: articleObject.get("main_audio_url") as string,
    url_to_main_illustration: articleObject.get("url_to_main_illustration") as string,
    created_at: new Date().toISOString(),
    updated_at: null,
    updated_by: null,
    published_at: null,
    author: articleObject.get("author") as string,
    author_email: articleObject.get("author_email") as string,
    validated: false,
    shipped: false,
    slug: slugify(articleObject.get("title") as string, { lower: true, remove: /[*+~.()'"!:@]/g }),
  };

  try {
    const articleGeneratedId = ulid();
    const createArticleResponse = fixedDb
      .insert(articles)
      .values({
        ...(article as typeof articles.$inferInsert),
        id: articleGeneratedId,
      })
      .onConflictDoNothing({
        target: articles.id,
      })
      .returning({
        returningArticleId: articles.id,
      });

    const slugGeneratedId = ulid();
    const createSlugResponse = await createSlug({
      id: slugGeneratedId,
      slug: article.slug,
      createdAt: new Date().toISOString(),
      articleId: (await createArticleResponse)[0]?.returningArticleId,
      validated: false,
    });

    if (createSlugResponse.isSuccess) {
      return {
        isSuccess: true,
        status: 200,
        message: "Article & slug created successfully",
      };
    } else {
      return {
        isSuccess: false,
        status: 400,
        message: "Article & slug creation failed",
      };
    }
  } catch (error) {
    const errMessage = `Could not create article: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};

/**
 * Updates an existing article in the database.
 *
 * This function updates an article record in the database with the provided data.
 * Note: This function should only be used server-side.
 *
 * @param id - The ID of the article to update.
 * @param articleObject - The article data to update, excluding certain readonly fields.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await updateArticle(123, {
 *   content: "Updated content...",
 *   excerpt: "Updated excerpt...",
 *   // ... other updatable article properties
 * });
 * if (response.isSuccess) {
 *   console.log("Article updated successfully");
 * }
 * ```
 */
export const updateArticle = async (id: string, articleObject: Omit<typeof articles.$inferInsert, "id" | "createdAt" | "title" | "slug">): Promise<CustomResponseT> => {
  try {
    const updateArticleResponse = fixedDb
      .update(articles)
      .set({
        ...articleObject,
      })
      .where(eq(articles.id, id));

    console.log("article update response ", updateArticleResponse);

    return {
      isSuccess: true,
      status: 200,
      message: "Article updated successfully",
    };
  } catch (error) {
    const errMessage = `Could not update article: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};

/**
 * Deletes an article from the database.
 *
 * This function removes an article record from the database by its ID.
 * Note: This function should only be used server-side.
 *
 * @param id - The ID of the article to delete.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await deleteArticle(123);
 * if (response.isSuccess) {
 *   console.log("Article deleted successfully");
 * }
 * ```
 */
export const deleteArticle = async (id: string): Promise<CustomResponseT> => {
  try {
    const deleteArticleResponse = fixedDb.delete(articles).where(eq(articles.id, id));

    console.log("article deletion response ", deleteArticleResponse);

    return {
      isSuccess: true,
      status: 200,
      message: "Article deleted successfully",
    };
  } catch (error) {
    const errMessage = `Could not delete article: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};

/**
 * Validates or invalidates an article.
 *
 * This function updates the validation status of an article in the database.
 * Note: This function should only be used server-side.
 *
 * @param id - The ID of the article to validate.
 * @param validation - The validation status to set (true for validated, false for invalid).
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await validateArticle(123, true);
 * if (response.isSuccess) {
 *   console.log("Article validated successfully");
 * }
 * ```
 */
export const validateArticle = async (id: string, validation: boolean): Promise<CustomResponseT> => {
  try {
    const validateArticleResponse = fixedDb
      .update(articles)
      .set({
        validated: validation,
      })
      .where(eq(articles.id, id));

    console.log("article validation response ", validateArticleResponse);

    return {
      isSuccess: true,
      status: 200,
      message: "Article validated successfully",
    };
  } catch (error) {
    const errMessage = `Could not validate article: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};

/**
 * Ships or unships an article.
 *
 * This function updates the shipping status of an article in the database.
 * Note: This function should only be used server-side.
 *
 * @param id - The ID of the article to ship/unship.
 * @param shipValue - The shipping status to set (true for shipped, false for not shipped).
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const response = await shipArticle(123, true);
 * if (response.isSuccess) {
 *   console.log("Article shipped successfully");
 * }
 * ```
 */
export const shipArticle = async (id: string, shipValue: boolean): Promise<CustomResponseT> => {
  try {
    const actualStatus = await fetchArticleById(id);

    if (!actualStatus) {
      return {
        isSuccess: false,
        status: 404,
        message: "Article not found",
      };
    }

    const actualShippedStatus = actualStatus.shipped;

    if (actualShippedStatus === shipValue) {
      return {
        isSuccess: false,
        status: 400,
        message: "Article already has the same shipping status",
      };
    }

    const shipArticleResponse = fixedDb
      .update(articles)
      .set({
        shipped: shipValue,
      })
      .where(eq(articles.id, id));

    console.log("article shipping response ", shipArticleResponse);

    return {
      isSuccess: true,
      status: 200,
      message: "Article shipped successfully",
    };
  } catch (error) {
    const errMessage = `Could not ship article: ${error}`;
    console.error(errMessage);

    return {
      isSuccess: false,
      status: 400,
      message: errMessage,
    };
  }
};
