"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateBrand, deleteBrand } from "@/modules/brands/services";
import { updateBrandMannequins } from "@/modules/mannequins/services";
import { uploadImage, deleteImage } from "@/modules/upload/services";
import { createAsset, deleteAsset } from "@/modules/brand-assets/services";
import type { BrandWithMannequins } from "@/modules/brands/types";
import type { MannequinListItem } from "@/modules/mannequins/types";
import type { BrandAsset, AssetCategory } from "@/modules/brand-assets/types";
import { assetCategories, categoryLabels } from "@/modules/brand-assets/types";
import { 
    Trash2, User, X, Plus, ImagePlus, Tags, Save, ArrowLeft,
    Image, FileText, Upload, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BrandDetailProps {
    brand: BrandWithMannequins;
    allMannequins: MannequinListItem[];
    assets: BrandAsset[];
}

export function BrandDetail({ brand, allMannequins, assets }: BrandDetailProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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

    // Assets state
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "all">("all");
    const [uploadCategory, setUploadCategory] = useState<AssetCategory>("product");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const assetFileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const clearNewLogo = () => {
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let logoUrl = currentLogoUrl;
            if (logoPreview) {
                const result = await uploadImage(logoPreview, { folder: "brands" });
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

    // Asset functions
    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const result = await uploadImage(reader.result as string, {
                        folder: `brands/${brand.id}`,
                    });
                    await createAsset({
                        brandId: brand.id,
                        name: file.name,
                        type: file.type.startsWith("video/") ? "video" : "image",
                        category: uploadCategory,
                        url: result.url,
                        publicId: result.publicId,
                        width: result.width,
                        height: result.height,
                        fileSize: file.size,
                        mimeType: file.type,
                    });
                    toast.success(`${file.name} yüklendi`);
                    router.refresh();
                } catch (error) {
                    console.error("Upload failed:", error);
                    toast.error(`${file.name} yüklenemedi`);
                }
            };
            reader.readAsDataURL(file);
        }
        setIsUploading(false);
        if (assetFileInputRef.current) assetFileInputRef.current.value = "";
    };

    const handleDeleteAsset = async (asset: BrandAsset) => {
        if (!confirm(`"${asset.name}" silinsin mi?`)) return;
        try {
            if (asset.publicId) await deleteImage(asset.publicId);
            await deleteAsset(asset.id);
            toast.success("Asset silindi");
            router.refresh();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Silme başarısız");
        }
    };

    const availableMannequins = allMannequins.filter(
        (m) => !selectedMannequins.includes(m.id)
    );
    const selectedMannequinDetails = selectedMannequins
        .map((id) => allMannequins.find((m) => m.id === id))
        .filter(Boolean) as MannequinListItem[];

    const displayLogoUrl = logoPreview || currentLogoUrl;

    const filteredAssets =
        selectedCategory === "all" ? assets : assets.filter((a) => a.category === selectedCategory);

    const groupedAssets = filteredAssets.reduce(
        (acc, asset) => {
            if (!acc[asset.category]) acc[asset.category] = [];
            acc[asset.category].push(asset);
            return acc;
        },
        {} as Record<string, BrandAsset[]>
    );

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white"
            >
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => router.back()} className="rounded-xl bg-white/20 p-2 hover:bg-white/30 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        {displayLogoUrl ? (
                            <img src={displayLogoUrl} alt={brand.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-xl" />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                                <Tags className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
                            <p className="text-sm text-white/70">{brand.description || "Marka düzenleme"}</p>
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

            {/* Brand Info Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid gap-6 lg:grid-cols-2"
                >
                    {/* Brand Details Card */}
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardHeader className="border-b bg-muted/30">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Tags className="h-4 w-4 text-primary" />
                                Marka Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Logo</label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative group">
                                            <img src={logoPreview} alt="New logo" className="h-20 w-20 rounded-xl object-cover ring-2 ring-primary/20" />
                                            <button
                                                type="button"
                                                onClick={clearNewLogo}
                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : displayLogoUrl ? (
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <img src={displayLogoUrl} alt="Logo" className="h-20 w-20 rounded-xl object-cover ring-2 ring-muted" />
                                            <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImagePlus className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-20 w-20 border-2 border-dashed rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                                        >
                                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marka Adı</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-background"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Açıklama</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-background"
                                    placeholder="Marka hakkında kısa açıklama..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mannequins Card */}
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4 text-primary" />
                                    Mankenler
                                    <Badge variant="secondary" className="ml-1">{selectedMannequins.length}</Badge>
                                </CardTitle>
                                {availableMannequins.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowMannequinSelect(!showMannequinSelect)}
                                        className="gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Ekle
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {showMannequinSelect && (
                                <div className="mb-4 p-3 border rounded-xl space-y-1 max-h-40 overflow-y-auto bg-muted/30">
                                    {availableMannequins.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => addMannequin(m.id)}
                                            className="w-full text-left px-3 py-2 hover:bg-background rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            {m.primaryPhotoUrl ? (
                                                <img src={m.primaryPhotoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedMannequinDetails.length === 0 ? (
                                <div className="py-8 text-center">
                                    <User className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                                    <p className="text-sm text-muted-foreground">Henüz manken eklenmemiş</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMannequinDetails.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl border"
                                        >
                                            {m.primaryPhotoUrl ? (
                                                <img src={m.primaryPhotoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                                                    <User className="w-3 h-3" />
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">{m.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeMannequin(m.id)}
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

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
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

            <Separator />

            {/* Inline Assets Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Marka Varlıkları</h2>
                        <p className="text-sm text-muted-foreground">Görseller, logolar ve diğer marka dosyaları</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={uploadCategory}
                            onValueChange={(v) => setUploadCategory(v as AssetCategory)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {assetCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {categoryLabels[cat]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <input
                            ref={assetFileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleAssetUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            onClick={() => assetFileInputRef.current?.click()}
                            disabled={isUploading}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {isUploading ? "Yükleniyor..." : "Yükle"}
                        </Button>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                    <Badge
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => setSelectedCategory("all")}
                    >
                        Tümü ({assets.length})
                    </Badge>
                    {assetCategories.map((cat) => {
                        const count = assets.filter((a) => a.category === cat).length;
                        if (count === 0) return null;
                        return (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                className="cursor-pointer transition-all hover:scale-105"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {categoryLabels[cat]} ({count})
                            </Badge>
                        );
                    })}
                </div>

                {/* Assets Grid */}
                {filteredAssets.length === 0 ? (
                    <Card className="border-0 shadow-lg shadow-black/5">
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Henüz asset eklenmemiş</p>
                            <p className="text-sm text-muted-foreground mt-1">Yukarıdan dosya yükleyebilirsiniz</p>
                        </CardContent>
                    </Card>
                ) : selectedCategory === "all" ? (
                    <div className="space-y-6">
                        {Object.entries(groupedAssets).map(([category, catAssets]) => (
                            <div key={category}>
                                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                    <Image className="h-4 w-4 text-primary" />
                                    {categoryLabels[category]}
                                    <Badge variant="secondary" className="text-xs">{catAssets.length}</Badge>
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {catAssets.map((asset) => (
                                        <AssetCard key={asset.id} asset={asset} onDelete={handleDeleteAsset} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredAssets.map((asset) => (
                            <AssetCard key={asset.id} asset={asset} onDelete={handleDeleteAsset} />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function AssetCard({
    asset,
    onDelete,
}: {
    asset: BrandAsset;
    onDelete: (asset: BrandAsset) => void;
}) {
    return (
        <div className="group relative aspect-square rounded-xl overflow-hidden border bg-muted shadow-sm hover:shadow-md transition-shadow">
            {asset.type === "image" ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            ) : asset.type === "video" ? (
                <video src={asset.url} className="w-full h-full object-cover" muted />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-3 gap-2">
                <p className="text-white text-xs text-center truncate max-w-full font-medium">
                    {asset.name}
                </p>
                <button
                    onClick={() => onDelete(asset)}
                    className="p-2 bg-destructive rounded-full text-white hover:bg-destructive/80 transition-colors shadow-lg"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
