// Asset-specific prompt templates and configurations

// Print asset categories for automatic detection
export const PRINT_ASSET_TYPES = new Set([
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

// Hyper-realistic environment contexts for different asset types
export const HYPERREALISTIC_CONTEXTS: Record<string, string> = {
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

// Standard design prompts for each asset type
export const ASSET_PROMPTS: Record<string, string> = {
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
  STEP_AND_REPEAT: "Design a STEP AND REPEAT media wall backdrop. Create a grid pattern where the event logo/branding repeats in an offset grid pattern across the entire backdrop. The logos should be evenly spaced in a diagonal or straight grid pattern. This is a photo backdrop where celebrities and guests pose for photos. The repeating pattern should be clean, professional, and clearly show the brand/event name multiple times. Typical dimensions are wide format (16:9 or wider). High contrast for photography.",
  
  // Isolated design variants
  TSHIRT_ISOLATED: "Generate ONLY the isolated design graphic on a transparent background. Do NOT show any t-shirt or clothing. Just the artwork/logo/graphic that will be printed. Suitable for screen printing with clean edges. 12x16 inch design area.",
  TSHIRT_BACK_ISOLATED: "Generate ONLY the isolated back design graphic on a transparent background. Do NOT show any t-shirt. Just the artwork with event name, date, sponsors. Clean edges for screen printing. 12x14 inch design area.",
  HAT_ISOLATED: "Generate ONLY the isolated embroidery-ready logo on a transparent background. Do NOT show any hat or cap. Just the logo with clean lines, no gradients, suitable for embroidery stitching. Max 6 colors. 4x2.5 inch design area.",
  BANNER_ISOLATED: "Generate FLAT PRINT-READY banner design. Full 33x81 inch retractable banner artwork. Include 1 inch bleed. Complete design with no banner stand visible.",
  STEP_AND_REPEAT_ISOLATED: "Generate FLAT PRINT-READY step and repeat pattern. Create an 8ft x 10ft repeating grid of logos/brand elements with proper spacing. Offset grid pattern. NO people, NO 3D elements. Just the flat repeating pattern artwork ready for large format printing.",
};

/**
 * Get the appropriate base prompt for an asset type
 */
export function getBasePrompt(
  assetType: string,
  renderMode: 'design' | 'mockup' | 'hyperrealistic' = 'hyperrealistic'
): string {
  if (renderMode === 'hyperrealistic' && HYPERREALISTIC_CONTEXTS[assetType]) {
    return HYPERREALISTIC_CONTEXTS[assetType];
  }
  
  if (renderMode === 'design' || assetType.includes('_ISOLATED')) {
    return ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
  }
  
  return ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
}

/**
 * Check if an asset type is a print asset
 */
export function isPrintAsset(assetType: string): boolean {
  return PRINT_ASSET_TYPES.has(assetType);
}
