/*
 * Mannequins Schema
 * Model/mannequin definitions for brands
 */

import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { brands } from "./brands";

// Mannequins table
export const mannequins = pgTable("mannequins", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    birthYear: integer("birth_year"),
    heightCm: integer("height_cm"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mannequin photos table (multiple photos per mannequin)
export const mannequinPhotos = pgTable("mannequin_photos", {
    id: uuid("id").primaryKey().defaultRandom(),
    mannequinId: uuid("mannequin_id")
        .notNull()
        .references(() => mannequins.id, { onDelete: "cascade" }),

    url: text("url").notNull(),
    publicId: text("public_id"), // Cloudinary public ID for deletion
    width: integer("width"),
    height: integer("height"),
    isPrimary: boolean("is_primary").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Junction table for many-to-many relationship
export const brandMannequins = pgTable("brand_mannequins", {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
        .notNull()
        .references(() => brands.id, { onDelete: "cascade" }),
    mannequinId: uuid("mannequin_id")
        .notNull()
        .references(() => mannequins.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Mannequin = typeof mannequins.$inferSelect;
export type NewMannequin = typeof mannequins.$inferInsert;
export type MannequinPhoto = typeof mannequinPhotos.$inferSelect;
export type BrandMannequin = typeof brandMannequins.$inferSelect;
