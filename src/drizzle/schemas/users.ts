import { relations, sql } from "drizzle-orm";
import { primaryKey, uuid, pgTable, varchar } from "drizzle-orm/pg-core";
import { favoriteRecipesTable, recipesTable } from "./recipes";

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const providersTable = pgTable("accountProviders", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const localAccountsTable = pgTable("localAccounts", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userID: uuid()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  password: varchar({ length: 255 }).notNull(),
});

export const oauthAccountsTable = pgTable(
  "oauthAccounts",
  {
    userID: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountID: varchar({ length: 255 }).notNull().unique(),
  },
  (table) => [
    primaryKey({
      name: "oauth_accounts_pk",
      columns: [table.userID, table.provider],
    }),
    // primaryKey({ name: 'custom_name', columns: [table.bookId, table.authorId] }),
  ]
);
// add accounts relations
export const userRelations = relations(usersTable, ({ one, many }) => ({
  oauthAccounts: many(oauthAccountsTable),
  localAccount: one(oauthAccountsTable),
  recipes: many(recipesTable),
  favoriteRecipes: many(favoriteRecipesTable),
}));
