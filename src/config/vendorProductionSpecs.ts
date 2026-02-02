// Vendor Production Specifications - Researched from actual print vendor requirements
// Sources: 4over.com, Vistaprint.com, StickerMule.com, Signs.com, BannerBuzz.com, PrintingForLess.com

import { AssetType } from '../types';

// ════════════════════════════════════════════════════════════════════════════════
// INDUSTRY-STANDARD PRINT SPECIFICATIONS
// ════════════════════════════════════════════════════════════════════════════════

export interface ProductionSpec {
  // Dimensions
  widthInches: number;
  heightInches: number;
  
  // Bleed & Safety
  bleedInches: number;           // Area beyond trim that gets cut off
  safeZoneInches: number;        // Keep important content inside this margin
  trimLineOffset?: number;       // Offset from edge to trim line
  
  // Resolution
  dpi: number;
  minDpi?: number;               // Minimum acceptable DPI
  
  // Color
  colorMode: 'CMYK' | 'RGB' | 'Pantone';
  colorProfile?: string;         // ICC profile name
  maxColors?: number;            // For screen printing
  
  // File Requirements
  fileFormats: string[];
  preferredFormat: string;
  maxFileSizeMB?: number;
  
  // Print Marks
  requiresTrimMarks: boolean;
  requiresBleedMarks: boolean;
  requiresRegistrationMarks: boolean;
  requiresColorBars: boolean;
  
  // Special Requirements
  flattenLayers: boolean;
  embedFonts: boolean;
  convertToOutlines: boolean;
  
  // Vendor-specific notes
  notes?: string[];
}

