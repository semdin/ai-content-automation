"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Image, Video, CheckCircle2, XCircle, Clock, Loader2, 
    RefreshCw, SkipForward, Play, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { WorkflowWithSteps, StepStatus, WorkflowStepType, ImageGenOutput, VideoGenOutput } from "@/modules/workflow/types";
import { approveStep, retryStep, skipStep, toggleAutoMode } from "@/modules/workflow/services";

interface WorkflowDiagramProps {
    workflow: WorkflowWithSteps;
    onUpdate: () => void;
}

const stepIcons: Record<WorkflowStepType, React.ReactNode> = {
    image_gen: <Image className="h-5 w-5" />,
    video_gen: <Video className="h-5 w-5" />,
    complete: <CheckCircle2 className="h-5 w-5" />,
};

const statusColors: Record<StepStatus, string> = {
    pending: "border-muted-foreground/30 bg-muted/50",
    running: "border-blue-500 bg-blue-500/10",
    completed: "border-green-500 bg-green-500/10",
    failed: "border-red-500 bg-red-500/10",
    skipped: "border-muted-foreground/50 bg-muted/30",
};

const statusTextColors: Record<StepStatus, string> = {
    pending: "text-muted-foreground",
    running: "text-blue-500",
    completed: "text-green-500",
    failed: "text-red-500",
    skipped: "text-muted-foreground",
};

export function WorkflowDiagram({ workflow, onUpdate }: WorkflowDiagramProps) {
    const [loading, setLoading] = useState(false);

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
    const currentStep = workflow.steps.find(s => s.stepIndex === workflow.currentStep);

    return (
        <div className="flex flex-col h-full">
            {/* Steps Diagram */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="relative">
                    {workflow.steps.map((step, index) => {
                        const isLast = index === workflow.steps.length - 1;
                        const output = step.output as ImageGenOutput | VideoGenOutput | null;
                        
                        return (
                            <div key={step.id} className="relative">
                                {/* Connector Line */}
                                {!isLast && (
                                    <div 
                                        className={cn(
                                            "absolute left-6 top-14 w-0.5 h-8",
                                            step.status === "completed" 
                                                ? "bg-green-500" 
                                                : "bg-muted-foreground/30"
                                        )}
                                    />
                                )}

                                {/* Step Node */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "relative flex gap-4 rounded-xl border-2 p-4 mb-4",
                                        statusColors[step.status]
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2",
                                        statusColors[step.status],
                                        statusTextColors[step.status]
                                    )}>
                                        {step.status === "running" ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            stepIcons[step.type]
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{step.name}</h4>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                statusColors[step.status],
                                                statusTextColors[step.status]
                                            )}>
                                                {step.status === "pending" && "Bekliyor"}
                                                {step.status === "running" && "Çalışıyor..."}
                                                {step.status === "completed" && "Tamamlandı"}
                                                {step.status === "failed" && "Başarısız"}
                                                {step.status === "skipped" && "Atlandı"}
                                            </span>
                                        </div>

                                        {/* Preview */}
                                        {step.status === "completed" && output && (
                                            <div className="mt-3">
                                                {"imageUrl" in output && (
                                                    <img
                                                        src={output.imageUrl}
                                                        alt="Generated"
                                                        className="h-24 w-24 rounded-lg object-cover border"
                                                    />
                                                )}
                                                {"videoUrl" in output && (
                                                    <video
                                                        src={output.videoUrl}
                                                        className="h-24 w-40 rounded-lg object-cover border"
                                                        muted
                                                        loop
                                                        playsInline
                                                        onMouseEnter={(e) => e.currentTarget.play()}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.pause();
                                                            e.currentTarget.currentTime = 0;
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Error */}
                                        {step.error && (
                                            <p className="mt-2 text-sm text-red-500">{step.error}</p>
                                        )}

                                        {/* Time */}
                                        {step.completedAt && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(step.completedAt).toLocaleTimeString("tr-TR")}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="border-t px-6 py-4 space-y-4">
                {/* Auto Mode Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="auto-mode" className="font-medium">Auto</Label>
                        <span className="text-xs text-muted-foreground">
                            Otomatik olarak sonraki adıma geç
                        </span>
                    </div>
                    <Switch
                        id="auto-mode"
                        checked={workflow.autoMode}
                        onCheckedChange={handleToggleAuto}
                        disabled={loading}
                    />
                </div>

                {/* Action Buttons (when paused) */}
                {isPaused && currentStep && (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleApprove}
                            disabled={loading}
                            className="flex-1 gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            Onayla & Devam Et
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleRetry}
                            disabled={loading}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            disabled={loading}
                        >
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Status when running */}
                {workflow.status === "running" && (
                    <div className="flex items-center justify-center gap-2 text-blue-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Çalışıyor...</span>
                    </div>
                )}

                {/* Status when completed */}
                {workflow.status === "completed" && (
                    <div className="flex items-center justify-center gap-2 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Tamamlandı!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
