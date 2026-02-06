export type ContentGenerationStep = "assets" | "concept" | "format";

export type AspectRatio = "1:1" | "9:16" | "16:9";

export type MediaType = "photo" | "video";

export type VideoDuration = "5" | "10";

export interface ContentGenerationConfig {
    brandId: string;
    assetIds: string[];
    mannequinId?: string;
    prompt: string;
    aspectRatio: AspectRatio;
    mediaType: MediaType;
    videoDuration?: VideoDuration;
}

// Resolution options with platform badges
export const ASPECT_RATIO_OPTIONS: {
    id: AspectRatio;
    label: string;
    description: string;
    platforms: string[];
}[] = [
    {
        id: "1:1",
        label: "Kare (1:1)",
        description: "E-ticaret ve sosyal medya gönderileri için ideal",
        platforms: ["E-Ticaret", "Instagram Post", "Facebook Post"],
    },
    {
        id: "9:16",
        label: "Dikey (9:16)",
        description: "Kısa video ve hikaye formatları için ideal",
        platforms: ["Reels", "TikTok", "YouTube Shorts", "Story"],
    },
    {
        id: "16:9",
        label: "Yatay (16:9)",
        description: "YouTube ve geniş ekran içerikler için ideal",
        platforms: ["YouTube", "Website Banner"],
    },
];

export const MEDIA_TYPE_OPTIONS: {
    id: MediaType;
    label: string;
    description: string;
}[] = [
    {
        id: "photo",
        label: "Fotoğraf",
        description: "Statik görsel içerik",
    },
    {
        id: "video",
        label: "Video",
        description: "Kling V3 ile hareketli içerik",
    },
];

export const VIDEO_DURATION_OPTIONS: {
    id: VideoDuration;
    label: string;
}[] = [
    { id: "5", label: "5 saniye" },
    { id: "10", label: "10 saniye" },
];
