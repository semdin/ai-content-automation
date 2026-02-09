"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    PlusCircle, Sparkles, Loader2, Play, 
    ImageIcon, Video, Camera
} from "lucide-react";
import Link from "next/link";
import { fetchContents } from "./actions";
import { useActiveBrand } from "@/contexts/active-brand-context";
import { useWorkflow } from "@/contexts/workflow-context";
import { Content } from "@/db/schema/contents";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "photo" | "video";

const formatConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    photo: {
        icon: <Camera className="h-3.5 w-3.5" />,
        label: "Fotoğraf",
        color: "from-violet-500 to-purple-600",
    },
    video: {
        icon: <Video className="h-3.5 w-3.5" />,
        label: "Video",
        color: "from-pink-500 to-orange-500",
    },
};

export default function ContentDashboardPage() {
    const { activeBrandId } = useActiveBrand();
    const { openWorkflowById } = useWorkflow();
    const [contentList, setContentList] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

    useEffect(() => {
        setLoading(true);
        fetchContents(activeBrandId || undefined)
            .then(setContentList)
            .finally(() => setLoading(false));
    }, [activeBrandId]);

    const isVideo = (content: Content) => {
        return content.format === "video" || !!content.falVideoUrl;
    };

    const filteredList = activeFilter === "all" 
        ? contentList 
        : contentList.filter(c => {
            if (activeFilter === "video") return isVideo(c);
            return !isVideo(c);
        });

    const photoCount = contentList.filter(c => !isVideo(c)).length;
    const videoCount = contentList.filter(c => isVideo(c)).length;

    const handleContentClick = (content: Content) => {
        if (content.workflowId) {
            openWorkflowById(content.workflowId);
        }
    };

    const filterTabs: { id: FilterTab; label: string; count: number }[] = [
        { id: "all", label: "Tümü", count: contentList.length },
        { id: "photo", label: "Fotoğraf", count: photoCount },
        { id: "video", label: "Video", count: videoCount },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">İçerik Stüdyosu</h1>
                        <p className="text-sm text-muted-foreground">
                            {contentList.length} içerik oluşturuldu
                        </p>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                    <Link href="/dashboard/content/create">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Yeni Oluştur
                    </Link>
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 border-b">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={cn(
                            "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
                            activeFilter === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )}
                    >
                        {tab.label}
                        <span className={cn(
                            "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                            activeFilter === tab.id
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">İçerikler yükleniyor...</p>
                    </div>
                </div>
            ) : filteredList.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 mb-4">
                            <Sparkles className="h-8 w-8 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {activeFilter === "all" 
                                ? "Henüz içerik üretilmedi" 
                                : `Henüz ${activeFilter === "photo" ? "fotoğraf" : "video"} üretilmedi`}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            AI destekli içerik oluşturma gücünü keşfedin ve ilk içeriğinizi oluşturun
                        </p>
                        <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600">
                            <Link href="/dashboard/content/create">
                                <Sparkles className="h-4 w-4 mr-2" />
                                İlk İçeriğinizi Oluşturun
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredList.map((content) => {
                        const fmt = formatConfig[isVideo(content) ? "video" : "photo"];
                        return (
                            <Card 
                                key={content.id} 
                                className={cn(
                                    "group overflow-hidden hover:shadow-lg transition-all duration-300",
                                    content.workflowId && "cursor-pointer"
                                )}
                                onClick={() => handleContentClick(content)}
                            >
                                {/* Media Preview */}
                                <div className="relative aspect-square bg-muted overflow-hidden">
                                    {isVideo(content) && content.falVideoUrl ? (
                                        <div className="relative h-full w-full">
                                            <video
                                                src={content.falVideoUrl}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                muted
                                                loop
                                                playsInline
                                                onMouseEnter={(e) => e.currentTarget.play()}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.pause();
                                                    e.currentTarget.currentTime = 0;
                                                }}
                                            />
                                            <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        </div>
                                    ) : content.falImageUrl ? (
                                        <img
                                            src={content.falImageUrl}
                                            alt={content.prompt}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Format Badge */}
                                    <div className="absolute top-2 left-2">
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-br text-white shadow-md text-xs font-medium",
                                            fmt.color
                                        )}>
                                            {fmt.icon}
                                            {fmt.label}
                                        </div>
                                    </div>

                                    {/* Aspect Ratio Badge */}
                                    {content.aspectRatio && (
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-black/60 text-white border-0">
                                                {content.aspectRatio}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <CardContent className="p-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                        {content.generatedCaption || content.prompt}
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                                        <span>{new Date(content.createdAt).toLocaleDateString("tr-TR")}</span>
                                        <span>{fmt.label}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
