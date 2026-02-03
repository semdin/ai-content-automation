import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { user } from "./auth";

export const contents = pgTable("contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Configuration
  platform: text("platform").notNull(), 
  format: text("format").notNull(),
  prompt: text("prompt").notNull(), 
  
  // Fal.ai Integration
  falRequestId: text("fal_request_id"),
  falImageUrl: text("fal_image_url"),
  
  // Generated Metadata
  generatedCaption: text("generated_caption"),
  generatedHashtags: text("generated_hashtags"),
  
  status: text("status").notNull().default("draft"), // draft, generating, completed, failed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
