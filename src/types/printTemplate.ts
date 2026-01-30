// Print Template Types
// Types for imported PDF templates and extracted specifications

export interface PrintTemplateSpecs {
  // Dimensions
  width: number;
  height: number;
  unit: 'in' | 'mm' | 'px';
  
  // Margins & zones
  bleed: number;
  safeZone: number;
  trimLine?: {
    offset: number;
    visible: boolean;
  };
  
  // Resolution
  resolution: number; // DPI
  colorMode: 'CMYK' | 'RGB' | 'Grayscale' | 'Spot';
  colorProfile?: string;
  
  // Special features
  dieLine?: {
    detected: boolean;
    path?: string; // SVG path data
    description?: string;
  };
  foldLines?: {
    positions: number[]; // positions in inches from left
    type: 'valley' | 'mountain' | 'mixed';
  };
  perforationLines?: {
    positions: number[];
    direction: 'horizontal' | 'vertical';
  };
  
  // AI confidence
  confidenceScore?: number;
  extractionNotes?: string[];
}

export interface PrintTemplate {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  filePath: string;
  thumbnailUrl?: string;
  
  // Extracted specs
  specs: PrintTemplateSpecs;
  
  // Quick access fields
  widthInches: number;
  heightInches: number;
  bleedInches: number;
  safeZoneInches: number;
  resolutionDpi: number;
  colorMode: string;
  
  // Feature flags
  hasDieLines: boolean;
  hasFoldLines: boolean;
  hasPerforation: boolean;
  
  // Metadata
  sourceVendor?: string;
  assetType?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExtractionResult {
  success: boolean;
  specs?: PrintTemplateSpecs;
  thumbnailBase64?: string;
  error?: string;
  warnings?: string[];
}

export interface TemplateOverlayState {
  templateUrl: string;
  designUrl: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  showBleed: boolean;
  showSafeZone: boolean;
  showDieLines: boolean;
  showFoldLines: boolean;
}

// Vendor template presets
export interface VendorTemplatePreset {
  vendor: string;
  productName: string;
  specs: PrintTemplateSpecs;
}

// Common vendor presets
export const VENDOR_PRESETS: VendorTemplatePreset[] = [
  {
    vendor: 'Vistaprint',
    productName: 'Business Card',
    specs: {
      width: 3.5,
      height: 2,
      unit: 'in',
      bleed: 0.125,
      safeZone: 0.125,
      resolution: 300,
      colorMode: 'CMYK',
    }
  },
  {
    vendor: 'Moo',
    productName: 'Postcard 4x6',
    specs: {
      width: 6,
      height: 4,
      unit: 'in',
      bleed: 0.125,
      safeZone: 0.25,
      resolution: 300,
      colorMode: 'CMYK',
    }
  },
  {
    vendor: '4over',
    productName: 'Retractable Banner 33x81',
    specs: {
      width: 33,
      height: 81,
      unit: 'in',
      bleed: 1,
      safeZone: 2,
      resolution: 150,
      colorMode: 'CMYK',
    }
  },
  {
    vendor: 'Custom Ink',
    productName: 'T-Shirt Print Area',
    specs: {
      width: 12,
      height: 16,
      unit: 'in',
      bleed: 0,
      safeZone: 0.5,
      resolution: 300,
      colorMode: 'RGB',
    }
  },
  {
    vendor: 'FastSigns',
    productName: 'Foam Board 24x36',
    specs: {
      width: 24,
      height: 36,
      unit: 'in',
      bleed: 0.125,
      safeZone: 0.5,
      resolution: 150,
      colorMode: 'CMYK',
    }
  },
];

// Helper to convert units
export const convertToInches = (value: number, unit: 'in' | 'mm' | 'px', dpi = 300): number => {
  switch (unit) {
    case 'mm':
      return value / 25.4;
    case 'px':
      return value / dpi;
    case 'in':
    default:
      return value;
  }
};

// Helper to get total dimensions with bleed
export const getTotalDimensions = (specs: PrintTemplateSpecs): { width: number; height: number } => {
  const bleedInches = convertToInches(specs.bleed, specs.unit);
  const widthInches = convertToInches(specs.width, specs.unit);
  const heightInches = convertToInches(specs.height, specs.unit);
  
  return {
    width: widthInches + (bleedInches * 2),
    height: heightInches + (bleedInches * 2),
  };
};
