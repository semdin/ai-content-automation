/*
 * Brands Types
 */

import type { Brand } from "@/db/schema";

export type { Brand };

export type CreateBrandInput = {
    name: string;
    description?: string;
};

export type UpdateBrandInput = {
    name?: string;
    description?: string;
    logoUrl?: string;
};

export type BrandListItem = {
    id: string;
    name: string;
};
