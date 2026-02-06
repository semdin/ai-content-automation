"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkflowDiagram } from "./workflow-diagram";
import { getWorkflows, getWorkflow } from "@/modules/workflow/services";
import { Workflow } from "@/db/schema/workflows";
import { WorkflowWithSteps } from "@/modules/workflow/types";

interface WorkflowPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { 
        icon: <Clock className="h-3.5 w-3.5" />, 
        color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
        label: "Bekliyor"
    },
    running: { 
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, 
        color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
        label: "Çalışıyor"
    },
    paused: { 
        icon: <Clock className="h-3.5 w-3.5" />, 
        color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
        label: "Onay Bekliyor"
    },
    completed: { 
        icon: <CheckCircle2 className="h-3.5 w-3.5" />, 
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
        label: "Tamamlandı"
    },
    failed: { 
        icon: <XCircle className="h-3.5 w-3.5" />, 
        color: "text-red-400 bg-red-400/10 border-red-400/30",
        label: "Başarısız"
    },
};

export function WorkflowPanel({ isOpen, onClose }: WorkflowPanelProps) {
    const [workflowList, setWorkflowList] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithSteps | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"active" | "history">("active");

    const loadWorkflows = useCallback(async () => {
        try {
            const data = await getWorkflows();
            setWorkflowList(data);
        } catch (e) {
            console.error("Failed to fetch workflows:", e);
        }
    }, []);

    const loadSelectedWorkflow = useCallback(async (id: string) => {
        try {
            const workflow = await getWorkflow(id);
            setSelectedWorkflow(workflow);
        } catch (e) {
            console.error("Failed to fetch workflow:", e);
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            loadWorkflows().finally(() => setLoading(false));
        }
    }, [isOpen, loadWorkflows]);

    // Polling for updates
    useEffect(() => {
        if (!isOpen) return;
        
        const interval = setInterval(() => {
            loadWorkflows();
            if (selectedWorkflow) {
                loadSelectedWorkflow(selectedWorkflow.id);
            }
        }, 2000);
        
        return () => clearInterval(interval);
    }, [isOpen, selectedWorkflow, loadWorkflows, loadSelectedWorkflow]);

    const selectWorkflow = async (id: string) => {
        setLoading(true);
        await loadSelectedWorkflow(id);
        setLoading(false);
    };

    const activeWorkflows = workflowList.filter(w => 
        w.status === "running" || w.status === "paused" || w.status === "pending"
    );
    const historyWorkflows = workflowList.filter(w => 
        w.status === "completed" || w.status === "failed"
    );

    const displayList = activeTab === "active" ? activeWorkflows : historyWorkflows;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                    />

                    {/* Center Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div 
                            className={cn(
                                "relative w-full max-w-5xl overflow-hidden rounded-2xl",
                                "bg-gradient-to-br from-zinc-900/95 via-zinc-900/98 to-zinc-950/95",
                                "border border-white/10 shadow-2xl shadow-black/50",
                                "backdrop-blur-xl",
                                "min-h-[500px] max-h-[80vh]",
                                "flex flex-col"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0">
                                <div className="flex items-center gap-3">
                                    {selectedWorkflow && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => setSelectedWorkflow(null)}
                                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <h2 className="text-lg font-semibold text-white">
                                        {selectedWorkflow ? selectedWorkflow.name : "Workflows"}
                                    </h2>
                                    {selectedWorkflow && (
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                            statusConfig[selectedWorkflow.status]?.color
                                        )}>
                                            {statusConfig[selectedWorkflow.status]?.icon}
                                            {statusConfig[selectedWorkflow.status]?.label}
                                        </span>
                                    )}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={onClose}
                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {selectedWorkflow ? (
                                    <WorkflowDiagram 
                                        workflow={selectedWorkflow} 
                                        onUpdate={() => loadSelectedWorkflow(selectedWorkflow.id)}
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col">
                                        {/* Tabs */}
                                        <div className="flex gap-1 px-6 py-3 border-b border-white/5 shrink-0">
                                            <button
                                                onClick={() => setActiveTab("active")}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                    activeTab === "active"
                                                        ? "bg-white/10 text-white"
                                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                Aktif ({activeWorkflows.length})
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("history")}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                    activeTab === "history"
                                                        ? "bg-white/10 text-white"
                                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                Geçmiş ({historyWorkflows.length})
                                            </button>
                                        </div>

                                        {/* List */}
                                        <div className="flex-1 overflow-y-auto p-6">
                                            {loading ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                                                </div>
                                            ) : displayList.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                                    <Clock className="h-10 w-10 mb-3 opacity-50" />
                                                    <p>{activeTab === "active" ? "Aktif workflow yok" : "Geçmiş workflow yok"}</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                    {displayList.map((workflow) => (
                                                        <WorkflowCard
                                                            key={workflow.id}
                                                            workflow={workflow}
                                                            onClick={() => selectWorkflow(workflow.id)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function WorkflowCard({ workflow, onClick }: { workflow: Workflow; onClick: () => void }) {
    const config = statusConfig[workflow.status] || statusConfig.pending;
    
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative w-full text-left rounded-xl p-4",
                "bg-gradient-to-br from-white/5 to-white/[0.02]",
                "border border-white/10 hover:border-white/20",
                "transition-all duration-200"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{workflow.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                        {new Date(workflow.createdAt).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>
                <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0",
                    config.color
                )}>
                    {config.icon}
                </span>
            </div>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </motion.button>
    );
}
