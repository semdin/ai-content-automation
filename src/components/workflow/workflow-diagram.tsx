"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image, Video, CheckCircle2, XCircle, Clock, Loader2, 
    Plus, Play, X, ZoomIn, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WorkflowWithSteps, StepStatus, WorkflowStepType, ImageGenOutput, VideoGenOutput } from "@/modules/workflow/types";
import { approveStep, generateVariant, selectVariant, toggleAutoMode } from "@/modules/workflow/services";

interface WorkflowDiagramProps {
    workflow: WorkflowWithSteps;
    onUpdate: () => void;
}

const stepIcons: Record<WorkflowStepType, React.ReactNode> = {
    image_gen: <Image className="h-4 w-4" />,
    video_gen: <Video className="h-4 w-4" />,
    complete: <Check className="h-4 w-4" />,
};

const statusStyles: Record<StepStatus, { bg: string; border: string; text: string; glow: string }> = {
    pending: { 
        bg: "bg-zinc-800/50", 
        border: "border-zinc-700", 
        text: "text-zinc-500",
        glow: ""
    },
    running: { 
        bg: "bg-blue-500/10", 
        border: "border-blue-500/50", 
        text: "text-blue-400",
        glow: "shadow-lg shadow-blue-500/20"
    },
    generating_variant: { 
        bg: "bg-violet-500/10", 
        border: "border-violet-500/50", 
        text: "text-violet-400",
        glow: "shadow-lg shadow-violet-500/20"
    },
    completed: { 
        bg: "bg-emerald-500/10", 
        border: "border-emerald-500/50", 
        text: "text-emerald-400",
        glow: ""
    },
    failed: { 
        bg: "bg-red-500/10", 
        border: "border-red-500/50", 
        text: "text-red-400",
        glow: "shadow-lg shadow-red-500/20"
    },
    skipped: { 
        bg: "bg-zinc-800/30", 
        border: "border-zinc-700/50", 
        text: "text-zinc-600",
        glow: ""
    },
};

// Independent Lightbox Component using Portal
function Lightbox({ 
    src, 
    type, 
    onClose 
}: { 
    src: string; 
    type: "image" | "video"; 
    onClose: () => void;
}) {
    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Use portal to render outside of any parent constraints
    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-6 right-6 h-12 w-12 text-white hover:bg-white/10 z-10 rounded-full"
            >
                <X className="h-7 w-7" />
            </Button>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center p-8"
                style={{ maxWidth: "95vw", maxHeight: "95vh" }}
            >
                {type === "image" ? (
                    <img 
                        src={src} 
                        alt="Preview" 
                        style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }}
                    />
                ) : (
                    <video 
                        src={src} 
                        controls 
                        autoPlay 
                        style={{ maxWidth: "95vw", maxHeight: "95vh" }}
                    />
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
}

