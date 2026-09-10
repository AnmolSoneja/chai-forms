import { boolean, pgTable, timestamp, uuid, varchar, text } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formsTable = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", {length: 50},).notNull(),
    description: varchar("description", {length: 300}),
    isPublished: boolean("is_published").default(false).notNull(),
    
    createdBy: uuid("created_by").references(()=>usersTable.id),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}); 