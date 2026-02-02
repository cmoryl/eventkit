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
// EVERY asset must render as a real-world physical/digital mockup
export const HYPERREALISTIC_CONTEXTS: Record<string, string> = {
  // === APPAREL - on real models/mannequins ===
  TSHIRT: "Photorealistic product photography of a premium t-shirt worn by an attractive model in a professional studio setting. Dramatic lighting, shallow depth of field. The t-shirt features",
  TSHIRT_BACK: "Photorealistic product shot showing the back of a premium t-shirt on a model. Professional studio lighting, fashion photography quality. The back design shows",
  TSHIRT_SLEEVE: "Photorealistic close-up product photography of a t-shirt sleeve detail on a model, showing embroidered or printed sleeve graphic. Studio lighting. The sleeve design shows",
  HAT: "Photorealistic product photography of a high-quality baseball cap/dad hat on a model or floating in a professional studio setting. Clean background, perfect lighting. The cap features",
  VOLUNTEER_VEST: "Photorealistic product photography of a branded safety vest worn by a friendly volunteer at an event venue. Natural lighting, professional event setting. The vest displays",
  
  // === MERCHANDISE - in real environments ===
  SWAG_BAG: "Photorealistic product photography of a premium canvas tote bag held by a hand or styled on a rustic wooden table with lifestyle props. The tote bag design shows",
  WATER_BOTTLE: "Photorealistic product photography of a sleek stainless steel water bottle with condensation droplets, on a modern desk or gym setting. The bottle wrap design features",
  LANYARD: "Photorealistic product photography of a premium fabric lanyard with metal badge clip, worn around someone's neck at a professional conference. Shallow depth of field showing texture. The lanyard shows",
  WRISTBAND_DESIGN: "Photorealistic product photography of fabric event wristbands on a wrist, concert/festival atmosphere with blurred lights in background. The wristband design features",
  COASTER_DESIGN: "Photorealistic product photography of premium cork/cardboard coasters stacked on a bar counter with a glass of drink. Ambient bar lighting. The coaster design shows",
  NAPKIN_DESIGN: "Photorealistic product photography of elegant cocktail napkins fanned out on a marble table at a gala dinner. Candlelight ambiance. The napkin design features",
  COCKTAIL_NAPKIN: "Photorealistic product photography of a cocktail napkin under a crystal glass at an upscale bar. Moody lighting. The napkin shows",
  GIFT_BOX: "Photorealistic product photography of a premium branded gift box with ribbon, on a luxurious surface with tissue paper visible. The box design features",
  STICKER_SHEET: "Photorealistic product photography of die-cut stickers partially peeled from their backing sheet, scattered on a creative workspace desk. The stickers show",
  MATCHBOOK: "Photorealistic product photography of branded matchbooks on a restaurant table, one slightly open. Warm ambient lighting. The matchbook design shows",
  
  // === BADGES & CREDENTIALS ===
  NAME_TAG: "Photorealistic product photography of a premium name badge with lanyard, laying on a conference registration desk with event materials around it. The badge design features",
  NAME_TAG_BACK: "Photorealistic product shot of the back of a name badge showing schedule and QR code, held in hand at a conference. The back design shows",
  VIP_PASS: "Photorealistic product photography of an exclusive VIP laminated pass with holographic elements, held against a red carpet event backdrop. The VIP pass design features",
  BACKSTAGE_PASS: "Photorealistic product photography of a backstage access pass on a lanyard, with stage equipment blurred in background. The pass design shows",
  MEDIA_CREDENTIAL: "Photorealistic product photography of a press/media credential badge with camera strap visible, in a press room setting. The credential features",
  SECURITY_BADGE: "Photorealistic product photography of a security personnel badge clipped to a suit jacket, professional event setting. The badge design shows",
  PARKING_PASS: "Photorealistic product photography of a parking permit hanging from a car rearview mirror, windshield and venue visible through glass. The pass shows",
  
  // === SIGNAGE - in venue environments ===
  BANNER: "Photorealistic 3D render of a professional retractable banner stand in a modern conference center lobby with polished floors reflecting the banner. Realistic lighting. The banner displays",
  ROLLUP_BANNER: "Photorealistic 3D render of a premium roll-up banner stand at a trade show booth with other exhibitors blurred in background. The banner shows",
  EVENT_SIGNAGE: "Photorealistic 3D render of professional event signage mounted on a modern exhibition wall. Other event elements visible in background. The sign shows",
  HANGING_SIGNAGE: "Photorealistic 3D render of overhead hanging fabric banners in a large convention hall with dramatic lighting from above. The banners display",
  OUTDOOR_SIGNAGE: "Photorealistic 3D render of weather-resistant outdoor event signage on a sunny day outside a modern venue entrance with people walking by. The sign shows",
  DOOR_SIGNAGE: "Photorealistic 3D render of professional door signage on a conference room door, showing room name and session info. The sign displays",
  ROOM_SIGNAGE: "Photorealistic 3D render of illuminated room identification signage outside a meeting room with glass walls. The signage shows",
  LOCATION_SIGNAGE: "Photorealistic 3D render of wayfinding/directional signage with arrows in a modern convention center corridor with attendees walking. The signs display",
  WIFI_SIGN: "Photorealistic 3D render of a WiFi information sign on an easel in a hotel lobby with comfortable seating visible. The sign shows",
  EASEL_SIGNAGE: "Photorealistic 3D render of a welcome sign on a wooden easel at a venue entrance with floral arrangements nearby. The sign displays",
  ACCESSIBILITY_SIGNAGE: "Photorealistic 3D render of ADA-compliant accessibility signage with Braille, mounted on a wall near elevators. The sign shows",
  ADA_SIGNAGE: "Photorealistic 3D render of tactile ADA wayfinding signage with raised text and Braille in a modern building corridor. The sign displays",
  EMERGENCY_EXIT: "Photorealistic 3D render of illuminated emergency exit signage above a door in a convention center, meeting safety standards. The sign shows",
  CROWD_CONTROL: "Photorealistic 3D render of crowd management signage with stanchions and velvet ropes at an event entrance. The signage displays",
  SHUTTLE_SIGNAGE: "Photorealistic 3D render of transportation/shuttle bus stop signage at a hotel or venue pickup area. The sign shows",
  LOADING_DOCK: "Photorealistic 3D render of loading dock/service entrance signage at a venue's back of house area. The sign displays",
  HEALTH_SCREENING: "Photorealistic 3D render of health checkpoint signage with safety protocols displayed at a venue entrance. The sign shows",
  
  // === FLAGS & OUTDOOR ===
  FEATHER_FLAG: "Photorealistic 3D render of a tall feather flag on a windy day outside an event venue with grass and blue sky. Motion blur on flag edge. The flag displays",
  TEARDROP_FLAG: "Photorealistic 3D render of teardrop promotional flags flanking a venue entrance with people entering. The flags show",
  A_FRAME: "Photorealistic 3D render of an A-frame sandwich board sign on a sidewalk outside a venue with pedestrians passing. The sign shows",
  PORTABLE_BILLBOARD: "Photorealistic 3D render of a portable billboard on wheels in an outdoor event area with tents visible. The billboard displays",
  
  // === COUNTERS & STRUCTURES ===
  REGISTRATION_COUNTER: "Photorealistic 3D render of a modern branded registration desk in a sleek convention center with monitors, staff area, and attendees approaching. The counter branding shows",
  WELCOME_COUNTER: "Photorealistic 3D render of an elegant welcome/information desk in a luxury hotel lobby with marble floors and chandelier lighting. The desk displays",
  TECHNOLOGY_COUNTER: "Photorealistic 3D render of a modern tech support station with device charging ports, in a contemporary event space with attendees. The station branding features",
  TECH_COUNTER: "Photorealistic 3D render of a tech help desk with laptops and charging cables, branded panels glowing in a modern venue. The counter shows",
  KIOSK: "Photorealistic 3D render of an interactive touchscreen kiosk in a busy exhibition hall with people walking by. The kiosk displays",
  FEEDBACK_KIOSK: "Photorealistic 3D render of a feedback/survey kiosk with touchscreen in a post-event area. The kiosk branding shows",
  REGISTRATION_WALL: "Photorealistic 3D render of a dramatic branded registration wall behind check-in counters with dramatic lighting. The wall displays",
  
  // === BACKDROPS & STAGES ===
  STEP_AND_REPEAT: "Photorealistic 3D render of a professional step and repeat media wall with paparazzi-style lighting, velvet rope, and red carpet in foreground. The backdrop shows a repeating pattern of",
  BACK_WALL: "Photorealistic 3D render of a modern event backdrop wall with integrated LED accent lighting and AV equipment visible. The wall features",
  MAIN_STAGE_BACKDROP: "Photorealistic 3D render of a massive main stage at a professional conference with LED screens, professional lighting rigs, podium, and audience silhouettes. The backdrop displays",
  STAGE_BACKDROP: "Photorealistic 3D render of a presentation stage backdrop with dramatic theatrical lighting and speaker podium. The backdrop shows",
  SPONSOR_WALL: "Photorealistic 3D render of a sponsor recognition wall with multiple company logos at various tiers in a networking area. The wall displays",
  SPONSOR_BANNER: "Photorealistic 3D render of sponsor banners hanging in a row in a convention hall with ambient lighting. The banners show",
  SELFIE_STATION: "Photorealistic 3D render of a fun selfie photo station with ring light, props, and branded backdrop at an event. The station features",
  SELFIE_FRAME: "Photorealistic product photography of an oversized photo frame prop with event branding, held by attendees taking a selfie. The frame shows",
  PHOTO_BOOTH_FRAME: "Photorealistic 3D render of a photo booth with branded frame surround, lighting, and prop table nearby. The booth displays",
  PHOTO_BOOTH_PROPS: "Photorealistic product photography of photo booth props (glasses, hats, signs) with event branding spread on a table. The props feature",
  GREEN_ROOM: "Photorealistic 3D render of a speaker green room/VIP lounge with branded signage, comfortable seating, and refreshments. The room branding shows",
  VIP_LOUNGE: "Photorealistic 3D render of an exclusive VIP lounge area with plush seating, branded elements, and ambient lighting. The lounge features",
  
  // === ARCHITECTURAL ELEMENTS ===
  STAIRS: "Photorealistic 3D render of grand venue stairs with branded risers, attendees walking up, beautiful lighting from above. The stair graphics show",
  STAIR_GRAPHICS: "Photorealistic 3D render of escalator or stair riser graphics in a modern convention center with people using them. The graphics display",
  ESCALATOR_GRAPHICS: "Photorealistic 3D render of branded escalator side panels in a convention center with attendees riding. The graphics show",
  GLASS_DOOR: "Photorealistic 3D render of modern glass entrance doors with frosted vinyl graphics, people entering the building. Natural daylight. The door branding shows",
  GLASS_DOUBLE_DOOR: "Photorealistic 3D render of elegant double glass doors at a corporate venue with branded graphics spanning both panels seamlessly. The design displays",
  GLASS_ROTATING_DOOR: "Photorealistic 3D render of a branded revolving door at a modern office tower entrance with reflections and people passing through. The door panels show",
  ELEVATOR_WRAP: "Photorealistic 3D render of elevator doors with full vinyl wrap in a modern building lobby. The elevator branding shows",
  COLUMN_WRAP: "Photorealistic 3D render of structural columns wrapped with branded graphics in an exhibition hall. The column wraps display",
  CEILING_HANGER: "Photorealistic 3D render of branded ceiling-hung banners or mobiles in a large atrium space with dramatic height. The hanging elements show",
  WINDOW_CLING: "Photorealistic 3D render of window cling graphics on large venue windows with city view behind, interior lighting visible. The window graphics display",
  FLOOR_DECAL: "Photorealistic 3D render of floor graphics/decals in a high-traffic area with attendees walking over them. The floor graphics show",
  
  // === TABLE & DINING ===
  TABLE_TENT: "Photorealistic product photography of a table tent card on a set dining table with glasses and place settings. The table tent displays",
  TABLE_NUMBER: "Photorealistic product photography of an elegant table number holder on a wedding/gala dining table with floral centerpiece. The number design features",
  TABLE_RUNNER: "Photorealistic product photography of a branded table runner on a long banquet table with place settings. The runner shows",
  TABLECLOTH: "Photorealistic 3D render of branded tablecloths on registration or display tables at an event. The tablecloth design features",
  PLACE_CARD: "Photorealistic product photography of elegant place cards on fine dining plates with silverware and glassware. The cards display",
  MENU: "Photorealistic product photography of an elegant menu card on a beautifully set dining table with wine glasses and fine dining elements. The menu design features",
  BAR_MENU: "Photorealistic product photography of a bar menu on the bar counter with cocktail glasses and bottles in background. The menu shows",
  DIETARY_CARD: "Photorealistic product photography of dietary restriction/allergen cards near a buffet station. The cards display",
  CATERING_LABEL: "Photorealistic product photography of food labels/signs at a catering station with dishes visible. The labels show",
  
  // === PRINT MATERIALS ===
  FOLDER: "Photorealistic product photography of a professional presentation folder on a mahogany boardroom table with pen and business cards nearby. The folder cover shows",
  INVITATION: "Photorealistic product photography of a premium invitation card with envelope on a marble surface with calligraphy pen. The invitation design features",
  RSVP_CARD: "Photorealistic product photography of an RSVP response card with envelope on an elegant desk setting. The card shows",
  TICKET: "Photorealistic product photography of event tickets fanned out with a lanyard badge nearby on a surface. The ticket design features",
  PROGRAM_BOOKLET: "Photorealistic product photography of an event program booklet opened on a conference table with coffee cup nearby. The booklet cover shows",
  THANK_YOU_NOTE: "Photorealistic product photography of elegant thank you cards stacked with a fountain pen on a linen surface. The card design features",
  ENVELOPE: "Photorealistic product photography of branded envelopes with liner visible, on a desk with letter opener. The envelope design shows",
  CERTIFICATE: "Photorealistic product photography of a framed certificate with gold seal and ribbon on an executive desk. The certificate displays",
  EVALUATION_FORM: "Photorealistic product photography of feedback/evaluation forms on clipboards at session seats. The form design shows",
  FLOOR_PLAN: "Photorealistic product photography of a printed floor plan/map unfolded on an information desk. The map shows",
  SEATING_CHART: "Photorealistic 3D render of a large printed seating chart display on an easel at a gala entrance. The chart displays",
  
  // === DIGITAL DISPLAYS ===
  PRESENTATION_SLIDE: "Photorealistic 3D render of a presentation slide displayed on a large LED screen in a modern conference room with audience silhouettes. The slide shows",
  WEBINAR_SLIDE: "Photorealistic mockup of a webinar presentation slide on a laptop screen in a home office setting. The slide displays",
  SOCIAL_POST: "Photorealistic mockup of a social media post displayed on an iPhone screen held in hand, Instagram/LinkedIn interface visible. The post shows",
  SOCIAL_STORY: "Photorealistic mockup of an Instagram/TikTok story displayed on a smartphone screen with notification badges. The story features",
  SOCIAL_PROFILE: "Photorealistic mockup of a social media profile page on a phone screen with followers and posts visible. The profile shows",
  EMAIL_HEADER: "Photorealistic mockup of an email opened on a laptop/desktop screen showing the header banner in an email client. The header displays",
  LINKEDIN_BANNER: "Photorealistic mockup of a LinkedIn profile/company page banner on a desktop monitor in an office setting. The banner shows",
  TWITTER_HEADER: "Photorealistic mockup of a Twitter/X profile header on a mobile device screen. The header features",
  YOUTUBE_THUMBNAIL: "Photorealistic mockup of a YouTube video thumbnail on a tablet screen showing the YouTube interface. The thumbnail displays",
  PODCAST_COVER: "Photorealistic mockup of a podcast cover displayed in a podcast app on a smartphone with AirPods nearby. The cover shows",
  ZOOM_BACKGROUND: "Photorealistic mockup of a Zoom virtual background in use during a video call on a monitor screen. The background features",
  STREAM_OVERLAY: "Photorealistic mockup of a streaming overlay on a gaming monitor with streaming software interface visible. The overlay displays",
  LIVE_STREAM_OVERLAY: "Photorealistic mockup of a live event stream overlay on a broadcast monitor in a production control room. The overlay shows",
  SIGNAGE_LOOP: "Photorealistic 3D render of digital signage displays in a venue lobby showing animated event content. The screens display",
  COUNTDOWN: "Photorealistic 3D render of a large LED countdown display in an event venue showing days/hours until event. The display shows",
  
  // === DIGITAL ASSETS ===
  APP_ICON: "Photorealistic mockup of an app icon on an iPhone home screen among other apps, phone held in hand. The icon design features",
  APP_SPLASH: "Photorealistic mockup of an app splash/loading screen on a smartphone being held, app opening animation implied. The splash shows",
  FAVICON: "Photorealistic mockup of browser tabs on a monitor showing the favicon in the tab, website partially visible. The favicon displays",
  QR_CODE: "Photorealistic product photography of a QR code on signage or printed material, with a phone scanning it. The QR code links to",
  AR_MARKER: "Photorealistic product photography of an AR marker being scanned by a phone showing augmented content appearing. The marker displays",
  
  // === DOCUMENTS & MEDIA ===
  PRESS_RELEASE: "Photorealistic product photography of a printed press release on a journalist's desk with notepad and recorder. The release header shows",
  MEDIA_KIT: "Photorealistic product photography of a media kit folder with USB drive and printed materials spread on a desk. The kit features",
  SPONSOR_PACKAGE: "Photorealistic product photography of a sponsorship proposal booklet opened on a boardroom table. The package shows",
  STYLE_GUIDE: "Photorealistic product photography of a printed brand style guide laid open showing color and typography pages. The guide displays",
  
  // === SPECIALTY ITEMS ===
  POLL_CARD: "Photorealistic product photography of audience response/poll cards being held up at an event session. The cards show",
  NETWORKING_BINGO: "Photorealistic product photography of networking bingo cards with some squares marked, on a cocktail table. The card displays",
  SCAVENGER_HUNT: "Photorealistic product photography of a scavenger hunt map/card being held with event venue in background. The hunt card shows",
  AGENDA_HIGHLIGHTS: "Photorealistic product photography of a printed agenda highlights card tucked into a lanyard holder. The card displays",
  SPEAKER_INTRO: "Photorealistic 3D render of a speaker introduction slide on stage screens with the speaker approaching podium. The intro shows",
  BREAKOUT_SESSION: "Photorealistic 3D render of breakout session signage outside a meeting room with attendees gathering. The sign displays",
  
  // === VIDEO & MOTION ===
  VIDEO_INTRO: "Photorealistic 3D render of a video intro frame displayed on a large projector screen in a darkened auditorium. The intro shows",
  MOTION_GRAPHIC: "Photorealistic mockup of a motion graphic still frame on a video editing timeline on a professional monitor. The graphic features",
  ANIMATED_LOGO: "Photorealistic mockup of an animated logo reveal frame on a cinema screen in a screening room. The logo animation shows",
  VIDEO_TEASER: "Photorealistic mockup of a video teaser playing on social media on a smartphone screen with engagement visible. The teaser shows",
  HYBRID_EVENT: "Photorealistic 3D render of a hybrid event setup with in-person stage and remote attendees visible on screens. The branding shows",
  
  // === 3D/VR ===
  VENUE_TOUR_3D: "Photorealistic screenshot of a 3D virtual venue tour on a computer screen showing interactive navigation. The tour features",
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
 * ALWAYS returns a photorealistic/mockup context for real-world visualization
 */
export function getBasePrompt(
  assetType: string,
  renderMode: 'design' | 'mockup' | 'hyperrealistic' = 'hyperrealistic'
): string {
  // For isolated/print-ready variants, return flat design prompts
  if (renderMode === 'design' || assetType.includes('_ISOLATED')) {
    return ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
  }
  
  // For hyperrealistic mode, always try to return a real-world context
  if (renderMode === 'hyperrealistic' || renderMode === 'mockup') {
    // First check if we have a specific context
    if (HYPERREALISTIC_CONTEXTS[assetType]) {
      return HYPERREALISTIC_CONTEXTS[assetType];
    }
    
    // Generate a dynamic photorealistic context for unknown asset types
    const formattedType = assetType.toLowerCase().replace(/_/g, ' ');
    const isPrint = PRINT_ASSET_TYPES.has(assetType);
    
    if (isPrint) {
      return `Photorealistic product photography of a professional ${formattedType} in a real-world environment. Show it as it would appear when printed and in use at a high-end corporate event. Professional lighting, shallow depth of field, premium materials visible. The ${formattedType} design features`;
    } else {
      return `Photorealistic mockup of a ${formattedType} displayed on an appropriate device or in its natural digital context. Show realistic screen reflections, device bezels, and environmental lighting. The ${formattedType} shows`;
    }
  }
  
  return ASSET_PROMPTS[assetType] || "Create a professional event design with modern aesthetics.";
}

/**
 * Check if an asset type is a print asset
 */
export function isPrintAsset(assetType: string): boolean {
  return PRINT_ASSET_TYPES.has(assetType);
}
