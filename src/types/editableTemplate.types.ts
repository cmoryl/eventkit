// Editable Template Types - Field-based template system for asset customization

import { AssetType } from '@/types';

// ============= FIELD TYPES =============

export type TemplateFieldType = 
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'image'          // Image placeholder
  | 'logo'           // Logo placement
  | 'color'          // Color picker
  | 'date'           // Date field
  | 'qrcode'         // QR code placeholder
  | 'shape'          // Decorative shape
  | 'divider'        // Line/divider element
  | 'icon';          // Icon placeholder

export interface TemplateFieldPosition {
  x: number;          // Percentage from left (0-100)
  y: number;          // Percentage from top (0-100)
  width: number;      // Percentage of container width
  height: number;     // Percentage of container height
  rotation?: number;  // Rotation in degrees
  zIndex?: number;    // Layer order
}

export interface TemplateFieldStyle {
  // Typography
  fontFamily?: string;
  fontSize?: number;           // In points for print
  fontWeight?: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Colors
  color?: string;              // Text/stroke color
  backgroundColor?: string;
  borderColor?: string;
  
  // Borders & Shapes
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Effects
  opacity?: number;
  shadow?: string;
  
  // Image specific
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
}

export interface TemplateField {
  id: string;
  type: TemplateFieldType;
  name: string;                    // Display name for editor
  placeholder?: string;            // Placeholder text/guidance
  defaultValue?: string;           // Default content
  required?: boolean;
  position: TemplateFieldPosition;
  style: TemplateFieldStyle;
  
  // Constraints
  maxLength?: number;              // For text fields
  minLines?: number;               // For textarea
  maxLines?: number;               // For textarea
  acceptedFormats?: string[];      // For images: ['jpg', 'png', 'svg']
  aspectRatio?: number;            // For image placeholders
  
  // Grouping
  group?: string;                  // Group related fields
  
  // Vendor-specific adjustments
  vendorOverrides?: {
    [vendorId: string]: Partial<TemplateFieldPosition & TemplateFieldStyle>;
  };
}

// ============= TEMPLATE STRUCTURE =============

export interface TemplateBackground {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  value: string;                   // Color, gradient CSS, or image URL
  overlay?: string;                // Optional overlay color with opacity
}

export interface TemplateDimensions {
  widthInches: number;
  heightInches: number;
  widthPx: number;                 // At 300 DPI
  heightPx: number;                // At 300 DPI
  bleedInches: number;
  safeZoneInches: number;
  orientation: 'portrait' | 'landscape' | 'square';
}

export interface EditableTemplate {
  id: string;
  name: string;
  description: string;
  assetType: AssetType;
  category: 'universal' | 'vendor-specific' | 'premium';
  vendorId?: string;               // Only for vendor-specific templates
  
  // Visual
  thumbnail?: string;
  previewUrl?: string;
  background: TemplateBackground;
  
  // Dimensions
  dimensions: TemplateDimensions;
  
  // Fields
  fields: TemplateField[];
  
  // Styling
  defaultFonts: {
    heading: string;
    body: string;
    accent?: string;
  };
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  
  // Metadata
  tags?: string[];
  isPremium?: boolean;
  isSystemTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Print specs
  colorMode: 'CMYK' | 'RGB';
  dpi: number;

  // Optional AI generation prompt for this template
  prompt?: string;
}

// ============= USER TEMPLATE INSTANCE =============

export interface TemplateFieldValue {
  fieldId: string;
  value: string;                   // Text content or image URL
  styleOverrides?: Partial<TemplateFieldStyle>;
  positionOverrides?: Partial<TemplateFieldPosition>;
}

export interface UserTemplateInstance {
  id: string;
  templateId: string;
  userId: string;
  projectId?: string;
  name: string;
  
  // Field values
  fieldValues: TemplateFieldValue[];
  
  // Global overrides
  backgroundOverride?: TemplateBackground;
  fontOverrides?: {
    heading?: string;
    body?: string;
    accent?: string;
  };
  colorOverrides?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
    background?: string;
  };
  
  // Export settings
  selectedVendorId?: string;
  exportFormat?: 'pdf' | 'png' | 'jpg' | 'svg';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastExportedAt?: string;
}

// ============= TEMPLATE COLLECTIONS =============

export interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  assetTypes: AssetType[];
  templates: EditableTemplate[];
  isPremium?: boolean;
  thumbnail?: string;
}

// ============= EXPORT CONFIGURATION =============

export interface TemplateExportConfig {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'psd';
  vendorId?: string;
  includeBleed: boolean;
  includeCropMarks: boolean;
  includeRegistrationMarks: boolean;
  colorMode: 'CMYK' | 'RGB';
  dpi: number;
  flattenLayers: boolean;
  embedFonts: boolean;
  colorProfile?: string;
}

// ============= FIELD GROUP DEFINITIONS =============

export interface FieldGroup {
  id: string;
  name: string;
  description?: string;
  fields: string[];               // Field IDs in this group
  collapsible?: boolean;
  defaultExpanded?: boolean;
}
