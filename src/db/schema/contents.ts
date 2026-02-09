import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { user } from "./auth";
import { workflows } from "./workflows";

export const contents = pgTable("contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workflowId: uuid("workflow_id")
    .references(() => workflows.id, { onDelete: "set null" }),

  // Configuration
  platform: text("platform").notNull(), 
  format: text("format").notNull(), // photo | video
  prompt: text("prompt").notNull(), 
  aspectRatio: text("aspect_ratio"), // 1:1 | 9:16 | 16:9
  
  // Fal.ai Integration
  falRequestId: text("fal_request_id"),
  falImageUrl: text("fal_image_url"),
  falVideoUrl: text("fal_video_url"), // NEW: for video content
  
  // Generated Metadata
  generatedCaption: text("generated_caption"),
  generatedHashtags: text("generated_hashtags"),
  
  status: text("status").notNull().default("draft"), // draft, generating, completed, failed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
