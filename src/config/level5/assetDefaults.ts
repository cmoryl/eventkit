// config/level5/assetDefaults.ts
// Production-ready asset defaults with category system, scene presets, and per-asset overrides

import type { Level5AssetType } from "../../types/eventTemplateSystem";

export type AssetCategory =
  | "Branding"
  | "PrintSignage"
  | "VenueEnvironmental"
  | "FoodBeverage"
  | "MerchSwag"
  | "CredentialsPasses"
  | "DigitalSocial"
  | "DocumentsComms"
  | "PresentationsContent"
  | "SpecialtyEngagement"
  | "AdditionalSpecialty"
  | "Operational";

export type AssetDefault = {
  assetType: Level5AssetType;
  category: AssetCategory;
  dimensions?: { size: string; dpi: number; colorMode: "CMYK" | "RGB"; bleed?: string; safeMargin?: string };
  variables: string[];
  sceneBase?: {
    environment: string;
    mounting: string;
    people: string;
    lighting: string;
    realismConstraints: string[];
  };
  layoutBase: string[];
  robustnessGuards: string[];
};

// ─── Shared guard sets ────────────────────────────────
const GUARDS_PRINT = [
  "No floating mockups — output must appear physically printed and installed.",
  "No warped edges, melted type, or random perspective distortion.",
  "Maintain a clear hierarchy: logo/event name → primary info → secondary info.",
  "Avoid micro-text below real-world readability for intended viewing distance.",
  "No fake sponsors, fake trademarks, or invented brand marks.",
];

const GUARDS_DIGITAL = [
  "Respect platform safe zones and typical UI overlays.",
  "Typography must remain readable at real thumbnail sizes.",
  "No clutter — 1 primary message per asset.",
];

// ─── Scene presets ────────────────────────────────────
const SCENE_EXPOHALL = {
  environment: "Modern expo hall / conference venue with realistic staging and ambient activity",
  mounting: "Professionally installed print materials (grommets, standoffs, SEG frames, easels, mounts)",
  people: "Optional blurred silhouettes for realism; never block key info or logos",
  lighting: "Neutral overhead venue lighting with natural shadow falloff and realistic reflections",
  realismConstraints: ["No floating designs", "Visible real materials", "Natural shadows", "No AI-smudged text"],
};

const SCENE_GALA = {
  environment: "Luxury hotel ballroom / gala space with warm ambient lighting and premium finishes",
  mounting: "High-end installation: SEG fabric, acrylic standoffs, brushed metal frames",
  people: "Optional out-of-focus guests; keep signage fully readable",
  lighting: "Warm tungsten (2800–3200K) with soft bounce, no harsh glare",
  realismConstraints: ["No floating", "Premium material realism", "No glossy glare on step & repeat"],
};

const SCENE_OUTDOOR = {
  environment: "Outdoor venue entrance / sidewalk approach / parking flow area",
  mounting: "Weatherproof mounting: stakes, A-frames, pole sleeves, grommets, weighted bases",
  people: "Optional passersby; keep signage readable and unobstructed",
  lighting: "Daylight or dusk with realistic sky bounce; no unnatural neon glow unless specified",
  realismConstraints: ["No floating", "Wind-safe realism", "No warped posts/frames"],
};

// ─── Factory helpers ──────────────────────────────────
function makeDefault(
  assetType: Level5AssetType,
  category: AssetCategory,
  variables: string[],
  dimensions?: AssetDefault["dimensions"],
  sceneBase?: AssetDefault["sceneBase"],
  layoutBase: string[] = [],
  robustnessGuards: string[] = []
): AssetDefault {
  return { assetType, category, variables, dimensions, sceneBase, layoutBase, robustnessGuards: [...GUARDS_PRINT, ...robustnessGuards] };
}

function makeDigitalDefault(
  assetType: Level5AssetType,
  variables: string[],
  dimensions: AssetDefault["dimensions"],
  layoutBase: string[] = [],
  robustnessGuards: string[] = []
): AssetDefault {
  return { assetType, category: "DigitalSocial", variables, dimensions, layoutBase, robustnessGuards: [...GUARDS_DIGITAL, ...robustnessGuards] };
}

