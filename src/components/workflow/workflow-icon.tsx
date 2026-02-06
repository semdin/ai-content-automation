"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowIconProps {
    activeCount?: number;
    onClick?: () => void;
    isAnimating?: boolean;
}

export function WorkflowIcon({ activeCount = 0, onClick, isAnimating = false }: WorkflowIconProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.button
                onClick={onClick}
                className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full",
                    "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500",
                    "shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40",
                    "transition-shadow"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Pulsing rings */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                    animate={{
                        scale: [1, 1.3, 1.3],
                        opacity: [0.5, 0, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                />
                
                {activeCount > 0 && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                        animate={{
                            scale: [1, 1.2, 1.2],
                            opacity: [0.3, 0, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.5,
                        }}
                    />
                )}

                {/* Icon */}
                <Sparkles className="h-6 w-6 text-white" />

                {/* Badge */}
                <AnimatePresence>
                    {activeCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
                        >
                            {activeCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Flying droplet animation */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ y: -100, x: 0, opacity: 1, scale: 1 }}
                        animate={{ 
                            y: 0, 
                            x: 0, 
                            opacity: 0,
                            scale: 0.2,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: 0.6,
                            ease: "easeIn",
                        }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
