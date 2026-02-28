import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["admin", "contributor"]);

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Permissions = string[];

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: rolesEnum().default("contributor").notNull(),
  permissions: jsonb("permissions").$type<Permissions>().default([]).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const articles = pgTable("articles_development", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  introduction: text("introduction").notNull(),
  main: text("main").notNull(),
  main_audio_url: text("main_audio_url").notNull(),
  url_to_main_illustration: text("url_to_main_illustration").notNull(),
  published_at: timestamp("published_at", { mode: "string", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "string", withTimezone: true }).notNull(),
  updated_at: timestamp("updated_at", { mode: "string", withTimezone: true }),
  updated_by: text("updated_by"),
  author: text("author").notNull(),
  author_email: text("author_email").notNull(),
  urls: jsonb("urls"),
  validated: boolean("validated").notNull(),
  shipped: boolean("shipped").notNull(),
});

export const slugs = pgTable(
  "slugs_development",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true }).notNull(),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    validated: boolean("validated").default(false),
  },
  (table) => [index("slugs_article_id_idx").on(table.articleId)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const slugsRelations = relations(slugs, ({ one }) => ({
  article: one(articles, {
    fields: [slugs.articleId],
    references: [articles.id],
  }),
}));
