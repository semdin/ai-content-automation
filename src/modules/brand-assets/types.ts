/*
 * Brand Assets Types
 */

export type { BrandAsset, AssetType, AssetCategory } from "@/db/schema/brand-assets";
export { assetTypes, assetCategories } from "@/db/schema/brand-assets";

export type CreateAssetInput = {
    brandId: string;
    name: string;
    type: "image" | "video" | "document" | "font";
    category: "logo" | "product" | "social" | "background" | "reference" | "other";
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
};

// Category labels for UI
export const categoryLabels: Record<string, string> = {
    logo: "Logo",
    product: "Ürün",
    social: "Sosyal Medya",
    background: "Arkaplan",
    reference: "Referans",
    other: "Diğer",
};
