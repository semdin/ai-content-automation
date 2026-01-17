"use server";

/*
 * Brands Services
 * All brand-related server actions and queries
 */

import { db } from "@/db";
import { brands } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateBrandInput, UpdateBrandInput, BrandListItem } from "./types";

// ============ Queries ============

export async function getBrands() {
    const user = await getCurrentUser();
    return db.select().from(brands).where(eq(brands.userId, user.id));
}

export async function getBrandsForSwitcher(): Promise<BrandListItem[]> {
    const user = await getCurrentUser();
    return db
        .select({ id: brands.id, name: brands.name })
        .from(brands)
        .where(eq(brands.userId, user.id));
}

export async function getBrand(id: string) {
    const user = await getCurrentUser();
    const [brand] = await db
        .select()
        .from(brands)
        .where(and(eq(brands.id, id), eq(brands.userId, user.id)));
    return brand;
}

// ============ Mutations ============

export async function createBrand(input: CreateBrandInput) {
    const user = await getCurrentUser();
    const [brand] = await db
        .insert(brands)
        .values({
            userId: user.id,
            name: input.name.trim(),
            description: input.description?.trim(),
        })
        .returning();
    revalidatePath("/dashboard/brands");
    return brand;
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
    const user = await getCurrentUser();
    const [brand] = await db
        .update(brands)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(brands.id, id), eq(brands.userId, user.id)))
        .returning();
    revalidatePath("/dashboard/brands");
    return brand;
}

export async function deleteBrand(id: string) {
    const user = await getCurrentUser();
    await db
        .delete(brands)
        .where(and(eq(brands.id, id), eq(brands.userId, user.id)));
    revalidatePath("/dashboard/brands");
}
