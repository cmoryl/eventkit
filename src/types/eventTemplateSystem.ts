// Level-5 Event Template System — Types
// DNA + Anchors + Scene + Guards + Logo Rules

export type Level5AssetType =
  | "PALETTE" | "LOGO" | "LOGO_MONOCHROME" | "LOGO_REVERSED" | "SLOGANS" | "STYLE_GUIDE" | "SEAMLESS_PATTERN"
  | "NAME_TAG" | "NAME_TAG_BACK" | "BANNER" | "EVENT_SIGNAGE" | "HANGING_SIGNAGE" | "OUTDOOR_SIGNAGE"
  | "DOOR_SIGNAGE" | "EASEL_SIGNAGE" | "LOCATION_SIGNAGE" | "ROOM_SIGNAGE" | "STAND_UP_PILLAR_BANNER"
  | "FEATHER_FLAG" | "TEARDROP_FLAG" | "FLOOR_DECAL"
  | "MAIN_STAGE_BACKDROP" | "BACK_WALL" | "STEP_AND_REPEAT" | "REGISTRATION_COUNTER" | "KIOSK"
  | "ELEVATOR_WRAP" | "COLUMN_WRAP" | "CEILING_HANGER" | "GLASS_DOOR" | "GLASS_DOUBLE_DOOR" | "GLASS_ROTATING_DOOR"
  | "MENU" | "BAR_MENU" | "TABLE_TENT" | "PLACE_CARD" | "TABLE_NUMBER" | "CATERING_LABEL" | "DIETARY_CARD"
  | "TSHIRT" | "TSHIRT_BACK" | "TSHIRT_SLEEVE" | "HAT" | "LANYARD" | "SWAG_BAG" | "WATER_BOTTLE"
  | "VIP_BADGE" | "BACKSTAGE_PASS" | "MEDIA_CREDENTIAL" | "SECURITY_BADGE" | "PARKING_PASS" | "TICKET_DESIGN" | "WRISTBAND_DESIGN"
  | "SOCIAL_POST" | "SOCIAL_STORY" | "EMAIL_HEADER" | "LINKEDIN_BANNER" | "TWITTER_HEADER" | "YOUTUBE_THUMBNAIL"
  | "PODCAST_COVER" | "APP_ICON" | "FAVICON" | "ZOOM_BACKGROUND" | "WEBINAR_SLIDE" | "LIVE_STREAM_OVERLAY"
  | "INVITATION_CARD" | "RSVP_CARD" | "PROGRAM_BOOKLET" | "CERTIFICATE_AWARD" | "THANK_YOU_NOTE"
  | "PRESS_RELEASE" | "MEDIA_KIT" | "SPONSOR_PACKAGE" | "FOLDER"
  | "PRESENTATION_SLIDE" | "AGENDA_HIGHLIGHTS" | "SESSION_EVALUATION" | "ANIMATED_LOGO"
  | "PHOTO_BOOTH_FRAME" | "QR_CODE" | "WIFI_SIGN" | "NETWORKING_BINGO" | "EMERGENCY_GUIDE" | "ACCESSIBILITY_SIGNAGE" | "VOLUNTEER_VEST"
  | "DIGITAL_SIGNAGE_LOOP" | "EVENT_APP_SPLASH" | "COUNTDOWN_TIMER" | "PHOTOREALISTIC_SHOT" | "FLOOR_PLAN" | "STICKER_SHEET"
  | "MARKETING_COPY" | "SEATING_CHART" | "RUN_OF_SHOW" | "VIDEO_TEASER" | "NAPKIN_DESIGN" | "COASTER_DESIGN";

export type TemplateDNA = {
  influence: string;
  composition: string;
  materialStory: string;
  finishes: string;
  typeBehavior: string;
  graphicMotif: string;
  lightingIntent: string;
  cameraLanguage: string;
};

export type SceneSpec = {
  environment: string;
  mounting: string;
  people: string;
  lighting: string;
  realismConstraints: string[];
};

export type VariationControls = {
  allowed: string[];
  disallowed: string[];
};

export type LogoRules = {
  reproduction: string;
  placement: string;
  size: string;
  clearSpace: string;
  contrastProtection: string;
  failureConditions: string[];
};

export type AssetDimensions = {
  size: string;
  dpi: number;
  colorMode: "CMYK" | "RGB";
  bleed?: string;
  safeMargin?: string;
};

export type Level5Template = {
  id: string;
  assetType: Level5AssetType;
  variantName: string;
  tags: string[];
  dimensions?: AssetDimensions;
  variables: string[];
  dna: TemplateDNA;
  anchors: string[];
  layout: string[];
  logoRules: LogoRules;
  scene: SceneSpec;
  variationControls: VariationControls;
  robustnessGuards: string[];
  prompt: {
    designSpec: string[];
    photorealScene: string[];
  };
};

/** Compact definition for a variant — expanded by the generator at runtime */
export type VariantDNAPreset = {
  influence: string;
  composition: string;
  materialHint: string;
  finishes: string;
  typeBehavior: string;
  motif: string;
  lightingIntent: string;
  cameraLanguage: string;
  sceneOverrides?: Partial<SceneSpec>;
  tags?: string[];
};

/** Asset defaults: dimensions, variables, base scene, base layout, base guards */
export type AssetDefaults = {
  dimensions: AssetDimensions;
  variables: string[];
  baseLayout: string[];
  baseScene: SceneSpec;
  baseGuards: string[];
  baseTags: string[];
  logoOverrides?: Partial<LogoRules>;
};
