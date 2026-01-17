"use server";

/*
 * Brand Assets Services
 */

import { db } from "@/db";
import { brandAssets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateAssetInput, AssetCategory } from "./types";

// ============ Queries ============

export async function getAssetsByBrand(brandId: string) {
    return db
        .select()
        .from(brandAssets)
        .where(eq(brandAssets.brandId, brandId))
        .orderBy(brandAssets.createdAt);
}

export async function getAssetsByCategory(brandId: string, category: AssetCategory) {
    return db
        .select()
        .from(brandAssets)
        .where(
            and(
                eq(brandAssets.brandId, brandId),
                eq(brandAssets.category, category)
            )
        )
        .orderBy(brandAssets.createdAt);
}

export async function getAsset(id: string) {
    const [asset] = await db
        .select()
        .from(brandAssets)
        .where(eq(brandAssets.id, id));
    return asset || null;
}

// ============ Mutations ============

export async function createAsset(input: CreateAssetInput) {
    const [asset] = await db
        .insert(brandAssets)
        .values({
            brandId: input.brandId,
            name: input.name,
            type: input.type,
            category: input.category,
            url: input.url,
            publicId: input.publicId,
            width: input.width,
            height: input.height,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
        })
        .returning();

    revalidatePath("/dashboard/brands");
    return asset;
}

export async function deleteAsset(id: string) {
    await db.delete(brandAssets).where(eq(brandAssets.id, id));
    revalidatePath("/dashboard/brands");
}

export async function deleteAssetsByBrand(brandId: string) {
    await db.delete(brandAssets).where(eq(brandAssets.brandId, brandId));
    revalidatePath("/dashboard/brands");
}
