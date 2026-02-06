"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image, Video, CheckCircle2, XCircle, Clock, Loader2, 
    RefreshCw, SkipForward, Play, X, ZoomIn, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WorkflowWithSteps, StepStatus, WorkflowStepType, ImageGenOutput, VideoGenOutput } from "@/modules/workflow/types";
import { approveStep, retryStep, skipStep, toggleAutoMode } from "@/modules/workflow/services";

interface WorkflowDiagramProps {
    workflow: WorkflowWithSteps;
    onUpdate: () => void;
}

const stepIcons: Record<WorkflowStepType, React.ReactNode> = {
    image_gen: <Image className="h-3.5 w-3.5" />,
    video_gen: <Video className="h-3.5 w-3.5" />,
    complete: <Check className="h-3.5 w-3.5" />,
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

    const handleRetry = async () => {
        setLoading(true);
        try {
            await retryStep(workflow.id);
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            await skipStep(workflow.id);
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

    const isPaused = workflow.status === "paused";

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
                {/* Top Controls - Auto Mode + Action Buttons */}
                <div className="flex items-center justify-center gap-6 px-6 py-4 shrink-0">
                    {/* Auto Mode Toggle */}
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
                    </div>

                    {/* Action Buttons (only when paused) */}
                    {isPaused && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                disabled={loading}
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Yeniden
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSkip}
                                disabled={loading}
                                className="border-zinc-700 hover:bg-zinc-800"
                            >
                                <SkipForward className="h-4 w-4 mr-1" />
                                Atla
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={loading}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                    <Play className="h-4 w-4 mr-1" />
                                )}
                                Onayla
                            </Button>
                        </div>
                    )}
                </div>

                {/* Horizontal Pipeline - Centered */}
                <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-x-auto">
                    <div className="flex items-center gap-0">
                        {workflow.steps.map((step, index) => {
                            const isLast = index === workflow.steps.length - 1;
                            const styles = statusStyles[step.status];
                            const output = step.output as ImageGenOutput | VideoGenOutput | null;
                            const hasPreview = step.status === "completed" && output;
                            
                            return (
                                <div key={step.id} className="flex items-center">
                                    {/* Step Card - Compact Design */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={cn(
                                            "relative rounded-xl border-2 overflow-hidden",
                                            styles.bg, styles.border, styles.glow,
                                            "transition-all duration-300",
                                            hasPreview ? "min-w-[160px]" : "min-w-[140px]"
                                        )}
                                    >
                                        {/* Header - Name + Status Icon */}
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                {step.status === "completed" && (
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                                                        <Check className="h-2.5 w-2.5 text-white" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-white">{step.name}</span>
                                            </div>
                                            {/* Small Icon - Top Right */}
                                            <div className={cn(
                                                "flex h-6 w-6 items-center justify-center rounded-lg",
                                                "bg-white/5 border border-white/10",
                                                styles.text
                                            )}>
                                                {step.status === "running" ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    stepIcons[step.type]
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-3">
                                            {/* Status for non-completed */}
                                            {step.status !== "completed" && (
                                                <div className={cn("text-xs font-medium text-center py-4", styles.text)}>
                                                    {step.status === "pending" && "Bekliyor..."}
                                                    {step.status === "running" && (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Çalışıyor</span>
                                                        </div>
                                                    )}
                                                    {step.status === "failed" && "Başarısız"}
                                                    {step.status === "skipped" && "Atlandı"}
                                                </div>
                                            )}

                                            {/* Large Preview */}
                                            {hasPreview && (
                                                <div className="relative group">
                                                    {"imageUrl" in output! && (
                                                        <button
                                                            onClick={() => setLightbox({ src: output!.imageUrl, type: "image" })}
                                                            className="relative block w-full rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                                                        >
                                                            <img
                                                                src={output!.imageUrl}
                                                                alt="Generated"
                                                                className="w-full h-28 object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <ZoomIn className="h-5 w-5 text-white" />
                                                            </div>
                                                        </button>
                                                    )}
                                                    {"videoUrl" in output! && (
                                                        <button
                                                            onClick={() => setLightbox({ src: output!.videoUrl, type: "video" })}
                                                            className="relative block w-full rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                                                        >
                                                            <video
                                                                src={output!.videoUrl}
                                                                className="w-full h-28 object-cover"
                                                                muted
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                                                                <Play className="h-8 w-8 text-white fill-white" />
                                                            </div>
                                                        </button>
                                                    )}
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
                                        <div className="flex items-center px-3">
                                            <div className={cn(
                                                "h-0.5 w-10",
                                                step.status === "completed" 
                                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-500/30" 
                                                    : "bg-zinc-700"
                                            )} />
                                            <div className={cn(
                                                "h-2 w-2 rounded-full -ml-1",
                                                step.status === "completed" 
                                                    ? "bg-emerald-500" 
                                                    : "bg-zinc-700"
                                            )} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
