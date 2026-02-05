import { fixedDb } from "db/drizzle";
// import { or, ilike } from "drizzle-orm";
import { ilike } from "drizzle-orm";

// import { articles, slugs } from "db/schema";
import { slugs } from "db/schema";

export async function slugsTermSearch(term: string): Promise<any[] | null> {
  let slugResults: any[] = [];
  try {
    slugResults = await fixedDb
      .select()
      .from(slugs)
      .where(ilike(slugs.slug, `%${term}%`));

    return slugResults;
  } catch (error) {
    console.error("Error searching slugs:", error);

    return null;
  }

  // let articleResults: any[] = [];
  // try {
  //   articleResults = await fixedDb
  //     .select()
  //     .from(articles)
  //     .where(or(ilike(articles.introduction, `%${term}%`), ilike(articles.main, `%${term}%`)));
  // } catch (error) {
  //   console.error("Error searching articles:", error);
  // }

  // const combinedResults = [...slugResults, ...articleResults];
  // const seenSlugs = new Set<string>();

  // return combinedResults.filter((record) => {
  //   const slug = "slug" in record ? record.slug : null;
  //   if (slug && !seenSlugs.has(slug)) {
  //     seenSlugs.add(slug);
  //     return true;
  //   }
  //   return false;
  // });
}
