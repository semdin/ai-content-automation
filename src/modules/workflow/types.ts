import { ContentGenerationConfig } from "@/modules/content/types";

// Workflow statuses
export type WorkflowStatus = "pending" | "running" | "paused" | "completed" | "failed";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "generating_variant";

// Step types
export type WorkflowStepType = "image_gen" | "video_gen" | "complete";

// Step output types - now support multiple variants
export interface ImageGenOutput {
    imageUrl: string;
    variants?: string[]; // Additional variant images
    selectedVariant?: number; // Index of selected variant (0 = original)
}

export interface VideoGenOutput {
    videoUrl: string;
    variants?: string[];
    selectedVariant?: number;
}

export type StepOutput = ImageGenOutput | VideoGenOutput | null;

// Step definition for building workflows
export interface StepDefinition {
    type: WorkflowStepType;
    name: string;
}

// Build workflow steps based on config
export function buildWorkflowSteps(config: ContentGenerationConfig): StepDefinition[] {
    const steps: StepDefinition[] = [];
    
    if (config.mediaType === "video") {
        // Video flow: Image → Video → Complete
        steps.push({
            type: "image_gen",
            name: "Görsel Oluştur",
        });
        steps.push({
            type: "video_gen", 
            name: "Video Oluştur",
        });
    } else {
        // Image flow: Image → Complete
        steps.push({
            type: "image_gen",
            name: "Görsel Oluştur",
        });
    }
    
    steps.push({
        type: "complete",
        name: "Tamamlandı",
    });
    
    return steps;
}

// Full workflow with steps for frontend
export interface WorkflowWithSteps {
    id: string;
    name: string;
    status: WorkflowStatus;
    autoMode: boolean;
    currentStep: number;
    createdAt: Date;
    completedAt: Date | null;
    steps: {
        id: string;
        stepIndex: number;
        type: WorkflowStepType;
        name: string;
        status: StepStatus;
        output: StepOutput;
        error: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
    }[];
}
