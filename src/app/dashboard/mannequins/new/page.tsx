"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMannequin, addMannequinPhoto } from "@/modules/mannequins/services";
import { uploadImage } from "@/modules/upload/services";
import { Upload, X, ImagePlus } from "lucide-react";

type PhotoPreview = {
    id: string;
    dataUrl: string;
};

export default function NewMannequinPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [photos, setPhotos] = useState<PhotoPreview[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        birthYear: "",
        heightCm: "",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                setPhotos((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), dataUrl: reader.result as string },
                ]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removePhoto = (id: string) => {
        setPhotos(photos.filter((p) => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Create mannequin first
            const mannequin = await createMannequin({
                name: formData.name,
                birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
                heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
            });

            // Upload photos (original quality - no transformation)
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                const result = await uploadImage(photo.dataUrl, {
                    folder: "mannequins",
                });
                await addMannequinPhoto(mannequin.id, {
                    url: result.url,
                    publicId: result.publicId,
                    width: result.width,
                    height: result.height,
                    isPrimary: i === 0, // First photo is primary
                });
            }

            router.push("/dashboard/mannequins");
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg">
            <h1 className="text-2xl font-semibold mb-4">Yeni Manken</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Manken Bilgileri</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ad Soyad *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Manken adı"
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
                                    placeholder="1990"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Boy (cm)</label>
                                <Input
                                    type="number"
                                    value={formData.heightCm}
                                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                                    placeholder="175"
                                    min="100"
                                    max="250"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fotoğraflar</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="relative aspect-square">
                                        <img
                                            src={photo.dataUrl}
                                            alt="Preview"
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.id)}
                                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
                                >
                                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Ekle</span>
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Birden fazla fotoğraf seçebilirsiniz. İlk fotoğraf ana fotoğraf olacak.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                                        Yükleniyor...
                                    </>
                                ) : (
                                    "Kaydet"
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
