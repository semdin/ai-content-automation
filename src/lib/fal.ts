import { fal } from "@fal-ai/client";

fal.config({
  // ProxyUrl: "/api/fal/proxy", 
});

export const FAL_MODELS = {
  IMAGE_GEN: "fal-ai/nano-banana-pro/edit",
  VIDEO_GEN: "fal-ai/kling-video/v3/pro/image-to-video",
};

export { fal };
