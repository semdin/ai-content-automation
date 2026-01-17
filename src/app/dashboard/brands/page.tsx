import { getBrands } from "@/modules/brands/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

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

            {brands.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Henüz marka eklemediniz.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {brands.map((brand) => (
                        <Link key={brand.id} href={`/dashboard/brands/${brand.id}`}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                                </CardHeader>
                                {brand.description && (
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {brand.description}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
