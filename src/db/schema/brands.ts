/*
 * Brands Schema
 * User's brand definitions
 */

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const brands = pgTable("brands", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),

    // Style guide (colors, tone, etc.) - JSON for flexibility
    styleGuide: text("style_guide"), // JSON string

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
