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
  location?: string;
  incorporateLocationStyle?: boolean;
  vibeImageBase64?: string;
  masterPatternBase64?: string;
}

// Location cultural contexts for enhanced locality awareness
const LOCATION_CULTURAL_CONTEXTS: Record<string, string> = {
  // US Cities
  'new york': 'NYC urban sophistication, Broadway energy, art deco influences, metropolitan elegance, Times Square vibrancy',
  'los angeles': 'Hollywood glamour, beach lifestyle, entertainment industry aesthetics, palm tree motifs, California sunshine',
  'las vegas': 'Neon lights, entertainment spectacle, desert luxury, casino glamour, bold show-stopping designs',
  'miami': 'Art deco pastels, tropical vibes, Cuban influences, ocean blues and sunset oranges, South Beach energy',
  'san francisco': 'Tech-forward innovation, Victorian charm, fog and bridge imagery, progressive culture, startup energy',
  'chicago': 'Industrial strength, architectural excellence, deep dish culture, blues heritage, lakefront beauty',
  'austin': 'Live music capital, tech meets BBQ, Keep Austin Weird spirit, creative independence, food truck culture',
  'seattle': 'Pacific Northwest nature, coffee culture, tech innovation, rain-forest greens, grunge heritage',
  'nashville': 'Country music heritage, honky-tonk energy, southern hospitality, music row aesthetics',
  'new orleans': 'Jazz heritage, French Quarter charm, Mardi Gras colors, Creole culture, wrought iron details',
  
  // International
  'london': 'British elegance, royal heritage, modern meets traditional, underground culture, cosmopolitan sophistication',
  'paris': 'French haute couture, romantic aesthetics, art nouveau details, café culture, Parisian chic',
  'tokyo': 'Japanese minimalism, kawaii culture, neon-lit streets, zen tranquility balanced with Harajuku boldness',
  'dubai': 'Ultra-luxury, futuristic architecture, Arabian opulence, desert gold, modern innovation',
  'singapore': 'Garden city aesthetics, multicultural fusion, modern efficiency, tropical sophistication',
  'sydney': 'Harbour vibes, beach lifestyle, outdoor culture, Opera House inspired curves, Australian warmth',
  'berlin': 'Industrial chic, underground culture, creative freedom, street art influences, techno heritage',
  'barcelona': 'Gaudí-inspired organic forms, Mediterranean colors, Catalan modernism, beach meets city',
  'amsterdam': 'Dutch design minimalism, canal charm, cycling culture, tulip colors, progressive creativity',
  'hong kong': 'Vertical city energy, East meets West, neon nights, harbor views, financial sophistication',
  'mumbai': 'Bollywood vibrancy, rich colors, traditional meets modern, monsoon moods, bustling energy',
  'mexico city': 'Frida Kahlo colors, ancient meets contemporary, Day of Dead aesthetics, street food culture',
  'rio': 'Carnival energy, beach culture, samba rhythms, tropical boldness, Christ the Redeemer majesty',
  'toronto': 'Multicultural mosaic, CN Tower modern, Canadian politeness, diverse neighborhood vibes',
  'vancouver': 'Mountain meets ocean, sustainable living, Asian-Pacific fusion, outdoor lifestyle',
};

