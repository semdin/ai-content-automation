"use client";

import { useState, useEffect } from "react";
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

interface Brand {
    id: string;
    name: string;
}

interface BrandSwitcherProps {
    brands: Brand[];
}

const BRAND_COOKIE_NAME = "current_brand";

export function BrandSwitcher({ brands }: BrandSwitcherProps) {
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    // Load from cookie on mount
    useEffect(() => {
        const savedBrandId = document.cookie
            .split("; ")
            .find((row) => row.startsWith(BRAND_COOKIE_NAME))
            ?.split("=")[1];

        if (savedBrandId) {
            const brand = brands.find((b) => b.id === savedBrandId);
            if (brand) setSelectedBrand(brand);
        } else if (brands.length > 0) {
            setSelectedBrand(brands[0]);
        }
    }, [brands]);

    const handleSelect = (brand: Brand) => {
        setSelectedBrand(brand);
        document.cookie = `${BRAND_COOKIE_NAME}=${brand.id}; path=/; max-age=${60 * 60 * 24 * 365}`;
    };

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
                                onSelect={() => handleSelect(brand)}
                            >
                                {brand.name}
                                {brand.id === selectedBrand?.id && (
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
