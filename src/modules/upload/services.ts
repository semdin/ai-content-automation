"use server";

/*
 * Upload Services
 * Cloudinary integration for file uploads
 */

import { v2 as cloudinary } from "cloudinary";
import type { UploadResult, UploadOptions } from "./types";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image from base64 data
 */
export async function uploadImage(
    base64Data: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const { folder = "mannequins", transformation } = options;

    const uploadOptions: Record<string, unknown> = {
        folder: `ai-content-automation/${folder}`,
        resource_type: "image",
    };

    if (transformation) {
        uploadOptions.transformation = {
            width: transformation.width,
            height: transformation.height,
            crop: transformation.crop || "fill",
        };
    }

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
    };
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

/**
 * Get optimized URL for an image (async to work as server action)
 */
export async function getOptimizedUrl(
    publicId: string,
    options: { width?: number; height?: number; quality?: number } = {}
): Promise<string> {
    return cloudinary.url(publicId, {
        fetch_format: "auto",
        quality: options.quality || "auto",
        width: options.width,
        height: options.height,
        crop: "fill",
    });
}
