import { and, eq } from "drizzle-orm";
import {
  localAccountsTable,
  oauthAccountsTable,
  usersTable,
} from "@drizzle/schemas/users";
import { db } from "@drizzle/index";
import { LocalUser, OauthUser, UserDB } from "@shared/types/user";
import { favoriteRecipesTable, recipesTable } from "@drizzle/schemas/recipes";

export async function findUsers(): Promise<UserDB[]> {
  const users = await db.select().from(usersTable);
  return users;
}

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

export async function findUserLocalAccount(
  userId: string
): Promise<LocalUser | undefined> {
  const [account] = await db
    .select({
      userId: localAccountsTable.user_id,
      password: localAccountsTable.password,
    })
    .from(localAccountsTable)
    .where(eq(localAccountsTable.user_id, userId));
  return account;
}

export async function findUserOauthAccount(
  userId: string,
  provider: string
): Promise<OauthUser | undefined> {
  const [account] = await db
    .select({
      userId: oauthAccountsTable.userId,
      provider: oauthAccountsTable.provider,
      providerAccountID: oauthAccountsTable.provider_account_id,
    })
    .from(oauthAccountsTable)
    .where(
      and(
        eq(oauthAccountsTable.userId, userId),
        eq(oauthAccountsTable.provider, provider)
      )
    );
  return account;
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
export async function findUserRecipes(userID: string) {
  const recipes = await db
    .select({
      recipeID: recipesTable.id,
    })
    .from(recipesTable)
    .leftJoin(usersTable, eq(usersTable.id, recipesTable.id))
    .where(eq(recipesTable.author_id, userID));
  return recipes;
}
export async function insertUser(userData: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<UserDB | undefined> {
  const [settedUser] = await db.insert(usersTable).values(userData).returning();
  return settedUser;
}
export async function insertLocalUser(userData: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<UserDB | undefined> {
  const [settedUser] = await db.insert(usersTable).values(userData).returning();
  if (!settedUser) throw new Error("Failed insert user into usersTable");
  const [account] = await db
    .insert(localAccountsTable)
    .values({
      user_id: settedUser.id,
      password: userData.hashedPassword,
    })
    .returning();
  if (!account)
    throw new Error("Failed insert user's credentials into localAccountsTable");
  return settedUser;
}
export async function insertOauthUser(userData: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<UserDB | undefined> {
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
