export interface Slugs {
  id?: number;
  slug: string;
  createdAt: string;
  articleId: number;
  validated: boolean;
}

export interface Params {
  slug: string;
}
