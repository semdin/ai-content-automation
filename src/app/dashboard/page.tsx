import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBrands } from "@/modules/brands/services";
import { getContents } from "@/modules/content/services";
import { 
    Sparkles, ImageIcon, Tags, Users, ArrowRight, 
    TrendingUp, Clock, CheckCircle2, Zap
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentContentGrid } from "./_components/recent-content-grid";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    const brands = await getBrands();
    const contents = await getContents();
    
    const recentContents = contents.slice(0, 4);
    const completedToday = contents.filter(c => {
        const created = new Date(c.createdAt);
        const today = new Date();
        return created.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Hoş geldin, {session?.user.name} 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    AI destekli içerik otomasyon platformuna hoş geldiniz
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Toplam İçerik</CardTitle>
                        <ImageIcon className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            +{completedToday} bugün oluşturuldu
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Marka Sayısı</CardTitle>
                        <Tags className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{brands.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Aktif markalar
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">
                            Son 30 gün
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ortalama Süre</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">~45s</div>
                        <p className="text-xs text-muted-foreground">
                            İçerik başına
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <Link href="/dashboard/content/create" className="block">
                        <CardHeader>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-2">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                İçerik Oluştur
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription>
                                AI ile görsel ve video içerikler oluşturun
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <Link href="/dashboard/brands" className="block">
                        <CardHeader>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-2">
                                <Tags className="h-6 w-6" />
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                Markalar
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription>
                                Marka görsellerini ve ayarlarını yönetin
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <Link href="/dashboard/mannequins" className="block">
                        <CardHeader>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white mb-2">
                                <Users className="h-6 w-6" />
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                Mankenler
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription>
                                AI için model görsellerini yönetin
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>
            </div>

            {/* Recent Contents */}
            {recentContents.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Son Oluşturulanlar</h2>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/content">
                                Tümünü Gör
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                    <RecentContentGrid contents={recentContents} />
                </div>
            )}
        </div>
    );
}
