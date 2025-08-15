import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: uuid()
        .primaryKey()
        .default(sql `gen_random_uuid()`),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
});
//# sourceMappingURL=schema.js.map