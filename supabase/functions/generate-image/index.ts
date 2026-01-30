import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  SOCIAL_POST: "Create a modern social media post design with bold typography and clean layout. Square format (1:1). Include space for event name text overlay.",
  BANNER: "Design a professional event banner with gradient background, geometric elements, and clean typography layout. Wide format (16:9).",
  NAME_TAG: "Create an elegant event name badge design with a subtle pattern background and clear space for name text. Portrait format.",
  EMAIL_HEADER: "Design a professional email header banner with modern gradients and clean branding space. Wide format (3:1).",
  SOCIAL_STORY: "Create a vertical social story design with engaging visuals and text overlay areas. Portrait format (9:16).",
  EVENT_SIGNAGE: "Design professional event signage with bold, readable typography and clean layout. Include directional elements.",
  TSHIRT: "Create a minimalist t-shirt design with a centered graphic element suitable for screen printing.",
  LANYARD: "Design a vertical lanyard pattern with repeating brand elements and professional styling.",
  SWAG_BAG: "Create a tote bag design with a simple, iconic graphic that works at various sizes.",
  STICKER_SHEET: "Design a collection of 4-6 sticker designs with varied shapes, icons, and text elements.",
  THANK_YOU_NOTE: "Create an elegant thank you card design with subtle patterns and warm, professional styling.",
  WIFI_SIGN: "Design a clean WiFi information sign with clear typography and network icon.",
  HAT: "Create a simple embroidery-ready logo design suitable for cap/hat placement.",
  WATER_BOTTLE: "Design a wrap-around water bottle label with brand elements.",
  MENU: "Create an elegant menu card design with clear sections and professional typography.",
  FOLDER: "Design a professional folder cover with branded elements and clean layout.",
};

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

    const fullPrompt = `${basePrompt}

Event: "${eventName}"
${eventDescription ? `Theme: ${eventDescription}` : ''}
${styleDescription ? `Style: ${styleDescription}` : ''}
${colorContext}

Create a high-quality, professional design. Ultra high resolution. Modern, clean aesthetic. No text unless specified. Suitable for print and digital use.`;

    console.log(`Generating image for ${assetType}: ${eventName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log(`Successfully generated image for ${assetType}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
