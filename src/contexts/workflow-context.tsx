"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { WorkflowIcon, WorkflowPanel } from "@/components/workflow";
import { getWorkflows } from "@/modules/workflow/services";
import type { Workflow } from "@/db/schema/workflows";

interface WorkflowContextType {
    triggerAnimation: () => void;
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
        // Poll for updates every 3 seconds
        const interval = setInterval(refreshWorkflows, 3000);
        return () => clearInterval(interval);
    }, [refreshWorkflows]);

    const triggerAnimation = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
            setIsPanelOpen(true);
        }, 500);
        refreshWorkflows();
    };

    const openPanel = () => setIsPanelOpen(true);
    
    // Toggle: close if open, open if closed
    const togglePanel = () => setIsPanelOpen(prev => !prev);

    return (
        <WorkflowContext.Provider value={{ triggerAnimation, openPanel, togglePanel, refreshWorkflows }}>
            {children}
            <WorkflowIcon
                runningCount={runningCount}
                pendingCount={pendingCount}
                completedCount={completedCount}
                onClick={togglePanel}
                isAnimating={isAnimating}
            />
            <WorkflowPanel
                isOpen={isPanelOpen}
                onClose={() => {
                    setIsPanelOpen(false);
                    refreshWorkflows();
                }}
            />
        </WorkflowContext.Provider>
    );
}
