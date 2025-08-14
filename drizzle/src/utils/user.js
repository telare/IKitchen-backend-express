import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema.js";
import { db } from "../index.js";

export async function getAllUsers() {
  const users = await db.select().from(usersTable);
  if (!users[0]) {
    throw new Error("No users are found in 'usersTable'");
  }
  return users;
}
export async function getUser(email) {
  if (!email) {
    throw new Error("Email argument was not provided");
  }
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (user[0]) {
    return user[0];
  }
}
export async function setUser(userData) {
  if (!userData) {
    throw new Error("Invalid user data");
  }
  const [settedUser] = await db.insert(usersTable).values(userData).returning();
  if (!settedUser) {
    throw new Error("An unexpected error happened during inserting a user");
  }
  return settedUser;
}
