import { fal } from "@fal-ai/client";

fal.config({
  // ProxyUrl: "/api/fal/proxy", 
});

export const FAL_MODELS = {
  IMAGE_GEN: "fal-ai/nano-banana-pro/edit", // Gemini 3 tabanlı Image Editor
};

export { fal };
