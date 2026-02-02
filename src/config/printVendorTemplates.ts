// Print Vendor Templates with service-specific requirements
// This file re-exports from the comprehensive vendor production specs
// and provides backward compatibility with the original interface

import { AssetType } from '../types';
import { 
  ALL_VENDOR_SPECS, 
  getVendorSpecsForAsset, 
  getSpecsByVendor,
  VENDOR_LIST,
  type VendorProductSpec,
  type ProductionSpec
} from './vendorProductionSpecs';

export interface VendorTemplate {
  id: string;
  name: string;
  logo?: string;
  website: string;
  description: string;
  category: 'online' | 'local' | 'premium' | 'specialty' | 'trade' | 'signage' | 'apparel';
  specs: VendorSpecs;
  supportedAssets: AssetType[];
  tips: string[];
  uploadUrl?: string;
}

export interface VendorSpecs {
  dpi: number;
  colorMode: 'CMYK' | 'RGB';
  bleed: number;          // inches
  safeZone: number;       // inches from trim
  fileFormats: string[];
  maxFileSize?: string;   // e.g., "100MB"
  colorProfile?: string;  // e.g., "US Web Coated (SWOP) v2"
  requiresTrimMarks: boolean;
  requiresBleedMarks: boolean;
  flattenLayers: boolean;
  embedFonts: boolean;
  notes?: string;
}

// Re-export new types
export { VendorProductSpec, ProductionSpec };
export { getVendorSpecsForAsset, getSpecsByVendor, VENDOR_LIST, ALL_VENDOR_SPECS };

