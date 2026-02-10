"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Image, Video, CheckCircle2, XCircle, Clock, Loader2, 
    Plus, Play, X, ZoomIn, Check, FileText, User, Palette,
    ChevronDown, ChevronUp, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { WorkflowWithSteps, StepStatus, WorkflowStepType, ImageGenOutput, VideoGenOutput } from "@/modules/workflow/types";
import { approveStep, generateVariant, selectVariant, toggleAutoMode } from "@/modules/workflow/services";
import { ASPECT_RATIO_OPTIONS } from "@/modules/content/types";

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
    pending: { bg: "bg-zinc-800/50", border: "border-zinc-700", text: "text-zinc-500", glow: "" },
    running: { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-400", glow: "shadow-lg shadow-blue-500/20" },
    generating_variant: { bg: "bg-violet-500/10", border: "border-violet-500/50", text: "text-violet-400", glow: "shadow-lg shadow-violet-500/20" },
    completed: { bg: "bg-emerald-500/10", border: "border-emerald-500/50", text: "text-emerald-400", glow: "" },
    failed: { bg: "bg-red-500/10", border: "border-red-500/50", text: "text-red-400", glow: "shadow-lg shadow-red-500/20" },
    skipped: { bg: "bg-zinc-800/30", border: "border-zinc-700/50", text: "text-zinc-600", glow: "" },
};

const categoryLabels: Record<string, string> = {
    product: "Ürün", logo: "Logo", social: "Sosyal",
    background: "Arkaplan", reference: "Referans", other: "Diğer",
};

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ src, type, onClose }: { src: string; type: "image" | "video"; onClose: () => void }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
            <Button variant="ghost" size="icon"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-6 right-6 h-12 w-12 text-white hover:bg-white/10 z-10 rounded-full"
            >
                <X className="h-7 w-7" />
            </Button>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center p-8"
                style={{ maxWidth: "95vw", maxHeight: "95vh" }}
            >
                {type === "image" ? (
                    <img src={src} alt="Preview" style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }} />
                ) : (
                    <video src={src} controls autoPlay style={{ maxWidth: "95vw", maxHeight: "95vh" }} />
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
}

// ─── References Card ─────────────────────────────────────────────────────────

