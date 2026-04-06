// AI Gateway utilities for image generation
import type { ImageAnalysis } from "./types.ts";
import type { LogoAnalysis } from "./prompt-builder.ts";

/**
 * Pre-analyze a logo image to extract detailed structural description
 * This description is injected into the generation prompt so the AI has
 * a textual blueprint to cross-check its reproduction against.
 */
export async function analyzeLogoDetails(
  apiKey: string,
  logoBase64: string
): Promise<LogoAnalysis | null> {
  const prompt = `You are a logo analysis system. Examine this logo image with extreme precision and return a JSON object describing every visual detail. This will be used to verify AI reproduction accuracy.

Return ONLY a JSON object with these exact fields:
{
  "shape": "overall shape/structure description, e.g. 'circular emblem with wordmark below' or 'horizontal lockup with icon left'",
  "textContent": "exact text visible in logo, letter by letter, e.g. 'ACME CORP' — if no text, say 'none'",
  "colors": ["#hex1", "#hex2", ...list ALL colors present],
  "style": "design style, e.g. 'modern minimalist', 'vintage hand-drawn', 'corporate geometric'",
  "distinctiveFeatures": ["feature1", "feature2", ...list unique identifying elements like 'swoosh above A', 'star inside circle', 'gradient from blue to purple'],
  "aspectRatio": "approximate ratio, e.g. 'square 1:1', 'landscape 3:1', 'portrait 1:2'",
  "iconDescription": "detailed description of any icon/symbol, null if text-only",
  "fontStyle": "typography description if text present, e.g. 'bold sans-serif uppercase with tight tracking', null if no text"
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
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: logoBase64 } }
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn('Logo analysis failed:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Logo analysis complete:', parsed.textContent, parsed.shape);
        return parsed as LogoAnalysis;
      }
    }
  } catch (e) {
    console.warn('Logo analysis error:', e);
  }

  return null;
}

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

/**
 * Check if a string looks like a usable image reference (base64 data URI or URL)
 */
function isValidImageRef(ref: string): boolean {
  if (!ref || typeof ref !== 'string') return false;
  return ref.startsWith('data:image') || ref.startsWith('data:application') || ref.startsWith('https://') || ref.startsWith('http://');
}

export interface LabeledImage {
  url: string;
  label?: string; // e.g. "LOGO", "STYLE REFERENCE", "PATTERN", "VENUE PHOTO"
}

export async function generateImageWithRetry(
  apiKey: string,
  prompt: string,
  assetType: string,
  referenceImages: (string | LabeledImage)[] = [],
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

      // Build message content with labeled images
      const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

      // Collect valid images and build label annotations
      const validImages: LabeledImage[] = [];
      for (const ref of referenceImages) {
        if (typeof ref === 'string') {
          if (isValidImageRef(ref)) {
            validImages.push({ url: ref });
          }
        } else if (ref && isValidImageRef(ref.url)) {
          validImages.push(ref);
        }
      }

      // Build an image map description so the AI knows what each image is
      let imageMapDescription = '';
      if (validImages.length > 0) {
        const labelLines = validImages.map((img, i) => {
          const label = img.label || `Reference Image`;
          return `  Image ${i + 1}: ${label}`;
        });
        imageMapDescription = `\n\nREFERENCE IMAGES PROVIDED (${validImages.length} total):\n${labelLines.join('\n')}\nUse each image according to its label. The LOGO should be incorporated into the design. STYLE REFERENCE images define the visual aesthetic to match. PATTERN images should be used as decorative/background elements. VENUE PHOTO should be used for realistic compositing.\n`;
      }

      // Add text prompt with image map
      messageContent.push({ type: "text", text: prompt + imageMapDescription });

      // Add all valid images
      for (const img of validImages) {
        messageContent.push({
          type: "image_url",
          image_url: { url: img.url }
        });
      }

      console.log(`Sending ${validImages.length} reference images for ${assetType} (labels: ${validImages.map(i => i.label || 'unlabeled').join(', ')})`);

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
