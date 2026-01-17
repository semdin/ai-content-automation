import { getMannequins } from "@/modules/mannequins/services";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MannequinList } from "./_components/mannequin-list";

export default async function MannequinsPage() {
    const mannequins = await getMannequins();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Mankenler</h1>
                <Button asChild>
                    <Link href="/dashboard/mannequins/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Manken
                    </Link>
                </Button>
            </div>

            <MannequinList mannequins={mannequins} />
        </div>
    );
}
