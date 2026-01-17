"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";
import Link from "next/link";
import { useActiveBrand } from "@/contexts/active-brand-context";
import type { Brand } from "@/modules/brands/types";

interface BrandListProps {
    brands: Brand[];
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
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Henüz marka eklemediniz.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedBrands.map((brand) => (
                <Link key={brand.id} href={`/dashboard/brands/${brand.id}`}>
                    <Card
                        className={`hover:border-primary transition-colors cursor-pointer ${brand.id === activeBrandId ? "border-primary" : ""
                            }`}
                    >
                        <CardHeader className="flex flex-row items-center gap-4">
                            {brand.logoUrl ? (
                                <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                    <Tags className="w-6 h-6 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-lg">{brand.name}</CardTitle>
                                {brand.id === activeBrandId && (
                                    <Badge className="mt-1">Aktif</Badge>
                                )}
                            </div>
                        </CardHeader>
                        {brand.description && (
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {brand.description}
                                </p>
                            </CardContent>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    );
}
