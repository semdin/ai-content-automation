"use server";

/*
 * Mannequins Services
 * All mannequin-related server actions and queries
 */

import { db } from "@/db";
import { mannequins, mannequinPhotos, brandMannequins, brands } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateMannequinInput, UpdateMannequinInput, MannequinListItem } from "./types";

// ============ Mannequin Queries ============

export async function getMannequins() {
    const user = await getCurrentUser();
    const mannequinList = await db
        .select()
        .from(mannequins)
        .where(eq(mannequins.userId, user.id));

    const mannequinIds = mannequinList.map((m) => m.id);

    // Get primary photos
    let photos: { mannequinId: string; url: string; isPrimary: boolean | null }[] = [];
    // Get brand associations
    let associations: { mannequinId: string; brandId: string }[] = [];

    if (mannequinIds.length > 0) {
        photos = await db
            .select({
                mannequinId: mannequinPhotos.mannequinId,
                url: mannequinPhotos.url,
                isPrimary: mannequinPhotos.isPrimary,
            })
            .from(mannequinPhotos)
            .where(inArray(mannequinPhotos.mannequinId, mannequinIds));

        associations = await db
            .select({
                mannequinId: brandMannequins.mannequinId,
                brandId: brandMannequins.brandId,
            })
            .from(brandMannequins)
            .where(inArray(brandMannequins.mannequinId, mannequinIds));
    }

    return mannequinList.map((m) => {
        const mPhotos = photos.filter((p) => p.mannequinId === m.id);
        const primaryPhoto = mPhotos.find((p) => p.isPrimary) || mPhotos[0];
        const brandIds = associations
            .filter((a) => a.mannequinId === m.id)
            .map((a) => a.brandId);
        return {
            ...m,
            primaryPhotoUrl: primaryPhoto?.url || null,
            brandIds,
        };
    });
}

export async function getMannequinsForSelect(): Promise<MannequinListItem[]> {
    const user = await getCurrentUser();
    const mannequinList = await db
        .select({ id: mannequins.id, name: mannequins.name })
        .from(mannequins)
        .where(eq(mannequins.userId, user.id));

    const mannequinIds = mannequinList.map((m) => m.id);
    let photos: { mannequinId: string; url: string; isPrimary: boolean | null }[] = [];

    if (mannequinIds.length > 0) {
        photos = await db
            .select({
                mannequinId: mannequinPhotos.mannequinId,
                url: mannequinPhotos.url,
                isPrimary: mannequinPhotos.isPrimary,
            })
            .from(mannequinPhotos)
            .where(inArray(mannequinPhotos.mannequinId, mannequinIds));
    }

    return mannequinList.map((m) => {
        const mPhotos = photos.filter((p) => p.mannequinId === m.id);
        const primaryPhoto = mPhotos.find((p) => p.isPrimary) || mPhotos[0];
        return {
            id: m.id,
            name: m.name,
            primaryPhotoUrl: primaryPhoto?.url || null,
        };
    });
}

export async function getMannequin(id: string) {
    const user = await getCurrentUser();
    const [mannequin] = await db
        .select()
        .from(mannequins)
        .where(and(eq(mannequins.id, id), eq(mannequins.userId, user.id)));

    if (!mannequin) return null;

    const photos = await db
        .select()
        .from(mannequinPhotos)
        .where(eq(mannequinPhotos.mannequinId, id));

    return { ...mannequin, photos };
}

export async function getMannequinWithBrands(id: string) {
    const user = await getCurrentUser();
    const [mannequin] = await db
        .select()
        .from(mannequins)
        .where(and(eq(mannequins.id, id), eq(mannequins.userId, user.id)));

    if (!mannequin) return null;

    // Get photos
    const photos = await db
        .select()
        .from(mannequinPhotos)
        .where(eq(mannequinPhotos.mannequinId, id));

    // Get associated brands
    const associations = await db
        .select({ brandId: brandMannequins.brandId })
        .from(brandMannequins)
        .where(eq(brandMannequins.mannequinId, id));

    const brandIds = associations.map((a) => a.brandId);

    let mannequinBrands: { id: string; name: string }[] = [];
    if (brandIds.length > 0) {
        mannequinBrands = await db
            .select({ id: brands.id, name: brands.name })
            .from(brands)
            .where(inArray(brands.id, brandIds));
    }

    return { ...mannequin, photos, brands: mannequinBrands };
}