// Get cultural context for a location
function getLocationCulturalContext(location: string): string {
  if (!location) return '';
  
  const locationLower = location.toLowerCase();
  
  // Check for exact city matches
  for (const [city, context] of Object.entries(LOCATION_CULTURAL_CONTEXTS)) {
    if (locationLower.includes(city)) {
      return context;
    }
  }
  
  // Regional fallbacks
  if (locationLower.includes('california') || locationLower.includes('ca')) {
    return 'California sunshine, laid-back sophistication, tech-forward thinking, outdoor lifestyle';
  }
  if (locationLower.includes('texas') || locationLower.includes('tx')) {
    return 'Texas pride, big and bold, hospitality warmth, western heritage with modern flair';
  }
  if (locationLower.includes('florida') || locationLower.includes('fl')) {
    return 'Tropical vibes, beach lifestyle, retirement luxury meets spring break energy, sunshine state';
  }
  if (locationLower.includes('hawaii') || locationLower.includes('hi')) {
    return 'Aloha spirit, tropical paradise, island time, lush greenery, ocean blues, lei and hibiscus motifs';
  }
  if (locationLower.includes('japan')) {
    return 'Japanese attention to detail, wabi-sabi aesthetics, cherry blossom beauty, precision and harmony';
  }
  if (locationLower.includes('italy') || locationLower.includes('rome') || locationLower.includes('milan')) {
    return 'Italian elegance, Renaissance artistry, fashion-forward, Mediterranean warmth, la dolce vita';
  }
  if (locationLower.includes('france')) {
    return 'French sophistication, artistic heritage, culinary excellence, romantic aesthetics';
  }
  if (locationLower.includes('germany')) {
    return 'German precision, Bauhaus design principles, efficiency meets creativity, industrial heritage';
  }
  if (locationLower.includes('spain')) {
    return 'Spanish passion, flamenco energy, Moorish influences, vibrant colors, siesta lifestyle';
  }
  if (locationLower.includes('india')) {
    return 'Indian richness, vibrant colors, intricate patterns, spiritual depth, festival energy';
  }
  if (locationLower.includes('china') || locationLower.includes('beijing') || locationLower.includes('shanghai')) {
    return 'Chinese heritage, red and gold prosperity, dragon motifs, ancient wisdom meets modern power';
  }
  if (locationLower.includes('australia')) {
    return 'Australian outback ruggedness, beach culture, indigenous art influences, laid-back sophistication';
  }
  if (locationLower.includes('brazil')) {
    return 'Brazilian vibrancy, carnival colors, tropical energy, football passion, Amazon lushness';
  }
  if (locationLower.includes('uk') || locationLower.includes('england') || locationLower.includes('britain')) {
    return 'British heritage, understated elegance, pub culture warmth, royal traditions';
  }
  
  return '';
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
  SEAMLESS_PATTERN: "Create a seamless repeating pattern with abstract geometric shapes inspired by the event theme. Tileable in all directions.",
  
  // Step and Repeat / Media Wall
  STEP_AND_REPEAT: "Design a STEP AND REPEAT media wall backdrop. Create a grid pattern where the event logo/branding repeats in an offset grid pattern across the entire backdrop. The logos should be evenly spaced in a diagonal or straight grid pattern. This is a photo backdrop where celebrities and guests pose for photos. The repeating pattern should be clean, professional, and clearly show the brand/event name multiple times. Typical dimensions are wide format (16:9 or wider). High contrast for photography.",
  STEP_AND_REPEAT_ISOLATED: "Generate FLAT PRINT-READY step and repeat pattern. Create an 8ft x 10ft repeating grid of logos/brand elements with proper spacing. Offset grid pattern. NO people, NO 3D elements. Just the flat repeating pattern artwork ready for large format printing.",
  
  // Isolated design variants
  TSHIRT_ISOLATED: "Generate ONLY the isolated design graphic on a transparent background. Do NOT show any t-shirt or clothing. Just the artwork/logo/graphic that will be printed. Suitable for screen printing with clean edges. 12x16 inch design area.",
  TSHIRT_BACK_ISOLATED: "Generate ONLY the isolated back design graphic on a transparent background. Do NOT show any t-shirt. Just the artwork with event name, date, sponsors. Clean edges for screen printing. 12x14 inch design area.",
  HAT_ISOLATED: "Generate ONLY the isolated embroidery-ready logo on a transparent background. Do NOT show any hat or cap. Just the logo with clean lines, no gradients, suitable for embroidery stitching. Max 6 colors. 4x2.5 inch design area.",
  BANNER_ISOLATED: "Generate FLAT PRINT-READY banner design. Full 33x81 inch retractable banner artwork. Include 1 inch bleed. Complete design with no banner stand visible.",
};

