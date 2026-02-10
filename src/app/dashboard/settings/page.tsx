"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient, useSession, signOut } from "@/lib/auth-client";
import { 
    Settings, User, Bell, Palette, Key, Shield, 
    Zap, Check, Copy, Eye, EyeOff, LogOut, Lock, Save, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "appearance", label: "Görünüm", icon: Palette },
    { id: "notifications", label: "Bildirimler", icon: Bell },
    { id: "security", label: "Güvenlik", icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="mx-auto max-w-5xl space-y-8 py-6">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 text-white"
            >
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
                        <p className="text-sm text-white/60">Hesap ve uygulama tercihlerinizi yönetin</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                {/* Tab Navigation */}
                <motion.nav
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-1"
                >
                    {tabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <TabIcon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </motion.nav>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {activeTab === "profile" && <ProfileSection />}
                    {activeTab === "appearance" && <AppearanceSection />}
                    {activeTab === "notifications" && <NotificationsSection />}
                    {activeTab === "security" && <SecuritySection />}
                </motion.div>
            </div>
        </div>
    );
}

/* ========================================
   PROFILE SECTION
   ======================================== */

function ProfileSection() {
    const { data: session, isPending } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            toast.error("İsim boş olamaz");
            return;
        }
        setIsLoading(true);
        try {
            await authClient.updateUser({
                name: name.trim(),
            });
            toast.success("Profil güncellendi");
        } catch (err) {
            console.error(err);
            toast.error("Güncelleme başarısız oldu");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPending) {
        return (
            <Card className="border-0 shadow-lg shadow-black/5">
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg shadow-black/5">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-primary" />
                    Profil Bilgileri
                </CardTitle>
                <CardDescription>Hesap bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold shadow-lg">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-lg">{session?.user?.name || "Kullanıcı"}</p>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    </div>
                </div>
                <Separator />
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Ad Soyad</Label>
                        <Input 
                            placeholder="Adınız" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>E-posta</Label>
                        <Input 
                            type="email" 
                            value={session?.user?.email || ""} 
                            disabled 
                            className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">E-posta değiştirilemez</p>
                    </div>
                </div>
                <Button 
                    className="gap-2" 
                    onClick={handleUpdateProfile}
                    disabled={isLoading || name === session?.user?.name}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </CardContent>
        </Card>
    );
}

/* ========================================
   APPEARANCE SECTION
   ======================================== */

function AppearanceSection() {
    const [compactMode, setCompactMode] = useState(false);
    const [animations, setAnimations] = useState(true);

    useEffect(() => {
        const savedCompact = localStorage.getItem("compact-mode");
        const savedAnimations = localStorage.getItem("animations-enabled");
        if (savedCompact !== null) setCompactMode(savedCompact === "true");
        if (savedAnimations !== null) setAnimations(savedAnimations === "true");
    }, []);

    const handleCompactToggle = (checked: boolean) => {
        setCompactMode(checked);
        localStorage.setItem("compact-mode", String(checked));
        toast.success(checked ? "Kompakt mod açıldı" : "Kompakt mod kapatıldı");
    };

    const handleAnimationsToggle = (checked: boolean) => {
        setAnimations(checked);
        localStorage.setItem("animations-enabled", String(checked));
        toast.success(checked ? "Animasyonlar açıldı" : "Animasyonlar kapatıldı");
    };

    return (
        <Card className="border-0 shadow-lg shadow-black/5">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="h-4 w-4 text-primary" />
                    Görünüm
                </CardTitle>
                <CardDescription>Uygulama görünümünü özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">Tema</Label>
                        <p className="text-sm text-muted-foreground">Karanlık veya aydınlık mod seçin</p>
                    </div>
                    <ThemeToggle />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">Kompakt Mod</Label>
                        <p className="text-sm text-muted-foreground">Daha küçük aralıklar ve yazı boyutu</p>
                    </div>
                    <Switch checked={compactMode} onCheckedChange={handleCompactToggle} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">Animasyonlar</Label>
                        <p className="text-sm text-muted-foreground">Sayfa geçiş animasyonlarını aç/kapat</p>
                    </div>
                    <Switch checked={animations} onCheckedChange={handleAnimationsToggle} />
                </div>
            </CardContent>
        </Card>
    );
}

