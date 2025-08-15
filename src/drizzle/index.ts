import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) throw new Error("Unexpected database URL from .env");

export const db = drizzle(DATABASE_URL);
