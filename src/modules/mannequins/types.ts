/*
 * Mannequins Types
 */

import type { Mannequin, MannequinPhoto } from "@/db/schema";

export type { Mannequin, MannequinPhoto };

export type CreateMannequinInput = {
    name: string;
    birthYear?: number;
    heightCm?: number;
};

export type UpdateMannequinInput = Partial<CreateMannequinInput>;

export type MannequinWithPhotos = Mannequin & {
    photos: MannequinPhoto[];
};

export type MannequinWithBrands = Mannequin & {
    photos: MannequinPhoto[];
    brands: { id: string; name: string }[];
};

export type MannequinListItem = {
    id: string;
    name: string;
    primaryPhotoUrl: string | null;
};
