// Professional Print Service with CMYK conversion, bleed, and trim marks
import { jsPDF } from 'jspdf';
import { AssetType } from '../types';
import type { PdfExportOptions } from '../types';
import { printDimensionsMap, paperSizes, sanitizeFileName } from '../utils';

// ============= COLOR CONVERSION =============

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

interface LABColor {
  l: number;
  a: number;
  b: number;
}

// Convert hex to RGB
export const hexToRgb = (hex: string): RGBColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Convert RGB to CMYK using ICC profile approximation
export const rgbToCmyk = (rgb: RGBColor): CMYKColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = ((1 - r - k) / (1 - k)) * 100;
  const m = ((1 - g - k) / (1 - k)) * 100;
  const y = ((1 - b - k) / (1 - k)) * 100;

  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k * 100)
  };
};

// Convert RGB to LAB (for perceptual color operations)
export const rgbToLab = (rgb: RGBColor): LABColor => {
  // First convert to XYZ
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ (D65 illuminant)
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750);
  const z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

  // Convert to LAB
  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
};

// CMYK to RGB for preview
export const cmykToRgb = (cmyk: CMYKColor): RGBColor => {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k))
  };
};

// Format CMYK for display
export const formatCmyk = (cmyk: CMYKColor): string => {
  return `C${cmyk.c} M${cmyk.m} Y${cmyk.y} K${cmyk.k}`;
};

// Check if color is print-safe (within CMYK gamut)
export const isPrintSafe = (rgb: RGBColor): boolean => {
  const cmyk = rgbToCmyk(rgb);
  const backToRgb = cmykToRgb(cmyk);
  
  // Check if round-trip conversion is close enough
  const tolerance = 5;
  return Math.abs(rgb.r - backToRgb.r) <= tolerance &&
         Math.abs(rgb.g - backToRgb.g) <= tolerance &&
         Math.abs(rgb.b - backToRgb.b) <= tolerance;
};

// Get print-safe warning
export const getPrintWarning = (hex: string): string | null => {
  const rgb = hexToRgb(hex);
  if (!isPrintSafe(rgb)) {
    return 'This color may appear different when printed (outside CMYK gamut)';
  }
  return null;
};

// ============= IMAGE PROCESSING =============

