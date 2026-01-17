"use server";

/*
 * Brands Services
 * All brand-related server actions and queries
 */

import { db } from "@/db";
import { brands, brandMannequins, mannequins, mannequinPhotos } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, and, inArray } from "drizzle-orm";
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

export async function getBrandWithMannequins(id: string) {
    const user = await getCurrentUser();
    const [brand] = await db
        .select()
        .from(brands)
        .where(and(eq(brands.id, id), eq(brands.userId, user.id)));

    if (!brand) return null;

    // Get associated mannequins
    const associations = await db
        .select({ mannequinId: brandMannequins.mannequinId })
        .from(brandMannequins)
        .where(eq(brandMannequins.brandId, id));

    const mannequinIds = associations.map((a) => a.mannequinId);

    let brandMannequinsList: { id: string; name: string; primaryPhotoUrl: string | null }[] = [];
    if (mannequinIds.length > 0) {
        const mannequinData = await db
            .select({ id: mannequins.id, name: mannequins.name })
            .from(mannequins)
            .where(inArray(mannequins.id, mannequinIds));

        // Get primary photos
        const photos = await db
            .select({
                mannequinId: mannequinPhotos.mannequinId,
                url: mannequinPhotos.url,
                isPrimary: mannequinPhotos.isPrimary,
            })
            .from(mannequinPhotos)
            .where(inArray(mannequinPhotos.mannequinId, mannequinIds));

        brandMannequinsList = mannequinData.map((m) => {
            const mPhotos = photos.filter((p) => p.mannequinId === m.id);
            const primaryPhoto = mPhotos.find((p) => p.isPrimary) || mPhotos[0];
            return {
                id: m.id,
                name: m.name,
                primaryPhotoUrl: primaryPhoto?.url || null,
            };
        });
    }

    return { ...brand, mannequins: brandMannequinsList };
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
