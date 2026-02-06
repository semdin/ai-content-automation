"use server";

import { db } from "@/db";
import { workflows, workflowSteps, brandAssets, mannequinPhotos, contents } from "@/db/schema";
import { FAL_MODELS, fal } from "@/lib/fal";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ContentGenerationConfig, AspectRatio, VideoDuration } from "@/modules/content/types";
import { buildWorkflowSteps, WorkflowWithSteps, ImageGenOutput, VideoGenOutput } from "./types";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/modules/upload/services";

// ============ Core Generation Functions ============

async function runImageGeneration(prompt: string, imageUrls: string[], aspectRatio: AspectRatio) {
    console.log("Running image generation:", { prompt, aspectRatio, imageUrls });
    
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
        
        // Upload base64 to Cloudinary
        if (imageData.url?.startsWith("data:")) {
            const uploaded = await uploadImage(imageData.url, { folder: "generated-content" });
            return uploaded.url;
        }
        return imageData.url;
    }
    throw new Error("Image generation failed: no image returned");
}

async function runVideoGeneration(
    prompt: string, 
    startImageUrl: string, 
    aspectRatio: AspectRatio,
    duration: VideoDuration = "5"
) {
    console.log("Running video generation:", { prompt, aspectRatio, duration, startImageUrl });
    
    const result: any = await fal.subscribe(FAL_MODELS.VIDEO_GEN, {
        input: {
            prompt: prompt,
            start_image_url: startImageUrl,
            aspect_ratio: aspectRatio,
            duration: duration,
            generate_audio: false,
            negative_prompt: "blur, distort, and low quality",
            cfg_scale: 0.5
        },
        logs: true,
        onQueueUpdate: (update: any) => {
            if (update.status === "IN_PROGRESS" && update.logs) {
                update.logs.map((log: any) => log.message).forEach(console.log);
            }
        },
    });
    
    if (result.data?.video?.url) {
        return result.data.video.url;
    }
    throw new Error("Video generation failed: no video returned");
}

// ============ Workflow CRUD ============

export async function createWorkflow(config: ContentGenerationConfig, autoMode: boolean = true) {
    const user = await getCurrentUser();
    
    // Build workflow name from prompt
    const name = config.prompt.length > 30 
        ? config.prompt.substring(0, 30) + "..." 
        : config.prompt;
    
    // Create workflow
    const [workflow] = await db.insert(workflows).values({
        userId: user.id,
        brandId: config.brandId,
        name,
        config: config as any,
        autoMode,
        status: "pending",
        currentStep: 0,
    }).returning();
    
    // Build and insert steps
    const stepDefs = buildWorkflowSteps(config);
    for (let i = 0; i < stepDefs.length; i++) {
        await db.insert(workflowSteps).values({
            workflowId: workflow.id,
            stepIndex: i,
            type: stepDefs[i].type,
            name: stepDefs[i].name,
            status: "pending",
        });
    }
    
    console.log("Created workflow:", workflow.id);
    return workflow.id;
}

export async function getWorkflow(workflowId: string): Promise<WorkflowWithSteps | null> {
    const user = await getCurrentUser();
    
    const [workflow] = await db.select()
        .from(workflows)
        .where(and(eq(workflows.id, workflowId), eq(workflows.userId, user.id)));
    
    if (!workflow) return null;
    
    const steps = await db.select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, workflowId))
        .orderBy(workflowSteps.stepIndex);
    
    return {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status as any,
        autoMode: workflow.autoMode,
        currentStep: workflow.currentStep,
        createdAt: workflow.createdAt,
        completedAt: workflow.completedAt,
        steps: steps.map(s => ({
            id: s.id,
            stepIndex: s.stepIndex,
            type: s.type as any,
            name: s.name,
            status: s.status as any,
            output: s.output as any,
            error: s.error,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
        })),
    };
}

export async function getWorkflows() {
    const user = await getCurrentUser();
    
    return db.select()
        .from(workflows)
        .where(eq(workflows.userId, user.id))
        .orderBy(desc(workflows.createdAt));
}

// ============ Workflow Execution ============

export async function startWorkflow(workflowId: string) {
    // Update workflow status to running
    await db.update(workflows)
        .set({ status: "running" })
        .where(eq(workflows.id, workflowId));
    
    // Run the first step
    return runNextStep(workflowId);
}

