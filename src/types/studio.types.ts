// Studio Types - Comprehensive type definitions for creation studios

export type StudioType = 
  | 'branding'
  | 'print-signage'
  | 'merchandise'
  | 'social-digital'
  | 'presentations'
  | 'venue-experience'
  | 'invitations-access'
  | 'hospitality-dining'
  | 'video-motion'
  | 'documents-forms'
  | 'photo-engagement'
  | 'accessibility-safety';

export interface StudioDefinition {
  id: StudioType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
  route: string;
  assetTypes: string[];
  categories: StudioCategory[];
  features: StudioFeature[];
}

export interface StudioCategory {
  id: string;
  name: string;
  description: string;
  assetTypes: string[];
  icon?: string;
}

export interface StudioFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  logo_monochrome_url?: string;
  logo_reversed_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  brandhub_share_token?: string | null;
  styles?: BrandStyle;
}

export interface BrandStyle {
  id: string;
  brand_id: string;
  
  // Color System
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette: ColorInfo[];
  
  // Typography
  heading_font?: string;
  body_font?: string;
  accent_font?: string;
  typography_scale: Record<string, unknown>;
  
  // Voice & Tone
  brand_voice: string[];
  tone_keywords: string[];
  writing_style?: string;
  
  // Visual Style
  mood_keywords: string[];
  imagery_style?: string;
  pattern_style?: string;
  icon_style?: string;
  photography_style?: string;
  photography_dos?: string[];
  photography_donts?: string[];
  
  // Brand Identity
  tagline?: string;
  mission?: string;
  archetype?: string;
  
  // Logo Rules
  logo_clear_space?: string;
  logo_min_size?: string;
  logo_placement_rules?: string[];
  logo_backgrounds?: string[];
  
  // Layout & Restrictions
  approved_layouts?: string[];
  restricted_elements?: string[];
  
  // Cultural & Audience
  target_audience?: string;
  cultural_context?: string;
  industry?: string;
  
  // Social
  social_handles?: Record<string, string>;
  hashtags?: string[];
  
  // Imagery Library
  all_imagery?: {
    all?: string[];
    byType?: {
      logos?: string[];
      brandIcons?: string[];
      patterns?: string[];
      photography?: string[];
      heroImages?: string[];
      collateral?: string[];
      social?: string[];
      banners?: string[];
      video?: string[];
      sponsors?: string[];
    };
  };
  
  // Advanced Settings
  print_color_mode: 'CMYK' | 'RGB' | 'Pantone';
  preferred_render_engine?: string;
  custom_prompts: Record<string, string>;
  
  created_at: string;
  updated_at: string;
}

