"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateMannequin, deleteMannequin, addMannequinPhoto, setPrimaryPhoto, deleteMannequinPhoto, updateMannequinBrands } from "@/modules/mannequins/services";
import { uploadImage } from "@/modules/upload/services";
import type { MannequinWithBrands } from "@/modules/mannequins/types";
import type { BrandListItem } from "@/modules/brands/types";
import { 
    Trash2, User, X, Plus, ImagePlus, Save, ArrowLeft,
    Camera, Star, Tags
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MannequinDetailProps {
    mannequin: MannequinWithBrands;
    allBrands: BrandListItem[];
}

export function MannequinDetail({ mannequin, allBrands }: MannequinDetailProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: mannequin.name,
        birthYear: mannequin.birthYear?.toString() || "",
        heightCm: mannequin.heightCm?.toString() || "",
    });
    const [selectedBrands, setSelectedBrands] = useState<string[]>(
        mannequin.brands.map((b) => b.id)
    );
    const [showBrandSelect, setShowBrandSelect] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const photos = mannequin.photos || [];
    const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateMannequin(mannequin.id, {
                name: formData.name,
                birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
                heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
            });
            await updateMannequinBrands(mannequin.id, selectedBrands);
            toast.success("Manken başarıyla güncellendi");
            router.refresh();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Güncelleme sırasında hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bu mankeni silmek istediğinize emin misiniz?")) return;
        try {
            await deleteMannequin(mannequin.id);
            toast.success("Manken başarıyla silindi");
            router.push("/dashboard/mannequins");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Silme sırasında hata oluştu");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingPhoto(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const result = await uploadImage(reader.result as string, {
                    folder: `mannequins/${mannequin.id}`,
                });
                await addMannequinPhoto(mannequin.id, {
                    url: result.url,
                    publicId: result.publicId,
                    width: result.width,
                    height: result.height,
                });
                toast.success("Fotoğraf eklendi");
                router.refresh();
            } catch (err) {
                console.error(err);
                toast.error("Fotoğraf yüklenemedi");
            } finally {
                setIsUploadingPhoto(false);
                if (photoInputRef.current) photoInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSetMain = async (photoId: string) => {
        try {
            await setPrimaryPhoto(mannequin.id, photoId);
            toast.success("Ana fotoğraf değiştirildi");
            router.refresh();
        } catch {
            toast.error("İşlem başarısız");
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm("Fotoğrafı silmek istediğinize emin misiniz?")) return;
        try {
            await deleteMannequinPhoto(photoId);
            toast.success("Fotoğraf silindi");
            router.refresh();
        } catch {
            toast.error("Silme başarısız");
        }
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

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 p-8 text-white"
            >
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => router.back()} className="rounded-xl bg-white/20 p-2 hover:bg-white/30 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        {primaryPhoto ? (
                            <img src={primaryPhoto.url} alt={mannequin.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-xl" />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                                <User className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{mannequin.name}</h1>
                            <p className="text-sm text-white/70">
                                {mannequin.heightCm ? `${mannequin.heightCm}cm` : ""}
                                {mannequin.heightCm && mannequin.birthYear ? " • " : ""}
                                {mannequin.birthYear ? `${mannequin.birthYear} doğumlu` : ""}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-white/70 hover:text-white hover:bg-white/20"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid gap-6 lg:grid-cols-2"
                >
                    {/* Info Card */}
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-primary" />
                                Manken Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">İsim</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-background"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Doğum Yılı</label>
                                    <Input
                                        type="number"
                                        value={formData.birthYear}
                                        onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                                        className="bg-background"
                                        placeholder="1995"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Boy (cm)</label>
                                    <Input
                                        type="number"
                                        value={formData.heightCm}
                                        onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                                        className="bg-background"
                                        placeholder="175"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photos Card */}
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Camera className="h-4 w-4 text-primary" />
                                    Fotoğraflar
                                    <Badge variant="secondary" className="ml-1">{photos.length}</Badge>
                                </CardTitle>
                                <div>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => photoInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {isUploadingPhoto ? "Yükleniyor..." : "Ekle"}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {photos.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">Fotoğraf ekleyin</span>
                                </button>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {photos.map((photo) => (
                                        <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden border shadow-sm">
                                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                            {photo.isPrimary && (
                                                <div className="absolute top-1.5 left-1.5">
                                                    <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0.5">
                                                        <Star className="w-2.5 h-2.5 mr-0.5" />
                                                        Ana
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!photo.isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetMain(photo.id)}
                                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                                                    >
                                                        <Star className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    className="p-2 bg-destructive/80 rounded-full text-white hover:bg-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Brands Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Tags className="h-4 w-4 text-primary" />
                                    İlişkili Markalar
                                    <Badge variant="secondary" className="ml-1">{selectedBrands.length}</Badge>
                                </CardTitle>
                                {availableBrands.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBrandSelect(!showBrandSelect)}
                                        className="gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Ekle
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {showBrandSelect && (
                                <div className="mb-4 p-3 border rounded-xl space-y-1 max-h-40 overflow-y-auto bg-muted/30">
                                    {availableBrands.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => addBrand(b.id)}
                                            className="w-full text-left px-3 py-2 hover:bg-background rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <Tags className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{b.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedBrandDetails.length === 0 ? (
                                <div className="py-6 text-center">
                                    <Tags className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">Henüz marka ilişkilendirilmemiş</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedBrandDetails.map((b) => (
                                        <div
                                            key={b.id}
                                            className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl border"
                                        >
                                            <Tags className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{b.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeBrand(b.id)}
                                                className="hover:text-destructive ml-1 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Save & Back Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                >
                    <Button type="submit" disabled={isLoading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isLoading ? "Kaydediliyor..." : "Güncelle"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                </motion.div>
            </form>
        </div>
    );
}
