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
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
    ImageIcon, FolderOpen, Settings, LogOut, Tags, Users,
    Sparkles, LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { BrandSwitcher } from "./brand-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function AppSidebar({ user, brands }: { user: User; brands: Brand[] }) {
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
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
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
                                    tooltip={item.title}
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
                                    tooltip={item.title}
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
                                    tooltip={item.title}
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

            {/* Footer with User Info - Dropdown for both expanded and collapsed */}
            <SidebarFooter className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    tooltip={user.name}
                                    className="hover:bg-sidebar-accent transition-colors"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                side="top"
                                align="start"
                                sideOffset={8}
                            >
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="cursor-pointer">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Ayarlar
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-destructive cursor-pointer focus:text-destructive"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Çıkış Yap
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export function DashboardShell({
    children,
    user,
    brands,
}: {
    children: React.ReactNode;
    user: User;
    brands: Brand[];
}) {
    return (
        <SidebarProvider>
            <AppSidebar user={user} brands={brands} />

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
