"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrand, updateBrand } from "@/modules/brands/services";
import { uploadImage } from "@/modules/upload/services";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

export default function NewBrandPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
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

    const clearLogo = () => {
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const brand = await createBrand(formData);

            if (logoPreview) {
                const result = await uploadImage(logoPreview, {
                    folder: "brands",
                });
                await updateBrand(brand.id, { logoUrl: result.url });
            }

            toast.success("Marka başarıyla oluşturuldu");
            router.push("/dashboard/brands");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Marka oluşturulurken bir hata oluştu");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg">
            <h1 className="text-2xl font-semibold mb-4">Yeni Marka</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Marka Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                            alt="Logo preview"
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearLogo}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                                    >
                                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                    </button>
                                )}
                                <div className="text-sm text-muted-foreground">
                                    Marka logosu yükleyin (opsiyonel)
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Marka Adı *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Örn: Marka İsmi"
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
                                placeholder="Marka hakkında kısa açıklama"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
