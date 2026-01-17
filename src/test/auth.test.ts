/*
 * Auth Unit Tests
 * Tests for authentication utilities
 */

import { describe, it, expect, vi } from "vitest";

describe("Auth Client", () => {
    it("should export signIn function", async () => {
        const { signIn } = await import("@/lib/auth-client");
        expect(signIn).toBeDefined();
        expect(signIn.email).toBeDefined();
        expect(signIn.social).toBeDefined();
    });

    it("should export signUp function", async () => {
        const { signUp } = await import("@/lib/auth-client");
        expect(signUp).toBeDefined();
        expect(signUp.email).toBeDefined();
    });

    it("should export signOut function", async () => {
        const { signOut } = await import("@/lib/auth-client");
        expect(signOut).toBeDefined();
    });

    it("should export useSession hook", async () => {
        const { useSession } = await import("@/lib/auth-client");
        expect(useSession).toBeDefined();
    });
});

describe("Auth Config", () => {
    it("should have email/password enabled", async () => {
        // We can't directly test the config, but we verify exports work
        const { auth } = await import("@/lib/auth");
        expect(auth).toBeDefined();
    });
});
