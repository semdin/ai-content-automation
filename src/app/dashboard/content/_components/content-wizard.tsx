"use client";

import { useState, useEffect } from "react";
import { BrandListItem } from "@/modules/brands/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Loader2 } from "lucide-react";

import { BrandAssetSelector } from "./steps/brand-asset-selector";
import { ConceptMannequinStep } from "./steps/concept-mannequin";
import { PlatformConfigStep } from "./steps/platform-config";
import { ContentGenerationConfig } from "@/modules/content/types";
import { FalConnectionTest } from "./fal-connection-test";
import { toast } from "sonner";
import { generateContentAction } from "../actions";
import { useRouter } from "next/navigation";
import { useActiveBrand } from "@/contexts/active-brand-context";

interface ContentWizardProps {
    brands: BrandListItem[];
}

export function ContentWizard({ brands }: ContentWizardProps) {
    const router = useRouter();
    const { activeBrandId } = useActiveBrand();
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<ContentGenerationConfig>({
        brandId: "",
        assetIds: [],
        prompt: "",
        aspectRatio: "1:1",
        mediaType: "photo",
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Set default brand from active brand context
    useEffect(() => {
        if (activeBrandId && !config.brandId) {
            setConfig(prev => ({ ...prev, brandId: activeBrandId }));
        }
    }, [activeBrandId, config.brandId]);

    // Update brand when activeBrandId changes
    useEffect(() => {
        if (activeBrandId && step === 1) {
            setConfig(prev => ({ ...prev, brandId: activeBrandId, assetIds: [] }));
        }
    }, [activeBrandId, step]);

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleGenerate = async () => {
        if (!config.brandId || config.assetIds.length === 0) {
            toast.error("Lütfen marka ve görsel seçiniz.");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateContentAction(config);
            
            if (result.success) {
                toast.success(`Başarılı! ${result.count} adet içerik üretildi.`);
                router.push("/dashboard/content");
            } else {
                toast.error(`Hata: ${result.error}`);
            }
        } catch (error) {
            toast.error("Beklenmedik bir hata oluştu.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className={step === 1 ? "font-bold text-primary" : ""}>1. Varlıklar</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className={step === 2 ? "font-bold text-primary" : ""}>2. Konsept</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className={step === 3 ? "font-bold text-primary" : ""}>3. Format</span>
                </div>

                <Card className="p-6">
                    {step === 1 && (
                        <BrandAssetSelector 
                            brands={brands} 
                            selectedBrand={config.brandId}
                            selectedAssets={config.assetIds}
                            onBrandChange={(id: string) => setConfig({ ...config, brandId: id, assetIds: [] })}
                            onAssetsChange={(ids: string[]) => setConfig({ ...config, assetIds: ids })}
                        />
                    )}
                    {step === 2 && (
                        <ConceptMannequinStep 
                            brandId={config.brandId}
                            selectedMannequin={config.mannequinId}
                            prompt={config.prompt}
                            onMannequinChange={(id: string | undefined) => setConfig({ ...config, mannequinId: id })}
                            onPromptChange={(val: string) => setConfig({ ...config, prompt: val })}
                        />
                    )}
                    {step === 3 && (
                        <PlatformConfigStep 
                            config={config}
                            onConfigChange={setConfig}
                        />
                    )}
                </Card>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        Geri
                    </Button>
                    
                    {step < 3 ? (
                        <Button onClick={nextStep} disabled={
                            (step === 1 && (!config.brandId || config.assetIds.length === 0))
                        }>
                            Devam Et
                        </Button>
                    ) : (
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isGenerating ? "Fal.ai İle Üretiliyor..." : "Üretimi Başlat"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
                <Card className="p-4">
                    <h3 className="mb-4 font-semibold">Kampanya Özeti</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Marka:</span>
                            <div className="font-medium">
                                {brands.find(b => b.id === config.brandId)?.name || "-"}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground">Görseller:</span>
                            <div className="font-medium">{config.assetIds.length} Adet Seçildi</div>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground">Format:</span>
                            <div className="font-medium">
                                {config.aspectRatio} • {config.mediaType === "photo" ? "Fotoğraf" : "Video"}
                            </div>
                        </div>
                    </div>
                </Card>
                
                {/* Connection Test Widget */}
                <FalConnectionTest />
            </div>
        </div>
    );
}
