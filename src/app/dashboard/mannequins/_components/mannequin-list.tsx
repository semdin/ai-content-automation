"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActiveBrand } from "@/contexts/active-brand-context";
import type { Mannequin } from "@/modules/mannequins/types";
import { cn } from "@/lib/utils";

type MannequinWithBrandIds = Mannequin & {
    primaryPhotoUrl: string | null;
    brandIds: string[];
};

interface MannequinListProps {
    mannequins: MannequinWithBrandIds[];
}

export function MannequinList({ mannequins }: MannequinListProps) {
    const { activeBrandId } = useActiveBrand();

    // Sort: mannequins belonging to active brand first
    const sortedMannequins = [...mannequins].sort((a, b) => {
        const aHasCurrentBrand = activeBrandId && a.brandIds.includes(activeBrandId);
        const bHasCurrentBrand = activeBrandId && b.brandIds.includes(activeBrandId);

        if (aHasCurrentBrand && !bHasCurrentBrand) return -1;
        if (!aHasCurrentBrand && bHasCurrentBrand) return 1;
        return 0;
    });

    if (sortedMannequins.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                        <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">Henüz manken yok</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        AI için model görsellerini ekleyerek başlayın
                    </p>
                    <Link 
                        href="/dashboard/mannequins/new"
                        className="text-sm text-primary hover:underline"
                    >
                        Yeni Manken Ekle →
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedMannequins.map((mannequin) => {
                const isInActiveBrand = activeBrandId && mannequin.brandIds.includes(activeBrandId);

                return (
                    <Link key={mannequin.id} href={`/dashboard/mannequins/${mannequin.id}`}>
                        <Card
                            className={cn(
                                "group overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300",
                                isInActiveBrand && "border-primary ring-2 ring-primary/20"
                            )}
                        >
                            {/* Photo */}
                            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                                {mannequin.primaryPhotoUrl ? (
                                    <img
                                        src={mannequin.primaryPhotoUrl}
                                        alt={mannequin.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="h-16 w-16 text-muted-foreground/30" />
                                    </div>
                                )}
                                {isInActiveBrand && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                            Aktif Marka
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{mannequin.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {mannequin.heightCm && `${mannequin.heightCm} cm`}
                                            {mannequin.heightCm && mannequin.birthYear && " • "}
                                            {mannequin.birthYear && `${new Date().getFullYear() - mannequin.birthYear} yaş`}
                                            {!mannequin.heightCm && !mannequin.birthYear && "Bilgi eklenmemiş"}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
