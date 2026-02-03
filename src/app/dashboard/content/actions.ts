"use server";

import { getAssetsByBrand } from "@/modules/brand-assets/services";
import { getBrandWithMannequins } from "@/modules/brands/services";
import { generateContentFlow, getContents } from "@/modules/content/services"; 
import { ContentGenerationConfig } from "@/modules/content/types";

// --- Queries ---

export async function fetchBrandAssets(brandId: string) {
    return await getAssetsByBrand(brandId);
}

export async function fetchBrandMannequins(brandId: string) {
    const brand = await getBrandWithMannequins(brandId);
    return brand ? brand.mannequins : [];
}

export async function fetchContents(brandId?: string) {
    return await getContents(brandId);
}

// --- Mutations ---

export async function generateContentAction(config: ContentGenerationConfig) {
    try {
        const results = await generateContentFlow(config);
        return { success: true, count: results.length };
    } catch (error: any) {
        console.error("Generation Failed:", error);
        return { success: false, error: error.message };
    }
}