async function generateImageWithRetry(
  apiKey: string,
  prompt: string,
  assetType: string,
  referenceImages: string[] = [],
  maxRetries = 2
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
          model: "google/gemini-2.5-flash-image",
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
    const { 
      assetType, 
      eventName, 
      eventDescription, 
      styleDescription, 
      colorPalette, 
      logoBase64,
      location,
      incorporateLocationStyle,
      vibeImageBase64,
      masterPatternBase64
    } = body;

    const basePrompt = ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
    
    const colorContext = colorPalette?.length 
      ? `Use this exact color palette: ${colorPalette.join(', ')}. These colors should be prominently featured.` 
      : '';

    // Build location cultural context
    let locationContext = '';
    if (location && incorporateLocationStyle) {
      const culturalVibes = getLocationCulturalContext(location);
      if (culturalVibes) {
        locationContext = `
LOCATION CULTURAL CONTEXT - IMPORTANT:
This event is in ${location}. Incorporate local cultural aesthetics:
${culturalVibes}
Subtly weave these local influences into the design while maintaining brand consistency.`;
      } else {
        locationContext = `This event is located in ${location}. Consider any local cultural elements that would resonate with attendees.`;
      }
    }

    // Build logo integration instructions
    const logoInstructions = logoBase64 
      ? `
LOGO INTEGRATION - CRITICAL:
Reference Image #1 is the EVENT LOGO. You MUST:
1. Incorporate this logo prominently and appropriately into the design
2. Match the visual style, colors, and aesthetic of the provided logo
3. Ensure the logo remains clearly visible and is not distorted
4. Use the logo's color scheme as a guide for the overall design palette
5. The design should feel like a cohesive extension of the logo's brand identity`
      : '';

    // Build vibe/style image instructions
    const vibeInstructions = vibeImageBase64
      ? `
STYLE REFERENCE - IMPORTANT:
Reference Image #${logoBase64 ? '2' : '1'} is a STYLE/VIBE REFERENCE IMAGE. You MUST:
1. Match the overall aesthetic, mood, and visual style of this reference
2. Use similar color tones, textures, and design elements
3. Capture the same energy and feeling conveyed in this reference
4. Apply this visual language throughout the design`
      : '';

    // Build pattern instructions
    const patternInstructions = masterPatternBase64
      ? `
PATTERN REFERENCE - IMPORTANT:
Reference Image #${(logoBase64 ? 1 : 0) + (vibeImageBase64 ? 1 : 0) + 1} is a MASTER PATTERN. You MUST:
1. Incorporate this pattern as a design element in the final output
2. Use the pattern as a background, accent, or decorative element
3. Maintain the pattern's colors and style throughout the design`
      : '';

    // Build style instructions
    const styleInstructions = styleDescription 
      ? `
STYLE DIRECTION:
${styleDescription}
Follow these style guidelines precisely.`
      : '';

    const fullPrompt = `Generate an image: ${basePrompt}

Event: "${eventName}"
${eventDescription ? `Event Description: ${eventDescription}` : ''}
${styleInstructions}
${colorContext}
${locationContext}
${logoInstructions}
${vibeInstructions}
${patternInstructions}

REQUIREMENTS:
- Create a high-quality, professional design
- Ultra high resolution
- Modern, polished aesthetic
- Suitable for both print and digital use
- Ensure text is readable and well-positioned
- Maintain visual hierarchy with the event name prominent
- ALL REFERENCE IMAGES PROVIDED SHOULD INFORM THE FINAL DESIGN`;

    console.log(`Generating image for ${assetType}: ${eventName}${location ? ` (Location: ${location})` : ''}${vibeImageBase64 ? ' [with vibe ref]' : ''}${masterPatternBase64 ? ' [with pattern]' : ''}`);

    // Collect all reference images
    const referenceImages: string[] = [];
    if (logoBase64) referenceImages.push(logoBase64);
    if (vibeImageBase64) referenceImages.push(vibeImageBase64);
    if (masterPatternBase64) referenceImages.push(masterPatternBase64);

    const imageUrl = await generateImageWithRetry(LOVABLE_API_KEY, fullPrompt, assetType, referenceImages);
    
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