// ============ Mannequin Mutations ============

export async function createMannequin(input: CreateMannequinInput) {
    const user = await getCurrentUser();
    const [mannequin] = await db
        .insert(mannequins)
        .values({
            userId: user.id,
            name: input.name.trim(),
            birthYear: input.birthYear,
            heightCm: input.heightCm,
        })
        .returning();
    revalidatePath("/dashboard/mannequins");
    return mannequin;
}

export async function updateMannequin(id: string, input: UpdateMannequinInput) {
    const user = await getCurrentUser();
    const [mannequin] = await db
        .update(mannequins)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(mannequins.id, id), eq(mannequins.userId, user.id)))
        .returning();
    revalidatePath("/dashboard/mannequins");
    return mannequin;
}

export async function deleteMannequin(id: string) {
    const user = await getCurrentUser();
    await db
        .delete(mannequins)
        .where(and(eq(mannequins.id, id), eq(mannequins.userId, user.id)));
    revalidatePath("/dashboard/mannequins");
}

// ============ Photo Management ============

export async function addMannequinPhoto(
    mannequinId: string,
    photoData: { url: string; publicId?: string; width?: number; height?: number; isPrimary?: boolean }
) {
    const [photo] = await db
        .insert(mannequinPhotos)
        .values({
            mannequinId,
            url: photoData.url,
            publicId: photoData.publicId,
            width: photoData.width,
            height: photoData.height,
            isPrimary: photoData.isPrimary || false,
        })
        .returning();
    revalidatePath("/dashboard/mannequins");
    return photo;
}

export async function deleteMannequinPhoto(photoId: string) {
    await db.delete(mannequinPhotos).where(eq(mannequinPhotos.id, photoId));
    revalidatePath("/dashboard/mannequins");
}

export async function setPrimaryPhoto(mannequinId: string, photoId: string) {
    // Remove primary from all photos
    await db
        .update(mannequinPhotos)
        .set({ isPrimary: false })
        .where(eq(mannequinPhotos.mannequinId, mannequinId));

    // Set new primary
    await db
        .update(mannequinPhotos)
        .set({ isPrimary: true })
        .where(eq(mannequinPhotos.id, photoId));

    revalidatePath("/dashboard/mannequins");
}

// ============ Brand-Mannequin Association ============

export async function getMannequinsByBrand(brandId: string) {
    const associations = await db
        .select({ mannequinId: brandMannequins.mannequinId })
        .from(brandMannequins)
        .where(eq(brandMannequins.brandId, brandId));

    const mannequinIds = associations.map((a) => a.mannequinId);

    if (mannequinIds.length === 0) return [];

    return db
        .select()
        .from(mannequins)
        .where(inArray(mannequins.id, mannequinIds));
}

export async function addMannequinToBrand(brandId: string, mannequinId: string) {
    const [existing] = await db
        .select()
        .from(brandMannequins)
        .where(
            and(
                eq(brandMannequins.brandId, brandId),
                eq(brandMannequins.mannequinId, mannequinId)
            )
        );

    if (existing) return existing;

    const [association] = await db
        .insert(brandMannequins)
        .values({ brandId, mannequinId })
        .returning();

    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/mannequins");
    return association;
}

export async function removeMannequinFromBrand(brandId: string, mannequinId: string) {
    await db
        .delete(brandMannequins)
        .where(
            and(
                eq(brandMannequins.brandId, brandId),
                eq(brandMannequins.mannequinId, mannequinId)
            )
        );
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/mannequins");
}

export async function updateBrandMannequins(brandId: string, mannequinIds: string[]) {
    await db.delete(brandMannequins).where(eq(brandMannequins.brandId, brandId));

    if (mannequinIds.length > 0) {
        await db.insert(brandMannequins).values(
            mannequinIds.map((mannequinId) => ({ brandId, mannequinId }))
        );
    }

    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/mannequins");
}

export async function updateMannequinBrands(mannequinId: string, brandIds: string[]) {
    await db.delete(brandMannequins).where(eq(brandMannequins.mannequinId, mannequinId));

    if (brandIds.length > 0) {
        await db.insert(brandMannequins).values(
            brandIds.map((brandId) => ({ brandId, mannequinId }))
        );
    }

    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/mannequins");
}
