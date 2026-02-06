"use client";

import { useEffect } from "react";
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Brand {
    id: string;
    name: string;
}

interface BrandSwitcherProps {
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

export function BrandSwitcher({ brands }: BrandSwitcherProps) {
    const { activeBrandId, setActiveBrand } = useActiveBrand();

    // Auto-select first brand if none selected
    useEffect(() => {
        if (!activeBrandId && brands.length > 0) {
            setActiveBrand(brands[0].id);
        }
    }, [activeBrandId, brands, setActiveBrand]);

    const selectedBrand = brands.find((b) => b.id === activeBrandId);
    const brandColor = selectedBrand ? getBrandColor(selectedBrand.name) : "";

    if (brands.length === 0) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="hover:bg-sidebar-accent">
                        <Link href="/dashboard/brands/new" className="group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/50 transition-colors">
                                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Marka Ekle</span>
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
                            className={cn(
                                "data-[state=open]:bg-sidebar-accent",
                                "hover:bg-sidebar-accent transition-colors"
                            )}
                        >
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold text-sm shadow-md",
                                brandColor
                            )}>
                                {selectedBrand?.name.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">
                                    {selectedBrand?.name || "Marka Seç"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Aktif marka
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                        align="start"
                    >
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Markalar
                        </div>
                        {brands.map((brand) => {
                            const color = getBrandColor(brand.name);
                            const isActive = brand.id === activeBrandId;
                            return (
                                <DropdownMenuItem
                                    key={brand.id}
                                    onSelect={() => setActiveBrand(brand.id)}
                                    className={cn(
                                        "cursor-pointer",
                                        isActive && "bg-accent"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-white text-xs font-bold mr-2",
                                        color
                                    )}>
                                        {brand.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="flex-1">{brand.name}</span>
                                    {isActive && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/dashboard/brands" className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2" />
                                Markaları Yönet
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/dashboard/brands/new" className="flex items-center">
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Marka Ekle
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
