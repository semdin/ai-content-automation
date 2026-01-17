"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    updateMannequin,
    deleteMannequin,
    addMannequinPhoto,
    deleteMannequinPhoto,
    setPrimaryPhoto,
    updateMannequinBrands,
} from "@/modules/mannequins/services";
import { uploadImage, deleteImage } from "@/modules/upload/services";
import type { MannequinWithBrands } from "@/modules/mannequins/types";
import type { BrandListItem } from "@/modules/brands/types";
import { Trash2, User, ImagePlus, X, Star, Plus, Tags } from "lucide-react";

interface MannequinDetailProps {
    mannequin: MannequinWithBrands;
    allBrands: BrandListItem[];
}

export function MannequinDetail({ mannequin, allBrands }: MannequinDetailProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: mannequin.name,
        birthYear: mannequin.birthYear?.toString() || "",
        heightCm: mannequin.heightCm?.toString() || "",
    });
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        mannequin.brands.map((b) => b.id)
    );
    const [showBrandSelect, setShowBrandSelect] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const result = await uploadImage(reader.result as string, {
                        folder: "mannequins",
                    });
                    await addMannequinPhoto(mannequin.id, {
                        url: result.url,
                        publicId: result.publicId,
                        width: result.width,
                        height: result.height,
                        isPrimary: mannequin.photos.length === 0,
                    });
                    router.refresh();
                } catch (error) {
                    console.error("Upload failed:", error);
                }
            };
            reader.readAsDataURL(file);
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeletePhoto = async (photoId: string, publicId?: string | null) => {
        if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;

        if (publicId) {
            await deleteImage(publicId);
        }
        await deleteMannequinPhoto(photoId);
        router.refresh();
    };

    const handleSetPrimary = async (photoId: string) => {
        await setPrimaryPhoto(mannequin.id, photoId);
        router.refresh();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await updateMannequin(mannequin.id, {
            name: formData.name,
            birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
            heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
        });
        await updateMannequinBrands(mannequin.id, selectedBrands);
        setIsLoading(false);
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm("Bu mankeni silmek istediğinize emin misiniz?")) return;
        for (const photo of mannequin.photos) {
            if (photo.publicId) {
                await deleteImage(photo.publicId);
            }
        }
        await deleteMannequin(mannequin.id);
        router.push("/dashboard/mannequins");
    };

    const addBrand = (id: string) => {
        if (!selectedBrands.includes(id)) {
            setSelectedBrands([...selectedBrands, id]);
        }
        setShowBrandSelect(false);
    };

    const removeBrand = (id: string) => {
        setSelectedBrands(selectedBrands.filter((b) => b !== id));
    };

    const availableBrands = allBrands.filter((b) => !selectedBrands.includes(b.id));
    const selectedBrandDetails = selectedBrands
        .map((id) => allBrands.find((b) => b.id === id))
        .filter(Boolean) as BrandListItem[];

    const primaryPhoto = mannequin.photos.find((p) => p.isPrimary) || mannequin.photos[0];

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    {primaryPhoto ? (
                        <img
                            src={primaryPhoto.url}
                            alt={mannequin.name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                    <h1 className="text-2xl font-semibold">{mannequin.name}</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bilgiler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ad Soyad</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Doğum Yılı</label>
                                <Input
                                    type="number"
                                    value={formData.birthYear}
                                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Boy (cm)</label>
                                <Input
                                    type="number"
                                    value={formData.heightCm}
                                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fotoğraflar</CardTitle>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                <ImagePlus className="w-4 h-4 mr-1" />
                                {isUploading ? "..." : "Ekle"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {mannequin.photos.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Henüz fotoğraf eklenmemiş
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {mannequin.photos.map((photo) => (
                                        <div key={photo.id} className="relative aspect-square group">
                                            <img
                                                src={photo.url}
                                                alt=""
                                                className="w-full h-full rounded-lg object-cover"
                                            />
                                            {photo.isPrimary && (
                                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                    <Star className="w-3 h-3" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                {!photo.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimary(photo.id)}
                                                        className="p-1 bg-white rounded text-black hover:bg-gray-200"
                                                        title="Ana fotoğraf yap"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePhoto(photo.id, photo.publicId)}
                                                    className="p-1 bg-destructive rounded text-white hover:bg-destructive/80"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="w-5 h-5" />
                            İlişkili Markalar
                        </CardTitle>
                        {availableBrands.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBrandSelect(!showBrandSelect)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Ekle
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {showBrandSelect && (
                            <div className="mb-4 p-2 border rounded-md space-y-1 max-h-40 overflow-y-auto">
                                {availableBrands.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => addBrand(b.id)}
                                        className="w-full text-left px-2 py-1 hover:bg-muted rounded flex items-center gap-2"
                                    >
                                        <Tags className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{b.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedBrandDetails.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Bu manken henüz bir markaya atanmamış.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedBrandDetails.map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-2 bg-muted px-2 py-1 rounded"
                                    >
                                        <Tags className="w-4 h-4" />
                                        <span className="text-sm">{b.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeBrand(b.id)}
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
