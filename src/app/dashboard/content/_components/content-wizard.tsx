"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandListItem } from "@/modules/brands/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, ImageIcon, MessageSquareText, LayoutGrid, Check, Zap } from "lucide-react";

import { BrandAssetSelector } from "./steps/brand-asset-selector";
import { ConceptMannequinStep } from "./steps/concept-mannequin";
import { PlatformConfigStep } from "./steps/platform-config";
import { ContentGenerationConfig } from "@/modules/content/types";
import { FalConnectionTest } from "./fal-connection-test";
import { toast } from "sonner";
import { startWorkflowAction } from "../actions";
import { useRouter } from "next/navigation";
import { useActiveBrand } from "@/contexts/active-brand-context";
import { useWorkflow } from "@/contexts/workflow-context";
import { cn } from "@/lib/utils";

interface ContentWizardProps {
    brands: BrandListItem[];
}

const steps = [
    { id: 1, title: "Varlıklar", description: "Marka ve görselleri seçin", icon: ImageIcon },
    { id: 2, title: "Konsept", description: "İçerik konseptini belirleyin", icon: MessageSquareText },
    { id: 3, title: "Format", description: "Çıktı formatını ayarlayın", icon: LayoutGrid },
];

export function ContentWizard({ brands }: ContentWizardProps) {
    const router = useRouter();
    const { activeBrandId } = useActiveBrand();
    const { triggerAnimation } = useWorkflow();
    const [step, setStep] = useState(1);
    const [autoMode, setAutoMode] = useState(true);
    const [config, setConfig] = useState<ContentGenerationConfig>({
        brandId: "",
        assetIds: [],
        prompt: "",
        aspectRatio: "1:1",
        mediaType: "photo",
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (activeBrandId && !config.brandId) {
            setConfig(prev => ({ ...prev, brandId: activeBrandId }));
        }
    }, [activeBrandId, config.brandId]);

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
        if (!config.prompt.trim()) {
            toast.error("Lütfen konsept prompt giriniz.");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await startWorkflowAction(config, autoMode);
            
            if (result.success) {
                toast.success("Workflow başlatıldı!");
                triggerAnimation(result.workflowId);
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

    const isStepValid = (s: number) => {
        if (s === 1) return config.brandId && config.assetIds.length > 0;
        if (s === 2) return config.prompt.trim().length > 0;
        return true;
    };

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Yeni İçerik Oluştur</h1>
                            <p className="text-sm text-white/70">
                                AI destekli içerik üretim sürecinizi başlatın
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stepper */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center justify-center gap-0"
            >
                {steps.map((s, index) => {
                    const isCompleted = step > s.id;
                    const isCurrent = step === s.id;
                    const StepIcon = s.icon;

                    return (
                        <div key={s.id} className="flex items-center">
                            <div className="flex flex-col items-center gap-2">
                                <motion.div
                                    className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300",
                                        isCompleted
                                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : isCurrent
                                                ? "border-primary bg-primary/10 text-primary shadow-md"
                                                : "border-muted bg-muted/50 text-muted-foreground"
                                    )}
                                    animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <StepIcon className="h-5 w-5" />
                                    )}
                                </motion.div>
                                <div className="text-center">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {s.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        {s.description}
                                    </p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="relative mx-6 mb-8">
                                    <div className="h-[2px] w-16 bg-muted" />
                                    <motion.div
                                        className="absolute inset-0 h-[2px] bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: isCompleted ? "100%" : "0%" }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </motion.div>

            {/* Content Area */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="overflow-hidden border-0 shadow-lg shadow-black/5">
                                <div className="border-b bg-muted/30 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const StepIcon = steps[step - 1].icon;
                                            return <StepIcon className="h-5 w-5 text-primary" />;
                                        })()}
                                        <div>
                                            <h2 className="font-semibold">{steps[step - 1].title}</h2>
                                            <p className="text-xs text-muted-foreground">{steps[step - 1].description}</p>
                                        </div>
                                        <Badge variant="secondary" className="ml-auto">
                                            {step} / {steps.length}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6">
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
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <Button 
                            variant="outline" 
                            onClick={prevStep} 
                            disabled={step === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Geri
                        </Button>
                        
                        {step < 3 ? (
                            <Button 
                                onClick={nextStep} 
                                disabled={!isStepValid(step)}
                                className="gap-2"
                            >
                                Devam Et
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleGenerate} 
                                disabled={isGenerating || !isStepValid(step)} 
                                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Başlatılıyor...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4" />
                                        Workflow Başlat
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sidebar Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-4"
                >
                    <Card className="overflow-hidden border-0 shadow-lg shadow-black/5">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 px-5 py-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-violet-400" />
                                Kampanya Özeti
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <SummaryRow 
                                label="Marka" 
                                value={brands.find(b => b.id === config.brandId)?.name || "—"}
                                done={!!config.brandId}
                            />
                            <Separator />
                            <SummaryRow 
                                label="Görseller" 
                                value={config.assetIds.length > 0 ? `${config.assetIds.length} Adet Seçildi` : "—"}
                                done={config.assetIds.length > 0}
                            />
                            <Separator />
                            <SummaryRow 
                                label="Format" 
                                value={`${config.aspectRatio} • ${config.mediaType === "photo" ? "Fotoğraf" : "Video"}`}
                                done={true}
                            />
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="auto-mode-sidebar" className="font-medium text-sm">Auto Mode</Label>
                                    <p className="text-xs text-muted-foreground">Adımları otomatik çalıştır</p>
                                </div>
                                <Switch
                                    id="auto-mode-sidebar"
                                    checked={autoMode}
                                    onCheckedChange={setAutoMode}
                                />
                            </div>
                        </div>
                    </Card>
                    
                    <FalConnectionTest />
                </motion.div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, done }: { label: string; value: string; done: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                    {value}
                </span>
                {done && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
        </div>
    );
}
