import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ImageAnalysis {
  dominantColors: string[];
  colorMood: string;
  colorHarmony: string;
  designStyle: string;
  aestheticKeywords: string[];
  era: string;
  mood: string;
  atmosphere: string;
  emotionalTone: string;
  patterns: string[];
  textures: string[];
  shapes: string;
  typographyStyle: string;
  typographyMood: string;
  composition: string;
  whitespace: string;
  visualWeight: string;
  promptEnhancements: string[];
  avoidElements: string[];
  analysisConfidence: number;
}

// Venue intelligence from AI research (matches frontend VenueIntelligence type)
interface VenueIntelligence {
  name: string;
  fullAddress?: string;
  city?: string;
  country?: string;
  capacity?: string;
  venueType?: string;
  description?: string;
  amenities?: string[];
  parkingInfo?: string;
  accessibilityInfo?: string;
  cateringOptions?: string;
  technicalSpecs?: string;
  website?: string;
  phone?: string;
  priceRange?: string;
  bestFor?: string[];
  nearbyHotels?: string[];
  localTips?: string;
  culturalContext?: string;
}

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
  venueImageBase64?: string;
  renderMode?: 'design' | 'mockup' | 'hyperrealistic';
  isPrintAsset?: boolean;
  printDPI?: number;
  imageAnalysis?: ImageAnalysis; // Comprehensive analysis from reference image
  venueIntelligence?: VenueIntelligence; // AI-researched venue data
}

// Print asset categories for automatic detection
const PRINT_ASSET_TYPES = new Set([
  'NAME_TAG', 'NAME_TAG_BACK', 'MENU', 'FOLDER', 'STICKER_SHEET', 
  'THANK_YOU_NOTE', 'BANNER', 'EVENT_SIGNAGE', 'EASEL_SIGNAGE',
  'DOOR_SIGNAGE', 'ROOM_SIGNAGE', 'LOCATION_SIGNAGE', 'WIFI_SIGN',
  'HANGING_SIGNAGE', 'OUTDOOR_SIGNAGE', 'TSHIRT', 'TSHIRT_BACK',
  'TSHIRT_SLEEVE', 'HAT', 'SWAG_BAG', 'WATER_BOTTLE', 'LANYARD',
  'STAND_UP_PILLAR_BANNER', 'FEATHER_FLAG', 'TEARDROP_FLAG',
  'BACK_WALL', 'MAIN_STAGE_BACKDROP', 'REGISTRATION_COUNTER',
  'WELCOME_COUNTER', 'TECHNOLOGY_COUNTER', 'KIOSK', 'STAIRS',
  'GLASS_DOOR', 'GLASS_DOUBLE_DOOR', 'GLASS_ROTATING_DOOR',
  'STEP_AND_REPEAT', 'WRISTBAND_DESIGN', 'COASTER_DESIGN', 
  'NAPKIN_DESIGN', 'REGISTRATION_BACK_WALL'
]);

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

