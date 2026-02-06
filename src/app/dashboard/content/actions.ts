"use server";

import { getAssetsByBrand } from "@/modules/brand-assets/services";
import { getBrandWithMannequins } from "@/modules/brands/services";
import { generateContentFlow, getContents } from "@/modules/content/services"; 
import { ContentGenerationConfig } from "@/modules/content/types";
import { createWorkflow, startWorkflow, getWorkflow, getWorkflows } from "@/modules/workflow/services";

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

export async function fetchWorkflows() {
    return await getWorkflows();
}

export async function fetchWorkflow(workflowId: string) {
    return await getWorkflow(workflowId);
}

// --- Mutations ---

// Legacy direct generation (kept for backward compatibility)
export async function generateContentAction(config: ContentGenerationConfig) {
    try {
        const results = await generateContentFlow(config);
        return { success: true, count: results.length };
    } catch (error: any) {
        console.error("Generation Failed:", error);
        return { success: false, error: error.message };
    }
}

// New workflow-based generation
export async function startWorkflowAction(config: ContentGenerationConfig, autoMode: boolean = true) {
    try {
        const workflowId = await createWorkflow(config, autoMode);
        
        // Start the workflow in background (don't await)
        startWorkflow(workflowId).catch(e => console.error("Workflow error:", e));
        
        return { success: true, workflowId };
    } catch (error: any) {
        console.error("Workflow Creation Failed:", error);
        return { success: false, error: error.message };
    }
}
