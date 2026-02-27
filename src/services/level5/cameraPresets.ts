// Level-5 Camera Presets — deterministic per-asset-type camera language
// Upgrade #3: Realism comes from camera discipline, not random DNA camera strings.

import type { Level5AssetType } from "../../types/eventTemplateSystem";
import type { AssetCategory } from "../../config/level5/assetDefaults";

/**
 * Categories that produce pure graphic output (no photoreal scene).
 * For these, camera/scene blocks are removed entirely to prevent
 * "fake photo of a logo on paper" artifacts.
 */
const GRAPHIC_ONLY_CATEGORIES: Set<AssetCategory> = new Set([
  "Branding",
  "DigitalSocial",
  "PresentationsContent",
  "AdditionalSpecialty",
]);

export function isGraphicOnlyCategory(category: AssetCategory): boolean {
  return GRAPHIC_ONLY_CATEGORIES.has(category);
}

/**
 * Asset-specific camera presets. These override the variant DNA camera language
 * for physical assets to ensure consistent, realistic rendering.
 */
const ASSET_CAMERA_PRESETS: Partial<Record<Level5AssetType, string>> = {
  // Badges / credentials — tabletop product photo
  VIP_BADGE: "35–50mm lens, tabletop, 15° down angle, crisp focus on name, soft natural shadows",
  SECURITY_BADGE: "35–50mm lens, tabletop, 15° down angle, crisp focus on name, soft natural shadows",
  BACKSTAGE_PASS: "35–50mm lens, tabletop, 15° down angle, crisp focus on name, soft natural shadows",
  MEDIA_CREDENTIAL: "35–50mm lens, tabletop, 15° down angle, crisp focus on name, soft natural shadows",
  PARKING_PASS: "35–50mm lens, tabletop, 15° down angle, crisp focus, soft shadows",
  TICKET_DESIGN: "35–50mm lens, tabletop, 10° down angle, sharp focus, studio lighting",
  WRISTBAND_DESIGN: "50mm macro, product-photo angle, soft studio light, sharp detail",
  NAME_TAG: "35–50mm lens, tabletop registration desk, 15° down angle, crisp focus",
  NAME_TAG_BACK: "35–50mm lens, tabletop, 15° down angle, crisp focus",

  // Stage / backdrop — wide establishing shot
  MAIN_STAGE_BACKDROP: "24–35mm wide, establishing shot from mid-hall, lighting truss visible, realistic stage depth",
  BACK_WALL: "24–35mm wide, straight-on from 10–15ft, venue context visible, ambient lighting",
  REGISTRATION_COUNTER: "24–35mm wide, approaching angle, venue entrance context",

  // Step & repeat — straight-on, flash-safe
  STEP_AND_REPEAT: "50mm lens, straight-on from 6–8ft, flash-safe (no glare), shallow DOF on center marks",

  // Signage — contextual venue shots
  BANNER: "35mm lens, slight upward angle for tall formats, venue context",
  HANGING_SIGNAGE: "24–35mm, looking up 30–45°, ceiling hardware visible, natural perspective",
  FLOOR_DECAL: "24mm wide, looking down 60–70°, foot traffic context, wayfinding perspective",
  EVENT_SIGNAGE: "35mm lens, eye-level, straight approach, directional context visible",
  OUTDOOR_SIGNAGE: "24–35mm wide, outdoor approach, daylight, weather-realistic",
  DOOR_SIGNAGE: "35–50mm, eye-level, straight-on, door frame visible",
  EASEL_SIGNAGE: "35mm, slight angle to show easel, venue lobby context",
  FEATHER_FLAG: "24–35mm, outdoor, slight low angle, sky visible, wind-realistic",
  TEARDROP_FLAG: "24–35mm, outdoor, slight low angle, natural wind shape",
  STAND_UP_PILLAR_BANNER: "35mm, slight low angle, full height visible, venue floor",

  // Venue environmental
  ELEVATOR_WRAP: "24mm wide, straight-on, elevator bank context, interior lighting",
  COLUMN_WRAP: "35mm, slight angle to show wrap curve, venue floor visible",
  CEILING_HANGER: "24mm, looking up 45°, ceiling grid/truss visible",
  GLASS_DOOR: "35mm, straight approach, transparency + reflection visible",
  GLASS_DOUBLE_DOOR: "35mm, centered approach, both panels visible",
  GLASS_ROTATING_DOOR: "35mm, slight angle, rotation panels visible",
  KIOSK: "35–50mm, approaching angle, screen visible, wayfinding context",

  // Food & beverage — table-level product photo
  MENU: "50mm, 30° down angle, table setting context, warm ambient light",
  BAR_MENU: "50mm, eye-level at bar, low-light realistic, warm tones",
  TABLE_TENT: "50mm, 20° down angle, table setting, natural centerpiece context",
  PLACE_CARD: "50–85mm, tabletop macro, shallow DOF, table setting context",
  TABLE_NUMBER: "50mm, tabletop, centered, table setting context",
  CATERING_LABEL: "50–85mm, buffet line context, slight down angle, warm food lighting",
  DIETARY_CARD: "50mm, tabletop close-up, crisp readable detail",

  // Apparel / merch — studio product photo
  TSHIRT: "50–85mm, studio softbox, flat-lay or mannequin, clean background, crisp fabric detail",
  TSHIRT_BACK: "50–85mm, studio softbox, mannequin back view, clean background",
  TSHIRT_SLEEVE: "85mm macro, sleeve detail, studio lighting, fabric texture visible",
  HAT: "50–85mm, product photo, front panel focus, studio softbox, clean background",
  LANYARD: "50mm, draped or coiled product shot, studio lighting",
  SWAG_BAG: "50–85mm, product photo, filled or flat, studio softbox",
  WATER_BOTTLE: "50–85mm, product photo, slight angle to show label wrap, studio lighting",
  VOLUNTEER_VEST: "50–85mm, mannequin or flat-lay, studio softbox, role text visible",

  // Documents — flat-lay or n/a
  INVITATION_CARD: "50mm, flat-lay on premium surface, soft window light, slight shadow",
  RSVP_CARD: "50mm, flat-lay alongside invitation, soft light",
  CERTIFICATE_AWARD: "50mm, flat-lay or framed, premium surface, warm light",
  THANK_YOU_NOTE: "50mm, flat-lay, handwriting texture visible, warm natural light",
  FOLDER: "50mm, flat-lay, premium desk surface, soft directional light",
  PROGRAM_BOOKLET: "50mm, flat-lay open spread + cover, venue surface context",

  // Specialty
  PHOTO_BOOTH_FRAME: "35mm, straight-on, person behind frame (optional), fun venue context",
  WIFI_SIGN: "35mm, wall-mounted or table-tent, venue context, readable at distance",
  STICKER_SHEET: "50mm, flat-lay on clean surface, studio lighting, sharp edges",
  NAPKIN_DESIGN: "50–85mm, table setting, folded presentation, warm ambient light",
  COASTER_DESIGN: "50–85mm, bar surface, condensation realism optional, warm light",

  // Photorealistic shots (these are inherently camera-based)
  PHOTOREALISTIC_SHOT: "24–35mm, wide establishing, full venue view, realistic staging",
};

/** Category-level fallback camera presets */
const CATEGORY_CAMERA_FALLBACKS: Partial<Record<AssetCategory, string>> = {
  CredentialsPasses: "35–50mm lens, tabletop, 15° down angle, crisp focus, soft natural shadows",
  PrintSignage: "35mm lens, eye-level, venue context, natural shadows",
  VenueEnvironmental: "24–35mm wide, establishing shot, venue context visible",
  FoodBeverage: "50mm, 20–30° down angle, table setting, warm ambient light",
  MerchSwag: "50–85mm, studio product photo, softbox lighting, clean background",
  DocumentsComms: "50mm, flat-lay on premium surface, soft directional light",
  SpecialtyEngagement: "35–50mm, venue context, eye-level, clear detail",
  Operational: "50mm, flat-lay, clean surface, even lighting",
};

/**
 * Get the deterministic camera preset for an asset type.
 * Falls back through: asset-specific → category → generic.
 */
export function getCameraPreset(assetType: Level5AssetType, category: AssetCategory): string {
  return (
    ASSET_CAMERA_PRESETS[assetType] ??
    CATEGORY_CAMERA_FALLBACKS[category] ??
    "35mm lens, eye-level, documentary realism, natural shadows"
  );
}
