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
  // Standard mockup/preview generation
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
  REGISTRATION_COUNTER: "Design a hyper-realistic 3D render of a branded registration desk in a modern convention center. Show the complete counter setup with branded front panels, signage, and welcoming atmosphere.",
  WELCOME_COUNTER: "Design a hyper-realistic 3D render of a welcome/information desk with branded graphics and professional staff area.",
  TECHNOLOGY_COUNTER: "Design a hyper-realistic 3D render of a tech support/charging station with branded panels and device charging areas.",
  BACK_WALL: "Create event backdrop wall design. Photo-ready, branded, impactful.",
  MAIN_STAGE_BACKDROP: "Design a stunning main stage backdrop with dramatic branding, lighting effects, and professional event production quality.",
  KIOSK: "Design a hyper-realistic 3D render of an interactive branded kiosk with touchscreen, header signage, and side panels. Modern trade show style.",
  STAIRS: "Design a hyper-realistic 3D render of branded stair risers with repeating graphics. Show stairs in a venue setting.",
  GLASS_DOOR: "Design a hyper-realistic 3D render of branded glass door vinyl graphics. Show the branding on glass entrance doors.",
  GLASS_ROTATING_DOOR: "Design a hyper-realistic 3D render of branded revolving door panels. Show vinyl graphics on rotating door sections.",
  GLASS_DOUBLE_DOOR: "Design a hyper-realistic 3D render of branded double glass doors with vinyl graphics spanning both panels.",
  STAND_UP_PILLAR_BANNER: "Design a freestanding pillar banner/column wrap for trade shows. Professional branded graphics.",
  FEATHER_FLAG: "Design a feather flag/sail flag for outdoor events. Vibrant branded graphics.",
  TEARDROP_FLAG: "Design a teardrop-shaped promotional flag. Bold event branding.",
  LOCATION_SIGNAGE: "Design wayfinding and directional signage with arrows and clear typography.",
  ROOM_SIGNAGE: "Design room identification signage with session info and branding.",
  WRISTBAND_DESIGN: "Design an event wristband with branded pattern. Colorful and distinctive.",
  COASTER_DESIGN: "Design a round coaster with event branding. Subtle and professional.",
  NAPKIN_DESIGN: "Design a cocktail napkin with simple logo/branding. Elegant and minimal.",
  
  // ============================================
  // ISOLATED DESIGN VARIANTS FOR PRINT EXTRACTION
  // ============================================
  
  // Apparel isolated designs
  TSHIRT_ISOLATED: "Generate ONLY the isolated design graphic on a transparent background. Do NOT show any t-shirt or clothing. Just the artwork/logo/graphic that will be printed. Suitable for screen printing with clean edges. 12x16 inch design area.",
  TSHIRT_BACK_ISOLATED: "Generate ONLY the isolated back design graphic on a transparent background. Do NOT show any t-shirt. Just the artwork with event name, date, sponsors. Clean edges for screen printing. 12x14 inch design area.",
  TSHIRT_SLEEVE_ISOLATED: "Generate ONLY the isolated small sleeve logo on a transparent background. Simple design, max 2 colors. 3x3 inch design area. No clothing visible.",
  HAT_ISOLATED: "Generate ONLY the isolated embroidery-ready logo on a transparent background. Do NOT show any hat or cap. Just the logo with clean lines, no gradients, suitable for embroidery stitching. Max 6 colors. 4x2.5 inch design area.",
  SWAG_BAG_ISOLATED: "Generate ONLY the isolated tote bag graphic on a transparent background. Do NOT show any bag. Just the artwork/logo that will be printed. Bold, simple design. Max 3 colors for screen printing. 10x10 inch design area.",
  WATER_BOTTLE_ISOLATED: "Generate ONLY the isolated water bottle label design. Rectangular wrap-around format, 8x3 inches. Clean design without showing any bottle. Ready for vinyl printing.",
  LANYARD_ISOLATED: "Generate ONLY the isolated repeating pattern for lanyard printing. Slim vertical format 1x6 inches. Pattern should tile seamlessly. Do NOT show any lanyard or strap.",
  WRISTBAND_DESIGN_ISOLATED: "Generate ONLY the isolated wristband pattern design. 10x1 inch strip format. Continuous design for wrap-around printing. No wristband visible.",
  COASTER_DESIGN_ISOLATED: "Generate ONLY the isolated round coaster design on transparent background. 4x4 inch circular format. No coaster or table visible.",
  NAPKIN_DESIGN_ISOLATED: "Generate ONLY the isolated napkin logo/design on transparent background. Simple, 1-2 colors. 5x5 inch design area. No napkin visible.",
  
  // Environmental/booth isolated panel designs
  KIOSK_ISOLATED: "Generate FLAT PRINT-READY GRAPHICS for kiosk panels. Show as labeled sections: 1) Header panel (48x12 inches), 2) Left side panel (24x72 inches), 3) Right side panel (24x72 inches). Clean flat artwork on solid background. NO 3D kiosk structure.",
  REGISTRATION_COUNTER_ISOLATED: "Generate FLAT PRINT-READY GRAPHICS for registration counter. Show as labeled sections: 1) Front panel (8ft x 3.5ft), 2) Top graphic strip if branded. Clean flat artwork on solid background. NO 3D counter structure.",
  WELCOME_COUNTER_ISOLATED: "Generate FLAT PRINT-READY GRAPHICS for welcome desk. Show as labeled sections: 1) Front face graphic (6ft x 3ft), 2) Header/topper panel. Clean flat artwork on solid background. NO 3D counter visible.",
  TECHNOLOGY_COUNTER_ISOLATED: "Generate FLAT PRINT-READY GRAPHICS for tech counter. Show front panel artwork (6ft x 3ft) and any accent graphics. Clean flat design. NO 3D structure.",
  REGISTRATION_BACK_WALL_ISOLATED: "Generate FLAT PRINT-READY ARTWORK for registration backdrop. Full 20ft x 10ft design. Solid background with event branding. NO 3D room or people visible.",
  BACK_WALL_ISOLATED: "Generate FLAT PRINT-READY ARTWORK for booth backdrop. Full 10ft x 8ft design. Complete artwork for fabric printing. NO 3D booth visible.",
  MAIN_STAGE_BACKDROP_ISOLATED: "Generate FLAT PRINT-READY ARTWORK for main stage backdrop. Full 40ft x 20ft design at digital resolution. NO stage, lights, or 3D elements visible.",
  STAIRS_ISOLATED: "Generate FLAT PRINT-READY stair riser graphic. Single riser design, 4ft wide x 8 inches tall. Pattern tile for repeating on multiple risers. NO 3D stairs visible.",
  GLASS_DOOR_ISOLATED: "Generate FLAT PRINT-READY vinyl graphics for glass door. 36x84 inch design with transparent areas indicated. NO door or glass visible.",
  GLASS_ROTATING_DOOR_ISOLATED: "Generate FLAT PRINT-READY vinyl graphics for rotating door panels. Show 3-4 individual panel designs (30x80 inches each). NO door mechanism visible.",
  GLASS_DOUBLE_DOOR_ISOLATED: "Generate FLAT PRINT-READY vinyl graphics for double doors. Full 72x84 inch design spanning both panels. Include center gap indication. NO doors visible.",
  
  // Large format signage isolated
  BANNER_ISOLATED: "Generate FLAT PRINT-READY banner design. Full 33x81 inch retractable banner artwork. Include 1 inch bleed. Complete design with no banner stand visible.",
  STAND_UP_PILLAR_BANNER_ISOLATED: "Generate FLAT PRINT-READY pillar wrap design. Full 3ft x 7ft unrolled flat artwork. NO pillar structure visible.",
  FEATHER_FLAG_ISOLATED: "Generate FLAT PRINT-READY feather flag design. Curved feather shape template, 2ft x 8ft. Include seam allowance. NO flag pole visible.",
  TEARDROP_FLAG_ISOLATED: "Generate FLAT PRINT-READY teardrop flag design. Teardrop shape template, 2.5ft x 7ft. Include seam allowance. NO flag pole visible.",
  HANGING_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY hanging sign design. 4ft x 3ft design with grommet positions marked. Double-sided layout. NO ceiling or mounting visible.",
  OUTDOOR_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY outdoor sign design. 4ft x 6ft weather-resistant design. Include mounting holes positions. High contrast colors.",
  EVENT_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY event sign design. 24x36 inch poster format. Include bleed area. NO easel or mounting visible.",
  EASEL_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY easel sign design. 22x28 inch format. Complete artwork with no easel visible.",
  
  // Location signage isolated
  LOCATION_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY wayfinding sign design. 18x24 inch format. Include directional arrows placeholder. Clean, high-contrast design.",
  ROOM_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY room sign design. 11x17 inch format. Include placeholders for session title, time, speaker. Clean design.",
  DOOR_SIGNAGE_ISOLATED: "Generate FLAT PRINT-READY door sign design. 8x10 inch format. Include room number/name area. Professional wayfinding design.",
  WIFI_SIGN_ISOLATED: "Generate FLAT PRINT-READY WiFi sign design. 8.5x11 inch format. Include large WiFi icon and text areas for network/password. Clean design.",
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
