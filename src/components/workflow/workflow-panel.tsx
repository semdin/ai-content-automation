"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { WorkflowDiagram } from "./workflow-diagram";
import { getWorkflows, getWorkflow } from "@/modules/workflow/services";
import { Workflow } from "@/db/schema/workflows";
import { WorkflowWithSteps } from "@/modules/workflow/types";

interface WorkflowPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    paused: <Clock className="h-4 w-4 text-amber-500" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
};

export function WorkflowPanel({ isOpen, onClose }: WorkflowPanelProps) {
    const [workflowList, setWorkflowList] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithSteps | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadWorkflows();
        }
    }, [isOpen]);

    const loadWorkflows = async () => {
        setLoading(true);
        try {
            const data = await getWorkflows();
            setWorkflowList(data);
        } finally {
            setLoading(false);
        }
    };

    const selectWorkflow = async (id: string) => {
        setLoading(true);
        try {
            const workflow = await getWorkflow(id);
            setSelectedWorkflow(workflow);
        } finally {
            setLoading(false);
        }
    };

    const activeWorkflows = workflowList.filter(w => w.status === "running" || w.status === "paused");
    const historyWorkflows = workflowList.filter(w => w.status === "completed" || w.status === "failed");

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
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-2xl border bg-background shadow-2xl"
                        style={{ maxHeight: "80vh" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">Workflows</h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="h-[60vh]">
                            {selectedWorkflow ? (
                                <div className="h-full">
                                    <div className="flex items-center gap-2 border-b px-6 py-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedWorkflow(null)}
                                        >
                                            ← Geri
                                        </Button>
                                        <span className="text-sm font-medium">{selectedWorkflow.name}</span>
                                    </div>
                                    <WorkflowDiagram 
                                        workflow={selectedWorkflow} 
                                        onUpdate={() => selectWorkflow(selectedWorkflow.id)}
                                    />
                                </div>
                            ) : (
                                <Tabs defaultValue="active" className="h-full">
                                    <TabsList className="mx-6 mt-4">
                                        <TabsTrigger value="active">
                                            Aktif ({activeWorkflows.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="history">
                                            Geçmiş ({historyWorkflows.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="active" className="h-[calc(100%-60px)]">
                                        <ScrollArea className="h-full px-6 py-4">
                                            {loading ? (
                                                <div className="flex justify-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : activeWorkflows.length === 0 ? (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    Aktif workflow yok
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {activeWorkflows.map((workflow) => (
                                                        <WorkflowListItem
                                                            key={workflow.id}
                                                            workflow={workflow}
                                                            onClick={() => selectWorkflow(workflow.id)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </TabsContent>

                                    <TabsContent value="history" className="h-[calc(100%-60px)]">
                                        <ScrollArea className="h-full px-6 py-4">
                                            {historyWorkflows.length === 0 ? (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    Geçmiş workflow yok
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {historyWorkflows.map((workflow) => (
                                                        <WorkflowListItem
                                                            key={workflow.id}
                                                            workflow={workflow}
                                                            onClick={() => selectWorkflow(workflow.id)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function WorkflowListItem({ workflow, onClick }: { workflow: Workflow; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
            )}
        >
            {statusIcons[workflow.status]}
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{workflow.name}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(workflow.createdAt).toLocaleString("tr-TR")}
                </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
    );
}
