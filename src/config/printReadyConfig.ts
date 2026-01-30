// Print-Ready Design Configuration
// Defines which assets need design extraction vs direct print export

import { AssetType } from '../types';

export type PrintOutputType = 'direct' | 'mockup' | 'pattern' | 'document';

export interface PrintReadySpec {
  outputType: PrintOutputType;
  designDescription: string;
  isolatedDimensions?: {
    width: number;
    height: number;
    unit: 'in' | 'px';
  };
  printMethod?: 'screen_print' | 'dtg' | 'embroidery' | 'vinyl' | 'sublimation' | 'offset' | 'digital';
  colorLimit?: number; // For screen printing
  requiresTransparency?: boolean;
  artworkPosition?: 'center' | 'left_chest' | 'full_front' | 'full_back' | 'wrap' | 'badge';
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
];

// Assets that are already print-ready (the generated image IS the print file)
export const DIRECT_PRINT_ASSETS: AssetType[] = [
  AssetType.NameTag,
  AssetType.NameTagBack,
  AssetType.Banner,
  AssetType.EventSignage,
  AssetType.HangingSignage,
  AssetType.OutdoorSignage,
  AssetType.DoorSignage,
  AssetType.EaselSignage,
  AssetType.LocationSignage,
  AssetType.RoomSignage,
  AssetType.StandUpPillarBanner,
  AssetType.FeatherFlag,
  AssetType.TeardropFlag,
  AssetType.WifiSign,
  AssetType.ThankYouNote,
  AssetType.Menu,
  AssetType.Folder,
  AssetType.BackWall,
  AssetType.MainStageBackdrop,
  AssetType.StickerSheet,
  AssetType.InvitationCard,
  AssetType.PlaceCard,
  AssetType.TableNumber,
  AssetType.TableTent,
];

// Print specifications by asset type
export const PRINT_READY_SPECS: Partial<Record<AssetType, PrintReadySpec>> = {
  // Apparel - need design extraction
  [AssetType.Tshirt]: {
    outputType: 'mockup',
    designDescription: 'Front chest or full front graphic for t-shirt printing',
    isolatedDimensions: { width: 12, height: 16, unit: 'in' },
    printMethod: 'screen_print',
    colorLimit: 6,
    requiresTransparency: true,
    artworkPosition: 'center',
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
    notes: 'Bold, simple design works best on fabric'
  },
  [AssetType.WaterBottle]: {
    outputType: 'mockup',
    designDescription: 'Wrap-around bottle label design',
    isolatedDimensions: { width: 8, height: 3, unit: 'in' },
    printMethod: 'vinyl',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    notes: 'Design should tile seamlessly or have clear start/end'
  },
  [AssetType.Lanyard]: {
    outputType: 'pattern',
    designDescription: 'Repeating pattern for lanyard printing',
    isolatedDimensions: { width: 1, height: 36, unit: 'in' },
    printMethod: 'sublimation',
    requiresTransparency: false,
    artworkPosition: 'wrap',
    notes: 'Pattern repeats along the length of the lanyard'
  },
  
  // Stickers - special handling
  [AssetType.StickerSheet]: {
    outputType: 'direct',
    designDescription: 'Die-cut sticker sheet with multiple designs',
    printMethod: 'vinyl',
    requiresTransparency: true,
    notes: 'Each sticker should have clear cut lines'
  },
  
  // Signage - direct print
  [AssetType.Banner]: {
    outputType: 'direct',
    designDescription: 'Full banner design ready for large format print',
    printMethod: 'digital',
    requiresTransparency: false,
    notes: 'Ensure 150+ DPI for large format'
  },
  [AssetType.EventSignage]: {
    outputType: 'direct',
    designDescription: 'Event signage for wayfinding and branding',
    printMethod: 'digital',
    requiresTransparency: false,
  },
  [AssetType.NameTag]: {
    outputType: 'direct',
    designDescription: 'Name badge design ready for print',
    printMethod: 'offset',
    requiresTransparency: false,
    notes: 'Include bleed area for professional cutting'
  },
};

// Check if asset type requires design extraction from mockup
export const requiresDesignExtraction = (assetType: AssetType): boolean => {
  return MOCKUP_ASSETS.includes(assetType);
};

// Check if asset is directly printable
export const isDirectPrintAsset = (assetType: AssetType): boolean => {
  return DIRECT_PRINT_ASSETS.includes(assetType);
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
  };
  return method ? labels[method] || method : 'Standard Print';
};

// Prompt additions for generating isolated designs
export const getIsolatedDesignPrompt = (assetType: AssetType): string => {
  const spec = PRINT_READY_SPECS[assetType];
  if (!spec) return '';
  
  const parts: string[] = [
    'Generate ONLY the isolated design graphic on a transparent or solid background.',
    'Do NOT show the product (no t-shirt, no hat, no bag visible).',
    'Just the artwork/logo/graphic that will be printed.',
  ];
  
  if (spec.colorLimit) {
    parts.push(`Limit to ${spec.colorLimit} colors for ${spec.printMethod}.`);
  }
  
  if (spec.printMethod === 'embroidery') {
    parts.push('Use clean lines, no gradients, suitable for embroidery stitching.');
  }
  
  if (spec.requiresTransparency) {
    parts.push('Use transparent background for flexibility.');
  }
  
  if (spec.isolatedDimensions) {
    parts.push(`Design dimensions: ${spec.isolatedDimensions.width}" × ${spec.isolatedDimensions.height}".`);
  }
  
  return parts.join(' ');
};
