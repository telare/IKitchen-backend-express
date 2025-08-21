import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || typeof DATABASE_URL !== "string")
  throw new Error("Unvalid DATABASE_URL");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/drizzle/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
