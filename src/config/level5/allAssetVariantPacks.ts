// Complete variant-pack manifest — 5 curated variants per asset type
import type { Level5AssetType } from "../../types/eventTemplateSystem";

export const variantPacks: Record<Level5AssetType, readonly string[]> = {
  // BRANDING & IDENTITY
  PALETTE: ["Prestige Corporate", "Modern Tech", "Warm Hospitality", "Luxury Gala", "Festival Neon"],
  LOGO: ["Swiss Minimal Mark", "Heritage Crest", "Modern Monogram", "Tech Emblem", "Bold Typographic Lockup"],
  LOGO_MONOCHROME: ["Stamp Optimized", "Emboss/Deboss", "Laser Engrave", "Newsprint", "Watermark Ultra-Light"],
  LOGO_REVERSED: ["Pure Knockout", "Outline Safe", "Glow Micro-Halo", "Soft Shadow Plate", "Glass/Video Overlay Safe"],
  SLOGANS: ["Hero Minimal", "Authority Corporate", "Emotional Human", "Experiential Eventy", "Social Punchy"],
  STYLE_GUIDE: ["Corporate System", "Gala Premium", "Tech Modular", "Festival Bold", "Minimal Essentials"],
  SEAMLESS_PATTERN: ["Subtle Monogram", "Geometric Grid", "Organic Flow", "Topographic Lines", "Kinetic Waves"],

  // PRINT & SIGNAGE
  NAME_TAG: ["Modern Minimal", "Color-Coded Tracks", "Gala Elegant", "Tech Neon", "Bold Identity"],
  NAME_TAG_BACK: ["Schedule Dense", "Map + QR", "Emergency Focus", "Sponsor Heavy", "Minimal Utility"],
  BANNER: ["Corporate Clean", "High-Impact Bold", "Tech Gradient", "Gala Premium", "Festival Energy"],
  EVENT_SIGNAGE: ["Directional Minimal", "Icon-First ADA", "Bold Color Blocks", "Dark Premium", "Dual-Language"],
  HANGING_SIGNAGE: ["Circular Premium", "Directional Blade", "Segmented Zones", "Tech Neon", "Minimal Wayfinding"],
  OUTDOOR_SIGNAGE: ["Parking/Traffic", "Event Entrance", "Sponsor Showcase", "Weatherproof Minimal", "Bold High Contrast"],
  DOOR_SIGNAGE: ["Minimal", "Bold Color", "Session Insert", "Dark Premium", "Elegant Frame"],
  EASEL_SIGNAGE: ["Welcome Hero", "Schedule Board", "Sponsor Board", "Menu Board", "Wayfinding"],
  LOCATION_SIGNAGE: ["Icon Grid", "Bilingual", "Emergency Focus", "Color-Coded Zones", "Premium Minimal"],
  ROOM_SIGNAGE: ["Modern", "Dual-Language", "Track Color-Coded", "Elegant", "Dark Premium"],
  STAND_UP_PILLAR_BANNER: ["Corporate Vertical", "Image-Led", "Tech Gradient", "Gala Premium", "Bold CTA"],
  FEATHER_FLAG: ["Minimal Mark", "Big Headline", "Directional Arrow", "Sponsor Flag", "Festival Pop"],
  TEARDROP_FLAG: ["Minimal Mark", "Big Headline", "Directional Arrow", "Sponsor Flag", "Festival Pop"],
  FLOOR_DECAL: ["Arrow Wayfinding", "Branded Roundel", "Pathway Trail", "Zone ID", "Engagement QR"],

  // VENUE & ENVIRONMENTAL
  MAIN_STAGE_BACKDROP: ["Corporate Minimal", "Tech LED Mood", "Gala Luxe", "Festival Bold", "Split Brand + Content"],
  BACK_WALL: ["Logo Repeat", "Solid Branded", "Scenic Immersive", "Hybrid Scenic", "Photo-Op Premium"],
  STEP_AND_REPEAT: ["Elegant Premium", "Sponsor Grid", "Branded Dense", "Minimal High Air", "Festival Step-and-Repeat"],
  REGISTRATION_COUNTER: ["Minimal Welcome", "Tech Kiosk Line", "Gala Premium", "Sponsor Forward", "Wayfinding Integrated"],
  KIOSK: ["Instructional Steps", "Multi-language", "Minimal UX", "Bold CTA", "Accessibility-First"],
  ELEVATOR_WRAP: ["Directional", "Immersive Scenic", "Pattern + Logo", "Promo CTA", "Minimal Frosted"],
  COLUMN_WRAP: ["Full Wrap Brand", "Info Column", "Directional Bands", "Immersive Theme", "Sponsor Stack"],
  CEILING_HANGER: ["Circle Premium", "Triangle Modern", "Blade Directional", "Big CTA", "Color-Coded Zones"],
  GLASS_DOOR: ["Frosted Privacy", "Clear Promo", "Safety Stripe", "Pattern Band", "Minimal Logo Band"],
  GLASS_DOUBLE_DOOR: ["Split Mirror", "Continuous Pattern", "Centered Lock", "Directional CTA", "Frosted Premium"],
  GLASS_ROTATING_DOOR: ["Sequential Animation", "Safety + Brand", "Pattern Flow", "Minimal Mark", "Promo CTA"],

  // FOOD & BEVERAGE
  MENU: ["Elegant Editorial", "Modern Minimal", "Thematic Illustrated", "High Contrast Low Light", "Premium Foil Look"],
  BAR_MENU: ["Low-Light Readable", "Signature Cocktails", "Modern Minimal", "Gala Luxe", "Bold Chalkboard Style"],
  TABLE_TENT: ["Sponsor + Info", "Menu Highlights", "Event CTA", "Elegant Premium", "Minimal QR Utility"],
  PLACE_CARD: ["Formal Classic", "Modern Minimal", "Foil Luxe", "Thematic Fun", "Edge Painted Look"],
  TABLE_NUMBER: ["Big Numerals", "Elegant Serif", "Laser Cut Look", "Illuminated Look", "Minimal Premium"],
  CATERING_LABEL: ["Icon-First", "Ingredient Dense", "Allergen Heavy", "Minimal Clean", "Premium Small Plate"],
  DIETARY_CARD: ["Personal Card", "Table Card", "Multi-language", "Icon-Only", "High Contrast"],

  // MERCH
  TSHIRT: ["Minimal Chest", "Bold Graphic", "Retro", "Staff/Crew", "Full Front Art"],
  TSHIRT_BACK: ["Tour/Schedule", "Hashtag Social", "Location Map", "Minimal", "Sponsor Stack"],
  TSHIRT_SLEEVE: ["Logo Mark", "Year/Date", "Sponsor Mini", "Decorative Stripe", "Single-Color Icon"],
  HAT: ["Text-Only", "Icon + Logo", "Curved Text", "Side Panel", "Minimal Mark"],
  LANYARD: ["Repeat Logo", "Woven Look", "Gradient Sublimation", "Sponsor Repeat", "Minimal Premium"],
  SWAG_BAG: ["Minimal", "Pattern", "Eco-Friendly", "Sponsor", "Full Graphic"],
  WATER_BOTTLE: ["Laser Engrave", "Screen Print", "Full Wrap", "Minimal Premium", "Playful Pattern"],

  // CREDENTIALS & PASSES
  VIP_BADGE: ["Modern Minimal", "Gala Elegant", "Corporate Executive", "Neon Night", "Security-Enhanced"],
  BACKSTAGE_PASS: ["Festival", "Corporate", "Theater", "Sports", "Neon Night"],
  MEDIA_CREDENTIAL: ["Press Classic", "Modern Minimal", "Photo Heavy", "Embargo/Rules", "Premium Glossless"],
  SECURITY_BADGE: ["Tactical", "Event Security", "Corporate", "Minimal", "Night Shift"],
  PARKING_PASS: ["Mirror Hang", "Lot Color-Coded", "VIP Premium", "Staff Utility", "Night Reflective"],
  TICKET_DESIGN: ["Collectible", "Minimal Premium", "Festival Stub", "Gala Luxe", "Anti-Fraud Heavy"],
  WRISTBAND_DESIGN: ["Tyvek Bold", "Vinyl Premium", "Fabric Woven", "RFID Modern", "Silicone Minimal"],

  // DIGITAL & SOCIAL
  SOCIAL_POST: ["Announcement", "Quote Card", "Event Recap", "Save the Date", "Speaker Feature"],
  SOCIAL_STORY: ["Speaker Announce", "Behind Scenes", "Live Now", "Thank You", "Countdown"],
  EMAIL_HEADER: ["Minimal", "Gradient", "Photo-Led", "Dark Mode", "Sponsor"],
  LINKEDIN_BANNER: ["Event", "Dark Tech", "Minimal", "Gradient", "Authority Corporate"],
  TWITTER_HEADER: ["Minimal", "Gradient", "Bold CTA", "Event Photo", "Dark Mode"],
  YOUTUBE_THUMBNAIL: ["Interview", "Tutorial", "Recap", "Announcement", "Behind the Scenes"],
  PODCAST_COVER: ["Bold Minimal", "Editorial", "Neon Tech", "Classic Authority", "Playful"],
  APP_ICON: ["Minimal Mark", "Monogram", "Tech Badge", "Two-Tone", "Ultra Simple"],
  FAVICON: ["Minimal Mark", "Letterform", "Monogram", "Icon Only", "Two-Tone"],
  ZOOM_BACKGROUND: ["Branded Office", "Venue Wide", "Abstract Minimal", "Dark Premium", "Soft Gradient"],
  WEBINAR_SLIDE: ["Corporate Clean", "Tech Modular", "Dark Premium", "Minimal", "Bold Keynote"],
  LIVE_STREAM_OVERLAY: ["Lower Third", "Full Frame", "BRB/Standby", "End Screen", "Scoreboard Style"],

  // DOCUMENTS & COMMUNICATIONS
  INVITATION_CARD: ["Modern Minimal", "Gala Luxe", "Tech Clean", "Festival Bold", "Editorial"],
  RSVP_CARD: ["Minimal", "Meal Options", "QR First", "Formal Classic", "Modern Clean"],
  PROGRAM_BOOKLET: ["Conference", "Gala", "Festival", "Minimal Premium", "Sponsor Heavy"],
  CERTIFICATE_AWARD: ["Classic Formal", "Modern Minimal", "Foil Luxe", "Embossed Seal", "Corporate Clean"],
  THANK_YOU_NOTE: ["Handwritten Feel", "Modern Minimal", "Sponsor Thanks", "Speaker Thanks", "Volunteer Thanks"],
  PRESS_RELEASE: ["AP Clean", "Modern Corporate", "Minimal", "Media Forward", "Executive Quote"],
  MEDIA_KIT: ["Premium PDF", "Minimal Clean", "Photo Forward", "Data/Stats", "Executive Bio Heavy"],
  SPONSOR_PACKAGE: ["Luxury Gala", "Conference Corporate", "Festival", "Tech Modular", "Minimal Premium"],
  FOLDER: ["Spot UV", "Foil Luxe", "Minimal Matte", "Pattern Lined", "Corporate Clean"],

  // PRESENTATIONS & CONTENT
  PRESENTATION_SLIDE: ["Corporate Clean", "Dark Premium", "Tech Modular", "Minimal", "Keynote Bold"],
  AGENDA_HIGHLIGHTS: ["Now/Next", "Tracks Grid", "Daily Overview", "Session Detail", "Sponsor Frame"],
  SESSION_EVALUATION: ["Ultra Fast", "QR First", "Print Friendly", "Data Heavy", "Minimal"],
  ANIMATED_LOGO: ["Draw-On", "Particle", "Morph", "Kinetic Type", "3D Subtle"],

  // SPECIALTY & ENGAGEMENT
  PHOTO_BOOTH_FRAME: ["Polaroid", "Instagram", "Elegant", "Playful", "Bold Festival"],
  QR_CODE: ["Minimal", "Rounded Dots", "Custom Eyes", "Logo Center", "High Contrast"],
  WIFI_SIGN: ["Dark", "QR First", "Table Card", "Corporate", "Big Readable"],
  NETWORKING_BINGO: ["Professional", "Social Fun", "Event Specific", "Prize Focus", "Minimal"],
  EMERGENCY_GUIDE: ["Ultra Clear", "Icon First", "Multi-language", "Pocket Minimal", "High Contrast"],
  ACCESSIBILITY_SIGNAGE: ["Wayfinding", "Sensory", "Assistance", "Tactile/Braille", "High Contrast"],
  VOLUNTEER_VEST: ["Big Back Type", "Role Patches", "Minimal", "Night Reflective", "Team Lead"],

  // ADDITIONAL SPECIALTY
  DIGITAL_SIGNAGE_LOOP: ["Welcome Brand", "Schedule Focus", "Sponsor Frame", "Announcements", "Social Feed"],
  EVENT_APP_SPLASH: ["Minimal", "Dark Premium", "Gradient", "Logo Center", "Tagline Center"],
  COUNTDOWN_TIMER: ["Flip Clock", "Minimal Digits", "Analog", "Bold", "Dark Premium"],
  PHOTOREALISTIC_SHOT: ["Ballroom", "Expo Hall", "Outdoor Entry", "Registration", "Stage Wide"],
  FLOOR_PLAN: ["Poster", "Badge Mini", "Digital Interactive", "Emergency Route", "Accessibility First"],
  STICKER_SHEET: ["Icon Set", "Typographic", "Holographic", "Playful", "Minimal"],

  // DOCUMENTS & OPERATIONAL
  MARKETING_COPY: ["25w", "50w", "100w", "250w", "Email Sequence"],
  SEATING_CHART: ["Alphabetical", "Table Map", "Hybrid", "Digital Search", "Premium Poster"],
  RUN_OF_SHOW: ["Minute-by-Minute", "Cue Heavy", "Minimal", "Production Grid", "Versioned"],
  VIDEO_TEASER: ["Cinematic", "Tech", "Festival", "Corporate", "Gala Luxe"],
  NAPKIN_DESIGN: ["Monogram", "Pattern", "Foil", "Minimal", "Message"],
  COASTER_DESIGN: ["Logo", "WiFi/QR", "Trivia", "Pattern", "Die-Cut"],
};
