"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateBrand, deleteBrand } from "@/modules/brands/services";
import { updateBrandMannequins } from "@/modules/mannequins/services";
import type { BrandWithMannequins } from "@/modules/brands/types";
import type { MannequinListItem } from "@/modules/mannequins/types";
import { Trash2, User, X, Plus } from "lucide-react";

interface BrandDetailProps {
    brand: BrandWithMannequins;
    allMannequins: MannequinListItem[];
}

export function BrandDetail({ brand, allMannequins }: BrandDetailProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: brand.name,
        description: brand.description || "",
    });
    const [selectedMannequins, setSelectedMannequins] = useState<string[]>(
        brand.mannequins.map((m) => m.id)
    );
    const [showMannequinSelect, setShowMannequinSelect] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateBrand(brand.id, formData);
        await updateBrandMannequins(brand.id, selectedMannequins);
        setIsLoading(false);
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return;
        await deleteBrand(brand.id);
        router.push("/dashboard/brands");
    };

    const addMannequin = (id: string) => {
        if (!selectedMannequins.includes(id)) {
            setSelectedMannequins([...selectedMannequins, id]);
        }
        setShowMannequinSelect(false);
    };

    const removeMannequin = (id: string) => {
        setSelectedMannequins(selectedMannequins.filter((m) => m !== id));
    };

    const availableMannequins = allMannequins.filter(
        (m) => !selectedMannequins.includes(m.id)
    );

    const selectedMannequinDetails = selectedMannequins
        .map((id) => allMannequins.find((m) => m.id === id))
        .filter(Boolean) as MannequinListItem[];

    return (
        <div className="max-w-lg">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">{brand.name}</h1>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Marka Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Mankenler</CardTitle>
                        {availableMannequins.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMannequinSelect(!showMannequinSelect)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Ekle
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {showMannequinSelect && (
                            <div className="mb-4 p-2 border rounded-md space-y-1 max-h-40 overflow-y-auto">
                                {availableMannequins.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => addMannequin(m.id)}
                                        className="w-full text-left px-2 py-1 hover:bg-muted rounded flex items-center gap-2"
                                    >
                                        {m.primaryPhotoUrl ? (
                                            <img
                                                src={m.primaryPhotoUrl}
                                                alt=""
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                                <User className="w-3 h-3" />
                                            </div>
                                        )}
                                        <span className="text-sm">{m.name}</span>
                                    </button>
                                ))}
                                {availableMannequins.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        Eklenebilecek manken yok
                                    </p>
                                )}
                            </div>
                        )}

                        {selectedMannequinDetails.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Bu markaya henüz manken eklenmemiş.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedMannequinDetails.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center gap-2 bg-muted px-2 py-1 rounded"
                                    >
                                        {m.primaryPhotoUrl ? (
                                            <img
                                                src={m.primaryPhotoUrl}
                                                alt=""
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center">
                                                <User className="w-3 h-3" />
                                            </div>
                                        )}
                                        <span className="text-sm">{m.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeMannequin(m.id)}
                                            className="hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Kaydediliyor..." : "Güncelle"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Geri
                    </Button>
                </div>
            </form>
        </div>
    );
}
