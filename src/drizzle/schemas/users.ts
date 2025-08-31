import { relations, sql } from "drizzle-orm";
import { primaryKey, uuid } from "drizzle-orm/pg-core";
import { pgTable, varchar } from "drizzle-orm/pg-core";
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
  user_id: uuid()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  password: varchar({ length: 255 }).notNull(),
});

export const oauthAccountsTable = pgTable(
  "oauthAccounts",
  {
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    provider: varchar({ length: 255 }).notNull(),
    provider_account_id: varchar({ length: 255 }).notNull().unique(),
  },
  (table) => [
    primaryKey({
      name: "oauth_accounts_pk",
      columns: [table.userId, table.provider],
    }),
    // primaryKey({ name: 'custom_name', columns: [table.bookId, table.authorId] }),
  ]
);
// add accounts relations
export const userRelations = relations(usersTable, ({ many }) => ({
  // accounts: many(userAccountsTable)
  recipes: many(recipesTable),
  favoriteRecipes: many(favoriteRecipesTable),
}));