export interface VendorProductSpec {
  vendorId: string;
  vendorName: string;
  productName: string;
  assetType: AssetType;
  specs: ProductionSpec;
  templateUrl?: string;
  uploadUrl?: string;
  turnaroundDays?: number;
  rushAvailable?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════════
// 4OVER SPECIFICATIONS (Trade Printer)
// Source: https://4over.com/templates/
// ════════════════════════════════════════════════════════════════════════════════

export const FOUROVER_SPECS: VendorProductSpec[] = [
  // Retractable Banners
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Standard Retractable Banner 33×80',
    assetType: AssetType.StandUpPillarBanner,
    templateUrl: 'https://4over.com/templates/files/list/category/signs-banners/',
    specs: {
      widthInches: 34,           // 33" + 0.5" bleed each side
      heightInches: 81,          // 80" + 0.5" bleed each side
      bleedInches: 0.5,
      safeZoneInches: 1,         // Top: 1", Bottom: 3" from research
      dpi: 300,
      minDpi: 150,
      colorMode: 'CMYK',
      colorProfile: 'US Web Coated (SWOP) v2',
      fileFormats: ['pdf', 'eps', 'jpg', 'tiff'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Artwork size: 34" × 81" to be cut down to 33" × 80"',
        'Top margin: Keep 1" from top edge',
        'Bottom margin: Keep 3" from bottom (hidden in stand)',
        '10mil Polypropylene indoor vinyl substrate',
        '4/0 (4 color front only)',
        'Turnaround: 4-7 business days'
      ]
    },
    turnaroundDays: 4,
    rushAvailable: true
  },
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Standard Retractable Banner 47×80',
    assetType: AssetType.StandUpPillarBanner,
    specs: {
      widthInches: 48,
      heightInches: 81,
      bleedInches: 0.5,
      safeZoneInches: 1,
      dpi: 300,
      minDpi: 150,
      colorMode: 'CMYK',
      colorProfile: 'US Web Coated (SWOP) v2',
      fileFormats: ['pdf', 'eps', 'jpg', 'tiff'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Wide format retractable for high-impact displays',
        'Includes carrying case'
      ]
    },
    turnaroundDays: 4
  },
  // Table Runners
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Table Runner 24×84',
    assetType: AssetType.TableRunner,
    specs: {
      widthInches: 25,
      heightInches: 85,
      bleedInches: 0.5,
      safeZoneInches: 1,
      dpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'eps', 'jpg'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['For 6ft table', 'Dye-sublimation print on fabric']
    },
    turnaroundDays: 5
  },
  // Foam Board
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Foam Board 24×36',
    assetType: AssetType.EaselSignage,
    specs: {
      widthInches: 24.25,
      heightInches: 36.25,
      bleedInches: 0.125,
      safeZoneInches: 0.5,
      dpi: 300,
      colorMode: 'CMYK',
      colorProfile: 'US Web Coated (SWOP) v2',
      fileFormats: ['pdf', 'eps', 'jpg'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['3/16" or 1/2" foam core available', 'Matte or gloss laminate options']
    },
    turnaroundDays: 3
  },
  // Table Throws
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Table Throw 6ft (3-sided)',
    assetType: AssetType.TableclothDesign,
    specs: {
      widthInches: 68,
      heightInches: 132,
      bleedInches: 0.5,
      safeZoneInches: 2,
      dpi: 150,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'eps', 'jpg'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Wrinkle-resistant polyester fabric',
        'Dye-sublimation print',
        'Machine washable'
      ]
    },
    turnaroundDays: 5
  },
  {
    vendorId: '4over',
    vendorName: '4over',
    productName: 'Table Throw 8ft (3-sided)',
    assetType: AssetType.TableclothDesign,
    specs: {
      widthInches: 68,
      heightInches: 156,
      bleedInches: 0.5,
      safeZoneInches: 2,
      dpi: 150,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'eps'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['For standard 8ft banquet table']
    },
    turnaroundDays: 5
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// VISTAPRINT SPECIFICATIONS
// Source: https://www.vistaprint.com/hub/
// ════════════════════════════════════════════════════════════════════════════════

export const VISTAPRINT_SPECS: VendorProductSpec[] = [
  // Business Cards / Name Tags
  {
    vendorId: 'vistaprint',
    vendorName: 'Vistaprint',
    productName: 'Standard Business Card',
    assetType: AssetType.NameTag,
    uploadUrl: 'https://www.vistaprint.com/business-cards',
    specs: {
      widthInches: 3.5,
      heightInches: 2,
      bleedInches: 0.125,
      safeZoneInches: 0.125,
      dpi: 300,
      colorMode: 'CMYK',
      colorProfile: 'US Web Coated (SWOP) v2',
      fileFormats: ['pdf', 'jpg', 'png'],
      preferredFormat: 'pdf',
      maxFileSizeMB: 25,
      requiresTrimMarks: false,  // Vistaprint adds their own
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Trim size: 3.5" × 2"',
        'Bleed size: 3.75" × 2.25"',
        'Safe area: 3.25" × 1.75"',
        'Vistaprint adds trim marks automatically'
      ]
    },
    turnaroundDays: 5,
    rushAvailable: true
  },
  // Postcards
  {
    vendorId: 'vistaprint',
    vendorName: 'Vistaprint',
    productName: 'Postcard 4×6',
    assetType: AssetType.InvitationCard,
    specs: {
      widthInches: 6,
      heightInches: 4,
      bleedInches: 0.125,
      safeZoneInches: 0.25,
      dpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'jpg', 'png'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['Standard 4×6 postcard, glossy or matte finish']
    },
    turnaroundDays: 5
  },
  // Flyers
  {
    vendorId: 'vistaprint',
    vendorName: 'Vistaprint',
    productName: 'Flyer A6 (105×148mm)',
    assetType: AssetType.EventSignage,
    specs: {
      widthInches: 4.13,         // 105mm
      heightInches: 5.83,        // 148mm
      bleedInches: 0.059,        // 1.5mm per side
      safeZoneInches: 0.059,     // 1.5mm safe zone
      dpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'jpg', 'png'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Bleed Area: 151 x 108 mm',
        'Trim Size: 148 x 105 mm',
        'Safe Printing Area: 145 x 102 mm',
        'Recommended pixels: 2528 × 1795 at 300 DPI'
      ]
    },
    turnaroundDays: 5
  },
  // Banners
  {
    vendorId: 'vistaprint',
    vendorName: 'Vistaprint',
    productName: 'Vinyl Banner 2×4ft',
    assetType: AssetType.Banner,
    specs: {
      widthInches: 48.5,
      heightInches: 24.5,
      bleedInches: 0.25,
      safeZoneInches: 0.5,
      dpi: 150,
      minDpi: 100,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'jpg', 'png'],
      preferredFormat: 'pdf',
      maxFileSizeMB: 100,
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        '13oz vinyl material',
        'Grommets included',
        'Indoor/outdoor use'
      ]
    },
    turnaroundDays: 7
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// STICKER MULE SPECIFICATIONS
// Source: https://www.stickermule.com/support/faq/artwork/
// ════════════════════════════════════════════════════════════════════════════════