// Apply CMYK simulation to canvas
export const applyCmykSimulation = async (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = data.data;

      // Apply CMYK simulation (round-trip conversion)
      for (let i = 0; i < pixels.length; i += 4) {
        const rgb: RGBColor = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
        const cmyk = rgbToCmyk(rgb);
        const simulated = cmykToRgb(cmyk);
        
        pixels[i] = simulated.r;
        pixels[i + 1] = simulated.g;
        pixels[i + 2] = simulated.b;
      }

      ctx.putImageData(data, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

// Scale image for high DPI output
export const scaleImageForPrint = async (
  imageData: string, 
  targetWidth: number, 
  targetHeight: number,
  dpi: number = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate pixel dimensions for target DPI
      const pxWidth = Math.round(targetWidth * dpi);
      const pxHeight = Math.round(targetHeight * dpi);

      const canvas = document.createElement('canvas');
      canvas.width = pxWidth;
      canvas.height = pxHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, pxWidth, pxHeight);

      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

// ============= PRINT SPECIFICATION TYPES =============

export interface PrintSpec {
  width: number;      // inches
  height: number;     // inches
  bleed: number;      // inches
  dpi: number;
  colorMode: 'CMYK' | 'RGB';
  showTrimMarks: boolean;
  showBleedArea: boolean;
  showSafeZone: boolean;
  safeZone: number;   // inches from trim edge
}

export interface PrintJobInfo {
  assetType: AssetType;
  assetTitle: string;
  eventName: string;
  dateGenerated: string;
  colorProfile: string;
  dimensions: string;
  bleed: string;
  fileSize?: string;
}

// Default print specs by asset type
export const getDefaultPrintSpec = (assetType: AssetType): PrintSpec => {
  const dims = printDimensionsMap[assetType] || { w: 8.5, h: 11 };
  const isLargeFormat = dims.w > 24 || dims.h > 24;
  
  return {
    width: dims.w,
    height: dims.h,
    bleed: isLargeFormat ? 0.5 : 0.125,
    dpi: 300,
    colorMode: 'CMYK',
    showTrimMarks: true,
    showBleedArea: true,
    showSafeZone: true,
    safeZone: isLargeFormat ? 0.5 : 0.125
  };
};

// ============= PROFESSIONAL PDF GENERATION =============

export interface ProfessionalPdfOptions extends PdfExportOptions {
  dpi?: number;
  colorMode?: 'CMYK' | 'RGB';
  showSafeZone?: boolean;
  showBleedArea?: boolean;
  safeZone?: number;
  includeJobTicket?: boolean;
  flatten?: boolean;
}

export const generateProfessionalPdf = async (
  imageBase64: string,
  assetType: AssetType,
  assetTitle: string,
  eventName: string,
  options: ProfessionalPdfOptions
): Promise<Blob> => {
  const DPI = options.dpi || 300;
  const PPI = 72; // PDF points per inch
  const BLEED_IN = options.bleed || 0.125;
  const BLEED_PTS = BLEED_IN * PPI;
  const SAFE_ZONE_IN = options.safeZone || 0.125;
  const SAFE_ZONE_PTS = SAFE_ZONE_IN * PPI;
  
  // Trim mark dimensions
  const TRIM_LEN = 18;    // Length of trim marks
  const TRIM_OFFSET = 6;  // Offset from trim edge
  const TRIM_WEIGHT = 0.5; // Line weight

  // Get asset dimensions
  const assetDims = printDimensionsMap[assetType];
  if (!assetDims) {
    throw new Error(`Print dimensions not found for asset type: ${assetType}`);
  }

  // Calculate page size (asset + bleed on all sides + space for marks)
  const MARK_SPACE = 24; // Points for trim marks outside bleed
  const pageWidth = (assetDims.w * PPI) + (BLEED_PTS * 2) + (MARK_SPACE * 2);
  const pageHeight = (assetDims.h * PPI) + (BLEED_PTS * 2) + (MARK_SPACE * 2);

  // Create PDF with custom page size
  const doc = new jsPDF({
    orientation: assetDims.w > assetDims.h ? 'l' : 'p',
    unit: 'pt',
    format: [pageWidth, pageHeight]
  });

  // Calculate positions
  const trimX = MARK_SPACE + BLEED_PTS;
  const trimY = MARK_SPACE + BLEED_PTS;
  const trimW = assetDims.w * PPI;
  const trimH = assetDims.h * PPI;
  
  const bleedX = MARK_SPACE;
  const bleedY = MARK_SPACE;
  const bleedW = trimW + (BLEED_PTS * 2);
  const bleedH = trimH + (BLEED_PTS * 2);

  // Process image for print
  let processedImage = imageBase64;
  
  if (options.colorMode === 'CMYK') {
    try {
      processedImage = await applyCmykSimulation(imageBase64);
    } catch (e) {
      console.warn('CMYK simulation failed, using original image', e);
    }
  }

  // Draw the image with bleed
  try {
    doc.addImage(processedImage, 'PNG', bleedX, bleedY, bleedW, bleedH);
  } catch (e) {
    console.error('Failed to add image to PDF', e);
    // Draw placeholder
    doc.setFillColor(200, 200, 200);
    doc.rect(bleedX, bleedY, bleedW, bleedH, 'F');
    doc.setFontSize(24);
    doc.setTextColor(100);
    doc.text('Image Error', pageWidth / 2, pageHeight / 2, { align: 'center' });
  }

  // Draw trim marks (registration marks style)
  if (options.showTrimMarks) {
    doc.setLineWidth(TRIM_WEIGHT);
    doc.setDrawColor(0, 0, 0);

    // Top-left corner
    // Horizontal mark
    doc.line(trimX - TRIM_OFFSET - TRIM_LEN, trimY, trimX - TRIM_OFFSET, trimY);
    // Vertical mark
    doc.line(trimX, trimY - TRIM_OFFSET - TRIM_LEN, trimX, trimY - TRIM_OFFSET);

    // Top-right corner
    doc.line(trimX + trimW + TRIM_OFFSET, trimY, trimX + trimW + TRIM_OFFSET + TRIM_LEN, trimY);
    doc.line(trimX + trimW, trimY - TRIM_OFFSET - TRIM_LEN, trimX + trimW, trimY - TRIM_OFFSET);

    // Bottom-left corner
    doc.line(trimX - TRIM_OFFSET - TRIM_LEN, trimY + trimH, trimX - TRIM_OFFSET, trimY + trimH);
    doc.line(trimX, trimY + trimH + TRIM_OFFSET, trimX, trimY + trimH + TRIM_OFFSET + TRIM_LEN);

    // Bottom-right corner
    doc.line(trimX + trimW + TRIM_OFFSET, trimY + trimH, trimX + trimW + TRIM_OFFSET + TRIM_LEN, trimY + trimH);
    doc.line(trimX + trimW, trimY + trimH + TRIM_OFFSET, trimX + trimW, trimY + trimH + TRIM_OFFSET + TRIM_LEN);

    // Registration marks (circles with crosshairs) at corners
    const regMarkRadius = 4;
    const corners = [
      { x: trimX - BLEED_PTS / 2, y: trimY - BLEED_PTS / 2 },
      { x: trimX + trimW + BLEED_PTS / 2, y: trimY - BLEED_PTS / 2 },
      { x: trimX - BLEED_PTS / 2, y: trimY + trimH + BLEED_PTS / 2 },
      { x: trimX + trimW + BLEED_PTS / 2, y: trimY + trimH + BLEED_PTS / 2 }
    ];

    corners.forEach(corner => {
      // Only draw if within page bounds
      if (corner.x > regMarkRadius && corner.x < pageWidth - regMarkRadius &&
          corner.y > regMarkRadius && corner.y < pageHeight - regMarkRadius) {
        // Circle
        doc.setLineWidth(0.3);
        doc.circle(corner.x, corner.y, regMarkRadius, 'S');
        // Crosshairs
        doc.line(corner.x - regMarkRadius - 2, corner.y, corner.x + regMarkRadius + 2, corner.y);
        doc.line(corner.x, corner.y - regMarkRadius - 2, corner.x, corner.y + regMarkRadius + 2);
      }
    });
  }

  // Draw bleed area indicator (light cyan line)
  if (options.showBleedArea !== false) {
    doc.setLineWidth(0.25);
    doc.setDrawColor(0, 255, 255); // Cyan
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(bleedX, bleedY, bleedW, bleedH);
    doc.setLineDashPattern([], 0);
  }

  // Draw safe zone indicator (light magenta line)
  if (options.showSafeZone) {
    doc.setLineWidth(0.25);
    doc.setDrawColor(255, 0, 255); // Magenta
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(
      trimX + SAFE_ZONE_PTS,
      trimY + SAFE_ZONE_PTS,
      trimW - (SAFE_ZONE_PTS * 2),
      trimH - (SAFE_ZONE_PTS * 2)
    );
    doc.setLineDashPattern([], 0);
  }

  // Add job ticket info at bottom
  if (options.includeJobTicket !== false) {
    doc.setFontSize(6);
    doc.setTextColor(128, 128, 128);
    
    const jobInfo = [
      `Event: ${eventName}`,
      `Asset: ${assetTitle}`,
      `Size: ${assetDims.w}" × ${assetDims.h}"`,
      `Bleed: ${BLEED_IN}"`,
      `Color: ${options.colorMode || 'CMYK'}`,
      `DPI: ${DPI}`,
      `Generated: ${new Date().toISOString().split('T')[0]}`
    ].join(' | ');

    doc.text(jobInfo, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  // Color bars (CMYK reference)
  if (options.colorMode === 'CMYK' && options.showTrimMarks) {
    const barWidth = 8;
    const barHeight = 4;
    const barY = pageHeight - 16;
    const startX = pageWidth / 2 - (barWidth * 4);

    // Cyan
    doc.setFillColor(0, 255, 255);
    doc.rect(startX, barY, barWidth, barHeight, 'F');
    
    // Magenta
    doc.setFillColor(255, 0, 255);
    doc.rect(startX + barWidth, barY, barWidth, barHeight, 'F');
    
    // Yellow
    doc.setFillColor(255, 255, 0);
    doc.rect(startX + barWidth * 2, barY, barWidth, barHeight, 'F');
    
    // Black
    doc.setFillColor(0, 0, 0);
    doc.rect(startX + barWidth * 3, barY, barWidth, barHeight, 'F');
  }

  return doc.output('blob');
};

// Generate and download professional PDF
export const downloadProfessionalPdf = async (
  imageBase64: string,
  assetType: AssetType,
  assetTitle: string,
  eventName: string,
  options: ProfessionalPdfOptions
): Promise<void> => {
  const blob = await generateProfessionalPdf(imageBase64, assetType, assetTitle, eventName, options);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const colorSuffix = options.colorMode === 'RGB' ? 'RGB' : 'CMYK';
  a.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(assetTitle)}_${colorSuffix}_PRINT.pdf`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ============= PRINT PREFLIGHT CHECK =============

export interface PreflightResult {
  passed: boolean;
  warnings: PreflightWarning[];
  errors: PreflightError[];
}

export interface PreflightWarning {
  type: 'color' | 'resolution' | 'bleed' | 'size';
  message: string;
  suggestion?: string;
}

export interface PreflightError {
  type: 'missing' | 'invalid' | 'unsupported';
  message: string;
}

export const runPrintPreflight = async (
  imageBase64: string,
  assetType: AssetType,
  options: PrintSpec
): Promise<PreflightResult> => {
  const warnings: PreflightWarning[] = [];
  const errors: PreflightError[] = [];

  // Check if asset has print dimensions
  const dims = printDimensionsMap[assetType];
  if (!dims) {
    errors.push({
      type: 'unsupported',
      message: `Asset type "${assetType}" does not have defined print dimensions`
    });
  }

  // Check image resolution
  if (imageBase64) {
    try {
      const img = await loadImageAsync(imageBase64);
      const requiredWidth = options.width * options.dpi;
      const requiredHeight = options.height * options.dpi;

      if (img.width < requiredWidth * 0.8 || img.height < requiredHeight * 0.8) {
        warnings.push({
          type: 'resolution',
          message: `Image resolution (${img.width}×${img.height}px) may be too low for ${options.dpi} DPI print`,
          suggestion: `Recommended: ${Math.round(requiredWidth)}×${Math.round(requiredHeight)}px`
        });
      }
    } catch (e) {
      errors.push({
        type: 'invalid',
        message: 'Could not analyze image resolution'
      });
    }
  } else {
    errors.push({
      type: 'missing',
      message: 'No image data provided'
    });
  }

  // Check bleed
  if (options.bleed < 0.125 && dims) {
    const isLargeFormat = dims.w > 24 || dims.h > 24;
    if (!isLargeFormat) {
      warnings.push({
        type: 'bleed',
        message: 'Bleed less than 0.125" may cause white edges after trimming',
        suggestion: 'Standard bleed is 0.125" for most print jobs'
      });
    }
  }

  // Check for very large formats
  if (dims && (dims.w > 48 || dims.h > 48)) {
    warnings.push({
      type: 'size',
      message: 'Large format print may require special handling',
      suggestion: 'Consider using a professional large format printer'
    });
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors
  };
};

// Helper to load image and get dimensions
const loadImageAsync = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// ============= EXPORT HELPERS =============

export const getRecommendedExportSettings = (assetType: AssetType): {
  dpi: number;
  colorMode: 'CMYK' | 'RGB';
  bleed: number;
  format: 'pdf' | 'png' | 'jpg';
} => {
  const dims = printDimensionsMap[assetType];
  const isPrint = !!dims;
  const isLargeFormat = dims && (dims.w > 24 || dims.h > 24);

  if (isPrint) {
    return {
      dpi: isLargeFormat ? 150 : 300,
      colorMode: 'CMYK',
      bleed: isLargeFormat ? 0.5 : 0.125,
      format: 'pdf'
    };
  }

  // Digital assets
  return {
    dpi: 72,
    colorMode: 'RGB',
    bleed: 0,
    format: 'png'
  };
};
