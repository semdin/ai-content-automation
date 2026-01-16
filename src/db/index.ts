/*
 * Database Connection
 * It is the main entry point for the database connection.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Database connection URL
const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://ai_content_user:ai_content_pass_2026@localhost:5433/ai_content_automation";

// Drizzle instance
export const db = drizzle(connectionString, { schema });

// export
export * from "./schema";
