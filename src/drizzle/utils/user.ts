import { eq } from "drizzle-orm";
import { usersTable } from "@drizzle/db/schema";
import { db } from "@drizzle/index";
import { User, UserDB } from "@shared/types/user";

export async function getAllUsers(): Promise<UserDB[] | undefined> {
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
export async function getUser(email: string): Promise<UserDB | undefined> {
  if (!email) {
    throw new Error("Email argument was not provided");
  }
  try {
    const user: UserDB[] | undefined = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user[0];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        "An unexpected error in setUser function:{error.message}"
      );
    }
  }
}
export async function setUser(userData: User): Promise<UserDB | undefined> {
  if (!userData) {
    throw new Error("Invalid user data");
  }
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
