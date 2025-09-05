import {
  integer,
  numeric,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { usersTable } from "./users";

export const recipesTable = pgTable("recipes", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authorID: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
  title: varchar({ length: 255 }).notNull().unique(),
  description: text().notNull(),
  servings: integer().notNull(),
  prepHrs: integer().notNull(),
  prepMins: integer().notNull(),
  cookHrs: integer().notNull(),
  cookMins: integer().notNull(),
});

export const recipeInstructionsTable = pgTable("recipeInstructions", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    }),
  step: integer().notNull(),
  instruction: text().notNull(),
});

export const recipeIngredientsTable = pgTable("recipeIngredients", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    }),
  name: text().notNull(),
  quantity: numeric().notNull(),
  unit: varchar({ length: 255 }).notNull(),
});

export const recipeTagsTable = pgTable("recipeTags", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    }),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const recipeImagesTable = pgTable("recipeImages", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    }),
  imageURL: varchar({ length: 255 }).notNull().unique(),
});

export const recipeCookTipsTable = pgTable("recipeCookTips", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    }),
  tip: varchar({ length: 255 }).notNull().unique(),
});

export const favoriteRecipesTable = pgTable("favoriteRecipes", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userID: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
  recipeID: uuid()
    .notNull()
    .references(() => recipesTable.id, {
      onDelete: "cascade",
    })
    .unique(),
});

export const recipeRelations = relations(recipesTable, ({ many }) => ({
  images: many(recipeImagesTable),
  instructions: many(recipeInstructionsTable),
  ingredients: many(recipeIngredientsTable),
  tags: many(recipeTagsTable),
  cookTips: many(recipeCookTipsTable),
}));
