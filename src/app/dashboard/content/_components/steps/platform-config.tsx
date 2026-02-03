"use client";

import { ContentGenerationConfig, ASPECT_RATIO_OPTIONS, MEDIA_TYPE_OPTIONS, AspectRatio, MediaType } from "@/modules/content/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Image, Video } from "lucide-react";

interface FormatStepProps {
    config: ContentGenerationConfig;
    onConfigChange: (c: ContentGenerationConfig) => void;
}

export function PlatformConfigStep({ config, onConfigChange }: FormatStepProps) {
    const selectAspectRatio = (ratio: AspectRatio) => {
        onConfigChange({ ...config, aspectRatio: ratio });
    };

    const selectMediaType = (type: MediaType) => {
        onConfigChange({ ...config, mediaType: type });
    };

    return (
        <div className="space-y-8">
            {/* Aspect Ratio Selection */}
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-semibold">Çözünürlük Seçin</Label>
                    <p className="text-sm text-muted-foreground">
                        İçeriğinizin kullanılacağı formata göre en boy oranını belirleyin.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {ASPECT_RATIO_OPTIONS.map((option) => {
                        const isSelected = config.aspectRatio === option.id;
                        return (
                            <div
                                key={option.id}
                                onClick={() => selectAspectRatio(option.id)}
                                className={cn(
                                    "relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:border-primary/50",
                                    isSelected ? "border-primary bg-primary/5" : "border-muted"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute right-3 top-3 rounded-full bg-primary p-1">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                                
                                <div className="mb-3 flex items-center gap-3">
                                    <div className={cn(
                                        "flex items-center justify-center rounded-lg border-2 bg-muted/50",
                                        option.id === "1:1" ? "h-12 w-12" : "h-16 w-9"
                                    )}>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {option.id}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{option.label}</h3>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {option.platforms.map((platform) => (
                                        <Badge key={platform} variant="secondary" className="text-xs">
                                            {platform}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Media Type Selection */}
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-semibold">İçerik Türü</Label>
                    <p className="text-sm text-muted-foreground">
                        Üretilecek içerik formatını seçin.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {MEDIA_TYPE_OPTIONS.map((option) => {
                        const isSelected = config.mediaType === option.id;
                        const isDisabled = option.id === "video"; // Video coming soon
                        
                        return (
                            <div
                                key={option.id}
                                onClick={() => !isDisabled && selectMediaType(option.id)}
                                className={cn(
                                    "relative cursor-pointer rounded-xl border-2 p-5 transition-all",
                                    isSelected ? "border-primary bg-primary/5" : "border-muted",
                                    isDisabled ? "cursor-not-allowed opacity-50" : "hover:border-primary/50"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute right-3 top-3 rounded-full bg-primary p-1">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        {option.id === "photo" ? (
                                            <Image className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <Video className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{option.label}</h3>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
