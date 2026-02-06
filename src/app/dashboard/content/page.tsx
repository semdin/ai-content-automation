"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Sparkles, Instagram, Youtube, Video, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { fetchContents } from "./actions";
import { useActiveBrand } from "@/contexts/active-brand-context";
import { Content } from "@/db/schema/contents";

const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    tiktok: <Video className="h-4 w-4" />,
    reels: <Video className="h-4 w-4" />,
};

export default function ContentDashboardPage() {
    const { activeBrandId } = useActiveBrand();
    const [contentList, setContentList] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchContents(activeBrandId || undefined)
            .then(setContentList)
            .finally(() => setLoading(false));
    }, [activeBrandId]);

    const isVideo = (content: Content) => {
        return content.format === "video" || !!content.falVideoUrl;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">İçerik Stüdyosu</h1>
                    <p className="text-muted-foreground">
                        Fal.ai destekli sosyal medya içerikleri oluşturun ve yönetin.
                    </p>
                </div>
                <Link href="/dashboard/content/create">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Yeni Oluştur
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : contentList.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50">
                    <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mb-2 text-lg font-semibold">Henüz içerik üretilmedi</h3>
                    <p className="text-muted-foreground">Yeni bir kampanya başlatarak AI gücünü keşfedin.</p>
                    <Link href="/dashboard/content/create" className="mt-4">
                        <Button variant="outline">İlk içeriğinizi oluşturun</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contentList.map((content) => (
                        <Card key={content.id} className="overflow-hidden">
                            <div className="relative aspect-square bg-muted">
                                {isVideo(content) && content.falVideoUrl ? (
                                    <div className="relative h-full w-full">
                                        <video
                                            src={content.falVideoUrl}
                                            className="h-full w-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                            onMouseEnter={(e) => e.currentTarget.play()}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5">
                                            <Play className="h-4 w-4 text-white fill-white" />
                                        </div>
                                    </div>
                                ) : content.falImageUrl ? (
                                    <img
                                        src={content.falImageUrl}
                                        alt={content.prompt}
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    {platformIcons[content.platform] || <Instagram className="h-4 w-4" />}
                                    <span className="text-sm font-medium capitalize">{content.platform}</span>
                                    <Badge variant="secondary" className="ml-auto">
                                        {content.format}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {content.generatedCaption || content.prompt}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(content.createdAt).toLocaleDateString("tr-TR")}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
