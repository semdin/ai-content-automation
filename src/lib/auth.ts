/*
 * Better Auth Configuration
 * Server-side auth instance with Drizzle adapter
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),

    // Email & Password authentication
    emailAndPassword: {
        enabled: true,
    },

    // Social providers
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});

// Export type for client
export type Auth = typeof auth;
