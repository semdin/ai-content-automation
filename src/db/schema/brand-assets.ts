/*
 * Brand Assets Schema
 * Media assets for brands (images, videos, documents)
 */

import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { brands } from "./brands";

// Asset types
export const assetTypes = ["image", "video", "document", "font"] as const;
export type AssetType = (typeof assetTypes)[number];

// Asset categories
export const assetCategories = [
    "logo",       // Logo varyasyonları
    "product",    // Ürün görselleri
    "social",     // Sosyal medya materyalleri
    "background", // Arkaplan görselleri
    "reference",  // AI referans görselleri
    "other",      // Diğer
] as const;
export type AssetCategory = (typeof assetCategories)[number];

export const brandAssets = pgTable("brand_assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
        .notNull()
        .references(() => brands.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    type: text("type").notNull().$type<AssetType>(),
    category: text("category").notNull().$type<AssetCategory>(),

    // File info
    url: text("url").notNull(),
    publicId: text("public_id"), // Cloudinary public ID
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"), // bytes
    mimeType: text("mime_type"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type BrandAsset = typeof brandAssets.$inferSelect;
export type NewBrandAsset = typeof brandAssets.$inferInsert;
