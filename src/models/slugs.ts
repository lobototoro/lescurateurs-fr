export interface Slugs {
  id?: number | bigint;
  slug: string;
  createdAt: string;
  articleId: number | bigint;
  validated: boolean;
}

export interface Params {
  slug: string;
}
