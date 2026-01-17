"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createAsset, deleteAsset } from "@/modules/brand-assets/services";
import { uploadImage, deleteImage } from "@/modules/upload/services";
import type { Brand } from "@/modules/brands/types";
import type { BrandAsset, AssetCategory } from "@/modules/brand-assets/types";
import { assetCategories, categoryLabels } from "@/modules/brand-assets/types";
import { ImagePlus, Trash2, ArrowLeft, Tags, Image, Video, FileText, Type } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BrandAssetsProps {
    brand: Brand;
    assets: BrandAsset[];
}

const categoryIcons: Record<string, React.ReactNode> = {
    logo: <Tags className="w-4 h-4" />,
    product: <Image className="w-4 h-4" />,
    social: <Image className="w-4 h-4" />,
    background: <Image className="w-4 h-4" />,
    reference: <Image className="w-4 h-4" />,
    other: <FileText className="w-4 h-4" />,
};

export function BrandAssets({ brand, assets }: BrandAssetsProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "all">("all");
    const [uploadCategory, setUploadCategory] = useState<AssetCategory>("product");
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (asset: BrandAsset) => {
        if (!confirm(`"${asset.name}" silinsin mi?`)) return;

        try {
            if (asset.publicId) {
                await deleteImage(asset.publicId);
            }
            await deleteAsset(asset.id);
            toast.success("Asset silindi");
            router.refresh();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Silme başarısız");
        }
    };

    const filteredAssets =
        selectedCategory === "all"
            ? assets
            : assets.filter((a) => a.category === selectedCategory);

    // Group by category
    const groupedAssets = filteredAssets.reduce(
        (acc, asset) => {
            if (!acc[asset.category]) {
                acc[asset.category] = [];
            }
            acc[asset.category].push(asset);
            return acc;
        },
        {} as Record<string, BrandAsset[]>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/brands/${brand.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">{brand.name}</h1>
                        <p className="text-sm text-muted-foreground">Assets</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        {isUploading ? "Yükleniyor..." : "Yükle"}
                    </Button>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer"
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
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {categoryLabels[cat]} ({count})
                        </Badge>
                    );
                })}
            </div>

            {/* Assets Grid */}
            {filteredAssets.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <ImagePlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Henüz asset eklenmemiş</p>
                        <p className="text-sm">Yukarıdan dosya yükleyebilirsiniz</p>
                    </CardContent>
                </Card>
            ) : selectedCategory === "all" ? (
                // Grouped view
                <div className="space-y-6">
                    {Object.entries(groupedAssets).map(([category, catAssets]) => (
                        <div key={category}>
                            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                                {categoryIcons[category]}
                                {categoryLabels[category]}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {catAssets.map((asset) => (
                                    <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Flat view
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredAssets.map((asset) => (
                        <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
                    ))}
                </div>
            )}
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
        <div className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
            {asset.type === "image" ? (
                <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                />
            ) : asset.type === "video" ? (
                <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    muted
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-white text-xs text-center px-2 truncate max-w-full">
                    {asset.name}
                </p>
                <button
                    onClick={() => onDelete(asset)}
                    className="p-2 bg-destructive rounded-full text-white hover:bg-destructive/80"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
