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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, ImageIcon, FolderOpen, Settings, LogOut } from "lucide-react";
import Link from "next/link";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

const menuItems = [
    { title: "Ana Sayfa", icon: Home, href: "/dashboard" },
    { title: "İçerikler", icon: ImageIcon, href: "/dashboard/content" },
    { title: "Kampanyalar", icon: FolderOpen, href: "/dashboard/campaigns" },
    { title: "Ayarlar", icon: Settings, href: "/dashboard/settings" },
];

export function DashboardShell({
    children,
    user,
}: {
    children: React.ReactNode;
    user: User;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-4">
                    <span className="font-semibold">AI Content</span>
                </SidebarHeader>
                <Separator />
                <SidebarContent>
                    <SidebarMenu className="p-2">
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname === item.href}>
                                    <Link href={item.href}>
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <Separator />
                <SidebarFooter className="p-2">
                    <div className="flex items-center gap-2 px-2 py-1">
                        {user.image && (
                            <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
                        )}
                        <span className="text-sm truncate flex-1">{user.name}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Çıkış
                    </Button>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-12 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                </header>
                <main className="flex-1 p-4">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
