import { getBrands } from "@/modules/brands/services";
import { Button } from "@/components/ui/button";
import { Plus, Tags } from "lucide-react";
import Link from "next/link";
import { BrandList } from "./_components/brand-list";

export default async function BrandsPage() {
    const brands = await getBrands();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                            <Tags className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Markalar</h1>
                            <p className="text-sm text-muted-foreground">
                                {brands.length} marka yönetiliyor
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                        <Link href="/dashboard/brands/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Marka
                        </Link>
                    </Button>
                </div>
            </div>

            <BrandList brands={brands} />
        </div>
    );
}
