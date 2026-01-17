/*
 * Upload Types
 */

export type UploadResult = {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
};

export type UploadOptions = {
    folder?: string;
    transformation?: {
        width?: number;
        height?: number;
        crop?: "fill" | "fit" | "scale" | "thumb";
    };
};
