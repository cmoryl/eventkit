import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateImageRequest {
  assetType: string;
  eventName: string;
  eventDescription?: string;
  styleDescription?: string;
  colorPalette?: string[];
  logoBase64?: string;
}

const ASSET_PROMPTS: Record<string, string> = {
  SOCIAL_POST: "Create a modern social media post design with bold typography and clean layout. Square format (1:1). Professional event branding with clear hierarchy.",
  BANNER: "Design a professional event banner with gradient background, geometric elements, and clean typography layout. Wide format (16:9). Impactful and memorable.",
  NAME_TAG: "Create an elegant event name badge design with a subtle pattern background and clear space for name text. Portrait format. Professional and welcoming.",
  NAME_TAG_BACK: "Design a name badge back with QR code placeholder, event schedule, and contact info area. Clean, functional design.",
  EMAIL_HEADER: "Design a professional email header banner with modern gradients and clean branding space. Wide format (3:1). Corporate yet inviting.",
  SOCIAL_STORY: "Create a vertical social story design with engaging visuals and text overlay areas. Portrait format (9:16). Eye-catching for Instagram/TikTok.",
  EVENT_SIGNAGE: "Design professional event signage with bold, readable typography and clean layout. Include directional elements. High visibility.",
  TSHIRT: "Create a minimalist t-shirt design with a centered graphic element suitable for screen printing. Simple, iconic, memorable.",
  TSHIRT_BACK: "Design a t-shirt back with event name, date, and sponsors area. Clean layout for screen printing.",
  LANYARD: "Design a vertical lanyard pattern with repeating brand elements and professional styling. Slim vertical format.",
  SWAG_BAG: "Create a tote bag design with a simple, iconic graphic that works at various sizes. Bold and recognizable.",
  STICKER_SHEET: "Design a collection of 4-6 sticker designs with varied shapes, icons, and text elements. Fun and collectible.",
  THANK_YOU_NOTE: "Create an elegant thank you card design with subtle patterns and warm, professional styling. Heartfelt and genuine.",
  WIFI_SIGN: "Create a modern WiFi information sign design. Include a large WiFi icon, space for network name and password text. Clean white background with accent colors. Easy to read from distance. Professional signage style.",
  HAT: "Create a simple embroidery-ready logo design suitable for cap/hat placement. Clean lines, limited colors.",
  WATER_BOTTLE: "Design a wrap-around water bottle label with brand elements. Sleek and modern.",
  MENU: "Create an elegant menu card design with clear sections and professional typography. Easy to read.",
  FOLDER: "Design a professional folder cover with branded elements and clean layout. Corporate and polished.",
  HANGING_SIGNAGE: "Design overhead hanging signage for events. Bold, readable from distance, professional.",
  OUTDOOR_SIGNAGE: "Create weather-resistant outdoor signage design. High contrast, durable aesthetic.",
  DOOR_SIGNAGE: "Design door signage with room info and branding. Clear wayfinding.",
  EASEL_SIGNAGE: "Create standing easel sign design. Welcome message and event info.",
  REGISTRATION_COUNTER: "Design registration desk backdrop. Welcoming, branded, professional.",
  BACK_WALL: "Create event backdrop wall design. Photo-ready, branded, impactful.",
  
  // Isolated design variants for print-ready extraction
  TSHIRT_ISOLATED: "Generate ONLY the isolated design graphic on a transparent background. Do NOT show any t-shirt or clothing. Just the artwork/logo/graphic that will be printed. Suitable for screen printing with clean edges. 12x16 inch design area.",
  TSHIRT_BACK_ISOLATED: "Generate ONLY the isolated back design graphic on a transparent background. Do NOT show any t-shirt. Just the artwork with event name, date, sponsors. Clean edges for screen printing. 12x14 inch design area.",
  HAT_ISOLATED: "Generate ONLY the isolated embroidery-ready logo on a transparent background. Do NOT show any hat or cap. Just the logo with clean lines, no gradients, suitable for embroidery stitching. Max 6 colors. 4x2.5 inch design area.",
  SWAG_BAG_ISOLATED: "Generate ONLY the isolated tote bag graphic on a transparent background. Do NOT show any bag. Just the artwork/logo that will be printed. Bold, simple design. Max 3 colors for screen printing. 10x10 inch design area.",
  WATER_BOTTLE_ISOLATED: "Generate ONLY the isolated water bottle label design. Rectangular wrap-around format, 8x3 inches. Clean design without showing any bottle. Ready for vinyl printing.",
  LANYARD_ISOLATED: "Generate ONLY the isolated repeating pattern for lanyard printing. Slim vertical format 1x6 inches. Pattern should tile seamlessly. Do NOT show any lanyard or strap.",
};

async function generateImageWithRetry(
  apiKey: string,
  prompt: string,
  assetType: string,
  maxRetries = 2
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for ${assetType}`);
        // Add small delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt,
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

      // No image in response - log details and retry
      console.warn(`No image in response for ${assetType} (attempt ${attempt}). Response:`, 
        JSON.stringify(data.choices?.[0]?.message || {}).substring(0, 500));
      lastError = new Error("No image in AI response");
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on rate limit or payment errors
      if (lastError.message === "RATE_LIMIT" || lastError.message === "PAYMENT_REQUIRED") {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Failed to generate image after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateImageRequest = await req.json();
    const { assetType, eventName, eventDescription, styleDescription, colorPalette } = body;

    const basePrompt = ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
    
    const colorContext = colorPalette?.length 
      ? `Use this color palette: ${colorPalette.join(', ')}.` 
      : '';

    const fullPrompt = `Generate an image: ${basePrompt}

Event: "${eventName}"
${eventDescription ? `Theme: ${eventDescription}` : ''}
${styleDescription ? `Style: ${styleDescription}` : ''}
${colorContext}

Create a high-quality, professional design. Ultra high resolution. Modern, clean aesthetic. Suitable for print and digital use.`;

    console.log(`Generating image for ${assetType}: ${eventName}`);

    const imageUrl = await generateImageWithRetry(LOVABLE_API_KEY, fullPrompt, assetType);
    
    console.log(`Successfully generated image for ${assetType}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (errorMessage === "PAYMENT_REQUIRED") {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
