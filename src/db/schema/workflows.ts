/*
 * Workflow Schema
 * Tracks content generation workflows and their steps
 */

import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { user } from "./auth";

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id")
    .references(() => brands.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  config: jsonb("config").notNull(), // Original generation config
  autoMode: boolean("auto_mode").default(true).notNull(),
  
  status: text("status").default("pending").notNull(), // pending, running, paused, completed, failed
  currentStep: integer("current_step").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  
  stepIndex: integer("step_index").notNull(),
  type: text("type").notNull(), // image_gen, video_gen, complete
  name: text("name").notNull(),
  
  status: text("status").default("pending").notNull(), // pending, running, completed, failed, skipped
  output: jsonb("output"), // Generated result { imageUrl, videoUrl, etc. }
  error: text("error"),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type NewWorkflowStep = typeof workflowSteps.$inferInsert;
