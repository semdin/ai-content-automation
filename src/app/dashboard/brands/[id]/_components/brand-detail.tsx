"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateBrand, deleteBrand } from "@/modules/brands/services";
import { updateBrandMannequins } from "@/modules/mannequins/services";
import { uploadImage } from "@/modules/upload/services";
import type { BrandWithMannequins } from "@/modules/brands/types";
import type { MannequinListItem } from "@/modules/mannequins/types";
import { Trash2, User, X, Plus, ImagePlus, Tags } from "lucide-react";
import { toast } from "sonner";

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
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(brand.logoUrl);
    const [selectedMannequins, setSelectedMannequins] = useState<string[]>(
        brand.mannequins.map((m) => m.id)
    );
    const [showMannequinSelect, setShowMannequinSelect] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const clearNewLogo = () => {
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let logoUrl = currentLogoUrl;

            if (logoPreview) {
                const result = await uploadImage(logoPreview, {
                    folder: "brands",
                });
                logoUrl = result.url;
            }

            await updateBrand(brand.id, { ...formData, logoUrl: logoUrl || undefined });
            await updateBrandMannequins(brand.id, selectedMannequins);

            toast.success("Marka başarıyla güncellendi");
            router.refresh();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Marka güncellenirken bir hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return;

        try {
            await deleteBrand(brand.id);
            toast.success("Marka başarıyla silindi");
            router.push("/dashboard/brands");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Marka silinirken bir hata oluştu");
        }
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

    const displayLogoUrl = logoPreview || currentLogoUrl;

    return (
        <div className="max-w-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    {displayLogoUrl ? (
                        <img
                            src={displayLogoUrl}
                            alt={brand.name}
                            className="w-14 h-14 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                            <Tags className="w-7 h-7 text-muted-foreground" />
                        </div>
                    )}
                    <h1 className="text-2xl font-semibold">{brand.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/brands/${brand.id}/assets`}>
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Assets
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Marka Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Logo</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex items-center gap-4">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={logoPreview}
                                            alt="New logo"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearNewLogo}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <span className="block text-xs text-muted-foreground mt-1">
                                            Yeni logo
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                                    >
                                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>

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
