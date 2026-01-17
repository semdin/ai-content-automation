"use client";

import { useEffect } from "react";
import { Check, ChevronsUpDown, Tags, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useActiveBrand } from "@/contexts/active-brand-context";

interface Brand {
    id: string;
    name: string;
}

interface BrandSwitcherProps {
    brands: Brand[];
}

export function BrandSwitcher({ brands }: BrandSwitcherProps) {
    const { activeBrandId, setActiveBrand } = useActiveBrand();

    // Auto-select first brand if none selected
    useEffect(() => {
        if (!activeBrandId && brands.length > 0) {
            setActiveBrand(brands[0].id);
        }
    }, [activeBrandId, brands, setActiveBrand]);

    const selectedBrand = brands.find((b) => b.id === activeBrandId);

    if (brands.length === 0) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg">
                        <Link href="/dashboard/brands/new">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-dashed">
                                <Plus className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">Marka Ekle</span>
                                <span className="text-xs text-muted-foreground">
                                    İlk markanızı oluşturun
                                </span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Tags className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">
                                    {selectedBrand?.name || "Marka Seç"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Aktif marka
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        align="start"
                    >
                        {brands.map((brand) => (
                            <DropdownMenuItem
                                key={brand.id}
                                onSelect={() => setActiveBrand(brand.id)}
                            >
                                {brand.name}
                                {brand.id === activeBrandId && (
                                    <Check className="ml-auto size-4" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/brands">Markaları Yönet</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
