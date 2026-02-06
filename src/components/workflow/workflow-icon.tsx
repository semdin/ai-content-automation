"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowIconProps {
    runningCount?: number;
    pendingCount?: number;
    completedCount?: number;
    onClick?: () => void;
    isAnimating?: boolean;
    isPanelOpen?: boolean;
}

export function WorkflowIcon({ 
    runningCount = 0, 
    pendingCount = 0,
    completedCount = 0,
    onClick, 
    isAnimating = false,
    isPanelOpen = false
}: WorkflowIconProps) {
    const hasActivity = runningCount > 0 || pendingCount > 0;
    
    // Don't show icon when panel is open (to prevent z-index issues)
    if (isPanelOpen) {
        return null;
    }
    
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.button
                onClick={onClick}
                className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600",
                    "shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40",
                    "transition-shadow duration-300",
                    "border border-white/20"
                )}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Active pulse rings */}
                {hasActivity && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                            animate={{
                                scale: [1, 1.4, 1.4],
                                opacity: [0.4, 0, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                            animate={{
                                scale: [1, 1.25, 1.25],
                                opacity: [0.3, 0, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: 0.6,
                            }}
                        />
                    </>
                )}

                {/* Icon */}
                <Sparkles className="h-6 w-6 text-white relative z-10" />

                {/* Running badge (blue - top right) */}
                <AnimatePresence>
                    {runningCount > 0 && (
                        <motion.div
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0 }}
                            className={cn(
                                "absolute -top-1 -right-1 flex items-center justify-center",
                                "h-5 min-w-5 px-1 rounded-full",
                                "bg-blue-500 text-white text-[10px] font-bold",
                                "border-2 border-zinc-900"
                            )}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="h-2.5 w-2.5 mr-0.5"
                            >
                                <svg viewBox="0 0 24 24" className="h-full w-full">
                                    <circle 
                                        cx="12" cy="12" r="10" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        fill="none"
                                        strokeDasharray="40 60"
                                    />
                                </svg>
                            </motion.div>
                            {runningCount}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pending badge (amber - top left) */}
                <AnimatePresence>
                    {pendingCount > 0 && (
                        <motion.div
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0 }}
                            className={cn(
                                "absolute -top-1 -left-1 flex items-center justify-center gap-0.5",
                                "h-5 min-w-5 px-1 rounded-full",
                                "bg-amber-500 text-white text-[10px] font-bold",
                                "border-2 border-zinc-900"
                            )}
                        >
                            <Clock className="h-2.5 w-2.5" />
                            {pendingCount}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completed indicator (green dot - bottom) */}
                <AnimatePresence>
                    {completedCount > 0 && !hasActivity && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={cn(
                                "absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center",
                                "h-4 px-1.5 rounded-full",
                                "bg-emerald-500 text-white text-[9px] font-bold",
                                "border-2 border-zinc-900"
                            )}
                        >
                            <CheckCircle2 className="h-2 w-2 mr-0.5" />
                            {completedCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Flying droplet animation - zig-zag, slower, enters icon */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ y: -200, x: -60, opacity: 1, scale: 1.5 }}
                        animate={{ 
                            y: [
                                -200,  // Start high
                                -160,  // Move down
                                -120,  // Continue
                                -80,   // Getting closer
                                -40,   // Almost there
                                0,     // Enter icon
                            ],
                            x: [
                                -60,   // Start left
                                40,    // Swing right
                                -30,   // Swing left
                                25,    // Swing right
                                -15,   // Swing left
                                0,     // Center
                            ],
                            opacity: [1, 1, 1, 1, 0.8, 0],
                            scale: [1.5, 1.3, 1.1, 0.9, 0.6, 0],
                        }}
                        transition={{ 
                            duration: 1.4,
                            ease: "easeInOut",
                            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        }}
                        className={cn(
                            "absolute top-0 left-1/2",
                            "h-6 w-6 rounded-full",
                            "bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500",
                            "shadow-lg shadow-cyan-400/60"
                        )}
                        style={{ translateX: "-50%" }}
                    >
                        {/* Inner glow */}
                        <div className="absolute inset-1 rounded-full bg-white/40" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
