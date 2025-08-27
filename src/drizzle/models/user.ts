import { eq } from "drizzle-orm";
import { usersTable } from "@drizzle/schemas/users";
import { db } from "@drizzle/index";
import { User, UserDB } from "@shared/types/user";
import { favoriteRecipesTable, recipesTable } from "@drizzle/schemas/recipes";

export async function findUsers(): Promise<UserDB[]> {
  const users = await db.select().from(usersTable);
  return users;
}
// make separate func findUserID etc
export async function findUser({
  property,
  value,
}: {
  property: "id" | "email";
  value: string;
}): Promise<UserDB | undefined> {
  const whereEQ = eq(usersTable[property], value);
  const user: UserDB[] | undefined = await db
    .select()
    .from(usersTable)
    .where(whereEQ);
  return user[0];
}
export async function findUserFavoriteRecipes(userID: string): Promise<
  {
    recipeID: string;
  }[]
> {
  const favoriteRecipes = await db
    .select({
      recipeID: favoriteRecipesTable.recipe_id,
    })
    .from(favoriteRecipesTable)
    .leftJoin(usersTable, eq(usersTable.id, favoriteRecipesTable.user_id))
    .leftJoin(
      recipesTable,
      eq(recipesTable.author_id, favoriteRecipesTable.user_id)
    )
    .where(eq(favoriteRecipesTable.user_id, userID));
  return favoriteRecipes;
}
export async function findUserRecipes(
  userID: string
){
  const recipes = await db
    .select({
      recipeID: recipesTable.id,
    })
    .from(recipesTable)
    .leftJoin(usersTable, eq(usersTable.id, recipesTable.id))
    .where(eq(recipesTable.author_id, userID));
  return recipes;
}
export async function insertUser(userData: User): Promise<UserDB | undefined> {
  const [settedUser] = await db.insert(usersTable).values(userData).returning();
  return settedUser;
}
export async function insertUserFavoriteRecipe(
  recipeID: string,
  userID: string
) {
  const insertedFavoriteRecipe = await db
    .insert(favoriteRecipesTable)
    .values({ recipe_id: recipeID, user_id: userID })
    .returning();
  return insertedFavoriteRecipe[0]?.recipe_id;
}
