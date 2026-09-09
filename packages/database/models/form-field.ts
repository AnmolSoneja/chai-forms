import { jsonb, pgTable, timestamp, uuid, varchar, text, pgEnum, boolean, numeric } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum("field_type_enum", [
    "SHORT_TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT", "YES_NO", "PASSWORD", "RATING", "DATE"
]) 

export const formFieldsTable = pgTable("form_fields", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(()=> formsTable.id),

    label: varchar("label", {length:100}).notNull(),
    labelKey: varchar("label_key", {length:100}).notNull(),

    description: text("description"),

    placeholder: text("placeholder"),
    isRequired: boolean("is_required").default(false).notNull(),

    index: numeric("index").notNull(),
    type: fieldTypeEnum("type").notNull(),

    options: jsonb("options").$type<string[]>().default([]).notNull(),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}); 