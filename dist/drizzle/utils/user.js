import { eq } from "drizzle-orm";
import { usersTable } from "@drizzle/db/schema";
import { db } from "@drizzle/index";
export async function getAllUsers() {
    try {
        const users = await db.select().from(usersTable);
        if (!users[0]) {
            throw new Error("No users are found in 'usersTable'");
        }
        return users;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error("An unexpected error in setUser function:{error.message}");
        }
    }
}
export async function getUser(email) {
    if (!email) {
        throw new Error("Email argument was not provided");
    }
    try {
        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));
        return user[0];
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error("An unexpected error in setUser function:{error.message}");
        }
    }
}
export async function setUser(userData) {
    if (!userData) {
        throw new Error("Invalid user data");
    }
    try {
        const [settedUser] = await db
            .insert(usersTable)
            .values(userData)
            .returning();
        return settedUser;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error("An unexpected error in setUser function:{error.message}");
        }
    }
}
//# sourceMappingURL=user.js.map