// Hyper-realistic environment contexts for different asset types
const HYPERREALISTIC_CONTEXTS: Record<string, string> = {
  // Apparel - on real models/mannequins
  TSHIRT: "Photorealistic product photography of a premium t-shirt worn by an attractive model in a professional studio setting. Dramatic lighting, shallow depth of field. The t-shirt features",
  TSHIRT_BACK: "Photorealistic product shot showing the back of a premium t-shirt on a model. Professional studio lighting, fashion photography quality. The back design shows",
  HAT: "Photorealistic product photography of a high-quality baseball cap/dad hat on a model or floating in a professional studio setting. Clean background, perfect lighting. The cap features",
  
  // Merchandise - in real environments
  SWAG_BAG: "Photorealistic product photography of a premium canvas tote bag held by a hand or styled on a rustic wooden table with lifestyle props. The tote bag design shows",
  WATER_BOTTLE: "Photorealistic product photography of a sleek stainless steel water bottle with condensation droplets, on a modern desk or gym setting. The bottle wrap design features",
  LANYARD: "Photorealistic product photography of a premium lanyard with badge holder worn around someone's neck at a professional conference. Shallow depth of field. The lanyard shows",
  
  // Signage - in venue environments
  BANNER: "Photorealistic 3D render of a professional retractable banner stand in a modern conference center lobby. Realistic lighting, reflective floor. The banner displays",
  EVENT_SIGNAGE: "Photorealistic 3D render of professional event signage mounted on a modern exhibition wall. Other event elements visible in background. The sign shows",
  HANGING_SIGNAGE: "Photorealistic 3D render of overhead hanging banners in a large convention hall with dramatic lighting from above. The banners display",
  OUTDOOR_SIGNAGE: "Photorealistic 3D render of outdoor event signage on a sunny day outside a modern venue entrance. The sign shows",
  FEATHER_FLAG: "Photorealistic 3D render of a feather flag on a windy day outside an event venue with grass and blue sky. The flag displays",
  TEARDROP_FLAG: "Photorealistic 3D render of teardrop promotional flags flanking a venue entrance. The flags show",
  
  // Counters & Structures - in realistic venues
  REGISTRATION_COUNTER: "Photorealistic 3D render of a modern branded registration desk in a sleek convention center. Staff area visible, attendees approaching. The counter branding shows",
  WELCOME_COUNTER: "Photorealistic 3D render of an elegant welcome/information desk in a luxury hotel lobby with marble floors. The desk displays",
  TECHNOLOGY_COUNTER: "Photorealistic 3D render of a modern tech support station with device charging, in a contemporary event space. The station branding features",
  KIOSK: "Photorealistic 3D render of an interactive touchscreen kiosk in a busy exhibition hall with people walking by. The kiosk displays",
  
  // Backdrops & Stages
  STEP_AND_REPEAT: "Photorealistic 3D render of a professional step and repeat media wall with paparazzi-style lighting and velvet rope visible. Red carpet in foreground. The backdrop shows a repeating pattern of",
  BACK_WALL: "Photorealistic 3D render of a modern event backdrop with dramatic stage lighting and AV equipment visible. The wall features",
  MAIN_STAGE_BACKDROP: "Photorealistic 3D render of a massive main stage at a professional conference with LED screens, professional lighting rigs, and audience silhouettes. The backdrop displays",
  
  // Architectural elements
  STAIRS: "Photorealistic 3D render of grand venue stairs with branded risers, attendees walking up, beautiful lighting from above. The stair graphics show",
  GLASS_DOOR: "Photorealistic 3D render of modern glass entrance doors with vinyl graphics, people entering the building. The door branding shows",
  GLASS_DOUBLE_DOOR: "Photorealistic 3D render of elegant double glass doors at a corporate venue with the branded graphics spanning both panels. The design displays",
  GLASS_ROTATING_DOOR: "Photorealistic 3D render of a branded revolving door at a modern office tower entrance. The door panels show",
  
  // Print materials in context
  NAME_TAG: "Photorealistic product photography of a premium name badge with lanyard on a conference table with coffee cup and notebook props. The badge design features",
  FOLDER: "Photorealistic product photography of a professional presentation folder on a mahogany boardroom table with pen and business cards. The folder cover shows",
  MENU: "Photorealistic product photography of an elegant menu card on a beautifully set dining table with wine glasses and fine dining elements. The menu design features",
};

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

