/*
 * Better Auth Client
 * Client-side auth hooks and methods for React
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export commonly used methods
export const { signIn, signUp, signOut, useSession } = authClient;
