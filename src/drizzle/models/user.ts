import { eq } from "drizzle-orm";
import { usersTable } from "@drizzle/schemas/users";
import { db } from "@drizzle/index";
import { User, UserDB } from "@shared/types/user";
import { Recipe } from "@shared/types/recipe";
import { favoriteRecipesTable, recipesTable } from "@drizzle/schemas/recipes";

export async function findUsers(): Promise<UserDB[] | undefined> {
  try {
    const users = await db.select().from(usersTable);
    if (!users[0]) {
      throw new Error("No users are found in 'usersTable'");
    }
    return users;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        "An unexpected error in setUser function:{error.message}"
      );
    }
  }
}
// make separate func findUserID etc
export async function findUser({
  property,
  value,
}: {
  property: "id" | "email";
  value: string;
}): Promise<UserDB | undefined> {
  try {
    const whereEQ = eq(usersTable[property], value);
    console.log(property, value);
    const user: UserDB[] | undefined = await db
      .select()
      .from(usersTable)
      .where(whereEQ);

    return user[0];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `An unexpected error in setUser function:${error.message}`
      );
    }
  }
}
export async function findUserFavoriteRecipes(userID: string) {
  try {
    const favoriteRecipes = await db
      .select({
        recipeID: favoriteRecipesTable.recipe_id,
      })
      .from(favoriteRecipesTable)
      .leftJoin(usersTable, eq(usersTable.id, favoriteRecipesTable.user_id))
      .where(eq(favoriteRecipesTable.user_id, userID));
    return favoriteRecipes;
  } catch (err: unknown) {
    throw err;
  }
}
export async function findUserRecipes(userID: string) {
  try {
    const recipes = await db
      .select({
        recipeID: recipesTable.id,
      })
      .from(recipesTable)
      .leftJoin(usersTable, eq(usersTable.id, recipesTable.id))
      .where(eq(recipesTable.author_id, userID));
    console.log(recipes);
    return recipes;
  } catch (err: unknown) {
    throw err;
  }
}
export async function insertUser(userData: User): Promise<UserDB | undefined> {
  try {
    const [settedUser] = await db
      .insert(usersTable)
      .values(userData)
      .returning();
    return settedUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        "An unexpected error in setUser function:{error.message}"
      );
    }
  }
}
export async function insertUserFavoriteRecipe(
  recipeID: string,
  userID: string
): Promise<Recipe["id"]> {
  try {
    const insertedFavoriteRecipe = await db
      .insert(favoriteRecipesTable)
      .values({ recipe_id: recipeID, user_id: userID })
      .returning();
    if (!insertedFavoriteRecipe[0]) {
      throw new Error("An unexpected error during inserting favorite recipe");
    }
    return insertedFavoriteRecipe[0].recipe_id;
  } catch (err: unknown) {
    throw err;
  }
}
