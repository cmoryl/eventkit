import { AssetType } from '../types';

export type AssetCategory = 
  | 'branding' 
  | 'print' 
  | 'merchandise' 
  | 'digital' 
  | 'experience' 
  | 'utilities';

export interface PrintSpec {
  widthInches: number;
  heightInches: number;
  dpi: number;
  bleedInches: number;
  colorMode: 'RGB' | 'CMYK';
  fileFormat: 'PNG' | 'PDF' | 'SVG' | 'JPEG';
  notes?: string;
}

export interface AssetConfig {
  type: AssetType;
  title: string;
  description: string;
  category: AssetCategory;
  icon: string;
  printSpec?: PrintSpec;
  hasBack?: boolean;
  hasSleeve?: boolean;
  isTextBased?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isPresentationDeck?: boolean;
  requiresLogo?: boolean;
  aspectRatio?: string;
  pixelWidth?: number;
  pixelHeight?: number;
}

// Category metadata
export const ASSET_CATEGORIES: Record<AssetCategory, { label: string; description: string; icon: string }> = {
  branding: {
    label: 'Branding & Identity',
    description: 'Core brand elements, color palettes, and style guides',
    icon: 'Palette',
  },
  print: {
    label: 'Print & Signage',
    description: 'Banners, name tags, signage with production-ready specs',
    icon: 'Printer',
  },
  merchandise: {
    label: 'Merchandise',
    description: 'Apparel, swag, and branded merchandise mockups',
    icon: 'Shirt',
  },
  digital: {
    label: 'Digital Assets',
    description: 'Social media, email headers, and web graphics',
    icon: 'Monitor',
  },
  experience: {
    label: 'Venue & Experience',
    description: 'Stage backdrops, floor plans, and environmental graphics',
    icon: 'Building',
  },
  utilities: {
    label: 'Utilities',
    description: 'QR codes, WiFi signs, and functional assets',
    icon: 'Wrench',
  },
};

