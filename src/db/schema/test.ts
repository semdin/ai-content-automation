/*
 * Test Schema
 * Simple test table for verifying database connection
 */

import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const testTable = pgTable("test", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TestRecord = typeof testTable.$inferSelect;
export type NewTestRecord = typeof testTable.$inferInsert;
