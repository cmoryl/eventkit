// Hard logo placement rules — consistency guarantee per asset type
import type { Level5AssetType, LogoRules } from "../../types/eventTemplateSystem";

type LogoPlacement = Pick<LogoRules, "placement" | "size">;

const SHARED_LOGO_BASE: Omit<LogoRules, "placement" | "size"> = {
  reproduction: "Use uploaded logo EXACTLY as provided. Do not redraw, reinterpret, stylize, distort, or recolor.",
  clearSpace: "Maintain clear space equal to 10% of logo height on all sides.",
  contrastProtection: "If contrast fails, place logo on a solid or translucent backing plate—no glow, no heavy shadow.",
  failureConditions: [
    "Logo missing",
    "Logo warped/distorted/rotated arbitrarily",
    "Logo re-colored or 'AI-styled'",
    "Logo too small to read at intended viewing distance",
    "Logo blends into background without contrast protection",
    "Logo cropped unintentionally",
  ],
};

const placements: Partial<Record<Level5AssetType, LogoPlacement>> = {
  // Badges / credentials
  VIP_BADGE: { placement: "Top-center or top-left, never mid-field.", size: "15–20% of design height." },
  SECURITY_BADGE: { placement: "Top-center or top-left, reserved header zone.", size: "15–20% of design height." },
  BACKSTAGE_PASS: { placement: "Top-center header band or top-left lockup zone.", size: "15–20% of design height." },
  MEDIA_CREDENTIAL: { placement: "Top-left header band; avoid photo area.", size: "12–18% of design height." },
  PARKING_PASS: { placement: "Top-center or top-left.", size: "12–18% of design height." },
  TICKET_DESIGN: { placement: "Left stub or top header.", size: "10–15% of design height." },
  WRISTBAND_DESIGN: { placement: "Centered within band.", size: "Fill band height with proportional width." },
  NAME_TAG: { placement: "Top-center header band.", size: "15–20% of design height." },
  NAME_TAG_BACK: { placement: "Bottom-center utility zone.", size: "8–12% of design height." },

  // Social / digital
  SOCIAL_POST: { placement: "Bottom corner by default; never competing with headline.", size: "12–18% of width." },
  SOCIAL_STORY: { placement: "Top corner or bottom corner within safe zones.", size: "10–16% of width." },
  YOUTUBE_THUMBNAIL: { placement: "Corner placement; keep face/title dominant.", size: "8–14% of width." },
  LINKEDIN_BANNER: { placement: "Right-center safe; avoid profile overlap zones.", size: "10–18% of width." },
  TWITTER_HEADER: { placement: "Right side; avoid avatar overlap.", size: "10–18% of width." },
  EMAIL_HEADER: { placement: "Top-left or centered header.", size: "15–25% of width." },
  PODCAST_COVER: { placement: "Bottom corner or top corner.", size: "10–16% of width." },
  APP_ICON: { placement: "Centered.", size: "60–80% fill." },
  FAVICON: { placement: "Centered.", size: "80–90% fill." },
  ZOOM_BACKGROUND: { placement: "Bottom-right corner.", size: "8–12% of width." },
  WEBINAR_SLIDE: { placement: "Top-left or bottom-right corner.", size: "8–12% of width." },
  LIVE_STREAM_OVERLAY: { placement: "Top corner within lower-third safe zone.", size: "8–12% of width." },

  // Apparel / merch
  TSHIRT: { placement: "Left-chest or center lockup depending on variant.", size: "3–4 inch equivalent mark zone (real print)." },
  TSHIRT_BACK: { placement: "Upper back collar zone or large center.", size: "Collar: 3in; Center: 10–12in equivalent." },
  TSHIRT_SLEEVE: { placement: "Upper sleeve, centered.", size: "2–3 inch equivalent." },
  HAT: { placement: "Front panel center.", size: "4in × 2in embroidery field realism." },
  LANYARD: { placement: "Repeat pattern along strap.", size: "Proportional to 0.75in strap width." },
  SWAG_BAG: { placement: "Upper third or centered; keep margins generous.", size: "15–25% of width." },
  WATER_BOTTLE: { placement: "Centered on primary face.", size: "20–30% of wrap area." },
  VOLUNTEER_VEST: { placement: "Left chest front; large back.", size: "Front: 3in; Back: 10–12in." },

  // Large format / venue
  BANNER: { placement: "Top-center or upper-left; headline second.", size: "20–35%." },
  EVENT_SIGNAGE: { placement: "Top-left or top-center.", size: "15–25%." },
  HANGING_SIGNAGE: { placement: "Centered both sides; 360° readability.", size: "25–35%." },
  OUTDOOR_SIGNAGE: { placement: "Top-center.", size: "20–30%." },
  DOOR_SIGNAGE: { placement: "Top-center or top-left.", size: "15–20%." },
  EASEL_SIGNAGE: { placement: "Top-center header.", size: "15–25%." },
  LOCATION_SIGNAGE: { placement: "Top-left or top-center.", size: "12–20%." },
  ROOM_SIGNAGE: { placement: "Top-center or top-left.", size: "12–18%." },
  STAND_UP_PILLAR_BANNER: { placement: "Upper third, centered.", size: "20–30%." },
  FEATHER_FLAG: { placement: "Upper third, centered.", size: "15–25%." },
  TEARDROP_FLAG: { placement: "Upper third, centered.", size: "15–25%." },
  FLOOR_DECAL: { placement: "Trailing edge or lower third; arrows dominate.", size: "10–18%." },
  ACCESSIBILITY_SIGNAGE: { placement: "Top-left; ADA icon primary.", size: "10–15%." },

  // Stage & backdrops
  STEP_AND_REPEAT: { placement: "Tiled grid only; consistent gutters.", size: "Primary mark 10–15% larger than sponsors." },
  MAIN_STAGE_BACKDROP: { placement: "Upper third, stage-safe; avoid screen zones.", size: "25–40% depending on distance." },
  BACK_WALL: { placement: "Upper third or centered; photo-friendly clear space.", size: "25–35%." },

  // Counters & structures
  REGISTRATION_COUNTER: { placement: "Front-center panel.", size: "25–35% of front panel." },
  KIOSK: { placement: "Top header of screen/panel.", size: "15–20%." },
  ELEVATOR_WRAP: { placement: "Upper panel or centered.", size: "20–30%." },
  COLUMN_WRAP: { placement: "Repeated vertically or upper third.", size: "15–25%." },
  CEILING_HANGER: { placement: "Centered on each face.", size: "25–40%." },
  GLASS_DOOR: { placement: "Center band or top corners.", size: "15–25%." },
  GLASS_DOUBLE_DOOR: { placement: "Split across doors or centered.", size: "15–25%." },
  GLASS_ROTATING_DOOR: { placement: "Each panel centered.", size: "15–20%." },

  // Food & beverage
  MENU: { placement: "Top-center header.", size: "10–15%." },
  BAR_MENU: { placement: "Top-center header.", size: "10–15%." },
  TABLE_TENT: { placement: "Bottom corner.", size: "10–15%." },
  PLACE_CARD: { placement: "Top-center, subtle.", size: "8–12%." },
  TABLE_NUMBER: { placement: "Below number, subtle.", size: "8–10%." },
  CATERING_LABEL: { placement: "Top or bottom edge.", size: "8–12%." },
  DIETARY_CARD: { placement: "Bottom edge.", size: "6–10%." },

  // Documents & communications
  INVITATION_CARD: { placement: "Top-center or bottom-center, subtle.", size: "8–15%." },
  RSVP_CARD: { placement: "Top-center, subtle.", size: "8–12%." },
  PROGRAM_BOOKLET: { placement: "Cover: prominent center; inside: small header.", size: "Cover: 20–30%; Inside: 6–10%." },
  CERTIFICATE_AWARD: { placement: "Top-center or bottom-center.", size: "10–15%." },
  THANK_YOU_NOTE: { placement: "Top-center or bottom, subtle.", size: "8–12%." },
  PRESS_RELEASE: { placement: "Top-left letterhead.", size: "10–15% of width." },
  MEDIA_KIT: { placement: "Cover: prominent; inside: header.", size: "Cover: 20–30%; Inside: 8–12%." },
  SPONSOR_PACKAGE: { placement: "Cover: prominent center.", size: "20–30%." },
  FOLDER: { placement: "Front cover center or upper third.", size: "20–30%." },

  // Presentations
  PRESENTATION_SLIDE: { placement: "Bottom-right or top-left corner.", size: "8–12%." },
  AGENDA_HIGHLIGHTS: { placement: "Top header.", size: "10–15%." },

  // Specialty
  PHOTO_BOOTH_FRAME: { placement: "Bottom-center of frame.", size: "12–18%." },
  WIFI_SIGN: { placement: "Top-center.", size: "12–18%." },
  STICKER_SHEET: { placement: "One sticker is the logo.", size: "Per-sticker proportional." },
  NAPKIN_DESIGN: { placement: "Center or corner.", size: "15–25%." },
  COASTER_DESIGN: { placement: "Centered.", size: "30–50%." },

  // Digital specialty
  DIGITAL_SIGNAGE_LOOP: { placement: "Corner or header bar.", size: "10–15%." },
  EVENT_APP_SPLASH: { placement: "Centered.", size: "25–40%." },
  COUNTDOWN_TIMER: { placement: "Top or bottom.", size: "10–15%." },
};

/** Get full LogoRules for an asset type */
export function getLogoRulesForAsset(assetType: Level5AssetType): LogoRules {
  const preset = placements[assetType];
  return {
    ...SHARED_LOGO_BASE,
    placement: preset?.placement ?? "Top-center or center of the design.",
    size: preset?.size ?? "15–25% of the total visual area.",
  };
}

export { placements as logoPlacementPresets };
