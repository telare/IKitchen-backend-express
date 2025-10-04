import { and, eq, or } from "drizzle-orm";
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

export async function findUser(userData: {
  name: string;
  email: string;
}): Promise<UserDB | undefined> {
  const user: UserDB[] | undefined = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.name, userData.name),
        eq(usersTable.email, userData.email)
      )
    );
  return user[0];
}

export async function findUserByID(id: string): Promise<UserDB | undefined> {
  const user: UserDB[] | undefined = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return user[0];
}

export async function findUserLocalAccount(
  userID: string
): Promise<LocalUser | undefined> {
  const [account] = await db
    .select({
      userID: localAccountsTable.userID,
      password: localAccountsTable.password,
    })
    .from(localAccountsTable)
    .where(eq(localAccountsTable.userID, userID));
  return account;
}

export async function findUserOauthAccount(
  userID: string,
  provider: string
): Promise<OauthUser | undefined> {
  const [account] = await db
    .select({
      userID: oauthAccountsTable.userID,
      provider: oauthAccountsTable.provider,
      providerAccountID: oauthAccountsTable.providerAccountID,
    })
    .from(oauthAccountsTable)
    .where(
      and(
        eq(oauthAccountsTable.userID, userID),
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
      recipeID: favoriteRecipesTable.recipeID,
    })
    .from(favoriteRecipesTable)
    .leftJoin(usersTable, eq(usersTable.id, favoriteRecipesTable.userID))
    .leftJoin(
      recipesTable,
      eq(recipesTable.authorID, favoriteRecipesTable.userID)
    )
    .where(eq(favoriteRecipesTable.userID, userID));
  return favoriteRecipes;
}
export async function findUserRecipes(userID: string) {
  const recipes = await db
    .select({
      recipeID: recipesTable.id,
    })
    .from(recipesTable)
    .leftJoin(usersTable, eq(usersTable.id, recipesTable.id))
    .where(eq(recipesTable.authorID, userID));
  return recipes;
}
export async function insertUser(userData: {
  name: string;
  email: string;
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
      userID: settedUser.id,
      password: userData.hashedPassword,
    })
    .returning();
  if (!account)
    throw new Error("Failed insert user's credentials into localAccountsTable");
  return settedUser;
}
export async function insertOauthUser(
  userData: OauthUser
): Promise<OauthUser | undefined> {
  const [settedUser] = await db
    .insert(oauthAccountsTable)
    .values({
      provider: userData.provider,
      providerAccountID: userData.providerAccountID,
      userID: userData.userID,
    })
    .returning();
  return settedUser;
}
export async function updateOauthUser(
  userData: OauthUser
): Promise<OauthUser | undefined> {
  const [settedUser] = await db
    .update(oauthAccountsTable)
    .set({
      provider: userData.provider,
      providerAccountID: userData.providerAccountID,
    })
    .where(eq(oauthAccountsTable.userID, userData.userID))
    .returning();
  return settedUser;
}

export async function insertUserFavoriteRecipe(
  recipeID: string,
  userID: string
) {
  const insertedFavoriteRecipe = await db
    .insert(favoriteRecipesTable)
    .values({ recipeID: recipeID, userID: userID })
    .returning();
  return insertedFavoriteRecipe[0];
}

export async function truncateUsersTable() {
  await db.delete(usersTable);
}