// Complete asset configuration with print specifications
export const ASSET_CONFIGS: AssetConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BRANDING & IDENTITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.Palette,
    title: 'Color Palette',
    description: 'Brand colors with CMYK, Pantone, and hex values',
    category: 'branding',
    icon: 'Palette',
    isTextBased: true,
  },
  {
    type: AssetType.Logo,
    title: 'Primary Logo',
    description: 'Main event logo with clear space guidelines',
    category: 'branding',
    icon: 'Image',
    printSpec: {
      widthInches: 4,
      heightInches: 4,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'SVG',
    },
  },
  {
    type: AssetType.LogoMonochrome,
    title: 'Monochrome Logo',
    description: 'Single-color version for limited printing',
    category: 'branding',
    icon: 'Circle',
    printSpec: {
      widthInches: 4,
      heightInches: 4,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'SVG',
    },
    requiresLogo: true,
  },
  {
    type: AssetType.LogoReversed,
    title: 'Reversed Logo',
    description: 'White/light version for dark backgrounds',
    category: 'branding',
    icon: 'CircleDot',
    printSpec: {
      widthInches: 4,
      heightInches: 4,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'SVG',
    },
    requiresLogo: true,
  },
  {
    type: AssetType.Slogans,
    title: 'Event Slogans',
    description: 'Taglines and marketing catchphrases',
    category: 'branding',
    icon: 'Quote',
    isTextBased: true,
  },
  {
    type: AssetType.StyleGuide,
    title: 'Brand Style Guide',
    description: 'Complete brand guidelines document',
    category: 'branding',
    icon: 'BookOpen',
    isTextBased: true,
  },
  {
    type: AssetType.SeamlessPattern,
    title: 'Seamless Pattern',
    description: 'Tileable background pattern for merchandise',
    category: 'branding',
    icon: 'Grid3x3',
    pixelWidth: 1024,
    pixelHeight: 1024,
    aspectRatio: '1:1',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT & SIGNAGE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.NameTag,
    title: 'Name Tag (Front)',
    description: 'Attendee badge with name, company, and role',
    category: 'print',
    icon: 'CreditCard',
    hasBack: true,
    printSpec: {
      widthInches: 4,
      heightInches: 3,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Standard badge size, compatible with Avery templates',
    },
  },
  {
    type: AssetType.NameTagBack,
    title: 'Name Tag (Back)',
    description: 'Badge reverse with schedule or sponsors',
    category: 'print',
    icon: 'CreditCard',
    printSpec: {
      widthInches: 4,
      heightInches: 3,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.Banner,
    title: 'Event Banner',
    description: 'Large format horizontal banner',
    category: 'print',
    icon: 'RectangleHorizontal',
    printSpec: {
      widthInches: 96,
      heightInches: 36,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: '8ft x 3ft standard banner size',
    },
    aspectRatio: '8:3',
  },
  {
    type: AssetType.EventSignage,
    title: 'General Signage',
    description: 'Multi-purpose directional signage',
    category: 'print',
    icon: 'SquareArrowRight',
    printSpec: {
      widthInches: 24,
      heightInches: 36,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '2:3',
  },
  {
    type: AssetType.HangingSignage,
    title: 'Hanging Signage',
    description: 'Overhead directional or branding signs',
    category: 'print',
    icon: 'ArrowDownFromLine',
    printSpec: {
      widthInches: 36,
      heightInches: 24,
      dpi: 150,
      bleedInches: 0.25,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '3:2',
  },
  {
    type: AssetType.OutdoorSignage,
    title: 'Outdoor Signage',
    description: 'Weather-resistant exterior signage',
    category: 'print',
    icon: 'Sun',
    printSpec: {
      widthInches: 48,
      heightInches: 72,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'UV-resistant ink recommended',
    },
    aspectRatio: '2:3',
  },
  {
    type: AssetType.DoorSignage,
    title: 'Door Signage',
    description: 'Room identification and wayfinding',
    category: 'print',
    icon: 'DoorOpen',
    printSpec: {
      widthInches: 8.5,
      heightInches: 11,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '8.5:11',
  },
  {
    type: AssetType.EaselSignage,
    title: 'Easel Sign',
    description: 'Freestanding foam board signage',
    category: 'print',
    icon: 'Presentation',
    printSpec: {
      widthInches: 22,
      heightInches: 28,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '22:28',
  },
  {
    type: AssetType.LocationSignage,
    title: 'Location Marker',
    description: 'Booth and area identification',
    category: 'print',
    icon: 'MapPin',
    printSpec: {
      widthInches: 18,
      heightInches: 24,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.RoomSignage,
    title: 'Room Signage',
    description: 'Conference room and session identifiers',
    category: 'print',
    icon: 'LayoutGrid',
    printSpec: {
      widthInches: 11,
      heightInches: 8.5,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '11:8.5',
  },
  {
    type: AssetType.StandUpPillarBanner,
    title: 'Retractable Banner',
    description: 'Pull-up banner stand graphics',
    category: 'print',
    icon: 'PanelTop',
    printSpec: {
      widthInches: 33.5,
      heightInches: 80,
      dpi: 150,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Standard retractable banner size',
    },
    aspectRatio: '1:2.4',
  },
  {
    type: AssetType.FeatherFlag,
    title: 'Feather Flag',
    description: 'Outdoor feather-shaped flag banner',
    category: 'print',
    icon: 'Flag',
    printSpec: {
      widthInches: 26,
      heightInches: 112,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Large feather flag, print both sides for double-sided',
    },
  },
  {
    type: AssetType.TeardropFlag,
    title: 'Teardrop Flag',
    description: 'Curved teardrop-shaped flag banner',
    category: 'print',
    icon: 'Droplet',
    printSpec: {
      widthInches: 27.5,
      heightInches: 66.5,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.Menu,
    title: 'Event Menu',
    description: 'Food and beverage menu card',
    category: 'print',
    icon: 'UtensilsCrossed',
    printSpec: {
      widthInches: 8.5,
      heightInches: 11,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.Folder,
    title: 'Presentation Folder',
    description: 'Branded document folder with pockets',
    category: 'print',
    icon: 'FolderOpen',
    printSpec: {
      widthInches: 18,
      heightInches: 12,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Standard 9x12 folder with 4-inch pockets, print flat',
    },
  },
  {
    type: AssetType.ThankYouNote,
    title: 'Thank You Card',
    description: 'Post-event appreciation card',
    category: 'print',
    icon: 'Heart',
    printSpec: {
      widthInches: 5,
      heightInches: 7,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MERCHANDISE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.Tshirt,
    title: 'T-Shirt (Front)',
    description: 'Event t-shirt front design',
    category: 'merchandise',
    icon: 'Shirt',
    hasBack: true,
    hasSleeve: true,
    printSpec: {
      widthInches: 12,
      heightInches: 16,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
      notes: 'DTG or screen print ready, max 8 colors for screen',
    },
  },
  {
    type: AssetType.TshirtBack,
    title: 'T-Shirt (Back)',
    description: 'Event t-shirt back design',
    category: 'merchandise',
    icon: 'Shirt',
    printSpec: {
      widthInches: 12,
      heightInches: 16,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
    },
  },
  {
    type: AssetType.TshirtSleeve,
    title: 'T-Shirt (Sleeve)',
    description: 'Sleeve print design',
    category: 'merchandise',
    icon: 'Shirt',
    printSpec: {
      widthInches: 3.5,
      heightInches: 3.5,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
    },
  },
  {
    type: AssetType.Hat,
    title: 'Embroidered Hat',
    description: 'Baseball cap with embroidery mockup',
    category: 'merchandise',
    icon: 'HardHat',
    printSpec: {
      widthInches: 4,
      heightInches: 2.5,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
      notes: 'Max 15,000 stitches for standard embroidery',
    },
  },
  {
    type: AssetType.Lanyard,
    title: 'Lanyard',
    description: 'Neck strap with event branding',
    category: 'merchandise',
    icon: 'Ribbon',
    printSpec: {
      widthInches: 0.75,
      heightInches: 36,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
      notes: 'Standard 3/4" wide lanyard, sublimation print',
    },
  },
  {
    type: AssetType.SwagBag,
    title: 'Swag Bag',
    description: 'Tote bag with event branding',
    category: 'merchandise',
    icon: 'ShoppingBag',
    printSpec: {
      widthInches: 10,
      heightInches: 12,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
      notes: 'Standard canvas tote, screen print 1-2 colors',
    },
  },
  {
    type: AssetType.WaterBottle,
    title: 'Water Bottle',
    description: 'Branded water bottle wrap',
    category: 'merchandise',
    icon: 'Wine',
    printSpec: {
      widthInches: 8.25,
      heightInches: 2,
      dpi: 300,
      bleedInches: 0.0625,
      colorMode: 'CMYK',
      fileFormat: 'PNG',
      notes: 'Standard water bottle label wrap',
    },
  },
  {
    type: AssetType.StickerSheet,
    title: 'Sticker Sheet',
    description: 'Die-cut sticker collection',
    category: 'merchandise',
    icon: 'Sticker',
    printSpec: {
      widthInches: 8.5,
      heightInches: 11,
      dpi: 300,
      bleedInches: 0.125,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Kiss-cut or die-cut ready',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIGITAL ASSETS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.SocialPost,
    title: 'Social Media Post',
    description: 'Square post for Instagram/Facebook',
    category: 'digital',
    icon: 'Share2',
    pixelWidth: 1080,
    pixelHeight: 1080,
    aspectRatio: '1:1',
  },
  {
    type: AssetType.SocialStory,
    title: 'Social Story',
    description: 'Vertical story for Instagram/TikTok',
    category: 'digital',
    icon: 'Smartphone',
    pixelWidth: 1080,
    pixelHeight: 1920,
    aspectRatio: '9:16',
  },
  {
    type: AssetType.SocialProfile,
    title: 'Social Profile Image',
    description: 'Avatar for social media accounts',
    category: 'digital',
    icon: 'User',
    pixelWidth: 400,
    pixelHeight: 400,
    aspectRatio: '1:1',
  },
  {
    type: AssetType.EmailHeader,
    title: 'Email Header',
    description: 'Banner for email campaigns',
    category: 'digital',
    icon: 'Mail',
    pixelWidth: 600,
    pixelHeight: 200,
    aspectRatio: '3:1',
  },
  {
    type: AssetType.AppIcon,
    title: 'App Icon',
    description: 'Mobile app icon set',
    category: 'digital',
    icon: 'AppWindow',
    pixelWidth: 1024,
    pixelHeight: 1024,
    aspectRatio: '1:1',
  },
  {
    type: AssetType.Favicon,
    title: 'Favicon',
    description: 'Website browser icon',
    category: 'digital',
    icon: 'Globe',
    pixelWidth: 512,
    pixelHeight: 512,
    aspectRatio: '1:1',
  },
  {
    type: AssetType.MarketingCopy,
    title: 'Marketing Copy',
    description: 'Event description and promotional text',
    category: 'digital',
    icon: 'FileText',
    isTextBased: true,
  },
  {
    type: AssetType.AgendaHighlights,
    title: 'Agenda Highlights',
    description: 'Key sessions and schedule summary',
    category: 'digital',
    icon: 'ListChecks',
    isTextBased: true,
  },
  {
    type: AssetType.Presentation,
    title: 'Presentation Deck',
    description: 'Editable slide deck for keynotes',
    category: 'digital',
    icon: 'Presentation',
    isPresentationDeck: true,
    pixelWidth: 1920,
    pixelHeight: 1080,
    aspectRatio: '16:9',
  },
  {
    type: AssetType.PresentationSlide,
    title: 'Presentation Slide',
    description: 'Single slide template',
    category: 'digital',
    icon: 'Frame',
    pixelWidth: 1920,
    pixelHeight: 1080,
    aspectRatio: '16:9',
  },
  {
    type: AssetType.VideoTeaser,
    title: 'Video Teaser',
    description: '15-30 second promotional video',
    category: 'digital',
    icon: 'Video',
    isVideo: true,
    pixelWidth: 1920,
    pixelHeight: 1080,
    aspectRatio: '16:9',
  },
  {
    type: AssetType.Soundtrack,
    title: 'Event Soundtrack',
    description: 'Background music and audio branding',
    category: 'digital',
    icon: 'Music',
    isAudio: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENUE & EXPERIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.MainStageBackdrop,
    title: 'Main Stage Backdrop',
    description: 'Large format stage background',
    category: 'experience',
    icon: 'Theater',
    printSpec: {
      widthInches: 240,
      heightInches: 120,
      dpi: 72,
      bleedInches: 2,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: '20ft x 10ft, fabric or vinyl printing',
    },
    aspectRatio: '2:1',
  },
  {
    type: AssetType.BackWall,
    title: 'Backdrop Wall',
    description: 'Photo opportunity backdrop',
    category: 'experience',
    icon: 'LayoutPanelTop',
    printSpec: {
      widthInches: 96,
      heightInches: 84,
      dpi: 100,
      bleedInches: 1,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '8:7',
  },
  {
    type: AssetType.RegistrationCounter,
    title: 'Registration Counter',
    description: 'Check-in desk front wrap',
    category: 'experience',
    icon: 'SquareUser',
    printSpec: {
      widthInches: 72,
      heightInches: 36,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '2:1',
  },
  {
    type: AssetType.RegistrationBackWall,
    title: 'Registration Backdrop',
    description: 'Wall behind registration desk',
    category: 'experience',
    icon: 'PanelTopDashed',
    printSpec: {
      widthInches: 120,
      heightInches: 96,
      dpi: 100,
      bleedInches: 1,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
    aspectRatio: '5:4',
  },
  {
    type: AssetType.WelcomeCounter,
    title: 'Welcome Counter',
    description: 'Information desk wrap',
    category: 'experience',
    icon: 'Info',
    printSpec: {
      widthInches: 48,
      heightInches: 36,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.TechnologyCounter,
    title: 'Tech Demo Counter',
    description: 'Technology demonstration desk',
    category: 'experience',
    icon: 'Monitor',
    printSpec: {
      widthInches: 60,
      heightInches: 36,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.Kiosk,
    title: 'Interactive Kiosk',
    description: 'Self-service kiosk wrap design',
    category: 'experience',
    icon: 'TabletSmartphone',
    printSpec: {
      widthInches: 24,
      heightInches: 72,
      dpi: 150,
      bleedInches: 0.5,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.Stairs,
    title: 'Stair Graphics',
    description: 'Staircase riser branding',
    category: 'experience',
    icon: 'Footprints',
    printSpec: {
      widthInches: 48,
      heightInches: 8,
      dpi: 150,
      bleedInches: 0.25,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: 'Per stair riser, slip-resistant vinyl',
    },
  },
  {
    type: AssetType.GlassDoor,
    title: 'Glass Door Decal',
    description: 'Frosted or clear door graphics',
    category: 'experience',
    icon: 'DoorOpen',
    printSpec: {
      widthInches: 36,
      heightInches: 84,
      dpi: 150,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.GlassDoubleDoor,
    title: 'Double Door Decal',
    description: 'Two-panel glass door graphics',
    category: 'experience',
    icon: 'Columns2',
    printSpec: {
      widthInches: 72,
      heightInches: 84,
      dpi: 150,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.GlassRotatingDoor,
    title: 'Rotating Door Decal',
    description: 'Revolving door segment graphics',
    category: 'experience',
    icon: 'RefreshCw',
    printSpec: {
      widthInches: 30,
      heightInches: 84,
      dpi: 150,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
      notes: '4 segments for standard revolving door',
    },
  },
  {
    type: AssetType.FloorPlan,
    title: 'Floor Plan',
    description: 'Venue layout with zones and flow',
    category: 'experience',
    icon: 'Map',
    pixelWidth: 2400,
    pixelHeight: 1800,
    aspectRatio: '4:3',
  },
  {
    type: AssetType.PhotorealisticShot,
    title: 'Photorealistic Mockup',
    description: 'Design placed in real-world context',
    category: 'experience',
    icon: 'Camera',
    pixelWidth: 1920,
    pixelHeight: 1080,
    aspectRatio: '16:9',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    type: AssetType.QRCode,
    title: 'QR Code',
    description: 'Scannable code with custom styling',
    category: 'utilities',
    icon: 'QrCode',
    pixelWidth: 1024,
    pixelHeight: 1024,
    aspectRatio: '1:1',
  },
  {
    type: AssetType.WifiSign,
    title: 'WiFi Sign',
    description: 'Network credentials display',
    category: 'utilities',
    icon: 'Wifi',
    printSpec: {
      widthInches: 8.5,
      heightInches: 11,
      dpi: 300,
      bleedInches: 0,
      colorMode: 'CMYK',
      fileFormat: 'PDF',
    },
  },
  {
    type: AssetType.RunOfShow,
    title: 'Run of Show',
    description: 'Detailed event timeline',
    category: 'utilities',
    icon: 'Clock',
    isTextBased: true,
  },
  {
    type: AssetType.LocationIntel,
    title: 'Venue Intelligence',
    description: 'Venue research and details',
    category: 'utilities',
    icon: 'Building2',
    isTextBased: true,
  },
];

// Helper functions
export const getAssetConfig = (type: AssetType): AssetConfig | undefined => {
  return ASSET_CONFIGS.find(config => config.type === type);
};

export const getAssetsByCategory = (category: AssetCategory): AssetConfig[] => {
  return ASSET_CONFIGS.filter(config => config.category === category);
};

export const getCategoryForAsset = (type: AssetType): AssetCategory | undefined => {
  return ASSET_CONFIGS.find(config => config.type === type)?.category;
};

export const getPrintReadyAssets = (): AssetConfig[] => {
  return ASSET_CONFIGS.filter(config => config.printSpec);
};

export const getDigitalAssets = (): AssetConfig[] => {
  return ASSET_CONFIGS.filter(config => !config.printSpec && !config.isTextBased);
};

export const getTextBasedAssets = (): AssetConfig[] => {
  return ASSET_CONFIGS.filter(config => config.isTextBased);
};

// Default recommended assets for quick start
export const DEFAULT_QUICK_START_ASSETS: AssetType[] = [
  AssetType.Palette,
  AssetType.Slogans,
  AssetType.SocialPost,
  AssetType.SocialStory,
  AssetType.NameTag,
  AssetType.Banner,
  AssetType.Tshirt,
  AssetType.Lanyard,
  AssetType.WifiSign,
  AssetType.EmailHeader,
];

// Full suite of assets for comprehensive generation
export const FULL_SUITE_ASSETS: AssetType[] = ASSET_CONFIGS
  .filter(c => c.type !== AssetType.Logo && 
              c.type !== AssetType.NameTagBack && 
              c.type !== AssetType.TshirtBack && 
              c.type !== AssetType.TshirtSleeve)
  .map(c => c.type);