export const STICKERMULE_SPECS: VendorProductSpec[] = [
  {
    vendorId: 'stickermule',
    vendorName: 'Sticker Mule',
    productName: 'Die Cut Stickers',
    assetType: AssetType.StickerSheet,
    uploadUrl: 'https://www.stickermule.com/products/die-cut-stickers',
    specs: {
      widthInches: 3,            // Variable, this is typical
      heightInches: 3,
      bleedInches: 0.0625,       // 1/16" minimum bleed
      safeZoneInches: 0.0625,    // 1/16" minimum border
      dpi: 300,
      minDpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps', 'svg', 'png', 'jpg', 'psd'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Standard border: 0.1" (1/10")',
        'Minimum border: 0.0625" (1/16")',
        'Bleed requirement: 0.0625" (1/16")',
        'Cut line: Use 0.05-1pt magenta stroke',
        'Minimum font size: 6pt',
        'Minimum line thickness: 1pt',
        'CMYK recommended for color accuracy'
      ]
    },
    turnaroundDays: 4
  },
  {
    vendorId: 'stickermule',
    vendorName: 'Sticker Mule',
    productName: 'Custom Labels',
    assetType: AssetType.CateringLabel,
    specs: {
      widthInches: 2,
      heightInches: 2,
      bleedInches: 0.0625,
      safeZoneInches: 0.0625,
      dpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps', 'png', 'jpg'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['Full bleed printing available', 'Waterproof options']
    },
    turnaroundDays: 4
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// SIGNS.COM SPECIFICATIONS
// Source: https://www.signs.com/
// ════════════════════════════════════════════════════════════════════════════════

export const SIGNSCOM_SPECS: VendorProductSpec[] = [
  {
    vendorId: 'signscom',
    vendorName: 'Signs.com',
    productName: 'Vinyl Banner',
    assetType: AssetType.Banner,
    uploadUrl: 'https://www.signs.com/vinyl-banners/',
    specs: {
      widthInches: 72,           // Example: 6ft wide
      heightInches: 36,
      bleedInches: 0.5,
      safeZoneInches: 1,
      dpi: 150,                  // Standard for large format
      minDpi: 100,
      colorMode: 'CMYK',
      colorProfile: 'US Web Coated (SWOP) v2',
      fileFormats: ['pdf', 'ai', 'eps', 'jpg', 'png'],
      preferredFormat: 'pdf',
      maxFileSizeMB: 500,
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        '150 DPI sufficient for signage viewed from 3+ feet',
        '0.5" bleed for banners and large signs',
        '1" safe zone from edges',
        'Weather-resistant materials available'
      ]
    },
    turnaroundDays: 3,
    rushAvailable: true
  },
  {
    vendorId: 'signscom',
    vendorName: 'Signs.com',
    productName: 'Step and Repeat Backdrop',
    assetType: AssetType.BackWall,
    specs: {
      widthInches: 96,           // 8ft standard
      heightInches: 96,          // 8ft standard
      bleedInches: 1,
      safeZoneInches: 2,
      dpi: 150,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Pattern should tile seamlessly',
        'Logo spacing: 12-18" recommended',
        'Fabric or vinyl options',
        'Hardware included'
      ]
    },
    turnaroundDays: 5
  },
  {
    vendorId: 'signscom',
    vendorName: 'Signs.com',
    productName: 'Yard Sign 18×24',
    assetType: AssetType.OutdoorSignage,
    specs: {
      widthInches: 24.5,
      heightInches: 18.5,
      bleedInches: 0.25,
      safeZoneInches: 0.5,
      dpi: 300,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps', 'jpg'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        '4mm corrugated plastic',
        'Double-sided printing available',
        'H-stake or spider stake options'
      ]
    },
    turnaroundDays: 3
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// BANNERBUZZ SPECIFICATIONS
// Source: https://www.bannerbuzz.com/
// ════════════════════════════════════════════════════════════════════════════════

