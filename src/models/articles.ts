export enum UrlsTypes {
  WEBSITE = "website",
  VIDEOS = "videos",
  AUDIO = "audio",
  SOCIAL = "social",
  IMAGE = "image",
}

export type CustomFormInputs = {
  type: UrlsTypes;
  url: string;
  credits?: string;
}[];

export interface Article {
  id?: number | bigint;
  slug: string;
  title: string;
  introduction: string;
  main: string;
  main_audio_url: string;
  url_to_main_illustration: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
  author: string;
  author_email: string;
  urls: any | any[] | null;
  validated: boolean;
  shipped: boolean;
}