/* ========================================
   NOTIFICATIONS SECTION
   ======================================== */

function NotificationsSection() {
    const [prefs, setPrefs] = useState({
        workflowComplete: true,
        emailNotifications: false,
        errorNotifications: true,
    });

    useEffect(() => {
        const saved = localStorage.getItem("notification-prefs");
        if (saved) {
            try {
                setPrefs(JSON.parse(saved));
            } catch {}
        }
    }, []);

    const updatePref = (key: keyof typeof prefs, value: boolean) => {
        const updated = { ...prefs, [key]: value };
        setPrefs(updated);
        localStorage.setItem("notification-prefs", JSON.stringify(updated));
        toast.success("Bildirim tercihi güncellendi");
    };

    return (
        <Card className="border-0 shadow-lg shadow-black/5">
            <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4 text-primary" />
                    Bildirimler
                </CardTitle>
                <CardDescription>Bildirim tercihlerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">Workflow Tamamlanma</Label>
                        <p className="text-sm text-muted-foreground">İçerik üretimi tamamlandığında bildirim al</p>
                    </div>
                    <Switch 
                        checked={prefs.workflowComplete} 
                        onCheckedChange={(v) => updatePref("workflowComplete", v)} 
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">E-posta Bildirimleri</Label>
                        <p className="text-sm text-muted-foreground">Önemli güncellemeleri e-posta ile al</p>
                    </div>
                    <Switch 
                        checked={prefs.emailNotifications} 
                        onCheckedChange={(v) => updatePref("emailNotifications", v)} 
                    />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="font-medium text-base">Hata Bildirimleri</Label>
                        <p className="text-sm text-muted-foreground">Workflow hataları hakkında anında bildirim</p>
                    </div>
                    <Switch 
                        checked={prefs.errorNotifications} 
                        onCheckedChange={(v) => updatePref("errorNotifications", v)} 
                    />
                </div>
            </CardContent>
        </Card>
    );
}

/* ========================================
   SECURITY SECTION
   ======================================== */

function SecuritySection() {
    const router = useRouter();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("Yeni şifreler eşleşmiyor");
            return;
        }
        if (passwords.new.length < 8) {
            toast.error("Şifre en az 8 karakter olmalı");
            return;
        }
        setIsChangingPassword(true);
        try {
            await authClient.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            toast.success("Şifre başarıyla değiştirildi");
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err) {
            console.error(err);
            toast.error("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            router.push("/login");
        } catch {
            toast.error("Çıkış yapılamadı");
            setIsSigningOut(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <Card className="border-0 shadow-lg shadow-black/5">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lock className="h-4 w-4 text-primary" />
                        Şifre Değiştir
                    </CardTitle>
                    <CardDescription>Hesap şifrenizi güncelleyin</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Mevcut Şifre</Label>
                        <div className="relative">
                            <Input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="Mevcut şifreniz"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Yeni Şifre</Label>
                            <Input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="En az 8 karakter"
                                minLength={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Yeni Şifre (Tekrar)</Label>
                            <Input
                                type={showPasswords ? "text" : "password"}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="Tekrar girin"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={handleChangePassword}
                            disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                            className="gap-2"
                        >
                            {isChangingPassword ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )}
                            {isChangingPassword ? "Değiştiriliyor..." : "Şifre Değiştir"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showPasswords ? "Gizle" : "Göster"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Sign Out */}
            <Card className="border-0 shadow-lg shadow-black/5">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <LogOut className="h-4 w-4 text-primary" />
                        Oturum
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Çıkış Yap</p>
                            <p className="text-sm text-muted-foreground">Tüm cihazlardan oturumunuzu kapatın</p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={handleSignOut} 
                            disabled={isSigningOut}
                            className="gap-2"
                        >
                            {isSigningOut ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            {isSigningOut ? "Çıkılıyor..." : "Çıkış Yap"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-0 shadow-lg shadow-black/5 border-red-500/20">
                <CardHeader className="border-b bg-destructive/5">
                    <CardTitle className="flex items-center gap-2 text-base text-destructive">
                        <Shield className="h-4 w-4" />
                        Tehlikeli Bölge
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Hesabı Sil</p>
                            <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz. Tüm veriler silinir.</p>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                                toast.error("Bu özellik yakında aktif olacak.");
                            }}
                        >
                            Hesabı Sil
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
