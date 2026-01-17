"use client";

import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">
                Hoş geldin, {session?.user.name}
            </h1>
            <p className="text-muted-foreground">
                AI destekli içerik otomasyon platformu
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium">İçerik Üret</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        AI ile görsel oluştur
                    </p>
                </div>
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Kampanyalar</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kampanyaları yönet
                    </p>
                </div>
                <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Analitik</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Performansı takip et
                    </p>
                </div>
            </div>
        </div>
    );
}
