"use server";

import { db } from "@/db";
import { contents, brandAssets, mannequinPhotos } from "@/db/schema";
import { FAL_MODELS, fal } from "@/lib/fal";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ContentGenerationConfig, AspectRatio } from "./types";
import { inArray, eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/modules/upload/services";

// Image Generation with Nano Banana Pro
async function generateImage(prompt: string, imageUrls: string[], aspectRatio: AspectRatio) {
    try {
        console.log("Generating with Nano Banana Pro:", { prompt, aspectRatio, imageUrls });

        const result: any = await fal.subscribe(FAL_MODELS.IMAGE_GEN, {
            input: {
                prompt: prompt,
                image_urls: imageUrls,
                aspect_ratio: aspectRatio,
                output_format: "png",
                resolution: "2K",
                sync_mode: false
            },
            logs: true,
            onQueueUpdate: (update: any) => {
                if (update.status === "IN_PROGRESS" && update.logs) {
                    update.logs.map((log: any) => log.message).forEach(console.log);
                }
            },
        });
        
        if (result.data?.images?.length > 0) {
            const imageData = result.data.images[0];
            
            // If it's a base64 data URI, upload to Cloudinary
            if (imageData.url?.startsWith("data:")) {
                console.log("Uploading base64 to Cloudinary...");
                const uploaded = await uploadImage(imageData.url, { 
                    folder: "generated-content" 
                });
                return uploaded.url;
            }
            
            return imageData.url;
        }
        return null;

    } catch (error) {
        console.error("Image Gen Error:", error);
        return null;
    }
}

// Simple caption/hashtag generator
function generateCaptionAndHashtags(userPrompt: string) {
    const hashtags = "#moda #fashion #style #trend #ootd";
    const caption = userPrompt.length > 100 
        ? userPrompt.substring(0, 100) + "..." 
        : userPrompt;
    
    return { caption, hashtags };
}

export async function generateContentFlow(config: ContentGenerationConfig) {
    const user = await getCurrentUser();
    
    // Fetch Assets
    const assets = await db.select().from(brandAssets).where(inArray(brandAssets.id, config.assetIds));
    if (assets.length === 0) throw new Error("No assets found");
    
    const assetUrls = assets.map(a => a.url);
    console.log("Starting generation with assets:", assetUrls);

    // Fetch Mannequin Photo if selected
    let mannequinUrl: string | null = null;
    if (config.mannequinId) {
        const photos = await db.select()
            .from(mannequinPhotos)
            .where(eq(mannequinPhotos.mannequinId, config.mannequinId));
        
        const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
        if (primaryPhoto) {
            mannequinUrl = primaryPhoto.url;
            console.log("Using mannequin:", mannequinUrl);
        }
    }

    // Combine all image URLs
    const allImageUrls = mannequinUrl ? [...assetUrls, mannequinUrl] : assetUrls;

    // Generate Image
    const generatedImageUrl = await generateImage(config.prompt, allImageUrls, config.aspectRatio);
    
    const { caption, hashtags } = generateCaptionAndHashtags(config.prompt);

    const results = [];

    if (generatedImageUrl) {
        const [savedContent] = await db.insert(contents).values({
            brandId: config.brandId,
            userId: user.id,
            platform: config.aspectRatio === "1:1" ? "instagram" : "reels", // Simplified
            format: config.mediaType,
            prompt: config.prompt,
            
            falImageUrl: generatedImageUrl,
            generatedCaption: caption,
            generatedHashtags: hashtags,
            
            status: "completed",
        }).returning();
        
        results.push(savedContent);
        console.log(`Generated content with ${config.aspectRatio} aspect ratio`);
    }
    
    revalidatePath("/dashboard/content");
    return results;
}

// Query to get all content for the current user, optionally filtered by brand
export async function getContents(brandId?: string) {
    const user = await getCurrentUser();
    
    if (brandId) {
        return db.select()
            .from(contents)
            .where(and(
                eq(contents.userId, user.id),
                eq(contents.brandId, brandId)
            ))
            .orderBy(desc(contents.createdAt));
    }
    
    return db.select()
        .from(contents)
        .where(eq(contents.userId, user.id))
        .orderBy(desc(contents.createdAt));
}