export const BANNERBUZZ_SPECS: VendorProductSpec[] = [
  {
    vendorId: 'bannerbuzz',
    vendorName: 'BannerBuzz',
    productName: 'Retractable Banner 33×81',
    assetType: AssetType.StandUpPillarBanner,
    uploadUrl: 'https://www.bannerbuzz.com/retractable-banner-stands',
    specs: {
      widthInches: 34,
      heightInches: 82,
      bleedInches: 0.5,
      safeZoneInches: 1,
      dpi: 150,
      minDpi: 100,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'jpg', 'png', 'ai', 'psd'],
      preferredFormat: 'pdf',
      maxFileSizeMB: 250,
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Visible area after retraction: 33" × 78"',
        'Bottom 3" hidden in stand base',
        'Indoor use recommended',
        'Includes carrying case'
      ]
    },
    turnaroundDays: 2,
    rushAvailable: true
  },
  {
    vendorId: 'bannerbuzz',
    vendorName: 'BannerBuzz',
    productName: 'Teardrop Flag Medium',
    assetType: AssetType.TeardropFlag,
    specs: {
      widthInches: 27.5,
      heightInches: 66.5,
      bleedInches: 0.5,
      safeZoneInches: 1,
      dpi: 150,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Dye-sublimation on polyester',
        'Single or double-sided',
        'Ground stake or cross base options'
      ]
    },
    turnaroundDays: 3
  },
  {
    vendorId: 'bannerbuzz',
    vendorName: 'BannerBuzz',
    productName: 'Feather Flag Large',
    assetType: AssetType.FeatherFlag,
    specs: {
      widthInches: 26,
      heightInches: 112,
      bleedInches: 0.5,
      safeZoneInches: 1.5,
      dpi: 150,
      colorMode: 'CMYK',
      fileFormats: ['pdf', 'ai', 'eps', 'psd'],
      preferredFormat: 'pdf',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Total height with pole: ~14ft',
        'Wind-resistant design',
        'Visible from both sides'
      ]
    },
    turnaroundDays: 3
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOM INK / PRINTFUL SPECIFICATIONS (Apparel)
// Source: https://www.customink.com/, https://www.printful.com/
// ════════════════════════════════════════════════════════════════════════════════

export const APPAREL_SPECS: VendorProductSpec[] = [
  // T-Shirts - DTG (Direct to Garment)
  {
    vendorId: 'printful',
    vendorName: 'Printful',
    productName: 'T-Shirt Front Print (DTG)',
    assetType: AssetType.Tshirt,
    uploadUrl: 'https://www.printful.com/',
    specs: {
      widthInches: 12,
      heightInches: 16,
      bleedInches: 0,
      safeZoneInches: 0.25,
      dpi: 300,
      minDpi: 150,
      colorMode: 'RGB',          // DTG uses RGB for vibrant colors
      fileFormats: ['png'],      // PNG with transparency required
      preferredFormat: 'png',
      maxFileSizeMB: 200,
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'RGB produces more vibrant colors on fabric',
        'PNG with transparent background required',
        'Max print area: 12" × 16" for adult sizes',
        'File size: at least 3600 × 4800 pixels',
        'DTG works best on 100% cotton'
      ]
    },
    turnaroundDays: 3
  },
  {
    vendorId: 'printful',
    vendorName: 'Printful',
    productName: 'T-Shirt Back Print (DTG)',
    assetType: AssetType.TshirtBack,
    specs: {
      widthInches: 12,
      heightInches: 16,
      bleedInches: 0,
      safeZoneInches: 0.25,
      dpi: 300,
      colorMode: 'RGB',
      fileFormats: ['png'],
      preferredFormat: 'png',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['Same specs as front print']
    },
    turnaroundDays: 3
  },
  {
    vendorId: 'printful',
    vendorName: 'Printful',
    productName: 'T-Shirt Sleeve Print',
    assetType: AssetType.TshirtSleeve,
    specs: {
      widthInches: 4,
      heightInches: 4,
      bleedInches: 0,
      safeZoneInches: 0.125,
      dpi: 300,
      colorMode: 'RGB',
      fileFormats: ['png'],
      preferredFormat: 'png',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: ['Max print area: 4" × 4"', 'Position: Upper arm area']
    },
    turnaroundDays: 3
  },
  // Screen Printing
  {
    vendorId: 'customink',
    vendorName: 'Custom Ink',
    productName: 'T-Shirt Screen Print',
    assetType: AssetType.Tshirt,
    uploadUrl: 'https://www.customink.com/',
    specs: {
      widthInches: 12,
      heightInches: 14,
      bleedInches: 0,
      safeZoneInches: 0.5,
      dpi: 300,
      colorMode: 'CMYK',
      maxColors: 8,              // Screen printing color limit
      fileFormats: ['ai', 'eps', 'pdf', 'png'],
      preferredFormat: 'ai',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Vector artwork preferred for screen printing',
        'Maximum 8 colors for standard screen print',
        'Spot colors (Pantone) available',
        'Best for bulk orders (25+)',
        'Price decreases with quantity'
      ]
    },
    turnaroundDays: 7
  },
  // Embroidery
  {
    vendorId: 'customink',
    vendorName: 'Custom Ink',
    productName: 'Hat Embroidery',
    assetType: AssetType.Hat,
    specs: {
      widthInches: 4,
      heightInches: 2.5,
      bleedInches: 0,
      safeZoneInches: 0.125,
      dpi: 300,
      colorMode: 'CMYK',
      maxColors: 15,
      fileFormats: ['ai', 'eps', 'pdf', 'png'],
      preferredFormat: 'ai',
      requiresTrimMarks: false,
      requiresBleedMarks: false,
      requiresRegistrationMarks: false,
      requiresColorBars: false,
      flattenLayers: true,
      embedFonts: true,
      convertToOutlines: true,
      notes: [
        'Max stitch count: 15,000 for standard embroidery',
        'Vector artwork required',
        'Thread colors matched to Pantone',
        'Minimum text height: 0.25"',
        'Simple, bold designs work best'
      ]
    },
    turnaroundDays: 7
  }
];

