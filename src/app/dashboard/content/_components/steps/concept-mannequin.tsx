"use client";

import { useEffect, useState } from "react";
import { fetchBrandMannequins } from "../../actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptMannequinStepProps {
    brandId: string;
    selectedMannequin?: string;
    prompt: string;
    onMannequinChange: (id: string | undefined) => void;
    onPromptChange: (val: string) => void;
}

export function ConceptMannequinStep({ brandId, selectedMannequin, prompt, onMannequinChange, onPromptChange }: ConceptMannequinStepProps) {
    const [mannequins, setMannequins] = useState<{ id: string; name: string; primaryPhotoUrl: string | null }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (brandId) {
            setLoading(true);
            fetchBrandMannequins(brandId)
                .then(setMannequins)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [brandId]);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label>Manken Seçimi (Opsiyonel)</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div 
                        onClick={() => onMannequinChange(undefined)}
                        className={cn(
                            "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/20 hover:bg-muted/50",
                            !selectedMannequin ? "border-primary bg-primary/5" : "border-border"
                        )}
                    >
                        <User className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">Mankensiz</span>
                    </div>

                    {loading ? (
                        <div className="col-span-full py-4 text-sm text-muted-foreground">Mankenler yükleniyor...</div>
                    ) : (
                        mannequins.map((m) => {
                            const isSelected = selectedMannequin === m.id;
                            return (
                                <div 
                                    key={m.id}
                                    onClick={() => onMannequinChange(m.id)}
                                    className={cn(
                                        "relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 transition-all",
                                        isSelected ? "border-primary" : "border-transparent hover:border-muted-foreground/50",
                                        "bg-muted"
                                    )}
                                >
                                    {m.primaryPhotoUrl ? (
                                        <img src={m.primaryPhotoUrl} alt={m.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{m.name}</div>
                                    )}
                                    
                                    {isSelected && (
                                        <div className="absolute right-2 top-2 rounded-full bg-background p-0.5 text-primary shadow-sm">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prompt">Konsept & Prompt</Label>
                    <p className="text-xs text-muted-foreground">
                        Prompt mühendisliği Fal.ai tarafından otomatik yapılacak. Sen sadece ne istediğini anlat.
                    </p>
                </div>
                <Textarea
                    id="prompt"
                    className="min-h-[120px]"
                    placeholder="Örn: 14 Şubat sevgililer günü için zarif, romantik ve minimalist bir konsept istiyorum. Arka planda Eyfel kulesi olsun."
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                />
            </div>
        </div>
    );
}
