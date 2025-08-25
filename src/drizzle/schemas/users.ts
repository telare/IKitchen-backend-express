import { relations, sql } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { favoriteRecipesTable, recipesTable } from "./recipes";

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});


export const userRelations = relations(usersTable, ({ many }) => ({
  recipes: many(recipesTable),
  favoriteRecipes: many(favoriteRecipesTable),
}));