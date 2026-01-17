"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateBrand, deleteBrand } from "@/modules/brands/services";
import type { Brand } from "@/modules/brands/types";
import { Trash2 } from "lucide-react";

export function BrandDetail({ brand }: { brand: Brand }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: brand.name,
        description: brand.description || "",
    });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateBrand(brand.id, formData);
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return;
        await deleteBrand(brand.id);
        router.push("/dashboard/brands");
    };

    return (
        <div className="max-w-lg">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">{brand.name}</h1>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Marka Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marka Adı</label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Açıklama</label>
                            <Input
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Kaydediliyor..." : "Güncelle"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Geri
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
