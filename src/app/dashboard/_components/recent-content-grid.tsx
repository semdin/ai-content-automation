"use client";

import { Card } from "@/components/ui/card";
import { ImageIcon, CheckCircle2 } from "lucide-react";
import { useWorkflow } from "@/contexts/workflow-context";
import { Content } from "@/db/schema/contents";

interface RecentContentGridProps {
    contents: Content[];
}

export function RecentContentGrid({ contents }: RecentContentGridProps) {
    const { openWorkflowById } = useWorkflow();

    const handleClick = (content: Content) => {
        if (content.workflowId) {
            openWorkflowById(content.workflowId);
        }
    };

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {contents.map((content) => (
                <Card 
                    key={content.id} 
                    className={`overflow-hidden group ${content.workflowId ? "cursor-pointer" : ""}`}
                    onClick={() => handleClick(content)}
                >
                    <div className="aspect-square relative">
                        {content.falVideoUrl ? (
                            <video
                                src={content.falVideoUrl}
                                className="w-full h-full object-cover"
                                muted
                            />
                        ) : content.falImageUrl ? (
                            <img
                                src={content.falImageUrl}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
