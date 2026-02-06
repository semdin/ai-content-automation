"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { WorkflowIcon, WorkflowPanel } from "@/components/workflow";
import { getWorkflows } from "@/modules/workflow/services";
import type { Workflow } from "@/db/schema/workflows";

interface WorkflowContextType {
    triggerAnimation: (workflowId?: string) => void;
    openPanel: () => void;
    togglePanel: () => void;
    refreshWorkflows: () => void;
}

const WorkflowContext = createContext<WorkflowContextType>({
    triggerAnimation: () => {},
    openPanel: () => {},
    togglePanel: () => {},
    refreshWorkflows: () => {},
});

export const useWorkflow = () => useContext(WorkflowContext);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [runningCount, setRunningCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    
    // Track ID of newly created workflow to open after animation (use state for reactivity)
    const [pendingWorkflowId, setPendingWorkflowId] = useState<string | null>(null);

    const refreshWorkflows = useCallback(async () => {
        try {
            const workflows = await getWorkflows();
            
            const running = workflows.filter((w: Workflow) => w.status === "running").length;
            const pending = workflows.filter((w: Workflow) => w.status === "paused").length;
            const completed = workflows.filter((w: Workflow) => w.status === "completed").length;
            
            setRunningCount(running);
            setPendingCount(pending);
            setCompletedCount(completed);
        } catch (e) {
            console.error("Failed to fetch workflows:", e);
        }
    }, []);

    useEffect(() => {
        refreshWorkflows();
        const interval = setInterval(refreshWorkflows, 3000);
        return () => clearInterval(interval);
    }, [refreshWorkflows]);

    // Trigger animation and optionally store workflow ID to open after
    const triggerAnimation = useCallback((workflowId?: string) => {
        if (workflowId) {
            setPendingWorkflowId(workflowId);
        }
        setIsAnimating(true);
        
        // Slower animation duration (1.5s) before opening panel
        setTimeout(() => {
            setIsAnimating(false);
            setIsPanelOpen(true);
        }, 1500);
        
        refreshWorkflows();
    }, [refreshWorkflows]);

    const openPanel = () => setIsPanelOpen(true);
    
    const togglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    // Handler for when panel closes
    const handlePanelClose = useCallback(() => {
        setIsPanelOpen(false);
        setPendingWorkflowId(null);
        refreshWorkflows();
    }, [refreshWorkflows]);

    return (
        <WorkflowContext.Provider value={{ triggerAnimation, openPanel, togglePanel, refreshWorkflows }}>
            {children}
            <WorkflowIcon
                runningCount={runningCount}
                pendingCount={pendingCount}
                completedCount={completedCount}
                onClick={togglePanel}
                isAnimating={isAnimating}
                isPanelOpen={isPanelOpen}
            />
            <WorkflowPanel
                isOpen={isPanelOpen}
                onClose={handlePanelClose}
                initialWorkflowId={pendingWorkflowId}
            />
        </WorkflowContext.Provider>
    );
}
