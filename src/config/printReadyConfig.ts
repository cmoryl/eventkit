// Print-Ready Design Configuration
// Defines which assets need design extraction vs direct print export

import { AssetType } from '../types';

export type PrintOutputType = 'direct' | 'mockup' | 'pattern' | 'document' | 'large_format' | 'environmental';

export interface PrintReadySpec {
  outputType: PrintOutputType;
  designDescription: string;
  isolatedDimensions?: {
    width: number;
    height: number;
    unit: 'in' | 'px' | 'ft';
  };
  printMethod?: 'screen_print' | 'dtg' | 'embroidery' | 'vinyl' | 'sublimation' | 'offset' | 'digital' | 'large_format' | 'fabric' | 'rigid' | 'vehicle_wrap';
  colorLimit?: number;
  requiresTransparency?: boolean;
  artworkPosition?: 'center' | 'left_chest' | 'full_front' | 'full_back' | 'wrap' | 'badge' | 'full_surface' | 'panel';
  extractionType?: 'logo_only' | 'graphics_only' | 'full_design' | 'pattern_tile' | 'multi_panel';
  notes?: string;
}

// Merchandise assets that show mockups but need isolated design files
export const MOCKUP_ASSETS: AssetType[] = [
  AssetType.Tshirt,
  AssetType.TshirtBack,
  AssetType.TshirtSleeve,
  AssetType.Hat,
  AssetType.SwagBag,
  AssetType.WaterBottle,
  AssetType.Lanyard,
  AssetType.CoasterDesign,
  AssetType.NapkinDesign,
  AssetType.WristbandDesign,
];

// Environmental/3D mockups that need design extraction for production
export const ENVIRONMENTAL_MOCKUP_ASSETS: AssetType[] = [
  AssetType.Kiosk,
  AssetType.RegistrationCounter,
  AssetType.WelcomeCounter,
  AssetType.TechnologyCounter,
  AssetType.RegistrationBackWall,
  AssetType.BackWall,
  AssetType.MainStageBackdrop,
  AssetType.Stairs,
  AssetType.GlassDoor,
  AssetType.GlassRotatingDoor,
  AssetType.GlassDoubleDoor,
];

// Large format signage that needs panel extraction
export const LARGE_FORMAT_ASSETS: AssetType[] = [
  AssetType.Banner,
  AssetType.StandUpPillarBanner,
  AssetType.FeatherFlag,
  AssetType.TeardropFlag,
  AssetType.HangingSignage,
  AssetType.OutdoorSignage,
  AssetType.EventSignage,
  AssetType.EaselSignage,
];

// Location/wayfinding signage
export const LOCATION_SIGNAGE_ASSETS: AssetType[] = [
  AssetType.LocationSignage,
  AssetType.RoomSignage,
  AssetType.DoorSignage,
  AssetType.WifiSign,
];

// Assets that are already print-ready (the generated image IS the print file)
export const DIRECT_PRINT_ASSETS: AssetType[] = [
  AssetType.NameTag,
  AssetType.NameTagBack,
  AssetType.ThankYouNote,
  AssetType.Menu,
  AssetType.Folder,
  AssetType.StickerSheet,
  AssetType.InvitationCard,
  AssetType.PlaceCard,
  AssetType.TableNumber,
  AssetType.TableTent,
  AssetType.ParkingPass,
  AssetType.TicketDesign,
  AssetType.VIPBadge,
  AssetType.CateringLabel,
  AssetType.DietaryCard,
  AssetType.PhotoBoothFrame,
  AssetType.PhotoBoothProps,
];

