// Stub AI service - to be replaced with actual AI Gateway integration
import type { ColorInfo, GeneratedAsset } from '../types';
import { AssetType } from '../types';

// Placeholder functions that simulate AI responses
export const editImageContent = async (
  assetType: AssetType,
  sourceImage: string,
  colorPalette: string[],
  prompt: string,
  customContent?: Record<string, string>,
  overlayImage?: string,
  maskImage?: string
): Promise<string> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return the original image for now (AI integration needed)
  console.log('Edit image called with:', { assetType, prompt, customContent });
  return sourceImage;
};

export const getColorDetails = async (hex: string): Promise<ColorInfo> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Simple conversions
  const rgb = `rgb(${r}, ${g}, ${b})`;
  
  // Approximate CMYK
  const c = 1 - (r / 255);
  const m = 1 - (g / 255);
  const y = 1 - (b / 255);
  const k = Math.min(c, m, y);
  const cmyk = k === 1 
    ? 'C0 M0 Y0 K100' 
    : `C${Math.round((c - k) / (1 - k) * 100)} M${Math.round((m - k) / (1 - k) * 100)} Y${Math.round((y - k) / (1 - k) * 100)} K${Math.round(k * 100)}`;
  
  // HSV
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max / 255;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    if (max === r) h = (g - b) / (max - min);
    else if (max === g) h = 2 + (b - r) / (max - min);
    else h = 4 + (r - g) / (max - min);
    h *= 60;
    if (h < 0) h += 360;
  }
  const hsv = `hsv(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
  
  return {
    hex,
    rgb,
    cmyk,
    hsv,
    pantone: 'Pantone Match TBD',
    name: `Color ${hex.toUpperCase()}`
  };
};

export const refineText = async (text: string, instruction: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple text transformations based on instruction
  if (instruction.includes('shorter')) {
    return text.split('.').slice(0, Math.ceil(text.split('.').length / 2)).join('. ').trim() + '.';
  }
  if (instruction.includes('Expand')) {
    return text + '\n\nAdditional details and context would be added here by AI.';
  }
  if (instruction.includes('professional')) {
    return text.replace(/!/g, '.').replace(/awesome/gi, 'excellent');
  }
  if (instruction.includes('exciting')) {
    return text.replace(/\./g, '!').replace(/good/gi, 'amazing');
  }
  if (instruction.includes('grammar')) {
    return text; // Would run grammar check
  }
  
  return text;
};

export const regeneratePhotorealisticShot = async (
  sourceAsset: GeneratedAsset,
  prompt: string,
  environmentFile?: File | null
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return original for now
  console.log('Regenerate photorealistic shot:', { prompt, hasEnv: !!environmentFile });
  return sourceAsset.content as string;
};