// Step Card Component
function StepCard({ 
    step, 
    index, 
    workflow, 
    isLast,
    onApprove,
    onGenerateVariant,
    onSelectVariant,
    onLightbox,
    loading
}: {
    step: WorkflowWithSteps["steps"][0];
    index: number;
    workflow: WorkflowWithSteps;
    isLast: boolean;
    onApprove: () => void;
    onGenerateVariant: () => void;
    onSelectVariant: (stepIndex: number, variantIndex: number) => void;
    onLightbox: (src: string, type: "image" | "video") => void;
    loading: boolean;
}) {
    const styles = statusStyles[step.status];
    const output = step.output as ImageGenOutput | VideoGenOutput | null;
    const hasPreview = (step.status === "completed" || step.status === "generating_variant") && output;
    const isPaused = workflow.status === "paused";
    
    const showActions = isPaused && step.status === "completed" && 
        workflow.steps[index + 1]?.status === "pending";
    
    // Get all images/videos (original + variants)
    const allMedia: string[] = [];
    if (output) {
        if ("imageUrl" in output) allMedia.push(output.imageUrl);
        if ("videoUrl" in output) allMedia.push(output.videoUrl);
        if (output.variants) allMedia.push(...output.variants);
    }
    const selectedIdx = output?.selectedVariant ?? 0;
    
    const isImage = output && "imageUrl" in output;
    const isVideo = output && "videoUrl" in output;

    // Grid layout based on count
    const getGridClass = (count: number) => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count <= 4) return "grid-cols-2";
        return "grid-cols-3";
    };

    return (
        <div className="flex items-center">
            {/* Step Card - Bigger Design */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                    "relative rounded-2xl border-2 overflow-hidden",
                    styles.bg, styles.border, styles.glow,
                    "transition-all duration-300",
                    hasPreview && allMedia.length > 1 ? "w-[320px]" : hasPreview ? "w-[280px]" : "w-[220px]"
                )}
            >
                {/* Header - Name + Status Icon */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        {step.status === "completed" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                        <span className="text-sm font-semibold text-white">{step.name}</span>
                    </div>
                    <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg",
                        "bg-white/5 border border-white/10",
                        styles.text
                    )}>
                        {step.status === "running" || step.status === "generating_variant" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            stepIcons[step.type]
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4">
                    {/* Status for non-completed */}
                    {step.status !== "completed" && step.status !== "generating_variant" && (
                        <div className={cn("text-sm font-medium text-center py-12", styles.text)}>
                            {step.status === "pending" && "Bekliyor..."}
                            {step.status === "running" && (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Oluşturuluyor</span>
                                </div>
                            )}
                            {step.status === "failed" && "Başarısız"}
                            {step.status === "skipped" && "Atlandı"}
                        </div>
                    )}

                    {/* Generating variant status */}
                    {step.status === "generating_variant" && hasPreview && (
                        <div className="mb-3 text-center">
                            <div className="inline-flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Yeni varyant oluşturuluyor...
                            </div>
                        </div>
                    )}

                    {/* Grid Preview for variants */}
                    {hasPreview && allMedia.length > 0 && (
                        <div className={cn("grid gap-2", getGridClass(allMedia.length))}>
                            {allMedia.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onLightbox(url, isImage ? "image" : "video")}
                                    className={cn(
                                        "relative rounded-xl overflow-hidden transition-all group",
                                        "border-2",
                                        idx === selectedIdx 
                                            ? "border-emerald-500 ring-2 ring-emerald-500/30" 
                                            : "border-white/10 hover:border-white/30",
                                        allMedia.length === 1 ? "aspect-[4/5]" : "aspect-square"
                                    )}
                                >
                                    {isImage ? (
                                        <img
                                            src={url}
                                            alt={`Generated ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <video
                                                src={url}
                                                className="w-full h-full object-cover"
                                                muted
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Play className="h-6 w-6 text-white fill-white" />
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ZoomIn className="h-5 w-5 text-white" />
                                    </div>

                                    {/* Selected badge */}
                                    {idx === selectedIdx && allMedia.length > 1 && (
                                        <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                            ✓
                                        </div>
                                    )}

                                    {/* Click to select (for non-selected variants when paused) */}
                                    {showActions && idx !== selectedIdx && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectVariant(step.stepIndex, idx);
                                            }}
                                            className="absolute bottom-1.5 right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Seç
                                        </button>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons - On the card that just completed */}
                    {showActions && step.status === "completed" && (
                        <div className="flex flex-col gap-2 mt-4">
                            <Button
                                onClick={onApprove}
                                disabled={loading}
                                size="sm"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                    <Play className="h-4 w-4 mr-1" />
                                )}
                                Onayla & Devam
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGenerateVariant}
                                disabled={loading}
                                className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Bir Tane Daha
                            </Button>
                        </div>
                    )}

                    {/* Error */}
                    {step.error && (
                        <p className="text-xs text-red-400 truncate mt-2">
                            {step.error}
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Connector */}
            {!isLast && (
                <div className="flex items-center px-5">
                    <div className={cn(
                        "h-0.5 w-14",
                        step.status === "completed" 
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-500/30" 
                            : "bg-zinc-700"
                    )} />
                    <div className={cn(
                        "h-3.5 w-3.5 rounded-full -ml-1.5",
                        step.status === "completed" 
                            ? "bg-emerald-500" 
                            : "bg-zinc-700"
                    )} />
                </div>
            )}
        </div>
    );
}

export function WorkflowDiagram({ workflow, onUpdate }: WorkflowDiagramProps) {
    const [loading, setLoading] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; type: "image" | "video" } | null>(null);

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveStep(workflow.id);
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateVariant = async () => {
        setLoading(true);
        try {
            await generateVariant(workflow.id);
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVariant = async (stepIndex: number, variantIndex: number) => {
        setLoading(true);
        try {
            await selectVariant(workflow.id, stepIndex, variantIndex);
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAuto = async () => {
        setLoading(true);
        try {
            await toggleAutoMode(workflow.id, !workflow.autoMode);
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const handleLightbox = (src: string, type: "image" | "video") => {
        setLightbox({ src, type });
    };

    const isCompleted = workflow.status === "completed";
    const isFailed = workflow.status === "failed";
    const isFinished = isCompleted || isFailed;

    return (
        <>
            <AnimatePresence>
                {lightbox && (
                    <Lightbox 
                        src={lightbox.src} 
                        type={lightbox.type} 
                        onClose={() => setLightbox(null)} 
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col h-full">
                {/* Top Controls - Auto Mode (only for non-finished workflows) */}
                {!isFinished && (
                    <div className="flex items-center justify-center gap-6 px-6 py-4 shrink-0">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <Switch
                                id="auto-mode"
                                checked={workflow.autoMode}
                                onCheckedChange={handleToggleAuto}
                                disabled={loading}
                            />
                            <label htmlFor="auto-mode" className="text-sm font-medium text-white cursor-pointer">
                                Auto Mode
                            </label>
                            {workflow.autoMode && (
                                <span className="text-xs text-emerald-400 ml-1">Açık</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Horizontal Pipeline - Centered both horizontally and vertically */}
                <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-x-auto min-h-0">
                    <div className="flex items-center gap-0">
                        {workflow.steps.map((step, index) => (
                            <StepCard
                                key={step.id}
                                step={step}
                                index={index}
                                workflow={workflow}
                                isLast={index === workflow.steps.length - 1}
                                onApprove={handleApprove}
                                onGenerateVariant={handleGenerateVariant}
                                onSelectVariant={handleSelectVariant}
                                onLightbox={handleLightbox}
                                loading={loading}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
