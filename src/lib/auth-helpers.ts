/*
 * Auth Helpers
 * Server-side authentication utilities
 */

import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

/**
 * Get current authenticated user or throw error
 */
export async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Unauthorized");
    return session.user;
}

/**
 * Get current session (user + session info)
 */
export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    const session = await auth.api.getSession({ headers: await headers() });
    return !!session;
}

/**
 * Get current active brand ID from cookie
 */
export async function getCurrentBrandId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("current_brand")?.value || null;
}