export const PRINT_VENDORS: VendorTemplate[] = [
  // ============= ONLINE PRINT SERVICES =============
  {
    id: 'vistaprint',
    name: 'Vistaprint',
    website: 'vistaprint.com',
    description: 'Popular online printing for business materials',
    category: 'online',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf', 'jpg', 'png'],
      maxFileSize: '25MB',
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Vistaprint adds their own trim marks. Upload files at exact size with bleed.'
    },
    supportedAssets: [
      AssetType.NameTag, AssetType.Banner, AssetType.EventSignage,
      AssetType.Tshirt, AssetType.Hat, AssetType.WaterBottle,
      AssetType.StickerSheet, AssetType.Folder, AssetType.Menu,
      AssetType.ThankYouNote, AssetType.Lanyard
    ],
    tips: [
      'Use their online design tool to verify placement',
      'Order samples before large print runs',
      'CMYK colors may shift slightly from screen preview',
      'Allow 5-7 business days for standard delivery'
    ],
    uploadUrl: 'https://www.vistaprint.com/upload'
  },
  {
    id: 'canva-print',
    name: 'Canva Print',
    website: 'canva.com/print',
    description: 'Easy online printing integrated with Canva designs',
    category: 'online',
    specs: {
      dpi: 300,
      colorMode: 'RGB',  // Canva accepts RGB and converts
      bleed: 0.125,
      safeZone: 0.25,    // Canva recommends larger safe zone
      fileFormats: ['pdf', 'png', 'jpg'],
      maxFileSize: '100MB',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Canva accepts RGB and handles color conversion. Larger safe zone recommended.'
    },
    supportedAssets: [
      AssetType.NameTag, AssetType.Banner, AssetType.EventSignage,
      AssetType.StickerSheet, AssetType.Menu, AssetType.ThankYouNote,
      AssetType.Folder, AssetType.InvitationCard
    ],
    tips: [
      'Import PDF to Canva for final adjustments before printing',
      'Use their preview tool to check bleed areas',
      'Free delivery on orders over $25',
      'Premium paper options available'
    ],
    uploadUrl: 'https://www.canva.com/print/'
  },
  {
    id: 'moo',
    name: 'MOO',
    website: 'moo.com',
    description: 'Premium quality business cards and stationery',
    category: 'premium',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf'],
      maxFileSize: '50MB',
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'MOO specializes in premium finishes. PDF/X-1a format recommended.'
    },
    supportedAssets: [
      AssetType.NameTag, AssetType.StickerSheet, AssetType.ThankYouNote,
      AssetType.Folder
    ],
    tips: [
      'Known for exceptional paper quality and unique finishes',
      'Spot UV and foil options available',
      'Best for business cards and premium stationery',
      'Slightly higher cost but superior quality'
    ],
    uploadUrl: 'https://www.moo.com/us/'
  },
  {
    id: 'uprinting',
    name: 'UPrinting',
    website: 'uprinting.com',
    description: 'Affordable bulk printing for events and marketing',
    category: 'online',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf', 'jpg', 'png', 'eps', 'ai'],
      maxFileSize: '100MB',
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Great for large volume orders. Free file check included.'
    },
    supportedAssets: [
      AssetType.Banner, AssetType.EventSignage, AssetType.FeatherFlag,
      AssetType.TeardropFlag, AssetType.StandUpPillarBanner,
      AssetType.StickerSheet, AssetType.Menu, AssetType.Folder
    ],
    tips: [
      'Best value for large quantity orders',
      'Free online proofing before print',
      'Fast turnaround options available',
      'Wide variety of paper stocks and finishes'
    ],
    uploadUrl: 'https://www.uprinting.com/'
  },
  {
    id: 'printful',
    name: 'Printful',
    website: 'printful.com',
    description: 'Print-on-demand for apparel and merchandise',
    category: 'specialty',
    specs: {
      dpi: 300,
      colorMode: 'RGB',  // Printful uses RGB for DTG printing
      bleed: 0,          // Depends on product
      safeZone: 0.25,
      fileFormats: ['png'],  // PNG preferred for transparency
      maxFileSize: '200MB',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'RGB mode for DTG printing. PNG with transparency preferred.'
    },
    supportedAssets: [
      AssetType.Tshirt, AssetType.TshirtBack, AssetType.TshirtSleeve,
      AssetType.Hat, AssetType.SwagBag, AssetType.WaterBottle
    ],
    tips: [
      'RGB produces more vibrant colors on fabric',
      'PNG with transparent background recommended',
      'Order samples to check print quality on different fabrics',
      'Supports direct-to-garment (DTG) and embroidery'
    ],
    uploadUrl: 'https://www.printful.com/'
  },
  {
    id: 'customink',
    name: 'Custom Ink',
    website: 'customink.com',
    description: 'Group ordering for custom apparel and products',
    category: 'specialty',
    specs: {
      dpi: 300,
      colorMode: 'RGB',
      bleed: 0,
      safeZone: 0.25,
      fileFormats: ['png', 'jpg', 'pdf', 'ai', 'eps'],
      maxFileSize: '50MB',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Excellent for group orders. Their design team can help with artwork.'
    },
    supportedAssets: [
      AssetType.Tshirt, AssetType.TshirtBack, AssetType.Hat,
      AssetType.SwagBag, AssetType.WaterBottle, AssetType.Lanyard
    ],
    tips: [
      'Great for team/group orders with size assortments',
      'Free design assistance available',
      'Bulk discounts on larger orders',
      'Preview mockups on different product colors'
    ],
    uploadUrl: 'https://www.customink.com/'
  },
  {
    id: 'fedex-office',
    name: 'FedEx Office',
    website: 'fedex.com/office',
    description: 'Quick local printing with same-day pickup',
    category: 'local',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf', 'jpg', 'png', 'doc', 'ppt'],
      maxFileSize: '100MB',
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: true,
      requiresBleedMarks: true,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Include trim marks for professional cutting. Same-day available.'
    },
    supportedAssets: [
      AssetType.NameTag, AssetType.Banner, AssetType.EventSignage,
      AssetType.Menu, AssetType.Folder, AssetType.DoorSignage,
      AssetType.RoomSignage, AssetType.WifiSign
    ],
    tips: [
      'Great for last-minute printing needs',
      'Same-day pickup at most locations',
      'Staff can help with file preparation',
      'Wide format printing available'
    ],
    uploadUrl: 'https://www.fedex.com/printing/'
  },
  {
    id: 'staples',
    name: 'Staples Print',
    website: 'staples.com/print',
    description: 'Convenient local printing with competitive prices',
    category: 'local',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf', 'jpg', 'png', 'doc'],
      maxFileSize: '50MB',
      requiresTrimMarks: true,
      requiresBleedMarks: true,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Local pickup available. Request trim marks for precise cutting.'
    },
    supportedAssets: [
      AssetType.NameTag, AssetType.Banner, AssetType.EventSignage,
      AssetType.Menu, AssetType.Folder, AssetType.DoorSignage,
      AssetType.RoomSignage, AssetType.WifiSign, AssetType.ThankYouNote
    ],
    tips: [
      'Competitive pricing for everyday printing',
      'In-store pickup often same-day',
      'Good for rush jobs and proofs',
      'Rewards program for frequent customers'
    ],
    uploadUrl: 'https://www.staples.com/services/printing/'
  },
  {
    id: 'local-print-shop',
    name: 'Local Print Shop',
    website: '',
    description: 'Standard specs for independent print shops',
    category: 'local',
    specs: {
      dpi: 300,
      colorMode: 'CMYK',
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf'],
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: true,
      requiresBleedMarks: true,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Standard professional print specs. Confirm requirements with your printer.'
    },
    supportedAssets: Object.values(AssetType).filter(t => 
      !['PALETTE', 'SLOGANS', 'PRESENTATION', 'MARKETING_COPY', 'RUN_OF_SHOW', 
        'SOUNDTRACK', 'LOCATION_INTEL', 'STYLE_GUIDE', 'VIDEO_TEASER'].includes(t)
    ) as AssetType[],
    tips: [
      'Always confirm specs with your specific printer',
      'Request a proof before final print run',
      'Build relationship for better pricing on repeat orders',
      'Local shops often offer personalized service and rush jobs'
    ]
  },
  // ============= LARGE FORMAT / SIGNAGE =============
  {
    id: 'signs-com',
    name: 'Signs.com',
    website: 'signs.com',
    description: 'Custom signs, banners, and large format printing',
    category: 'specialty',
    specs: {
      dpi: 150,  // Lower DPI for large format
      colorMode: 'CMYK',
      bleed: 0.5,  // Larger bleed for banners
      safeZone: 1.0,  // 1 inch safe zone for large signage
      fileFormats: ['pdf', 'ai', 'eps', 'jpg', 'png'],
      maxFileSize: '500MB',
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: '150 DPI is sufficient for large format viewed from distance.'
    },
    supportedAssets: [
      AssetType.Banner, AssetType.EventSignage, AssetType.HangingSignage,
      AssetType.OutdoorSignage, AssetType.StandUpPillarBanner,
      AssetType.FeatherFlag, AssetType.TeardropFlag, AssetType.BackWall,
      AssetType.MainStageBackdrop
    ],
    tips: [
      '150 DPI is sufficient for signage viewed from 3+ feet away',
      'Use 0.5" bleed for banners and large signs',
      'Consider weather-resistant materials for outdoor use',
      'Rush production available for events'
    ],
    uploadUrl: 'https://www.signs.com/'
  },
  {
    id: 'bannerbuzz',
    name: 'BannerBuzz',
    website: 'bannerbuzz.com',
    description: 'Affordable banners, flags, and event signage',
    category: 'specialty',
    specs: {
      dpi: 150,
      colorMode: 'CMYK',
      bleed: 0.5,
      safeZone: 0.5,
      fileFormats: ['pdf', 'jpg', 'png', 'ai', 'psd'],
      maxFileSize: '250MB',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      flattenLayers: true,
      embedFonts: true,
      notes: 'Competitive pricing on event banners and flags.'
    },
    supportedAssets: [
      AssetType.Banner, AssetType.EventSignage, AssetType.StandUpPillarBanner,
      AssetType.FeatherFlag, AssetType.TeardropFlag, AssetType.BackWall,
      AssetType.HangingSignage, AssetType.OutdoorSignage
    ],
    tips: [
      'Very competitive pricing for event banners',
      'Multiple material options (vinyl, fabric, mesh)',
      'Hardware (stands, poles) available',
      'International shipping available'
    ],
    uploadUrl: 'https://www.bannerbuzz.com/'
  }
];

// Get vendors that support a specific asset type
export const getVendorsForAsset = (assetType: AssetType): VendorTemplate[] => {
  return PRINT_VENDORS.filter(vendor => 
    vendor.supportedAssets.includes(assetType)
  );
};

// Get vendor by ID
export const getVendorById = (id: string): VendorTemplate | undefined => {
  return PRINT_VENDORS.find(vendor => vendor.id === id);
};

// Get vendors by category
export const getVendorsByCategory = (category: VendorTemplate['category']): VendorTemplate[] => {
  return PRINT_VENDORS.filter(vendor => vendor.category === category);
};

// Check if asset dimensions are compatible with vendor
export const isAssetCompatibleWithVendor = (
  assetType: AssetType, 
  vendorId: string
): boolean => {
  const vendor = getVendorById(vendorId);
  if (!vendor) return false;
  return vendor.supportedAssets.includes(assetType);
};
