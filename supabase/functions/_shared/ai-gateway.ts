// AI Gateway utilities for image generation
import type { ImageAnalysis } from "./types.ts";

/**
 * Perform inline image analysis when no pre-computed analysis is provided
 */
export async function performInlineAnalysis(
  apiKey: string,
  vibeImageBase64: string,
  eventName: string,
  eventDescription?: string
): Promise<ImageAnalysis | null> {
  const analysisPrompt = `Analyze this reference image for design generation. Extract comprehensive visual characteristics.

Respond with ONLY a JSON object with these exact fields:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "colorMood": "warm/cool/neutral/vibrant/muted",
  "colorHarmony": "complementary/analogous/triadic/monochromatic/split-complementary",
  "designStyle": "minimalist/maximalist/vintage/modern/art-deco/etc",
  "aestheticKeywords": ["keyword1", "keyword2", "keyword3"],
  "era": "contemporary/retro/futuristic/timeless",
  "mood": "elegant/playful/bold/serene/dynamic",
  "atmosphere": "professional/casual/luxurious/friendly",
  "emotionalTone": "inspiring/calming/exciting/sophisticated",
  "patterns": ["pattern1", "pattern2"],
  "textures": ["texture1", "texture2"],
  "shapes": "geometric/organic/mixed",
  "typographyStyle": "serif/sans-serif/display/script",
  "typographyMood": "modern/classic/bold/delicate",
  "composition": "centered/asymmetric/grid/freeform",
  "whitespace": "minimal/balanced/generous",
  "visualWeight": "light/balanced/heavy",
  "promptEnhancements": ["enhancement1", "enhancement2"],
  "avoidElements": ["avoid1", "avoid2"],
  "analysisConfidence": 0.85
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              { type: "image_url", image_url: { url: vibeImageBase64 } }
            ],
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn('Inline analysis failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ImageAnalysis;
      }
    }
  } catch (e) {
    console.warn('Inline analysis error:', e);
  }
  
  return null;
}

/**
 * Generate image with retry logic
 */
export type ImageModelTier = 'fast' | 'quality';

const IMAGE_MODELS: Record<ImageModelTier, string> = {
  fast: 'google/gemini-2.5-flash-image',
  quality: 'google/gemini-3-pro-image-preview',
};

export async function generateImageWithRetry(
  apiKey: string,
  prompt: string,
  assetType: string,
  referenceImages: string[] = [],
  maxRetries = 2,
  modelTier: ImageModelTier = 'fast'
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${assetType}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      // Build message content - include all reference images
      const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: prompt }
      ];

      // Add all reference images (logo, vibe image, pattern)
      for (const imageBase64 of referenceImages) {
        if (imageBase64 && imageBase64.startsWith('data:image')) {
          messageContent.push({
            type: "image_url",
            image_url: { url: imageBase64 }
          });
        }
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: IMAGE_MODELS[modelTier],
          messages: [
            {
              role: "user",
              content: messageContent,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        if (response.status === 402) {
          throw new Error("PAYMENT_REQUIRED");
        }
        const errorText = await response.text();
        console.error(`AI gateway error (attempt ${attempt}):`, response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        return imageUrl;
      }

      console.warn(`No image in response for ${assetType} (attempt ${attempt}).`);
      lastError = new Error("No image in AI response");
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry for rate limit or payment errors
      if (lastError.message === "RATE_LIMIT" || lastError.message === "PAYMENT_REQUIRED") {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to generate image after retries");
}
