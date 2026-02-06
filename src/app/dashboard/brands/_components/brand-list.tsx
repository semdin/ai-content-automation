"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags, ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useActiveBrand } from "@/contexts/active-brand-context";
import type { Brand } from "@/modules/brands/types";
import { cn } from "@/lib/utils";

interface BrandListProps {
    brands: Brand[];
}

// Generate consistent color from brand name
function getBrandColor(name: string): string {
    const colors = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-cyan-600",
        "from-emerald-500 to-teal-600",
        "from-orange-500 to-amber-600",
        "from-pink-500 to-rose-600",
        "from-indigo-500 to-blue-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export function BrandList({ brands }: BrandListProps) {
    const { activeBrandId } = useActiveBrand();

    // Sort: active brand first
    const sortedBrands = [...brands].sort((a, b) => {
        if (a.id === activeBrandId) return -1;
        if (b.id === activeBrandId) return 1;
        return 0;
    });

    if (sortedBrands.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                        <Tags className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">Henüz marka yok</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        İlk markanızı ekleyerek başlayın
                    </p>
                    <Link 
                        href="/dashboard/brands/new"
                        className="text-sm text-primary hover:underline"
                    >
                        Yeni Marka Ekle →
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedBrands.map((brand) => {
                const isActive = brand.id === activeBrandId;
                const color = getBrandColor(brand.name);
                
                return (
                    <Link key={brand.id} href={`/dashboard/brands/${brand.id}`}>
                        <Card
                            className={cn(
                                "group hover:shadow-lg hover:border-primary/50 transition-all duration-300",
                                isActive && "border-primary ring-2 ring-primary/20"
                            )}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Brand Avatar */}
                                    {brand.logoUrl ? (
                                        <img
                                            src={brand.logoUrl}
                                            alt={brand.name}
                                            className="h-14 w-14 rounded-xl object-cover ring-2 ring-border"
                                        />
                                    ) : (
                                        <div className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold text-xl",
                                            color
                                        )}>
                                            {brand.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Brand Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold truncate">{brand.name}</h3>
                                            {isActive && (
                                                <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">
                                                    Aktif
                                                </Badge>
                                            )}
                                        </div>
                                        {brand.description ? (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                {brand.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Açıklama eklenmemiş
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
