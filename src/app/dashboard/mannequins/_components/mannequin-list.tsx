"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import Link from "next/link";
import { useActiveBrand } from "@/contexts/active-brand-context";
import type { Mannequin } from "@/modules/mannequins/types";

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
            <Card>
                <CardHeader className="text-center text-muted-foreground">
                    Henüz manken eklemediniz.
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedMannequins.map((mannequin) => {
                const isInActiveBrand = activeBrandId && mannequin.brandIds.includes(activeBrandId);

                return (
                    <Link key={mannequin.id} href={`/dashboard/mannequins/${mannequin.id}`}>
                        <Card
                            className={`hover:border-primary transition-colors cursor-pointer ${isInActiveBrand ? "border-primary" : ""
                                }`}
                        >
                            <CardHeader className="flex flex-row items-center gap-4">
                                {mannequin.primaryPhotoUrl ? (
                                    <img
                                        src={mannequin.primaryPhotoUrl}
                                        alt={mannequin.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <User className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">{mannequin.name}</CardTitle>
                                        {isInActiveBrand && <Badge>Aktif Marka</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {mannequin.heightCm && `${mannequin.heightCm} cm`}
                                        {mannequin.heightCm && mannequin.birthYear && " • "}
                                        {mannequin.birthYear && `${new Date().getFullYear() - mannequin.birthYear} yaş`}
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
