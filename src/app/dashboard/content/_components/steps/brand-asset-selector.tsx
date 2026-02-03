"use client";

import { useEffect, useState } from "react";
import { BrandListItem } from "@/modules/brands/types";
import { fetchBrandAssets } from "../../actions"; // Verify path
import { BrandAsset } from "@/modules/brand-assets/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // Shadcn Label

interface BrandAssetSelectorProps {
    brands: BrandListItem[];
    selectedBrand: string;
    selectedAssets: string[];
    onBrandChange: (id: string) => void;
    onAssetsChange: (ids: string[]) => void;
}

export function BrandAssetSelector({ brands, selectedBrand, selectedAssets, onBrandChange, onAssetsChange }: BrandAssetSelectorProps) {
    const [assets, setAssets] = useState<BrandAsset[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedBrand) {
            setLoading(true);
            fetchBrandAssets(selectedBrand)
                .then(setAssets)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setAssets([]);
        }
    }, [selectedBrand]);

    const toggleAsset = (id: string) => {
        if (selectedAssets.includes(id)) {
            onAssetsChange(selectedAssets.filter((a) => a !== id));
        } else {
            onAssetsChange([...selectedAssets, id]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Marka Seçin</Label>
                <Select value={selectedBrand} onValueChange={onBrandChange}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Marka seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedBrand && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Görseller ({selectedAssets.length} seçildi)</Label>
                        {selectedAssets.length > 0 && (
                            <button 
                                onClick={() => onAssetsChange([])}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Temizle
                            </button>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground">Yükleniyor...</div>
                    ) : assets.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                            Bu markaya ait görsel bulunamadı. Önce Assets kısmından yükleme yapın.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {assets.map((asset) => {
                                const isSelected = selectedAssets.includes(asset.id);
                                return (
                                    <div 
                                        key={asset.id}
                                        onClick={() => toggleAsset(asset.id)}
                                        className={cn(
                                            "group relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 transition-all",
                                            isSelected ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                                        )}
                                    >
                                        <img 
                                            src={asset.url} 
                                            alt={asset.name} 
                                            className="h-full w-full object-cover"
                                        />
                                        <div className={cn(
                                            "absolute right-2 top-2 rounded-full bg-background/80 p-0.5 backdrop-blur-sm",
                                            isSelected ? "text-primary" : "text-muted-foreground opacity-50 group-hover:opacity-100"
                                        )}>
                                            {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
