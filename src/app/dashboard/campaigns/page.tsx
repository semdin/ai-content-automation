"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
    FolderOpen, Plus, Calendar, Target, Clock, Search,
    BarChart3, Image, ChevronRight, Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

type CampaignStatus = "draft" | "active" | "paused" | "completed";

interface Campaign {
    id: string;
    name: string;
    description: string;
    status: CampaignStatus;
    contentCount: number;
    createdAt: string;
    brand: string;
}

const statusConfig: Record<CampaignStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
    draft: { label: "Taslak", variant: "secondary", color: "text-muted-foreground" },
    active: { label: "Aktif", variant: "default", color: "text-emerald-500" },
    paused: { label: "Duraklatıldı", variant: "outline", color: "text-amber-500" },
    completed: { label: "Tamamlandı", variant: "secondary", color: "text-blue-500" },
};

// Mock data for now
const mockCampaigns: Campaign[] = [];

export default function CampaignsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

    const filteredCampaigns = mockCampaigns.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="mx-auto max-w-6xl space-y-8 py-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 text-white"
            >
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Kampanyalar</h1>
                            <p className="text-sm text-white/70">İçerik kampanyalarınızı planlayın ve yönetin</p>
                        </div>
                    </div>
                    <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0 gap-2">
                        <Plus className="h-4 w-4" />
                        Yeni Kampanya
                    </Button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: "Toplam", value: "0", icon: FolderOpen, color: "text-blue-500" },
                    { label: "Aktif", value: "0", icon: Target, color: "text-emerald-500" },
                    { label: "İçerik", value: "0", icon: Image, color: "text-violet-500" },
                    { label: "Bu Ay", value: "0", icon: Calendar, color: "text-amber-500" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-0 shadow-md shadow-black/5">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 flex-wrap"
            >
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Kampanya ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "active", "draft", "paused", "completed"] as const).map((status) => (
                        <Badge
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            className="cursor-pointer transition-all hover:scale-105"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "all" ? "Tümü" : statusConfig[status].label}
                        </Badge>
                    ))}
                </div>
            </motion.div>

            {/* Campaign Grid or Empty State */}
            {filteredCampaigns.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardContent className="py-20 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                                <Rocket className="h-10 w-10 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Henüz kampanya yok</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Kampanyalar ile içerik planlamanızı organize edin, birden fazla içeriği
                                gruplandırın ve performanslarını takip edin.
                            </p>
                            <Button className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25">
                                <Plus className="h-4 w-4" />
                                İlk Kampanyanızı Oluşturun
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map((campaign, idx) => {
                        const status = statusConfig[campaign.status];
                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                <Card className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-shadow cursor-pointer group">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                    {campaign.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">{campaign.brand}</p>
                                            </div>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {campaign.description}
                                        </p>
                                        <Separator />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Image className="h-3.5 w-3.5" />
                                                    {campaign.contentCount} içerik
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {campaign.createdAt}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