export async function runNextStep(workflowId: string) {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStepIndex = workflow.currentStep;
    const step = workflow.steps.find(s => s.stepIndex === currentStepIndex);
    if (!step) throw new Error("Step not found");
    
    const config = (await db.select().from(workflows).where(eq(workflows.id, workflowId)))[0].config as ContentGenerationConfig;
    
    // Mark step as running
    await db.update(workflowSteps)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(workflowSteps.id, step.id));
    
    try {
        let output: ImageGenOutput | VideoGenOutput | null = null;
        
        if (step.type === "image_gen") {
            // Fetch asset URLs
            const assets = await db.select().from(brandAssets).where(eq(brandAssets.brandId, config.brandId));
            const assetUrls = assets.filter(a => config.assetIds.includes(a.id)).map(a => a.url);
            
            // Include mannequin if selected
            if (config.mannequinId) {
                const photos = await db.select()
                    .from(mannequinPhotos)
                    .where(eq(mannequinPhotos.mannequinId, config.mannequinId));
                const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
                if (primaryPhoto) assetUrls.push(primaryPhoto.url);
            }
            
            const imageUrl = await runImageGeneration(config.prompt, assetUrls, config.aspectRatio);
            output = { imageUrl };
            
        } else if (step.type === "video_gen") {
            // Get image from previous step
            const prevStep = workflow.steps.find(s => s.type === "image_gen");
            const imageUrl = (prevStep?.output as ImageGenOutput)?.imageUrl;
            if (!imageUrl) throw new Error("No image found from previous step");
            
            const videoUrl = await runVideoGeneration(
                config.prompt, 
                imageUrl, 
                config.aspectRatio,
                config.videoDuration || "5"
            );
            output = { videoUrl };
            
        } else if (step.type === "complete") {
            // Save to contents table
            const user = await getCurrentUser();
            const imageStep = workflow.steps.find(s => s.type === "image_gen");
            const videoStep = workflow.steps.find(s => s.type === "video_gen");
            
            await db.insert(contents).values({
                brandId: config.brandId,
                userId: user.id,
                platform: config.aspectRatio === "9:16" ? "reels" : "instagram",
                format: config.mediaType,
                prompt: config.prompt,
                aspectRatio: config.aspectRatio,
                falImageUrl: (imageStep?.output as ImageGenOutput)?.imageUrl,
                falVideoUrl: (videoStep?.output as VideoGenOutput)?.videoUrl,
                generatedCaption: config.prompt.substring(0, 100),
                generatedHashtags: "#moda #fashion #style",
                status: "completed",
            });
            
            revalidatePath("/dashboard/content");
        }
        
        // Mark step as completed
        await db.update(workflowSteps)
            .set({ 
                status: "completed", 
                output: output,
                completedAt: new Date() 
            })
            .where(eq(workflowSteps.id, step.id));
        
        // Move to next step
        const nextStepIndex = currentStepIndex + 1;
        const hasNextStep = workflow.steps.some(s => s.stepIndex === nextStepIndex);
        
        if (hasNextStep && step.type !== "complete") {
            await db.update(workflows)
                .set({ currentStep: nextStepIndex })
                .where(eq(workflows.id, workflowId));
            
            // If auto mode, continue to next step
            const [wf] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
            if (wf.autoMode) {
                return runNextStep(workflowId);
            } else {
                // Pause workflow, wait for approval
                await db.update(workflows)
                    .set({ status: "paused" })
                    .where(eq(workflows.id, workflowId));
            }
        } else {
            // Workflow completed
            await db.update(workflows)
                .set({ status: "completed", completedAt: new Date() })
                .where(eq(workflows.id, workflowId));
        }
        
        return getWorkflow(workflowId);
        
    } catch (error: any) {
        console.error("Step execution error:", error);
        
        // Mark step as failed
        await db.update(workflowSteps)
            .set({ status: "failed", error: error.message })
            .where(eq(workflowSteps.id, step.id));
        
        // Mark workflow as failed
        await db.update(workflows)
            .set({ status: "failed" })
            .where(eq(workflows.id, workflowId));
        
        return getWorkflow(workflowId);
    }
}

export async function approveStep(workflowId: string) {
    // Resume paused workflow and run next step
    await db.update(workflows)
        .set({ status: "running" })
        .where(eq(workflows.id, workflowId));
    
    return runNextStep(workflowId);
}

export async function retryStep(workflowId: string) {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStep = workflow.steps.find(s => s.stepIndex === workflow.currentStep);
    if (!currentStep) throw new Error("Step not found");
    
    // Reset step status
    await db.update(workflowSteps)
        .set({ status: "pending", error: null, output: null })
        .where(eq(workflowSteps.id, currentStep.id));
    
    // Run step again
    await db.update(workflows)
        .set({ status: "running" })
        .where(eq(workflows.id, workflowId));
    
    return runNextStep(workflowId);
}

export async function skipStep(workflowId: string) {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) throw new Error("Workflow not found");
    
    const currentStep = workflow.steps.find(s => s.stepIndex === workflow.currentStep);
    if (!currentStep) throw new Error("Step not found");
    
    // Mark as skipped
    await db.update(workflowSteps)
        .set({ status: "skipped", completedAt: new Date() })
        .where(eq(workflowSteps.id, currentStep.id));
    
    // Move to next
    const nextIdx = workflow.currentStep + 1;
    await db.update(workflows)
        .set({ currentStep: nextIdx, status: "running" })
        .where(eq(workflows.id, workflowId));
    
    return runNextStep(workflowId);
}

export async function toggleAutoMode(workflowId: string, autoMode: boolean) {
    await db.update(workflows)
        .set({ autoMode })
        .where(eq(workflows.id, workflowId));
    
    return getWorkflow(workflowId);
}
