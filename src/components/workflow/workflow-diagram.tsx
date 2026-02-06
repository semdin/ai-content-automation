"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image, Video, CheckCircle2, XCircle, Clock, Loader2, 
    Plus, Play, X, ZoomIn, Check, ChevronLeft, ChevronRight
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

// Lightbox Component
function Lightbox({ 
    src, 
    type, 
    onClose 
}: { 
    src: string; 
    type: "image" | "video"; 
    onClose: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 text-white hover:bg-white/10 z-10"
            >
                <X className="h-6 w-6" />
            </Button>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl"
            >
                {type === "image" ? (
                    <img src={src} alt="Preview" className="max-w-full max-h-[85vh] object-contain" />
                ) : (
                    <video 
                        src={src} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-[85vh]"
                    />
                )}
            </motion.div>
        </motion.div>
    );
}

// Step Card Component (to properly use hooks)
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
    const [currentViewIdx, setCurrentViewIdx] = useState(selectedIdx);

    // Reset view index when variants change
    useEffect(() => {
        setCurrentViewIdx(selectedIdx);
    }, [selectedIdx, allMedia.length]);
    
    const isImage = output && "imageUrl" in output;
    const isVideo = output && "videoUrl" in output;

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
                    hasPreview ? "w-[260px]" : "w-[200px]"
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
                        <div className={cn("text-sm font-medium text-center py-10", styles.text)}>
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

                    {/* Preview with variant navigation */}
                    {hasPreview && allMedia.length > 0 && (
                        <div className="relative group">
                            {/* Media display */}
                            {isImage && (
                                <button
                                    onClick={() => onLightbox(allMedia[currentViewIdx], "image")}
                                    className={cn(
                                        "relative block w-full rounded-xl overflow-hidden transition-all",
                                        "border-2",
                                        currentViewIdx === selectedIdx 
                                            ? "border-emerald-500" 
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <img
                                        src={allMedia[currentViewIdx]}
                                        alt="Generated"
                                        className="w-full h-44 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ZoomIn className="h-6 w-6 text-white" />
                                    </div>
                                    {currentViewIdx === selectedIdx && allMedia.length > 1 && (
                                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                            Seçili
                                        </div>
                                    )}
                                </button>
                            )}
                            {isVideo && (
                                <button
                                    onClick={() => onLightbox(allMedia[currentViewIdx], "video")}
                                    className={cn(
                                        "relative block w-full rounded-xl overflow-hidden transition-all",
                                        "border-2",
                                        currentViewIdx === selectedIdx 
                                            ? "border-emerald-500" 
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <video
                                        src={allMedia[currentViewIdx]}
                                        className="w-full h-44 object-cover"
                                        muted
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                                        <Play className="h-10 w-10 text-white fill-white" />
                                    </div>
                                    {currentViewIdx === selectedIdx && allMedia.length > 1 && (
                                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                            Seçili
                                        </div>
                                    )}
                                </button>
                            )}

                            {/* Variant navigation */}
                            {allMedia.length > 1 && (
                                <div className="flex items-center justify-between mt-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentViewIdx(Math.max(0, currentViewIdx - 1))}
                                        disabled={currentViewIdx === 0}
                                        className="h-7 w-7"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs text-zinc-400">
                                        {currentViewIdx + 1} / {allMedia.length}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentViewIdx(Math.min(allMedia.length - 1, currentViewIdx + 1))}
                                        disabled={currentViewIdx === allMedia.length - 1}
                                        className="h-7 w-7"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Select this variant (if viewing non-selected) */}
                            {showActions && allMedia.length > 1 && currentViewIdx !== selectedIdx && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSelectVariant(step.stepIndex, currentViewIdx)}
                                    disabled={loading}
                                    className="w-full mt-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Bunu Seç
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Action Buttons - On the card that just completed */}
                    {showActions && step.status === "completed" && (
                        <div className="flex flex-col gap-2 mt-3">
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
                <div className="flex items-center px-4">
                    <div className={cn(
                        "h-0.5 w-12",
                        step.status === "completed" 
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-500/30" 
                            : "bg-zinc-700"
                    )} />
                    <div className={cn(
                        "h-3 w-3 rounded-full -ml-1.5",
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

                {/* Horizontal Pipeline - Centered */}
                <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-x-auto">
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