export interface ColorInfo {
  hex: string;
  name?: string;
  rgb?: { r: number; g: number; b: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  pantone?: string;
  usage?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface StudioConfig {
  id: string;
  user_id: string;
  studio_type: StudioType;
  default_brand_id?: string;
  layout_preference: 'grid' | 'list' | 'masonry';
  auto_generate: boolean;
  show_advanced_options: boolean;
  default_export_format: 'png' | 'jpg' | 'pdf' | 'svg';
  default_resolution: number;
  include_bleed: boolean;
  include_crop_marks: boolean;
  preferred_model?: string;
  generation_quality: 'draft' | 'standard' | 'high' | 'ultra';
  created_at: string;
  updated_at: string;
}

export interface StudioTemplate {
  id: string;
  studio_type: StudioType;
  asset_type: string;
  template_name: string;
  description?: string;
  thumbnail_url?: string;
  
  // Production specs
  width_px?: number;
  height_px?: number;
  width_inches?: number;
  height_inches?: number;
  resolution_dpi: number;
  bleed_inches: number;
  safe_zone_inches: number;
  color_mode: 'CMYK' | 'RGB';
  
  // Output settings
  output_formats: string[];
  is_print_ready: boolean;
  is_digital_optimized: boolean;
  
  // Prompt configuration
  base_prompt?: string;
  prompt_variables: string[];
  style_modifiers: string[];
  
  // Metadata
  category?: string;
  tags: string[];
  sort_order: number;
  is_featured: boolean;
  is_system: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface StudioAsset {
  id: string;
  template: StudioTemplate;
  brand: Brand;
  content?: string;
  preview_url?: string;
  production_files?: ProductionFile[];
  metadata: Record<string, unknown>;
  status: 'draft' | 'generating' | 'ready' | 'exported';
  created_at: string;
  updated_at: string;
}

export interface ProductionFile {
  id: string;
  format: string;
  url: string;
  size_bytes: number;
  resolution_dpi?: number;
  color_mode?: string;
  has_bleed?: boolean;
  has_crop_marks?: boolean;
  created_at: string;
}

export interface GenerationRequest {
  template_id: string;
  brand_id: string;
  custom_prompt?: string;
  style_overrides?: Partial<BrandStyle>;
  production_settings?: ProductionSettings;
}

export interface ProductionSettings {
  format: string;
  resolution_dpi: number;
  color_mode: 'CMYK' | 'RGB';
  include_bleed: boolean;
  bleed_size: number;
  include_crop_marks: boolean;
  include_registration_marks: boolean;
  flatten_layers: boolean;
}

// Studio definitions with all asset mappings
export const STUDIO_DEFINITIONS: StudioDefinition[] = [
  {
    id: 'branding',
    name: 'Branding Studio',
    shortName: 'Branding',
    description: 'Create complete brand identity systems including logos, color palettes, and style guides',
    icon: 'Palette',
    gradient: 'from-violet-500 to-purple-600',
    accentColor: 'violet',
    route: '/studio/branding',
    assetTypes: ['LOGO', 'LOGO_MONOCHROME', 'LOGO_REVERSED', 'PALETTE', 'SLOGANS', 'STYLE_GUIDE', 'SEAMLESS_PATTERN'],
    categories: [
      { id: 'logos', name: 'Logo System', description: 'Primary and variant logos', assetTypes: ['LOGO', 'LOGO_MONOCHROME', 'LOGO_REVERSED'] },
      { id: 'colors', name: 'Color System', description: 'Brand color palettes', assetTypes: ['PALETTE'] },
      { id: 'identity', name: 'Brand Identity', description: 'Slogans, patterns, guides', assetTypes: ['SLOGANS', 'STYLE_GUIDE', 'SEAMLESS_PATTERN'] }
    ],
    features: [
      { id: 'ai-logo-gen', name: 'AI Logo Generation', description: 'Generate logos with AI', enabled: true },
      { id: 'color-extraction', name: 'Color Extraction', description: 'Extract colors from images', enabled: true },
      { id: 'brand-guide-export', name: 'Brand Guide Export', description: 'Export comprehensive brand guides', enabled: true }
    ]
  },
  {
    id: 'print-signage',
    name: 'Print & Signage Studio',
    shortName: 'Print',
    description: 'Professional print-ready assets from banners to business cards',
    icon: 'Printer',
    gradient: 'from-blue-500 to-cyan-500',
    accentColor: 'blue',
    route: '/studio/print-signage',
    assetTypes: ['BANNER', 'NAME_TAG', 'NAME_TAG_BACK', 'EVENT_SIGNAGE', 'HANGING_SIGNAGE', 'OUTDOOR_SIGNAGE', 'DOOR_SIGNAGE', 'EASEL_SIGNAGE', 'LOCATION_SIGNAGE', 'ROOM_SIGNAGE', 'STAND_UP_PILLAR_BANNER', 'FEATHER_FLAG', 'TEARDROP_FLAG', 'FOLDER', 'MENU'],
    categories: [
      { id: 'banners', name: 'Banners & Flags', description: 'Large format displays', assetTypes: ['BANNER', 'STAND_UP_PILLAR_BANNER', 'FEATHER_FLAG', 'TEARDROP_FLAG'] },
      { id: 'signage', name: 'Wayfinding Signage', description: 'Directional and informational', assetTypes: ['EVENT_SIGNAGE', 'HANGING_SIGNAGE', 'OUTDOOR_SIGNAGE', 'DOOR_SIGNAGE', 'EASEL_SIGNAGE', 'LOCATION_SIGNAGE', 'ROOM_SIGNAGE'] },
      { id: 'badges', name: 'Badges & IDs', description: 'Name tags and credentials', assetTypes: ['NAME_TAG', 'NAME_TAG_BACK'] },
      { id: 'collateral', name: 'Print Collateral', description: 'Folders, menus, materials', assetTypes: ['FOLDER', 'MENU'] }
    ],
    features: [
      { id: 'cmyk-export', name: 'CMYK Export', description: 'Print-ready color profiles', enabled: true },
      { id: 'bleed-trim', name: 'Bleed & Trim Marks', description: 'Professional print marks', enabled: true },
      { id: 'vendor-templates', name: 'Vendor Templates', description: 'Pre-configured for print vendors', enabled: true }
    ]
  },
  {
    id: 'merchandise',
    name: 'Merchandise Studio',
    shortName: 'Merch',
    description: 'Design apparel, accessories, and promotional items',
    icon: 'Shirt',
    gradient: 'from-orange-500 to-red-500',
    accentColor: 'orange',
    route: '/studio/merchandise',
    assetTypes: ['TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE', 'HAT', 'LANYARD', 'SWAG_BAG', 'STICKER_SHEET', 'WATER_BOTTLE'],
    categories: [
      { id: 'apparel', name: 'Apparel', description: 'T-shirts, hats, and wearables', assetTypes: ['TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE', 'HAT'] },
      { id: 'accessories', name: 'Accessories', description: 'Lanyards, bags, bottles', assetTypes: ['LANYARD', 'SWAG_BAG', 'WATER_BOTTLE'] },
      { id: 'promotional', name: 'Promotional', description: 'Stickers and giveaways', assetTypes: ['STICKER_SHEET'] }
    ],
    features: [
      { id: 'mockup-preview', name: '3D Mockup Preview', description: 'See designs on products', enabled: true },
      { id: 'artwork-extraction', name: 'Artwork Extraction', description: 'Isolate designs for production', enabled: true },
      { id: 'screen-print-ready', name: 'Screen Print Ready', description: 'Separated color exports', enabled: true }
    ]
  },
  {
    id: 'social-digital',
    name: 'Social & Digital Studio',
    shortName: 'Social',
    description: 'Social media posts, headers, and digital marketing assets',
    icon: 'Share2',
    gradient: 'from-pink-500 to-rose-500',
    accentColor: 'pink',
    route: '/studio/social-digital',
    assetTypes: ['SOCIAL_POST', 'SOCIAL_STORY', 'EMAIL_HEADER', 'LINKEDIN_BANNER', 'TWITTER_HEADER', 'YOUTUBE_THUMBNAIL', 'PODCAST_COVER', 'ZOOM_BACKGROUND', 'APP_ICON', 'FAVICON', 'EVENT_APP_SPLASH'],
    categories: [
      { id: 'social-posts', name: 'Social Posts', description: 'Feed and story content', assetTypes: ['SOCIAL_POST', 'SOCIAL_STORY'] },
      { id: 'headers', name: 'Profile Headers', description: 'Platform banners', assetTypes: ['LINKEDIN_BANNER', 'TWITTER_HEADER'] },
      { id: 'media', name: 'Media Assets', description: 'Thumbnails, covers, icons', assetTypes: ['YOUTUBE_THUMBNAIL', 'PODCAST_COVER', 'APP_ICON', 'FAVICON'] },
      { id: 'virtual', name: 'Virtual Assets', description: 'Backgrounds and splashes', assetTypes: ['ZOOM_BACKGROUND', 'EVENT_APP_SPLASH'] },
      { id: 'email', name: 'Email Marketing', description: 'Headers and templates', assetTypes: ['EMAIL_HEADER'] }
    ],
    features: [
      { id: 'platform-sizing', name: 'Platform Sizing', description: 'Auto-resize for platforms', enabled: true },
      { id: 'animated-export', name: 'Animated Export', description: 'GIF and video variants', enabled: true },
      { id: 'caption-gen', name: 'Caption Generation', description: 'AI-generated captions', enabled: true }
    ]
  },
  {
    id: 'presentations',
    name: 'Presentations Studio',
    shortName: 'Slides',
    description: 'Professional presentation decks and webinar assets',
    icon: 'Presentation',
    gradient: 'from-emerald-500 to-teal-500',
    accentColor: 'emerald',
    route: '/studio/presentations',
    assetTypes: ['PRESENTATION_SLIDE', 'WEBINAR_SLIDE', 'LIVE_STREAM_OVERLAY'],
    categories: [
      { id: 'slides', name: 'Slide Decks', description: 'Presentation templates', assetTypes: ['PRESENTATION_SLIDE', 'WEBINAR_SLIDE'] },
      { id: 'broadcast', name: 'Broadcast', description: 'Stream overlays', assetTypes: ['LIVE_STREAM_OVERLAY'] }
    ],
    features: [
      { id: 'pptx-export', name: 'PowerPoint Export', description: 'Editable PPTX files', enabled: true },
      { id: 'speaker-notes', name: 'Speaker Notes', description: 'AI-generated notes', enabled: true },
      { id: 'template-system', name: 'Template System', description: 'Consistent slide layouts', enabled: true }
    ]
  },
  {
    id: 'venue-experience',
    name: 'Venue & Experience Studio',
    shortName: 'Venue',
    description: 'Stage backdrops, environmental graphics, and experiential elements',
    icon: 'Building',
    gradient: 'from-indigo-500 to-blue-600',
    accentColor: 'indigo',
    route: '/studio/venue-experience',
    assetTypes: ['BACK_WALL', 'MAIN_STAGE_BACKDROP', 'REGISTRATION_COUNTER', 'REGISTRATION_BACK_WALL', 'KIOSK', 'STEP_AND_REPEAT', 'FLOOR_DECAL', 'ELEVATOR_WRAP', 'COLUMN_WRAP', 'CEILING_HANGER'],
    categories: [
      { id: 'stage', name: 'Stage & Backdrops', description: 'Main stage elements', assetTypes: ['BACK_WALL', 'MAIN_STAGE_BACKDROP', 'STEP_AND_REPEAT'] },
      { id: 'registration', name: 'Registration Area', description: 'Check-in graphics', assetTypes: ['REGISTRATION_COUNTER', 'REGISTRATION_BACK_WALL', 'KIOSK'] },
      { id: 'environmental', name: 'Environmental', description: 'Wraps and floor graphics', assetTypes: ['FLOOR_DECAL', 'ELEVATOR_WRAP', 'COLUMN_WRAP', 'CEILING_HANGER'] }
    ],
    features: [
      { id: 'scale-preview', name: 'Scale Preview', description: 'See assets at venue scale', enabled: true },
      { id: 'panel-system', name: 'Panel System', description: 'Multi-panel configurations', enabled: true },
      { id: 'led-specs', name: 'LED Specifications', description: 'LED wall optimized exports', enabled: true }
    ]
  },
  {
    id: 'invitations-access',
    name: 'Invitations & Access Studio',
    shortName: 'Invites',
    description: 'Event invitations, tickets, badges, and access credentials',
    icon: 'Ticket',
    gradient: 'from-amber-500 to-yellow-500',
    accentColor: 'amber',
    route: '/studio/invitations-access',
    assetTypes: ['INVITATION_CARD', 'RSVP_CARD', 'TICKET_DESIGN', 'VIP_BADGE', 'BACKSTAGE_PASS', 'PARKING_PASS', 'WRISTBAND_DESIGN'],
    categories: [
      { id: 'invitations', name: 'Invitations', description: 'Event invites and RSVPs', assetTypes: ['INVITATION_CARD', 'RSVP_CARD'] },
      { id: 'tickets', name: 'Tickets', description: 'Event tickets', assetTypes: ['TICKET_DESIGN'] },
      { id: 'access', name: 'Access Credentials', description: 'VIP and backstage passes', assetTypes: ['VIP_BADGE', 'BACKSTAGE_PASS', 'PARKING_PASS', 'WRISTBAND_DESIGN'] }
    ],
    features: [
      { id: 'qr-integration', name: 'QR Integration', description: 'Embedded QR codes', enabled: true },
      { id: 'variable-data', name: 'Variable Data', description: 'Personalized credentials', enabled: true },
      { id: 'security-features', name: 'Security Features', description: 'Anti-counterfeit elements', enabled: true }
    ]
  },
  {
    id: 'hospitality-dining',
    name: 'Hospitality & Dining Studio',
    shortName: 'Dining',
    description: 'Menus, table settings, and hospitality materials',
    icon: 'UtensilsCrossed',
    gradient: 'from-lime-500 to-green-500',
    accentColor: 'lime',
    route: '/studio/hospitality-dining',
    assetTypes: ['PLACE_CARD', 'TABLE_NUMBER', 'TABLE_TENT', 'COASTER_DESIGN', 'NAPKIN_DESIGN', 'BAR_MENU', 'CATERING_LABEL', 'DIETARY_CARD'],
    categories: [
      { id: 'table-settings', name: 'Table Settings', description: 'Place cards and numbers', assetTypes: ['PLACE_CARD', 'TABLE_NUMBER', 'TABLE_TENT'] },
      { id: 'menus', name: 'Menus & Labels', description: 'Food and beverage', assetTypes: ['BAR_MENU', 'CATERING_LABEL', 'DIETARY_CARD'] },
      { id: 'accessories', name: 'Table Accessories', description: 'Coasters and napkins', assetTypes: ['COASTER_DESIGN', 'NAPKIN_DESIGN'] }
    ],
    features: [
      { id: 'dietary-icons', name: 'Dietary Icons', description: 'Standard dietary indicators', enabled: true },
      { id: 'variable-print', name: 'Variable Print', description: 'Guest name personalization', enabled: true },
      { id: 'multi-language', name: 'Multi-Language', description: 'Translation support', enabled: true }
    ]
  },
  {
    id: 'video-motion',
    name: 'Video & Motion Studio',
    shortName: 'Video',
    description: 'Video teasers, animated graphics, and motion content',
    icon: 'Video',
    gradient: 'from-red-500 to-pink-600',
    accentColor: 'red',
    route: '/studio/video-motion',
    assetTypes: ['VIDEO_TEASER', 'ANIMATED_LOGO', 'MOTION_GRAPHIC', 'COUNTDOWN_TIMER', 'DIGITAL_SIGNAGE_LOOP'],
    categories: [
      { id: 'video', name: 'Video Content', description: 'Teasers and promos', assetTypes: ['VIDEO_TEASER'] },
      { id: 'animation', name: 'Animation', description: 'Animated graphics', assetTypes: ['ANIMATED_LOGO', 'MOTION_GRAPHIC'] },
      { id: 'digital-signage', name: 'Digital Signage', description: 'Loops and countdowns', assetTypes: ['COUNTDOWN_TIMER', 'DIGITAL_SIGNAGE_LOOP'] }
    ],
    features: [
      { id: 'ai-video-gen', name: 'AI Video Generation', description: 'Text and image to video', enabled: true },
      { id: 'loop-creation', name: 'Loop Creation', description: 'Seamless video loops', enabled: true },
      { id: 'multi-format', name: 'Multi-Format', description: 'MP4, WebM, GIF exports', enabled: true }
    ]
  },
  {
    id: 'documents-forms',
    name: 'Documents & Forms Studio',
    shortName: 'Docs',
    description: 'Program booklets, certificates, media kits, and forms',
    icon: 'FileText',
    gradient: 'from-slate-500 to-gray-600',
    accentColor: 'slate',
    route: '/studio/documents-forms',
    assetTypes: ['PROGRAM_BOOKLET', 'PRESS_RELEASE', 'MEDIA_KIT', 'SPONSOR_PACKAGE', 'CERTIFICATE_AWARD', 'THANK_YOU_NOTE', 'SESSION_EVALUATION'],
    categories: [
      { id: 'programs', name: 'Programs', description: 'Event programs and booklets', assetTypes: ['PROGRAM_BOOKLET'] },
      { id: 'media', name: 'Media & Press', description: 'Press kits and releases', assetTypes: ['PRESS_RELEASE', 'MEDIA_KIT'] },
      { id: 'sponsor', name: 'Sponsorship', description: 'Sponsor packages', assetTypes: ['SPONSOR_PACKAGE'] },
      { id: 'recognition', name: 'Recognition', description: 'Certificates and thank yous', assetTypes: ['CERTIFICATE_AWARD', 'THANK_YOU_NOTE'] },
      { id: 'feedback', name: 'Feedback', description: 'Evaluation forms', assetTypes: ['SESSION_EVALUATION'] }
    ],
    features: [
      { id: 'pdf-generation', name: 'PDF Generation', description: 'Multi-page documents', enabled: true },
      { id: 'template-merge', name: 'Template Merge', description: 'Variable data merge', enabled: true },
      { id: 'booklet-layout', name: 'Booklet Layout', description: 'Saddle-stitch impositions', enabled: true }
    ]
  },
  {
    id: 'photo-engagement',
    name: 'Photo & Engagement Studio',
    shortName: 'Photo',
    description: 'Photo booth assets, networking tools, and interactive elements',
    icon: 'Camera',
    gradient: 'from-fuchsia-500 to-purple-600',
    accentColor: 'fuchsia',
    route: '/studio/photo-engagement',
    assetTypes: ['PHOTO_BOOTH_FRAME', 'PHOTO_BOOTH_PROPS', 'NETWORKING_BINGO', 'SCAVENGER_HUNT_CARD', 'POLL_CARD', 'SPEAKER_INTRO_CARD', 'BREAKOUT_SESSION_SIGN'],
    categories: [
      { id: 'photo-booth', name: 'Photo Booth', description: 'Frames and props', assetTypes: ['PHOTO_BOOTH_FRAME', 'PHOTO_BOOTH_PROPS'] },
      { id: 'networking', name: 'Networking', description: 'Bingo and activities', assetTypes: ['NETWORKING_BINGO', 'SCAVENGER_HUNT_CARD', 'POLL_CARD'] },
      { id: 'sessions', name: 'Sessions', description: 'Speaker and session materials', assetTypes: ['SPEAKER_INTRO_CARD', 'BREAKOUT_SESSION_SIGN'] }
    ],
    features: [
      { id: 'social-share', name: 'Social Share', description: 'Branded sharing frames', enabled: true },
      { id: 'prop-templates', name: 'Prop Templates', description: 'Die-cut prop files', enabled: true },
      { id: 'gamification', name: 'Gamification', description: 'Activity game cards', enabled: true }
    ]
  },
  {
    id: 'accessibility-safety',
    name: 'Accessibility & Safety Studio',
    shortName: 'Safety',
    description: 'ADA signage, emergency information, and staff credentials',
    icon: 'Shield',
    gradient: 'from-green-500 to-emerald-600',
    accentColor: 'green',
    route: '/studio/accessibility-safety',
    assetTypes: ['ACCESSIBILITY_SIGNAGE', 'EMERGENCY_GUIDE', 'WIFI_SIGN', 'QR_CODE', 'AGENDA_HIGHLIGHTS', 'FLOOR_PLAN', 'VOLUNTEER_VEST', 'SECURITY_BADGE', 'MEDIA_CREDENTIAL'],
    categories: [
      { id: 'accessibility', name: 'Accessibility', description: 'ADA compliant signage', assetTypes: ['ACCESSIBILITY_SIGNAGE'] },
      { id: 'safety', name: 'Safety & Emergency', description: 'Emergency information', assetTypes: ['EMERGENCY_GUIDE'] },
      { id: 'utility', name: 'Utility Signage', description: 'WiFi, QR, wayfinding', assetTypes: ['WIFI_SIGN', 'QR_CODE', 'AGENDA_HIGHLIGHTS', 'FLOOR_PLAN'] },
      { id: 'staff', name: 'Staff Credentials', description: 'Volunteer and security badges', assetTypes: ['VOLUNTEER_VEST', 'SECURITY_BADGE', 'MEDIA_CREDENTIAL'] }
    ],
    features: [
      { id: 'ada-compliance', name: 'ADA Compliance', description: 'Meets accessibility standards', enabled: true },
      { id: 'qr-generation', name: 'QR Generation', description: 'Branded QR codes', enabled: true },
      { id: 'credential-security', name: 'Credential Security', description: 'Anti-counterfeit features', enabled: true }
    ]
  }
];

// Helper to get studio by ID
export const getStudioById = (id: StudioType): StudioDefinition | undefined => {
  return STUDIO_DEFINITIONS.find(s => s.id === id);
};

// Helper to get studio by asset type
export const getStudioByAssetType = (assetType: string): StudioDefinition | undefined => {
  return STUDIO_DEFINITIONS.find(s => s.assetTypes.includes(assetType));
};

// Get all asset types for a studio
export const getStudioAssetTypes = (studioId: StudioType): string[] => {
  const studio = getStudioById(studioId);
  return studio?.assetTypes || [];
};
