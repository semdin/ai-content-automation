"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    Home, ImageIcon, FolderOpen, Settings, LogOut, Tags, Users,
    Sparkles, LayoutDashboard, Palette, Image
} from "lucide-react";
import Link from "next/link";
import { BrandSwitcher } from "./brand-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface Brand {
    id: string;
    name: string;
}

const mainMenuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "İçerik Oluştur", icon: Sparkles, href: "/dashboard/content/create" },
    { title: "İçerikler", icon: ImageIcon, href: "/dashboard/content" },
];

const managementMenuItems = [
    { title: "Markalar", icon: Tags, href: "/dashboard/brands" },
    { title: "Mankenler", icon: Users, href: "/dashboard/mannequins" },
    { title: "Kampanyalar", icon: FolderOpen, href: "/dashboard/campaigns" },
];

const settingsMenuItems = [
    { title: "Ayarlar", icon: Settings, href: "/dashboard/settings" },
];

export function DashboardShell({
    children,
    user,
    brands,
}: {
    children: React.ReactNode;
    user: User;
    brands: Brand[];
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    return (
        <SidebarProvider>
            <Sidebar className="border-r border-sidebar-border">
                {/* Header with Brand Switcher */}
                <SidebarHeader className="p-3">
                    <BrandSwitcher brands={brands} />
                </SidebarHeader>

                <Separator className="mx-3 w-auto" />

                <SidebarContent className="px-2">
                    {/* Main Navigation */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs text-muted-foreground px-3 py-2">
                            Ana Menü
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {mainMenuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive(item.href)}
                                        className={cn(
                                            "transition-all duration-200",
                                            isActive(item.href) && "bg-primary/10 text-primary font-medium"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Management */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs text-muted-foreground px-3 py-2">
                            Yönetim
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {managementMenuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive(item.href)}
                                        className={cn(
                                            "transition-all duration-200",
                                            isActive(item.href) && "bg-primary/10 text-primary font-medium"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Settings */}
                    <SidebarGroup className="mt-auto">
                        <SidebarMenu>
                            {settingsMenuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isActive(item.href)}
                                        className={cn(
                                            "transition-all duration-200",
                                            isActive(item.href) && "bg-primary/10 text-primary font-medium"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <Separator className="mx-3 w-auto" />

                {/* Footer with User Info */}
                <SidebarFooter className="p-3">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Çıkış Yap
                    </Button>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                {/* Top Header Bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8" />
                        <Separator orientation="vertical" className="h-6" />
                        <nav className="text-sm text-muted-foreground">
                            {/* Breadcrumb could go here */}
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
