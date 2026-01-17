/*
 * Brands Services Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/db", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    },
}));

vi.mock("@/lib/auth-helpers", () => ({
    getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth-helpers";

describe("Brands Services", () => {
    const mockUser = {
        id: "user-123",
        name: "Test User",
        email: "test@test.com",
    };

    const mockBrand = {
        id: "brand-123",
        userId: "user-123",
        name: "Test Brand",
        description: "Test Description",
        logoUrl: null,
        styleGuide: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    });

    describe("getBrands", () => {
        it("should return brands for authenticated user", async () => {
            vi.mocked(db.select().from).mockReturnValue({
                where: vi.fn().mockResolvedValue([mockBrand]),
            } as never);

            const { getBrands } = await import("@/modules/brands/services");
            const brands = await getBrands();

            expect(brands).toHaveLength(1);
            expect(brands[0].name).toBe("Test Brand");
        });

        it("should throw error for unauthenticated user", async () => {
            vi.mocked(getCurrentUser).mockRejectedValue(new Error("Unauthorized"));

            const { getBrands } = await import("@/modules/brands/services");

            await expect(getBrands()).rejects.toThrow("Unauthorized");
        });
    });

    describe("createBrand", () => {
        it("should create a brand with valid data", async () => {
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockBrand]),
                }),
            } as never);

            const { createBrand } = await import("@/modules/brands/services");
            const brand = await createBrand({
                name: "Test Brand",
                description: "Test Description",
            });

            expect(brand.name).toBe("Test Brand");
        });
    });

    describe("deleteBrand", () => {
        it("should delete brand for owner", async () => {
            vi.mocked(db.delete).mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            } as never);

            const { deleteBrand } = await import("@/modules/brands/services");

            await expect(deleteBrand("brand-123")).resolves.not.toThrow();
        });
    });
});