function ReferencesCard({ workflow, onLightbox }: { workflow: WorkflowWithSteps; onLightbox: (src: string, type: "image" | "video") => void }) {
    const [promptExpanded, setPromptExpanded] = useState(false);
    const config = workflow.config;
    const aspectLabel = ASPECT_RATIO_OPTIONS.find(a => a.id === config.aspectRatio)?.label || config.aspectRatio;
    const isPromptLong = config.prompt.length > 80;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/30 w-[280px] shrink-0"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                        <Palette className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">Referanslar</span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-amber-400">
                    <FileText className="h-3.5 w-3.5" />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Prompt */}
                <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Prompt</span>
                    <p className={cn("text-xs text-zinc-300 mt-1 leading-relaxed", !promptExpanded && isPromptLong && "line-clamp-2")}>
                        {config.prompt}
                    </p>
                    {isPromptLong && (
                        <button onClick={() => setPromptExpanded(!promptExpanded)}
                            className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 mt-1 transition-colors">
                            {promptExpanded
                                ? <><ChevronUp className="h-3 w-3" />Daralt</>
                                : <><ChevronDown className="h-3 w-3" />Tamamını Gör</>}
                        </button>
                    )}
                </div>

                {/* Format + Ratio */}
                <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Format</span>
                        <span className="text-xs text-zinc-300 font-medium">
                            {config.mediaType === "photo" ? "Fotoğraf" : "Video"}
                        </span>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Oran</span>
                        <span className="text-xs text-zinc-300 font-medium">{aspectLabel}</span>
                    </div>
                </div>

                {/* Asset thumbnails */}
                {workflow.referenceAssets.length > 0 && (
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5 block">
                            Referans Görseller ({workflow.referenceAssets.length})
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {workflow.referenceAssets.map((asset) => (
                                <button key={asset.id} onClick={() => onLightbox(asset.url, "image")}
                                    className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all aspect-square">
                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ZoomIn className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5">
                                        <span className="text-[8px] text-zinc-300 font-medium truncate block">
                                            {categoryLabels[asset.category] || asset.category}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mannequin */}
                {workflow.mannequinInfo && (
                    <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 flex items-center gap-2.5">
                        {workflow.mannequinInfo.photoUrl ? (
                            <button onClick={() => onLightbox(workflow.mannequinInfo!.photoUrl!, "image")}
                                className="h-8 w-8 rounded-full overflow-hidden border border-white/20 hover:border-amber-500/50 transition-all shrink-0">
                                <img src={workflow.mannequinInfo.photoUrl} alt={workflow.mannequinInfo.name} className="w-full h-full object-cover" />
                            </button>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-zinc-500" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Manken</span>
                            <span className="text-xs text-zinc-300 font-medium truncate block">{workflow.mannequinInfo.name}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Connectors ──────────────────────────────────────────────────────────────

function HorizontalConnector({ completed }: { completed: boolean }) {
    return (
        <div className="flex items-center px-3 shrink-0">
            <div className={cn("h-0.5 w-10", completed ? "bg-gradient-to-r from-emerald-500 to-emerald-500/30" : "bg-zinc-700")} />
            <div className={cn("h-3 w-3 rounded-full -ml-1", completed ? "bg-emerald-500" : "bg-zinc-700")} />
        </div>
    );
}

function VerticalConnector({ completed }: { completed: boolean }) {
    return (
        <div className="flex justify-center py-1">
            <div className="flex flex-col items-center">
                <div className={cn("h-3 w-3 rounded-full", completed ? "bg-emerald-500" : "bg-zinc-700")} />
                <div className={cn("w-0.5 h-8", completed ? "bg-gradient-to-b from-emerald-500 to-emerald-500/30" : "bg-zinc-700")} />
                <div className={cn("h-3 w-3 rounded-full", completed ? "bg-emerald-500/30" : "bg-zinc-700")} />
            </div>
        </div>
    );
}

// ─── Step Card ───────────────────────────────────────────────────────────────

function StepCard({ step, index, workflow, onApprove, onGenerateVariant, onSelectVariant, onLightbox, loading }: {
    step: WorkflowWithSteps["steps"][0]; index: number; workflow: WorkflowWithSteps;
    onApprove: () => void; onGenerateVariant: () => void;
    onSelectVariant: (stepIndex: number, variantIndex: number) => void;
    onLightbox: (src: string, type: "image" | "video") => void; loading: boolean;
}) {
    const styles = statusStyles[step.status];
    const output = step.output as ImageGenOutput | VideoGenOutput | null;
    const hasPreview = (step.status === "completed" || step.status === "generating_variant") && output;
    const isPaused = workflow.status === "paused";
    const showActions = isPaused && step.status === "completed" && workflow.steps[index + 1]?.status === "pending";

    const allMedia: string[] = [];
    if (output) {
        if ("imageUrl" in output) allMedia.push(output.imageUrl);
        if ("videoUrl" in output) allMedia.push(output.videoUrl);
        if (output.variants) allMedia.push(...output.variants);
    }
    const selectedIdx = output?.selectedVariant ?? 0;
    const isImage = output && "imageUrl" in output;

    const getGridClass = (count: number) => {
        if (count <= 1) return "grid-cols-1";
        if (count <= 4) return "grid-cols-2";
        return "grid-cols-3";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
            className={cn(
                "relative rounded-2xl border-2 overflow-hidden shrink-0",
                styles.bg, styles.border, styles.glow, "transition-all duration-300",
                hasPreview && allMedia.length > 1 ? "w-[320px]" : hasPreview ? "w-[280px]" : "w-[220px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {step.status === "completed" && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    )}
                    <span className="text-sm font-semibold text-white">{step.name}</span>
                </div>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10", styles.text)}>
                    {step.status === "running" || step.status === "generating_variant"
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : stepIcons[step.type]}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {step.status !== "completed" && step.status !== "generating_variant" && (
                    <div className={cn("text-sm font-medium text-center py-12", styles.text)}>
                        {step.status === "pending" && "Bekliyor..."}
                        {step.status === "running" && (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" /><span>Oluşturuluyor</span>
                            </div>
                        )}
                        {step.status === "failed" && "Başarısız"}
                        {step.status === "skipped" && "Atlandı"}
                    </div>
                )}

                {step.status === "generating_variant" && hasPreview && (
                    <div className="mb-3 text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                            <Loader2 className="h-3 w-3 animate-spin" />Yeni varyant oluşturuluyor...
                        </div>
                    </div>
                )}

                {hasPreview && allMedia.length > 0 && (
                    <div className={cn("grid gap-2", getGridClass(allMedia.length))}>
                        {allMedia.map((url, idx) => (
                            <button key={idx} onClick={() => onLightbox(url, isImage ? "image" : "video")}
                                className={cn(
                                    "relative rounded-xl overflow-hidden transition-all group border-2",
                                    idx === selectedIdx ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-white/10 hover:border-white/30",
                                    allMedia.length === 1 ? "aspect-[4/5]" : "aspect-square"
                                )}>
                                {isImage ? (
                                    <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <video src={url} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Play className="h-6 w-6 text-white fill-white" />
                                        </div>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <ZoomIn className="h-5 w-5 text-white" />
                                </div>
                                {idx === selectedIdx && allMedia.length > 1 && (
                                    <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">✓</div>
                                )}
                                {showActions && idx !== selectedIdx && (
                                    <button onClick={(e) => { e.stopPropagation(); onSelectVariant(step.stepIndex, idx); }}
                                        className="absolute bottom-1.5 right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Seç
                                    </button>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {showActions && step.status === "completed" && (
                    <div className="flex flex-col gap-2 mt-4">
                        <Button onClick={onApprove} disabled={loading} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                            Onayla & Devam
                        </Button>
                        <Button variant="outline" size="sm" onClick={onGenerateVariant} disabled={loading}
                            className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
                            <Plus className="h-4 w-4 mr-1" />Bir Tane Daha
                        </Button>
                    </div>
                )}

                {step.error && <p className="text-xs text-red-400 truncate mt-2">{step.error}</p>}
            </div>
        </motion.div>
    );
}

// ─── Pipeline Item Type ──────────────────────────────────────────────────────

type PipelineItem =
    | { kind: "references" }
    | { kind: "step"; step: WorkflowWithSteps["steps"][0]; index: number };

// ─── Main Diagram ────────────────────────────────────────────────────────────

export function WorkflowDiagram({ workflow, onUpdate }: WorkflowDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [itemsPerRow, setItemsPerRow] = useState(4);
    const [loading, setLoading] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; type: "image" | "video" } | null>(null);

    // Measure container and calculate items per row
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const width = entries[0].contentRect.width;
            // Each card ~280px + connector ~64px ≈ 344px per unit
            const perRow = Math.max(2, Math.floor(width / 340));
            setItemsPerRow(perRow);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleApprove = async () => {
        setLoading(true);
        try { await approveStep(workflow.id); onUpdate(); } finally { setLoading(false); }
    };
    const handleGenerateVariant = async () => {
        setLoading(true);
        try { await generateVariant(workflow.id); onUpdate(); } finally { setLoading(false); }
    };
    const handleSelectVariant = async (stepIndex: number, variantIndex: number) => {
        setLoading(true);
        try { await selectVariant(workflow.id, stepIndex, variantIndex); onUpdate(); } finally { setLoading(false); }
    };
    const handleToggleAuto = async () => {
        setLoading(true);
        try { await toggleAutoMode(workflow.id, !workflow.autoMode); onUpdate(); } finally { setLoading(false); }
    };
    const handleLightbox = (src: string, type: "image" | "video") => setLightbox({ src, type });

    const isCompleted = workflow.status === "completed";
    const isFailed = workflow.status === "failed";
    const isFinished = isCompleted || isFailed;

    // Build pipeline items
    const allItems: PipelineItem[] = [
        { kind: "references" },
        ...workflow.steps.map((step, index) => ({ kind: "step" as const, step, index })),
    ];

    // Split into rows
    const rows: PipelineItem[][] = [];
    for (let i = 0; i < allItems.length; i += itemsPerRow) {
        rows.push(allItems.slice(i, i + itemsPerRow));
    }

    // Check if the item before a given global index is completed (for connector styling)
    const isPrevCompleted = (globalIndex: number): boolean => {
        if (globalIndex === 0) return true; // references card is always "completed"
        const prev = allItems[globalIndex - 1];
        if (prev.kind === "references") return true;
        return prev.step.status === "completed";
    };

    // Get global index in allItems for an item
    const getGlobalIndex = (item: PipelineItem): number => {
        if (item.kind === "references") return 0;
        return item.index + 1;
    };

    // Render a pipeline item
    const renderItem = (item: PipelineItem) => {
        if (item.kind === "references") {
            return <ReferencesCard workflow={workflow} onLightbox={handleLightbox} />;
        }
        return (
            <StepCard
                step={item.step} index={item.index} workflow={workflow}
                onApprove={handleApprove} onGenerateVariant={handleGenerateVariant}
                onSelectVariant={handleSelectVariant} onLightbox={handleLightbox}
                loading={loading}
            />
        );
    };

    return (
        <>
            <AnimatePresence>
                {lightbox && <Lightbox src={lightbox.src} type={lightbox.type} onClose={() => setLightbox(null)} />}
            </AnimatePresence>

            <div className="flex flex-col h-full">
                {/* Auto Mode Controls */}
                {!isFinished && (
                    <div className="flex items-center justify-center gap-6 px-6 py-4 shrink-0">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <Switch id="auto-mode" checked={workflow.autoMode} onCheckedChange={handleToggleAuto} disabled={loading} />
                            <label htmlFor="auto-mode" className="text-sm font-medium text-white cursor-pointer">Auto Mode</label>
                            {workflow.autoMode && <span className="text-xs text-emerald-400 ml-1">Açık</span>}
                        </div>
                    </div>
                )}

                {/* Diagram - Rows with proper connectors */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <style>{`.diagram-scroll::-webkit-scrollbar { display: none; }`}</style>
                    <div className="diagram-scroll flex flex-col items-center px-8 py-8 min-h-full justify-center">
                        {rows.map((row, rowIndex) => (
                            <Fragment key={rowIndex}>
                                {/* Row of cards with horizontal connectors */}
                                <div className="flex items-center justify-center">
                                    {row.map((item, colIndex) => {
                                        const globalIdx = getGlobalIndex(item);
                                        const showConnectorBefore = colIndex > 0;

                                        return (
                                            <Fragment key={globalIdx}>
                                                {showConnectorBefore && (
                                                    <HorizontalConnector completed={isPrevCompleted(globalIdx)} />
                                                )}
                                                {renderItem(item)}
                                            </Fragment>
                                        );
                                    })}
                                </div>

                                {/* Vertical connector between rows */}
                                {rowIndex < rows.length - 1 && (
                                    <VerticalConnector
                                        completed={
                                            // The last item in this row determines connector color
                                            (() => {
                                                const lastItem = row[row.length - 1];
                                                if (lastItem.kind === "references") return true;
                                                return lastItem.step.status === "completed";
                                            })()
                                        }
                                    />
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
