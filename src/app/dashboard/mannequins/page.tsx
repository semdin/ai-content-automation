import { getMannequins } from "@/modules/mannequins/services";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { MannequinList } from "./_components/mannequin-list";

export default async function MannequinsPage() {
    const mannequins = await getMannequins();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Mankenler</h1>
                            <p className="text-sm text-muted-foreground">
                                {mannequins.length} model yönetiliyor
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                        <Link href="/dashboard/mannequins/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Manken
                        </Link>
                    </Button>
                </div>
            </div>

            <MannequinList mannequins={mannequins} />
        </div>
    );
}