// ─── Category fallbacks ───────────────────────────────
const CATEGORY_DEFAULTS: Record<AssetCategory, Omit<AssetDefault, "assetType">> = {
  Branding: {
    category: "Branding",
    variables: ["eventName", "eventType", "mood", "location", "colors", "style", "theme"],
    dimensions: undefined,
    sceneBase: undefined,
    layoutBase: ["Build a clear system with strict rules and repeatable structure."],
    robustnessGuards: ["Avoid trendy gimmicks; prioritize timeless legibility and system integrity."],
  },
  PrintSignage: {
    category: "PrintSignage",
    variables: ["eventName", "date", "location", "colors", "logo", "cta", "qrCode"],
    dimensions: { size: "24in x 36in", dpi: 150, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: SCENE_EXPOHALL,
    layoutBase: ["Hierarchy must pass a 3-second comprehension test."],
    robustnessGuards: ["Respect bleed/safe zones; install realism (grommets, foamcore, frames)."],
  },
  VenueEnvironmental: {
    category: "VenueEnvironmental",
    variables: ["eventName", "colors", "logo", "sponsorLogos", "wayfinding"],
    dimensions: { size: "8ft x 10ft", dpi: 100, colorMode: "CMYK", bleed: "1in", safeMargin: "2in" },
    sceneBase: SCENE_EXPOHALL,
    layoutBase: ["Photo-friendly, flash-safe surfaces; avoid busy patterns behind faces."],
    robustnessGuards: ["Large-format readability; no tiny type; avoid reflective glare."],
  },
  FoodBeverage: {
    category: "FoodBeverage",
    variables: ["eventName", "colors", "logo", "menuItems", "dietaryIcons", "qrCode"],
    dimensions: { size: "5in x 7in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: SCENE_GALA,
    layoutBase: ["Low-light readability: strong contrast, clean type, clear icon system."],
    robustnessGuards: ["No micro text below 8pt; icons must be unambiguous."],
  },
  MerchSwag: {
    category: "MerchSwag",
    variables: ["eventName", "colors", "logo", "year", "tagline"],
    dimensions: undefined,
    sceneBase: { ...SCENE_EXPOHALL, environment: "Merch table / swag pickup zone with realistic product staging" },
    layoutBase: ["Keep prints physically plausible (embroidery limits, ink limits, wrap constraints)."],
    robustnessGuards: ["No impossible embroidery detail; no ultra-fine lines for screen print."],
  },
  CredentialsPasses: {
    category: "CredentialsPasses",
    variables: ["eventName", "colors", "logo", "attendeeName", "company", "title", "qrCode", "accessLevel"],
    dimensions: { size: "4in x 6in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: { ...SCENE_EXPOHALL, environment: "Registration desk with badge trays and lanyards" },
    layoutBase: ["Name must be the dominant readable element at arm's length."],
    robustnessGuards: ["QR quiet zone must remain clean; no glossy glare that hides text."],
  },
  DigitalSocial: {
    category: "DigitalSocial",
    variables: ["eventName", "colors", "logo", "headline", "date", "cta", "speaker", "photo"],
    dimensions: { size: "1080px x 1080px", dpi: 72, colorMode: "RGB" },
    sceneBase: undefined,
    layoutBase: ["Platform-native layout: bold hook → info → CTA → brand."],
    robustnessGuards: ["Readable at phone size; avoid edge-clipped text."],
  },
  DocumentsComms: {
    category: "DocumentsComms",
    variables: ["eventName", "colors", "logo", "date", "location", "details", "cta", "qrCode"],
    dimensions: { size: "8.5in x 11in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: undefined,
    layoutBase: ["Clear typographic hierarchy with comfortable whitespace."],
    robustnessGuards: ["No dense walls of text; enforce paragraph rhythm and headings."],
  },
  PresentationsContent: {
    category: "PresentationsContent",
    variables: ["eventName", "colors", "logo", "headline", "sections", "charts", "speaker"],
    dimensions: { size: "1920px x 1080px", dpi: 72, colorMode: "RGB" },
    sceneBase: undefined,
    layoutBase: ["Presentation grid discipline: titles, rails, consistent spacing."],
    robustnessGuards: ["Charts must be readable at distance; avoid thin lines and low contrast."],
  },
  SpecialtyEngagement: {
    category: "SpecialtyEngagement",
    variables: ["eventName", "colors", "logo", "qrCode", "hashtag", "wifi", "instructions"],
    dimensions: { size: "11in x 17in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: SCENE_EXPOHALL,
    layoutBase: ["Instruction-first: icons, steps, legibility."],
    robustnessGuards: ["QR must be scannable; avoid busy patterns near QR."],
  },
  AdditionalSpecialty: {
    category: "AdditionalSpecialty",
    variables: ["eventName", "colors", "logo", "schedule", "announcements", "sponsors"],
    dimensions: { size: "1920px x 1080px", dpi: 72, colorMode: "RGB" },
    sceneBase: undefined,
    layoutBase: ["Loop content must be modular and glanceable."],
    robustnessGuards: ["Avoid flicker-heavy patterns; maintain clear zones for text."],
  },
  Operational: {
    category: "Operational",
    variables: ["eventName", "colors", "logo", "tables", "timeline", "roles", "notes"],
    dimensions: { size: "8.5in x 11in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: undefined,
    layoutBase: ["Utility-first grids and tables; maximum clarity."],
    robustnessGuards: ["No decorative clutter; tables must be aligned and scannable."],
  },
};

// ─── Per-asset overrides ──────────────────────────────
const ASSET_OVERRIDES: Partial<Record<Level5AssetType, Partial<AssetDefault>>> = {
  // Large format
  STEP_AND_REPEAT: {
    category: "VenueEnvironmental",
    dimensions: { size: "10ft x 8ft", dpi: 150, colorMode: "CMYK", bleed: "3in", safeMargin: "12in perimeter buffer" },
    sceneBase: SCENE_GALA,
    layoutBase: [
      "Tiled logo grid only; consistent gutters; camera-flash-friendly matte finish.",
      "Primary mark slightly larger than sponsors, repeated on a consistent cadence.",
    ],
  },
  MAIN_STAGE_BACKDROP: {
    dimensions: { size: "40ft x 16ft", dpi: 100, colorMode: "CMYK", bleed: "6in", safeMargin: "4ft stage-safe content zone" },
    sceneBase: { ...SCENE_EXPOHALL, environment: "Main stage with realistic lighting truss, LED wash, and seating" },
    layoutBase: ["Keep center stage safe; avoid critical content behind speaker and screens."],
  },
  BACK_WALL: {
    dimensions: { size: "8ft x 10ft", dpi: 100, colorMode: "CMYK", bleed: "1in", safeMargin: "2in" },
    sceneBase: SCENE_EXPOHALL,
  },
  HANGING_SIGNAGE: {
    dimensions: { size: "4ft x 2ft (double-sided)", dpi: 150, colorMode: "CMYK", bleed: "1in", safeMargin: "2in" },
    sceneBase: SCENE_EXPOHALL,
    layoutBase: ["360° readability; minimum letter height rules for distance."],
  },
  FLOOR_DECAL: {
    dimensions: { size: "Varies (e.g., 24in x 24in round / 12in x 48in arrow)", dpi: 150, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" },
    sceneBase: SCENE_EXPOHALL,
    layoutBase: ["Directional arrows dominate; logo secondary; slip-resistant realism."],
  },
  OUTDOOR_SIGNAGE: {
    category: "PrintSignage",
    dimensions: { size: "48in x 96in (banner) / 24in x 36in (yard)", dpi: 150, colorMode: "CMYK", bleed: "0.25in", safeMargin: "0.5in" },
    sceneBase: SCENE_OUTDOOR,
  },

  // Digital sizes
  SOCIAL_POST: { dimensions: { size: "1080px x 1080px", dpi: 72, colorMode: "RGB" } },
  SOCIAL_STORY: { dimensions: { size: "1080px x 1920px", dpi: 72, colorMode: "RGB" } },
  LINKEDIN_BANNER: { dimensions: { size: "1584px x 396px", dpi: 72, colorMode: "RGB" } },
  TWITTER_HEADER: { dimensions: { size: "1500px x 500px", dpi: 72, colorMode: "RGB" } },
  YOUTUBE_THUMBNAIL: { dimensions: { size: "1280px x 720px", dpi: 72, colorMode: "RGB" } },
  PODCAST_COVER: { dimensions: { size: "3000px x 3000px", dpi: 72, colorMode: "RGB" } },
  APP_ICON: { dimensions: { size: "1024px x 1024px", dpi: 72, colorMode: "RGB" } },
  FAVICON: { dimensions: { size: "32px x 32px", dpi: 72, colorMode: "RGB" } },
  ZOOM_BACKGROUND: { dimensions: { size: "1920px x 1080px", dpi: 72, colorMode: "RGB" } },
  WEBINAR_SLIDE: { dimensions: { size: "1920px x 1080px", dpi: 72, colorMode: "RGB" } },
  LIVE_STREAM_OVERLAY: { dimensions: { size: "1920px x 1080px", dpi: 72, colorMode: "RGB" } },

  // Doc specifics
  PRESS_RELEASE: { dimensions: { size: "8.5in x 11in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.5in" } },
  PROGRAM_BOOKLET: { dimensions: { size: "5.5in x 8.5in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" } },

  // Badge specifics
  NAME_TAG: { dimensions: { size: "4in x 3in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" } },
  NAME_TAG_BACK: { dimensions: { size: "4in x 3in", dpi: 300, colorMode: "CMYK", bleed: "0.125in", safeMargin: "0.25in" } },

  // Pure branding outputs (no photoreal scene)
  PALETTE: { category: "Branding", sceneBase: undefined, dimensions: undefined },
  LOGO: { category: "Branding", sceneBase: undefined, dimensions: undefined },
  LOGO_MONOCHROME: { category: "Branding", sceneBase: undefined, dimensions: undefined },
  LOGO_REVERSED: { category: "Branding", sceneBase: undefined, dimensions: undefined },
  STYLE_GUIDE: { category: "Branding", sceneBase: undefined },
  SLOGANS: { category: "Branding", sceneBase: undefined },
  SEAMLESS_PATTERN: { category: "Branding", sceneBase: undefined },
};

// ─── Full asset → category map ────────────────────────
const CATEGORY_MAP: Record<Level5AssetType, AssetCategory> = {
  // BRANDING
  PALETTE: "Branding", LOGO: "Branding", LOGO_MONOCHROME: "Branding", LOGO_REVERSED: "Branding",
  SLOGANS: "Branding", STYLE_GUIDE: "Branding", SEAMLESS_PATTERN: "Branding",
  // PRINT & SIGNAGE
  NAME_TAG: "CredentialsPasses", NAME_TAG_BACK: "CredentialsPasses",
  BANNER: "PrintSignage", EVENT_SIGNAGE: "PrintSignage", HANGING_SIGNAGE: "PrintSignage",
  OUTDOOR_SIGNAGE: "PrintSignage", DOOR_SIGNAGE: "PrintSignage", EASEL_SIGNAGE: "PrintSignage",
  LOCATION_SIGNAGE: "PrintSignage", ROOM_SIGNAGE: "PrintSignage", STAND_UP_PILLAR_BANNER: "PrintSignage",
  FEATHER_FLAG: "PrintSignage", TEARDROP_FLAG: "PrintSignage", FLOOR_DECAL: "PrintSignage",
  // VENUE
  MAIN_STAGE_BACKDROP: "VenueEnvironmental", BACK_WALL: "VenueEnvironmental",
  STEP_AND_REPEAT: "VenueEnvironmental", REGISTRATION_COUNTER: "VenueEnvironmental",
  KIOSK: "VenueEnvironmental", ELEVATOR_WRAP: "VenueEnvironmental", COLUMN_WRAP: "VenueEnvironmental",
  CEILING_HANGER: "VenueEnvironmental", GLASS_DOOR: "VenueEnvironmental",
  GLASS_DOUBLE_DOOR: "VenueEnvironmental", GLASS_ROTATING_DOOR: "VenueEnvironmental",
  // FOOD & BEV
  MENU: "FoodBeverage", BAR_MENU: "FoodBeverage", TABLE_TENT: "FoodBeverage",
  PLACE_CARD: "FoodBeverage", TABLE_NUMBER: "FoodBeverage", CATERING_LABEL: "FoodBeverage",
  DIETARY_CARD: "FoodBeverage",
  // MERCH
  TSHIRT: "MerchSwag", TSHIRT_BACK: "MerchSwag", TSHIRT_SLEEVE: "MerchSwag",
  HAT: "MerchSwag", LANYARD: "MerchSwag", SWAG_BAG: "MerchSwag", WATER_BOTTLE: "MerchSwag",
  // CREDENTIALS
  VIP_BADGE: "CredentialsPasses", BACKSTAGE_PASS: "CredentialsPasses",
  MEDIA_CREDENTIAL: "CredentialsPasses", SECURITY_BADGE: "CredentialsPasses",
  PARKING_PASS: "CredentialsPasses", TICKET_DESIGN: "CredentialsPasses", WRISTBAND_DESIGN: "CredentialsPasses",
  // DIGITAL
  SOCIAL_POST: "DigitalSocial", SOCIAL_STORY: "DigitalSocial", EMAIL_HEADER: "DigitalSocial",
  LINKEDIN_BANNER: "DigitalSocial", TWITTER_HEADER: "DigitalSocial", YOUTUBE_THUMBNAIL: "DigitalSocial",
  PODCAST_COVER: "DigitalSocial", APP_ICON: "DigitalSocial", FAVICON: "DigitalSocial",
  ZOOM_BACKGROUND: "DigitalSocial", WEBINAR_SLIDE: "DigitalSocial", LIVE_STREAM_OVERLAY: "DigitalSocial",
  // DOCUMENTS
  INVITATION_CARD: "DocumentsComms", RSVP_CARD: "DocumentsComms", PROGRAM_BOOKLET: "DocumentsComms",
  CERTIFICATE_AWARD: "DocumentsComms", THANK_YOU_NOTE: "DocumentsComms", PRESS_RELEASE: "DocumentsComms",
  MEDIA_KIT: "DocumentsComms", SPONSOR_PACKAGE: "DocumentsComms", FOLDER: "DocumentsComms",
  // PRESENTATIONS
  PRESENTATION_SLIDE: "PresentationsContent", AGENDA_HIGHLIGHTS: "PresentationsContent",
  SESSION_EVALUATION: "PresentationsContent", ANIMATED_LOGO: "PresentationsContent",
  // SPECIALTY
  PHOTO_BOOTH_FRAME: "SpecialtyEngagement", QR_CODE: "SpecialtyEngagement",
  WIFI_SIGN: "SpecialtyEngagement", NETWORKING_BINGO: "SpecialtyEngagement",
  EMERGENCY_GUIDE: "SpecialtyEngagement", ACCESSIBILITY_SIGNAGE: "SpecialtyEngagement",
  VOLUNTEER_VEST: "SpecialtyEngagement",
  // ADDITIONAL SPECIALTY
  DIGITAL_SIGNAGE_LOOP: "AdditionalSpecialty", EVENT_APP_SPLASH: "AdditionalSpecialty",
  COUNTDOWN_TIMER: "AdditionalSpecialty", PHOTOREALISTIC_SHOT: "AdditionalSpecialty",
  FLOOR_PLAN: "AdditionalSpecialty", STICKER_SHEET: "AdditionalSpecialty",
  // OPERATIONAL
  MARKETING_COPY: "Operational", SEATING_CHART: "Operational", RUN_OF_SHOW: "Operational",
  VIDEO_TEASER: "Operational", NAPKIN_DESIGN: "Operational", COASTER_DESIGN: "Operational",
};

// ─── Public API ───────────────────────────────────────
export function getAssetDefault(assetType: Level5AssetType): AssetDefault {
  const category = CATEGORY_MAP[assetType];
  const base = CATEGORY_DEFAULTS[category];

  const defaultObj: AssetDefault =
    category === "DigitalSocial"
      ? makeDigitalDefault(assetType, base.variables, base.dimensions!, base.layoutBase, base.robustnessGuards)
      : makeDefault(assetType, category, base.variables, base.dimensions, base.sceneBase, base.layoutBase, base.robustnessGuards);

  const override = ASSET_OVERRIDES[assetType];
  if (!override) return defaultObj;

  return {
    ...defaultObj,
    ...override,
    dimensions: override.dimensions ?? defaultObj.dimensions,
    sceneBase: override.sceneBase ?? defaultObj.sceneBase,
    layoutBase: override.layoutBase ?? defaultObj.layoutBase,
    robustnessGuards: override.robustnessGuards
      ? [...defaultObj.robustnessGuards, ...override.robustnessGuards]
      : defaultObj.robustnessGuards,
  };
}

export function getAssetCategory(assetType: Level5AssetType): AssetCategory {
  return CATEGORY_MAP[assetType];
}

/** Re-export for compatibility */
export { getAssetDefault as getAssetDefaults };