// Print specifications by asset type
export const PRINT_READY_SPECS: Partial<Record<AssetType, PrintReadySpec>> = {
  // ============================================
  // APPAREL & MERCHANDISE - Need design extraction
  // ============================================
  [AssetType.Tshirt]: {
    outputType: 'mockup',
    designDescription: 'Front chest or full front graphic for t-shirt printing',
    isolatedDimensions: { width: 12, height: 16, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 6,
    requiresTransparency: true,
    artworkPosition: 'center',
    extractionType: 'graphics_only',
    notes: 'For screen printing, limit colors. For DTG, full color is fine.'
  },
  [AssetType.TshirtBack]: {
    outputType: 'mockup',
    designDescription: 'Back graphic with event name, date, sponsors',
    isolatedDimensions: { width: 12, height: 14, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 4,
    requiresTransparency: true,
    artworkPosition: 'full_back',
    extractionType: 'full_design',
    notes: 'Usually includes event details and sponsor logos'
  },
  [AssetType.TshirtSleeve]: {
    outputType: 'mockup',
    designDescription: 'Small sleeve logo or text',
    isolatedDimensions: { width: 3, height: 3, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 2,
    requiresTransparency: true,
    artworkPosition: 'badge',
    extractionType: 'logo_only',
    notes: 'Keep simple - 1-2 colors maximum'
  },
  [AssetType.Hat]: {
    outputType: 'mockup',
    designDescription: 'Embroidery-ready logo for cap front',
    isolatedDimensions: { width: 4, height: 2.5, unit: 'in' },
    printMethod: 'embroidery',
    colorLimit: 6,
    requiresTransparency: true,
    artworkPosition: 'center',
    extractionType: 'logo_only',
    notes: 'Simplify for embroidery - no gradients, clean lines'
  },
  [AssetType.SwagBag]: {
    outputType: 'mockup',
    designDescription: 'Tote bag graphic for screen printing',
    isolatedDimensions: { width: 10, height: 10, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 3,
    requiresTransparency: true,
    artworkPosition: 'center',
    extractionType: 'graphics_only',
    notes: 'Bold, simple design works best on fabric'
  },
  [AssetType.WaterBottle]: {
    outputType: 'mockup',
    designDescription: 'Wrap-around bottle label design',
    isolatedDimensions: { width: 8, height: 3, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    extractionType: 'full_design',
    notes: 'Design should tile seamlessly or have clear start/end'
  },
  [AssetType.Lanyard]: {
    outputType: 'pattern',
    designDescription: 'Repeating pattern for lanyard printing',
    isolatedDimensions: { width: 1, height: 36, unit: 'in' },
    printMethod: 'sublimation',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    extractionType: 'pattern_tile',
    notes: 'Pattern repeats along the length of the lanyard'
  },
  [AssetType.WristbandDesign]: {
    outputType: 'mockup',
    designDescription: 'Wristband design for event admission',
    isolatedDimensions: { width: 10, height: 1, unit: 'in' },
    printMethod: 'sublimation',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    extractionType: 'full_design',
    notes: 'Include event name, date, and any security features'
  },
  [AssetType.CoasterDesign]: {
    outputType: 'mockup',
    designDescription: 'Round or square coaster design',
    isolatedDimensions: { width: 4, height: 4, unit: 'in' },
    printMethod: 'sublimation',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Design for 4" diameter standard coaster'
  },
  [AssetType.NapkinDesign]: {
    outputType: 'mockup',
    designDescription: 'Cocktail napkin logo/design',
    isolatedDimensions: { width: 5, height: 5, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 2,
    requiresTransparency: true,
    artworkPosition: 'center',
    extractionType: 'logo_only',
    notes: 'Keep simple - usually 1-2 color print on napkin'
  },
  
  // ============================================
  // ENVIRONMENTAL & BOOTH STRUCTURES - Need multi-panel extraction
  // ============================================
  [AssetType.Kiosk]: {
    outputType: 'environmental',
    designDescription: 'Interactive kiosk wrap graphics - header, side panels, and screen surround',
    isolatedDimensions: { width: 6, height: 8, unit: 'ft' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'panel',
    extractionType: 'multi_panel',
    notes: 'Extract: Header panel (48"x12"), Side panels (24"x72" each), Screen surround graphics'
  },
  [AssetType.RegistrationCounter]: {
    outputType: 'environmental',
    designDescription: 'Registration desk front panel and side graphics',
    isolatedDimensions: { width: 8, height: 4, unit: 'ft' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'panel',
    extractionType: 'multi_panel',
    notes: 'Extract: Front panel (8\'x3.5\'), Top graphic if branded, Side returns'
  },
  [AssetType.WelcomeCounter]: {
    outputType: 'environmental',
    designDescription: 'Welcome/info desk branded graphics',
    isolatedDimensions: { width: 6, height: 4, unit: 'ft' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'panel',
    extractionType: 'multi_panel',
    notes: 'Extract: Front face graphic, Header/topper if present'
  },
  [AssetType.TechnologyCounter]: {
    outputType: 'environmental',
    designDescription: 'Tech support/charging station graphics',
    isolatedDimensions: { width: 6, height: 4, unit: 'ft' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'panel',
    extractionType: 'multi_panel',
    notes: 'Extract: Counter front, Cable management panel graphics'
  },
  [AssetType.RegistrationBackWall]: {
    outputType: 'environmental',
    designDescription: 'Large backdrop behind registration area',
    isolatedDimensions: { width: 20, height: 10, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Usually printed on fabric with SEG frame or pop-up system. Full bleed required.'
  },
  [AssetType.BackWall]: {
    outputType: 'environmental',
    designDescription: 'Booth or stage back wall graphic',
    isolatedDimensions: { width: 10, height: 8, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'SEG fabric or rigid panel. Provide at 100% scale, 150 DPI minimum.'
  },
  [AssetType.MainStageBackdrop]: {
    outputType: 'environmental',
    designDescription: 'Main stage LED or printed backdrop',
    isolatedDimensions: { width: 40, height: 20, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'For LED: provide digital file at screen resolution. For print: fabric at 100 DPI.'
  },
  [AssetType.Stairs]: {
    outputType: 'environmental',
    designDescription: 'Stair riser graphics for branded stairs',
    isolatedDimensions: { width: 4, height: 8, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: false,
    artworkPosition: 'panel',
    extractionType: 'pattern_tile',
    notes: 'Per-riser design, typically 8" tall x width of stairs. Anti-slip laminate required.'
  },
  [AssetType.GlassDoor]: {
    outputType: 'environmental',
    designDescription: 'Vinyl graphics for glass door branding',
    isolatedDimensions: { width: 36, height: 84, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: true,
    artworkPosition: 'full_surface',
    extractionType: 'graphics_only',
    notes: 'Frosted vinyl or clear with print. Include safety strip zone.'
  },
  [AssetType.GlassRotatingDoor]: {
    outputType: 'environmental',
    designDescription: 'Revolving door panel graphics',
    isolatedDimensions: { width: 30, height: 80, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: true,
    artworkPosition: 'panel',
    extractionType: 'multi_panel',
    notes: 'Per-panel design for 3-4 wing revolving door. Include push bar clearance.'
  },
  [AssetType.GlassDoubleDoor]: {
    outputType: 'environmental',
    designDescription: 'Double door vinyl graphics',
    isolatedDimensions: { width: 72, height: 84, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: true,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Design spans both doors. Include center gap for door meeting point.'
  },
  
  // ============================================
  // LARGE FORMAT SIGNAGE - Direct print but high-res extraction
  // ============================================
  [AssetType.Banner]: {
    outputType: 'large_format',
    designDescription: 'Retractable or hanging banner',
    isolatedDimensions: { width: 33, height: 81, unit: 'in' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Standard retractable: 33"x81". Add 1" bleed all sides. 150 DPI.'
  },
  [AssetType.StandUpPillarBanner]: {
    outputType: 'large_format',
    designDescription: 'Freestanding pillar/column wrap',
    isolatedDimensions: { width: 3, height: 7, unit: 'ft' },
    printMethod: 'large_format',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    extractionType: 'full_design',
    notes: 'Full wrap design for square or round pillar. Provide flat artwork.'
  },
  [AssetType.FeatherFlag]: {
    outputType: 'large_format',
    designDescription: 'Teardrop/feather flag for outdoor use',
    isolatedDimensions: { width: 2, height: 8, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Double-sided print on flag material. Use template for curved edges.'
  },
  [AssetType.TeardropFlag]: {
    outputType: 'large_format',
    designDescription: 'Teardrop-shaped promotional flag',
    isolatedDimensions: { width: 2.5, height: 7, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Teardrop template required. Double-sided dye-sub print.'
  },
  [AssetType.HangingSignage]: {
    outputType: 'large_format',
    designDescription: 'Overhead hanging sign or banner',
    isolatedDimensions: { width: 4, height: 3, unit: 'ft' },
    printMethod: 'fabric',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Double-sided if visible from both directions. Include grommet positions.'
  },
  [AssetType.OutdoorSignage]: {
    outputType: 'large_format',
    designDescription: 'Weather-resistant outdoor signage',
    isolatedDimensions: { width: 4, height: 6, unit: 'ft' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Coroplast, Dibond, or PVC. UV-resistant inks. Include mounting holes.'
  },
  [AssetType.EventSignage]: {
    outputType: 'large_format',
    designDescription: 'General event directional/branding signage',
    isolatedDimensions: { width: 24, height: 36, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Foam board or coroplast. Standard poster sizes with easel back option.'
  },
  [AssetType.EaselSignage]: {
    outputType: 'large_format',
    designDescription: 'Easel-mounted welcome or directional sign',
    isolatedDimensions: { width: 22, height: 28, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Foam board or acrylic. Portrait orientation standard.'
  },
  
  // ============================================
  // LOCATION & WAYFINDING SIGNAGE
  // ============================================
  [AssetType.LocationSignage]: {
    outputType: 'direct',
    designDescription: 'Wayfinding and directional signage',
    isolatedDimensions: { width: 18, height: 24, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'ADA compliant sizing recommended. Include arrow/direction indicators.'
  },
  [AssetType.RoomSignage]: {
    outputType: 'direct',
    designDescription: 'Room identification and session signage',
    isolatedDimensions: { width: 11, height: 17, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Tabloid size. Include session title, time, speaker placeholder.'
  },
  [AssetType.DoorSignage]: {
    outputType: 'direct',
    designDescription: 'Door-mounted room or area signage',
    isolatedDimensions: { width: 8, height: 10, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'With adhesive or suction mount. Include room name/number.'
  },
  [AssetType.WifiSign]: {
    outputType: 'direct',
    designDescription: 'WiFi network and password signage',
    isolatedDimensions: { width: 8.5, height: 11, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    artworkPosition: 'full_surface',
    extractionType: 'full_design',
    notes: 'Letter size. Include QR code for easy connection if possible.'
  },
  
  // ============================================
  // STATIONERY & DIRECT PRINT ITEMS
  // ============================================
  [AssetType.StickerSheet]: {
    outputType: 'direct',
    designDescription: 'Die-cut sticker sheet with multiple designs',
    isolatedDimensions: { width: 8.5, height: 11, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: true,
    extractionType: 'full_design',
    notes: 'Each sticker should have clear cut lines. Include kiss-cut paths.'
  },
  [AssetType.NameTag]: {
    outputType: 'direct',
    designDescription: 'Name badge design ready for print',
    isolatedDimensions: { width: 4, height: 3, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Include bleed area for professional cutting. Standard badge insert size.'
  },
  [AssetType.NameTagBack]: {
    outputType: 'direct',
    designDescription: 'Name badge back with schedule or info',
    isolatedDimensions: { width: 4, height: 3, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Match front dimensions. Include agenda, floor plan, or sponsor logos.'
  },
  [AssetType.InvitationCard]: {
    outputType: 'direct',
    designDescription: 'Event invitation card',
    isolatedDimensions: { width: 5, height: 7, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'A7 standard. Include envelope size specs. Premium paper recommended.'
  },
  [AssetType.PlaceCard]: {
    outputType: 'direct',
    designDescription: 'Table place card with guest name',
    isolatedDimensions: { width: 3.5, height: 2, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Folded tent style. Include fold line in artwork.'
  },
  [AssetType.TableNumber]: {
    outputType: 'direct',
    designDescription: 'Table number display card',
    isolatedDimensions: { width: 4, height: 6, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Tent fold or stake mount. Large visible numbers.'
  },
  [AssetType.TableTent]: {
    outputType: 'direct',
    designDescription: 'Table tent promotional card',
    isolatedDimensions: { width: 4, height: 6, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Tri-fold tent. Include all three visible panels in artwork.'
  },
  [AssetType.Menu]: {
    outputType: 'direct',
    designDescription: 'Event menu card',
    isolatedDimensions: { width: 5, height: 7, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Single or bi-fold. Include dietary icons if needed.'
  },
  [AssetType.ThankYouNote]: {
    outputType: 'direct',
    designDescription: 'Post-event thank you card',
    isolatedDimensions: { width: 5, height: 3.5, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'A1 size. Bi-fold with envelope.'
  },
  [AssetType.VIPBadge]: {
    outputType: 'direct',
    designDescription: 'VIP/Speaker badge with premium design',
    isolatedDimensions: { width: 4, height: 6, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Larger than standard badge. Include lanyard slot position.'
  },
  [AssetType.ParkingPass]: {
    outputType: 'direct',
    designDescription: 'Vehicle parking permit',
    isolatedDimensions: { width: 4, height: 6, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Rearview mirror hang tag. Include date and lot info.'
  },
  [AssetType.TicketDesign]: {
    outputType: 'direct',
    designDescription: 'Event admission ticket',
    isolatedDimensions: { width: 5.5, height: 2, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Include tear-off stub with perforation line. Add serial number area.'
  },
  [AssetType.CateringLabel]: {
    outputType: 'direct',
    designDescription: 'Food item identification label',
    isolatedDimensions: { width: 3, height: 2, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Include dietary icons placeholder. Tent or flat style.'
  },
  [AssetType.DietaryCard]: {
    outputType: 'direct',
    designDescription: 'Dietary restriction indicator card',
    isolatedDimensions: { width: 2.5, height: 3.5, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Clear icons for GF, V, VN, DF, etc. Color-coded recommended.'
  },
  [AssetType.PhotoBoothFrame]: {
    outputType: 'direct',
    designDescription: 'Photo booth frame overlay',
    isolatedDimensions: { width: 4, height: 6, unit: 'in' },
    printMethod: 'digital',
    requiresTransparency: true,
    extractionType: 'full_design',
    notes: '4x6 photo size. Transparent center for photo. Event branding on border.'
  },
  [AssetType.PhotoBoothProps]: {
    outputType: 'direct',
    designDescription: 'Photo booth prop cutouts',
    isolatedDimensions: { width: 11, height: 17, unit: 'in' },
    printMethod: 'rigid',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Foam board mounted. Include stick attachment point. Various prop shapes.'
  },
  [AssetType.Folder]: {
    outputType: 'direct',
    designDescription: 'Event folder/portfolio design',
    isolatedDimensions: { width: 18, height: 12, unit: 'in' },
    printMethod: 'offset',
    requiresTransparency: false,
    extractionType: 'full_design',
    notes: 'Flat artwork with fold lines. Include pocket and business card slit positions.'
  },
};

// Check if asset type requires design extraction from mockup
export const requiresDesignExtraction = (assetType: AssetType): boolean => {
  return MOCKUP_ASSETS.includes(assetType) || 
         ENVIRONMENTAL_MOCKUP_ASSETS.includes(assetType) ||
         LARGE_FORMAT_ASSETS.includes(assetType);
};

// Check if asset is directly printable
export const isDirectPrintAsset = (assetType: AssetType): boolean => {
  return DIRECT_PRINT_ASSETS.includes(assetType) || LOCATION_SIGNAGE_ASSETS.includes(assetType);
};

// Check if asset is an environmental/booth mockup
export const isEnvironmentalAsset = (assetType: AssetType): boolean => {
  return ENVIRONMENTAL_MOCKUP_ASSETS.includes(assetType);
};

// Check if asset is large format signage
export const isLargeFormatAsset = (assetType: AssetType): boolean => {
  return LARGE_FORMAT_ASSETS.includes(assetType);
};

// Get print-ready spec for asset type
export const getPrintReadySpec = (assetType: AssetType): PrintReadySpec | null => {
  return PRINT_READY_SPECS[assetType] || null;
};

// Get human-readable print method name
export const getPrintMethodLabel = (method?: string): string => {
  const labels: Record<string, string> = {
    screen_print: 'Screen Printing',
    dtg: 'Direct-to-Garment (DTG)',
    embroidery: 'Embroidery',
    vinyl: 'Vinyl/Sticker',
    sublimation: 'Sublimation',
    offset: 'Offset Printing',
    digital: 'Digital Printing',
    large_format: 'Large Format Print',
    fabric: 'Fabric/Dye-Sub Print',
    rigid: 'Rigid Substrate Print',
    vehicle_wrap: 'Vehicle Wrap',
  };
  return method ? labels[method] || method : 'Standard Print';
};

// Get extraction type label
export const getExtractionTypeLabel = (extractionType?: string): string => {
  const labels: Record<string, string> = {
    logo_only: 'Logo/Icon Only',
    graphics_only: 'Graphics Without Product',
    full_design: 'Complete Design File',
    pattern_tile: 'Seamless Pattern Tile',
    multi_panel: 'Multi-Panel Artwork',
  };
  return extractionType ? labels[extractionType] || extractionType : 'Standard Extraction';
};

// Prompt additions for generating isolated designs
export const getIsolatedDesignPrompt = (assetType: AssetType): string => {
  const spec = PRINT_READY_SPECS[assetType];
  if (!spec) return '';
  
  const parts: string[] = [];
  
  // Base instruction based on output type
  if (spec.outputType === 'mockup') {
    parts.push(
      'Generate ONLY the isolated design graphic on a transparent or solid background.',
      'Do NOT show the product (no t-shirt, no hat, no bag visible).',
      'Just the artwork/logo/graphic that will be printed.'
    );
  } else if (spec.outputType === 'environmental') {
    parts.push(
      'Generate ONLY the flat print-ready graphics/panels on a solid background.',
      'Do NOT show the 3D structure, booth, or counter.',
      'Extract the branded panels, signage, and graphics as flat artwork files.',
      'Show each panel/surface as a separate, clearly labeled section if multiple panels.'
    );
  } else if (spec.outputType === 'large_format') {
    parts.push(
      'Generate the complete print-ready design at full resolution.',
      'Include full bleed area around all edges.',
      'Ensure text and critical elements are within safe zone.'
    );
  } else if (spec.outputType === 'pattern') {
    parts.push(
      'Generate a seamless, tileable pattern.',
      'Ensure edges match perfectly for continuous repeat.',
      'Show one complete tile of the pattern.'
    );
  }
  
  // Add extraction type specifics
  if (spec.extractionType === 'multi_panel') {
    parts.push('Generate all branded panels/surfaces as separate flat artwork sections.');
  }
  
  if (spec.colorLimit) {
    parts.push(`Limit to ${spec.colorLimit} colors for ${spec.printMethod}.`);
  }
  
  if (spec.printMethod === 'embroidery') {
    parts.push('Use clean lines, no gradients, suitable for embroidery stitching.');
  }
  
  if (spec.printMethod === 'fabric') {
    parts.push('Design for fabric printing with vibrant colors. No fine details that may blur.');
  }
  
  if (spec.printMethod === 'rigid') {
    parts.push('Design for rigid substrate (foam board, Dibond). Include mounting margins.');
  }
  
  if (spec.requiresTransparency) {
    parts.push('Use transparent background for flexibility.');
  }
  
  if (spec.isolatedDimensions) {
    const unit = spec.isolatedDimensions.unit === 'ft' ? 'feet' : 
                 spec.isolatedDimensions.unit === 'in' ? 'inches' : 'pixels';
    parts.push(`Design dimensions: ${spec.isolatedDimensions.width} × ${spec.isolatedDimensions.height} ${unit}.`);
  }
  
  if (spec.notes) {
    parts.push(spec.notes);
  }
  
  return parts.join(' ');
};

// Get all assets that support print extraction
export const getAllPrintableAssets = (): AssetType[] => {
  return [
    ...MOCKUP_ASSETS,
    ...ENVIRONMENTAL_MOCKUP_ASSETS,
    ...LARGE_FORMAT_ASSETS,
    ...LOCATION_SIGNAGE_ASSETS,
    ...DIRECT_PRINT_ASSETS,
  ];
};

// Check if any print workflow is available for asset
export const hasPrintWorkflow = (assetType: AssetType): boolean => {
  return getAllPrintableAssets().includes(assetType);
};
