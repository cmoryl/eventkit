// Template Helper Functions

import { EditableTemplate, TemplateField, TemplateDimensions } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';
import { ALL_EDITABLE_TEMPLATES } from './allTemplates';

// Get templates by asset type
export const getTemplatesForAsset = (assetType: AssetType): EditableTemplate[] => {
  return ALL_EDITABLE_TEMPLATES.filter(t => t.assetType === assetType);
};

// Get universal templates (work with any vendor)
export const getUniversalTemplates = (assetType?: AssetType): EditableTemplate[] => {
  const templates = ALL_EDITABLE_TEMPLATES.filter(t => t.category === 'universal');
  return assetType ? templates.filter(t => t.assetType === assetType) : templates;
};

// Get vendor-specific templates
export const getVendorTemplates = (vendorId: string, assetType?: AssetType): EditableTemplate[] => {
  const templates = ALL_EDITABLE_TEMPLATES.filter(t => 
    t.category === 'vendor-specific' && t.vendorId === vendorId
  );
  return assetType ? templates.filter(t => t.assetType === assetType) : templates;
};

// Get template by ID
export const getTemplateById = (templateId: string): EditableTemplate | undefined => {
  return ALL_EDITABLE_TEMPLATES.find(t => t.id === templateId);
};

// Calculate pixel dimensions from inches at given DPI
export const calculatePixelDimensions = (
  widthInches: number,
  heightInches: number,
  dpi: number = 300
): { widthPx: number; heightPx: number } => {
  return {
    widthPx: Math.round(widthInches * dpi),
    heightPx: Math.round(heightInches * dpi)
  };
};

// Create standard dimensions object
export const createDimensions = (
  widthInches: number,
  heightInches: number,
  bleedInches: number = 0.125,
  safeZoneInches: number = 0.125,
  dpi: number = 300
): TemplateDimensions => {
  const { widthPx, heightPx } = calculatePixelDimensions(widthInches, heightInches, dpi);
  
  let orientation: 'portrait' | 'landscape' | 'square';
  if (widthInches > heightInches) {
    orientation = 'landscape';
  } else if (heightInches > widthInches) {
    orientation = 'portrait';
  } else {
    orientation = 'square';
  }
  
  return {
    widthInches,
    heightInches,
    widthPx,
    heightPx,
    bleedInches,
    safeZoneInches,
    orientation
  };
};

// Create a text field with common defaults
export const createTextField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'text',
  position,
  style: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#1a1a1a',
    ...options.style
  },
  ...options
});

// Create an image placeholder field
export const createImageField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'image',
  position,
  style: {
    objectFit: 'cover',
    borderRadius: 0,
    ...options.style
  },
  acceptedFormats: ['jpg', 'png', 'webp'],
  ...options
});

// Create a logo placeholder field
export const createLogoField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'logo',
  position,
  style: {
    objectFit: 'contain',
    ...options.style
  },
  acceptedFormats: ['png', 'svg', 'eps'],
  ...options
});

// Get all unique asset types that have templates
export const getTemplatedAssetTypes = (): AssetType[] => {
  const types = new Set<AssetType>();
  ALL_EDITABLE_TEMPLATES.forEach(t => types.add(t.assetType));
  return Array.from(types);
};

// Get template count per asset type
export const getTemplateCountByAsset = (): Partial<Record<AssetType, number>> => {
  const counts: Partial<Record<AssetType, number>> = {};
  ALL_EDITABLE_TEMPLATES.forEach(t => {
    counts[t.assetType] = (counts[t.assetType] || 0) + 1;
  });
  return counts;
};
