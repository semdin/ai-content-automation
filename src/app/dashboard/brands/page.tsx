import { getBrands } from "@/modules/brands/services";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BrandList } from "./_components/brand-list";

export default async function BrandsPage() {
    const brands = await getBrands();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Markalar</h1>
                <Button asChild>
                    <Link href="/dashboard/brands/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Marka
                    </Link>
                </Button>
            </div>

            <BrandList brands={brands} />
        </div>
    );
}
