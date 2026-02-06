"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { WorkflowIcon, WorkflowPanel } from "@/components/workflow";
import { getWorkflows } from "@/modules/workflow/services";
import type { Workflow } from "@/db/schema/workflows";

interface WorkflowContextType {
    triggerAnimation: () => void;
    openPanel: () => void;
    refreshWorkflows: () => void;
}

const WorkflowContext = createContext<WorkflowContextType>({
    triggerAnimation: () => {},
    openPanel: () => {},
    refreshWorkflows: () => {},
});

export const useWorkflow = () => useContext(WorkflowContext);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeCount, setActiveCount] = useState(0);

    const refreshWorkflows = useCallback(async () => {
        try {
            const workflows = await getWorkflows();
            const active = workflows.filter(
                (w: Workflow) => w.status === "running" || w.status === "paused"
            );
            setActiveCount(active.length);
        } catch (e) {
            console.error("Failed to fetch workflows:", e);
        }
    }, []);

    useEffect(() => {
        refreshWorkflows();
        // Poll for updates every 5 seconds
        const interval = setInterval(refreshWorkflows, 5000);
        return () => clearInterval(interval);
    }, [refreshWorkflows]);

    const triggerAnimation = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
            setIsPanelOpen(true);
        }, 600);
        refreshWorkflows();
    };

    const openPanel = () => setIsPanelOpen(true);

    return (
        <WorkflowContext.Provider value={{ triggerAnimation, openPanel, refreshWorkflows }}>
            {children}
            <WorkflowIcon
                activeCount={activeCount}
                onClick={() => setIsPanelOpen(true)}
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