// Inline analysis for when no pre-computed analysis is provided
// This saves a round-trip by doing analysis in the same call as generation
async function performInlineAnalysis(
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
      masterPatternBase64,
      venueImageBase64,
      renderMode = 'hyperrealistic',
      imageAnalysis: providedAnalysis, // Comprehensive analysis from reference image
      venueIntelligence // AI-researched venue intelligence data
    } = body;

    // OPTIMIZATION: Perform inline analysis if vibe image exists but no analysis provided
    // This saves a separate analyze-reference-image call
    let imageAnalysis: ImageAnalysis | undefined = providedAnalysis;
    if (!imageAnalysis && vibeImageBase64) {
      console.log('No pre-computed analysis provided, performing inline analysis...');
      const inlineResult = await performInlineAnalysis(LOVABLE_API_KEY, vibeImageBase64, eventName, eventDescription);
      if (inlineResult) {
        imageAnalysis = inlineResult;
        console.log('Inline analysis successful:', imageAnalysis.designStyle, imageAnalysis.mood);
      }
    }

    // Determine which prompt to use based on render mode
    let basePrompt: string;
    
    if (renderMode === 'hyperrealistic' && HYPERREALISTIC_CONTEXTS[assetType]) {
      // Use hyper-realistic environment prompt
      basePrompt = HYPERREALISTIC_CONTEXTS[assetType];
    } else if (renderMode === 'design' || assetType.includes('_ISOLATED')) {
      // Flat design mode - no mockup, just the artwork
      basePrompt = ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
    } else {
      // Standard mockup mode
      basePrompt = ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
    }
    
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

    // Build venue intelligence context from AI research
    let venueIntelligenceContext = '';
    if (venueIntelligence) {
      // Use the culturalContext field for design guidance
      const hasCulturalData = venueIntelligence.culturalContext || venueIntelligence.description;
      
      if (hasCulturalData) {
        venueIntelligenceContext = `
VENUE INTELLIGENCE - AI-RESEARCHED DESIGN CONTEXT:
This design is for "${venueIntelligence.name || location}".
${venueIntelligence.venueType ? `Venue Type: ${venueIntelligence.venueType}` : ''}
${venueIntelligence.city ? `City: ${venueIntelligence.city}` : ''}

${venueIntelligence.culturalContext ? `CULTURAL & DESIGN CONTEXT:
${venueIntelligence.culturalContext}
Incorporate these culturally appropriate design elements and respect the venue's heritage.` : ''}

${venueIntelligence.description ? `VENUE DESCRIPTION:
${venueIntelligence.description}
Design should complement this venue's character and atmosphere.` : ''}

${venueIntelligence.bestFor?.length ? `VENUE BEST SUITED FOR: ${venueIntelligence.bestFor.join(', ')}
Consider these typical use cases when designing.` : ''}

The design should feel like it BELONGS in this specific venue - as if it was custom-designed for this exact space.`;
      }
      
      // Add venue-specific practical context that may influence design
      if (venueIntelligence.venueType || venueIntelligence.capacity) {
        venueIntelligenceContext += `
VENUE ATMOSPHERE:
${venueIntelligence.venueType ? `This is a ${venueIntelligence.venueType}` : 'This venue'}${venueIntelligence.capacity ? ` with capacity for ${venueIntelligence.capacity}` : ''}.
${venueIntelligence.priceRange ? `Price range: ${venueIntelligence.priceRange}.` : ''}
Design should match the expected sophistication and energy level of this type of venue.`;
      }

      // Add local tips for authentic design elements
      if (venueIntelligence.localTips) {
        venueIntelligenceContext += `
LOCAL DESIGN TIPS:
${venueIntelligence.localTips}`;
      }
    }

    // Build logo integration instructions - STRENGTHENED for consistent visibility
    const logoInstructions = logoBase64 
      ? `
LOGO INTEGRATION - ABSOLUTELY CRITICAL (HIGHEST PRIORITY):
Reference Image #1 is the EVENT LOGO. This is the PRIMARY brand element and MUST be treated with utmost importance.

MANDATORY LOGO PLACEMENT REQUIREMENTS:
1. VISIBILITY: The logo MUST be clearly visible and immediately recognizable in the final design
2. SIZE: The logo should occupy at least 15-25% of the visual hierarchy - it should NEVER be tiny or hidden
3. POSITIONING: Place the logo in a prominent position:
   - For signage/banners: Center or top-center placement preferred
   - For merchandise: Front and center, appropriately sized for the item
   - For digital assets: Above the fold, clearly visible
4. INTEGRITY: The logo MUST remain:
   - Undistorted (maintain original aspect ratio)
   - Unobscured (no elements overlapping or competing)
   - Sharp and crisp (not blurred or pixelated)
   - Properly contrasted against background (ensure readability)
5. PROTECTION: Leave adequate clear space around the logo - no text or design elements crowding it

BRAND COHESION REQUIREMENTS:
6. Extract the logo's color palette and use it as the FOUNDATION for all design choices
7. Match the logo's visual style (modern, vintage, minimal, bold, etc.) throughout the design
8. Typography should complement (not compete with) the logo's typographic style
9. All design elements should feel like natural extensions of the logo's brand identity
10. The logo is the HERO - everything else supports it

FAILURE CRITERIA - DO NOT:
- Make the logo too small or insignificant
- Place the logo in corners where it can be overlooked
- Use colors that clash with or diminish the logo
- Apply effects that distort the logo (extreme shadows, warping)
- Let busy backgrounds make the logo hard to see`
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

    // Build venue compositing instructions - for placing assets in actual venue photos
    const venueInstructions = venueImageBase64
      ? `
VENUE COMPOSITING - CRITICAL:
Reference Image #${(logoBase64 ? 1 : 0) + (vibeImageBase64 ? 1 : 0) + (masterPatternBase64 ? 1 : 0) + 1} is the ACTUAL VENUE PHOTO where this asset will be displayed.
You MUST:
1. Composite the branded asset INTO this actual venue environment
2. Match the lighting, perspective, and shadows of the venue photo
3. Make the branded element look like it belongs naturally in the space
4. The final image should look like a real photograph of the installed branding
5. Maintain photorealistic quality - this should look like a professional installation photo`
      : '';

    // Build style instructions
    const styleInstructions = styleDescription 
      ? `
STYLE DIRECTION:
${styleDescription}
Follow these style guidelines precisely.`
      : '';

    // Build comprehensive image analysis instructions
    const analysisInstructions = imageAnalysis && imageAnalysis.analysisConfidence > 0.5 ? `
IMAGE ANALYSIS - DESIGN INTELLIGENCE FROM REFERENCE:
The reference image has been analyzed in detail. Apply these findings:

DESIGN STYLE: ${imageAnalysis.designStyle}
ERA/PERIOD: ${imageAnalysis.era}
MOOD: ${imageAnalysis.mood} | ATMOSPHERE: ${imageAnalysis.atmosphere}
EMOTIONAL TONE: ${imageAnalysis.emotionalTone}

VISUAL CHARACTERISTICS:
- Aesthetic Keywords: ${imageAnalysis.aestheticKeywords?.join(', ') || 'modern, professional'}
- Shapes: ${imageAnalysis.shapes || 'mixed'}
- Patterns: ${imageAnalysis.patterns?.join(', ') || 'none'}
- Textures: ${imageAnalysis.textures?.join(', ') || 'smooth'}

TYPOGRAPHY GUIDANCE:
- Style: ${imageAnalysis.typographyStyle || 'sans-serif modern'}
- Mood: ${imageAnalysis.typographyMood || 'clean'}

COMPOSITION:
- Layout: ${imageAnalysis.composition || 'balanced'}
- Whitespace: ${imageAnalysis.whitespace || 'balanced'}
- Visual Weight: ${imageAnalysis.visualWeight || 'balanced'}

GENERATION GUIDANCE - APPLY THESE:
${imageAnalysis.promptEnhancements?.map(p => `- ${p}`).join('\n') || '- Professional, cohesive design'}

AVOID THESE ELEMENTS:
${imageAnalysis.avoidElements?.map(a => `- DO NOT use: ${a}`).join('\n') || '- Avoid cluttered layouts'}`
      : '';

    // Build hyper-realistic requirements based on render mode
    const realismRequirements = renderMode === 'hyperrealistic' && !assetType.includes('_ISOLATED')
      ? `
PHOTOREALISTIC RENDERING - CRITICAL:
- Render as a professional product/environment photograph
- Use dramatic, professional lighting with soft shadows
- Include shallow depth of field for focus emphasis
- Add subtle environmental context (reflections, ambient occlusion)
- Quality should match high-end advertising photography
- Make viewers believe this is a real photograph, not a render`
      : '';

    // Determine if this is a print asset (either explicitly flagged or auto-detected)
    const isPrint = body.isPrintAsset ?? PRINT_ASSET_TYPES.has(assetType);
    const targetDPI = body.printDPI || (isPrint ? 300 : 150);

    // Build print-specific requirements for maximum quality output
    const printRequirements = isPrint ? `
PRINT PRODUCTION REQUIREMENTS - CRITICAL:
This asset is destined for professional print production. You MUST ensure:

COLOR & FIDELITY:
- Use CMYK-safe colors only - avoid neon/fluorescent colors that won't print accurately
- Prefer rich, saturated colors that reproduce well in print
- No RGB-only colors like pure blue (#0000FF) - these shift dramatically in print
- Use appropriate contrast for print reproduction (screens appear brighter than print)

RESOLUTION & CLARITY:
- Generate at maximum possible resolution (${targetDPI}+ DPI equivalent quality)
- All text must be crisp, sharp, and anti-aliased for clean print edges
- Fine details must be clear enough to survive print production
- Avoid compression artifacts or noise - clean, professional output

LAYOUT FOR PRINT:
- Keep critical content (text, logos) away from edges (safe zone)
- Extend backgrounds fully to edges for bleed area trimming
- Text should be large enough to read at print size
- High contrast between text and backgrounds

PROFESSIONAL PRINT AESTHETIC:
- Think like a print production designer
- Textures and gradients should be smooth, not banded
- Solid colors should be perfectly solid
- This will be produced by professional print vendors` : '';

    const fullPrompt = `Generate an image: ${basePrompt}

Event: "${eventName}"
${eventDescription ? `Event Description: ${eventDescription}` : ''}
${styleInstructions}
${analysisInstructions}
${colorContext}
${locationContext}
${venueIntelligenceContext}
${logoInstructions}
${vibeInstructions}
${patternInstructions}
${venueInstructions}
${realismRequirements}
${printRequirements}

REQUIREMENTS:
- Create a high-quality, professional design
- Ultra high resolution - maximum quality output
- Modern, polished aesthetic
${isPrint ? '- PRINT-OPTIMIZED: CMYK-safe colors, crisp text, production-ready quality' : '- Suitable for digital display'}
- Ensure text is razor-sharp and perfectly legible
- Maintain visual hierarchy with the event name prominent
- ALL REFERENCE IMAGES PROVIDED SHOULD INFORM THE FINAL DESIGN
${imageAnalysis ? '- APPLY ALL DESIGN INTELLIGENCE FROM IMAGE ANALYSIS' : ''}
${venueIntelligence ? '- APPLY VENUE INTELLIGENCE TO CREATE VENUE-SPECIFIC DESIGN' : ''}
${isPrint ? '- This asset WILL BE PRINTED - quality is paramount' : ''}`;

    console.log(`Generating ${isPrint ? 'PRINT-READY' : 'digital'} image for ${assetType}: ${eventName}${location ? ` (Location: ${location})` : ''}${venueIntelligence?.name ? ` [venue: ${venueIntelligence.name}]` : ''} [mode: ${renderMode}]${isPrint ? ` [${targetDPI}DPI]` : ''}${vibeImageBase64 ? ' [vibe]' : ''}${masterPatternBase64 ? ' [pattern]' : ''}${venueImageBase64 ? ' [venue-photo]' : ''}`);

    // Collect all reference images in order
    const referenceImages: string[] = [];
    if (logoBase64) referenceImages.push(logoBase64);
    if (vibeImageBase64) referenceImages.push(vibeImageBase64);
    if (masterPatternBase64) referenceImages.push(masterPatternBase64);
    if (venueImageBase64) referenceImages.push(venueImageBase64); // Venue photo for compositing

    const imageUrl = await generateImageWithRetry(LOVABLE_API_KEY, fullPrompt, assetType, referenceImages);
    
    console.log(`Successfully generated ${isPrint ? 'PRINT-READY' : renderMode} image for ${assetType}`);

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