// ════════════════════════════════════════════════════════════════════════════════
// INDUSTRY STANDARD DEFAULTS
// For professional print shops and local printers
// ════════════════════════════════════════════════════════════════════════════════

export const INDUSTRY_DEFAULTS: Record<string, ProductionSpec> = {
  // Standard small format (business cards, badges, postcards)
  smallFormat: {
    widthInches: 3.5,
    heightInches: 2,
    bleedInches: 0.125,
    safeZoneInches: 0.125,
    dpi: 300,
    colorMode: 'CMYK',
    colorProfile: 'US Web Coated (SWOP) v2',
    fileFormats: ['pdf'],
    preferredFormat: 'pdf',
    requiresTrimMarks: true,
    requiresBleedMarks: true,
    requiresRegistrationMarks: true,
    requiresColorBars: true,
    flattenLayers: true,
    embedFonts: true,
    convertToOutlines: true,
    notes: ['Industry standard for professional print shops']
  },
  
  // Large format signage
  largeFormat: {
    widthInches: 24,
    heightInches: 36,
    bleedInches: 0.5,
    safeZoneInches: 1,
    dpi: 150,
    minDpi: 100,
    colorMode: 'CMYK',
    colorProfile: 'US Web Coated (SWOP) v2',
    fileFormats: ['pdf', 'tiff'],
    preferredFormat: 'pdf',
    requiresTrimMarks: false,
    requiresBleedMarks: false,
    requiresRegistrationMarks: false,
    requiresColorBars: false,
    flattenLayers: true,
    embedFonts: true,
    convertToOutlines: true,
    notes: [
      '150 DPI acceptable for viewing distance 3+ feet',
      '100 DPI minimum for very large banners'
    ]
  },
  
  // Fabric/textile printing
  textile: {
    widthInches: 12,
    heightInches: 16,
    bleedInches: 0,
    safeZoneInches: 0.25,
    dpi: 300,
    colorMode: 'RGB',
    fileFormats: ['png'],
    preferredFormat: 'png',
    requiresTrimMarks: false,
    requiresBleedMarks: false,
    requiresRegistrationMarks: false,
    requiresColorBars: false,
    flattenLayers: true,
    embedFonts: true,
    convertToOutlines: true,
    notes: ['RGB for DTG printing', 'PNG with transparency']
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

// Get all vendor specs for a specific asset type
export const getVendorSpecsForAsset = (assetType: AssetType): VendorProductSpec[] => {
  const allSpecs = [
    ...FOUROVER_SPECS,
    ...VISTAPRINT_SPECS,
    ...STICKERMULE_SPECS,
    ...SIGNSCOM_SPECS,
    ...BANNERBUZZ_SPECS,
    ...APPAREL_SPECS
  ];
  
  return allSpecs.filter(spec => spec.assetType === assetType);
};

// Get specs for a specific vendor
export const getSpecsByVendor = (vendorId: string): VendorProductSpec[] => {
  const allSpecs = [
    ...FOUROVER_SPECS,
    ...VISTAPRINT_SPECS,
    ...STICKERMULE_SPECS,
    ...SIGNSCOM_SPECS,
    ...BANNERBUZZ_SPECS,
    ...APPAREL_SPECS
  ];
  
  return allSpecs.filter(spec => spec.vendorId === vendorId);
};

// Calculate pixel dimensions from inches and DPI
export const calculatePixelDimensions = (
  widthInches: number,
  heightInches: number,
  dpi: number
): { width: number; height: number } => {
  return {
    width: Math.round(widthInches * dpi),
    height: Math.round(heightInches * dpi)
  };
};

// Calculate total artwork dimensions including bleed
export const calculateTotalDimensions = (spec: ProductionSpec): {
  width: number;
  height: number;
  widthPx: number;
  heightPx: number;
} => {
  const totalWidth = spec.widthInches + (spec.bleedInches * 2);
  const totalHeight = spec.heightInches + (spec.bleedInches * 2);
  
  return {
    width: totalWidth,
    height: totalHeight,
    widthPx: Math.round(totalWidth * spec.dpi),
    heightPx: Math.round(totalHeight * spec.dpi)
  };
};

// Get the default spec for an asset category
export const getDefaultSpecForCategory = (category: 'print' | 'signage' | 'apparel'): ProductionSpec => {
  switch (category) {
    case 'print':
      return INDUSTRY_DEFAULTS.smallFormat;
    case 'signage':
      return INDUSTRY_DEFAULTS.largeFormat;
    case 'apparel':
      return INDUSTRY_DEFAULTS.textile;
    default:
      return INDUSTRY_DEFAULTS.smallFormat;
  }
};

// Validate if artwork meets vendor requirements
export const validateArtwork = (
  artworkWidthPx: number,
  artworkHeightPx: number,
  spec: ProductionSpec
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const requiredDimensions = calculateTotalDimensions(spec);
  
  // Check resolution
  const actualDpi = Math.min(
    artworkWidthPx / (spec.widthInches + spec.bleedInches * 2),
    artworkHeightPx / (spec.heightInches + spec.bleedInches * 2)
  );
  
  if (actualDpi < (spec.minDpi || spec.dpi)) {
    issues.push(`Resolution too low: ${Math.round(actualDpi)} DPI (minimum: ${spec.minDpi || spec.dpi} DPI)`);
  }
  
  // Check dimensions
  if (artworkWidthPx < requiredDimensions.widthPx * 0.95) {
    issues.push(`Width too small: ${artworkWidthPx}px (required: ${requiredDimensions.widthPx}px)`);
  }
  
  if (artworkHeightPx < requiredDimensions.heightPx * 0.95) {
    issues.push(`Height too small: ${artworkHeightPx}px (required: ${requiredDimensions.heightPx}px)`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

// Export all specs as a combined array
export const ALL_VENDOR_SPECS: VendorProductSpec[] = [
  ...FOUROVER_SPECS,
  ...VISTAPRINT_SPECS,
  ...STICKERMULE_SPECS,
  ...SIGNSCOM_SPECS,
  ...BANNERBUZZ_SPECS,
  ...APPAREL_SPECS
];

// Unique vendor list
export const VENDOR_LIST = [
  { id: '4over', name: '4over', category: 'trade', website: 'https://4over.com' },
  { id: 'vistaprint', name: 'Vistaprint', category: 'online', website: 'https://vistaprint.com' },
  { id: 'stickermule', name: 'Sticker Mule', category: 'specialty', website: 'https://stickermule.com' },
  { id: 'signscom', name: 'Signs.com', category: 'signage', website: 'https://signs.com' },
  { id: 'bannerbuzz', name: 'BannerBuzz', category: 'signage', website: 'https://bannerbuzz.com' },
  { id: 'printful', name: 'Printful', category: 'apparel', website: 'https://printful.com' },
  { id: 'customink', name: 'Custom Ink', category: 'apparel', website: 'https://customink.com' }
] as const;
