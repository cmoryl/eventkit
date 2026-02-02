// Large Event Signage Templates - Step & Repeat, Stage Backdrops, Booth Panels, Hanging Signs

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions
const createDimensions = (
  widthInches: number,
  heightInches: number,
  bleedInches: number = 0.125,
  safeZoneInches: number = 0.125,
  dpi: number = 150 // Large format uses lower DPI
) => {
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
    widthPx: Math.round(widthInches * dpi),
    heightPx: Math.round(heightInches * dpi),
    bleedInches,
    safeZoneInches,
    orientation
  };
};

const createTextField = (
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
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#1a1a1a',
    ...options.style
  },
  ...options
});

const createLogoField = (
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
  acceptedFormats: ['png', 'svg', 'eps', 'pdf'],
  ...options
});

const createImageField = (
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
  acceptedFormats: ['jpg', 'png', 'pdf'],
  ...options
});

// ============= STEP & REPEAT BACKDROP TEMPLATES =============

export const STEP_REPEAT_TEMPLATES: EditableTemplate[] = [
  // 8x8 Step & Repeat
  {
    id: 'step-repeat-8x8',
    name: 'Step & Repeat 8×8 ft',
    description: 'Standard step and repeat backdrop for photo ops',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: {
      widthInches: 96,
      heightInches: 96,
      widthPx: 14400,
      heightPx: 14400,
      bleedInches: 2,
      safeZoneInches: 6,
      orientation: 'square'
    },
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#0066cc',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      // Logo grid pattern - 6 columns x 6 rows staggered
      createLogoField('logo-1-1', 'Logo Row 1 Col 1', { x: 5, y: 5, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-1-2', 'Logo Row 1 Col 2', { x: 22, y: 5, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-1-3', 'Logo Row 1 Col 3', { x: 39, y: 5, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-1-4', 'Logo Row 1 Col 4', { x: 56, y: 5, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-1-5', 'Logo Row 1 Col 5', { x: 73, y: 5, width: 12, height: 12 }, { placeholder: 'Logo' }),
      // Staggered row
      createLogoField('logo-2-1', 'Logo Row 2 Col 1', { x: 13, y: 20, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-2-2', 'Logo Row 2 Col 2', { x: 30, y: 20, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-2-3', 'Logo Row 2 Col 3', { x: 47, y: 20, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-2-4', 'Logo Row 2 Col 4', { x: 64, y: 20, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      // Continue pattern
      createLogoField('logo-3-1', 'Logo Row 3 Col 1', { x: 5, y: 35, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-3-2', 'Logo Row 3 Col 2', { x: 22, y: 35, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-3-3', 'Logo Row 3 Col 3', { x: 39, y: 35, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-3-4', 'Logo Row 3 Col 4', { x: 56, y: 35, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-3-5', 'Logo Row 3 Col 5', { x: 73, y: 35, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-4-1', 'Logo Row 4 Col 1', { x: 13, y: 50, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-4-2', 'Logo Row 4 Col 2', { x: 30, y: 50, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-4-3', 'Logo Row 4 Col 3', { x: 47, y: 50, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-4-4', 'Logo Row 4 Col 4', { x: 64, y: 50, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-5-1', 'Logo Row 5 Col 1', { x: 5, y: 65, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-5-2', 'Logo Row 5 Col 2', { x: 22, y: 65, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-5-3', 'Logo Row 5 Col 3', { x: 39, y: 65, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-5-4', 'Logo Row 5 Col 4', { x: 56, y: 65, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-5-5', 'Logo Row 5 Col 5', { x: 73, y: 65, width: 12, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-6-1', 'Logo Row 6 Col 1', { x: 13, y: 80, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-6-2', 'Logo Row 6 Col 2', { x: 30, y: 80, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-6-3', 'Logo Row 6 Col 3', { x: 47, y: 80, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('logo-6-4', 'Logo Row 6 Col 4', { x: 64, y: 80, width: 12, height: 12 }, { placeholder: 'Sponsor' }),
    ],
    tags: ['step-repeat', 'backdrop', '8x8', 'photo-op', 'sponsors'],
    isSystemTemplate: true
  },

  // 10x8 Step & Repeat
  {
    id: 'step-repeat-10x8',
    name: 'Step & Repeat 10×8 ft',
    description: 'Wide step and repeat for larger events',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: {
      widthInches: 120,
      heightInches: 96,
      widthPx: 18000,
      heightPx: 14400,
      bleedInches: 2,
      safeZoneInches: 6,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#1a1a1a' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#c9a962',
      accent: '#0066cc',
      text: '#ffffff',
      background: '#1a1a1a'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      // Centered event logo
      createLogoField('main-logo', 'Event Logo', { x: 40, y: 40, width: 20, height: 20 }, { placeholder: 'Main Event Logo' }),
      // Surrounding sponsor logos
      createLogoField('sponsor-1', 'Sponsor 1', { x: 5, y: 10, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-2', 'Sponsor 2', { x: 25, y: 10, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-3', 'Sponsor 3', { x: 45, y: 10, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-4', 'Sponsor 4', { x: 65, y: 10, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-5', 'Sponsor 5', { x: 85, y: 10, width: 10, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-6', 'Sponsor 6', { x: 5, y: 80, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-7', 'Sponsor 7', { x: 25, y: 80, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-8', 'Sponsor 8', { x: 45, y: 80, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-9', 'Sponsor 9', { x: 65, y: 80, width: 15, height: 10 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-10', 'Sponsor 10', { x: 85, y: 80, width: 10, height: 10 }, { placeholder: 'Sponsor' }),
      // Event name
      createTextField('event-name', 'Event Name', 
        { x: 10, y: 65, width: 80, height: 10 },
        { placeholder: 'EVENT NAME 2024', style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#c9a962' } }
      ),
    ],
    tags: ['step-repeat', 'backdrop', '10x8', 'wide', 'sponsors'],
    isSystemTemplate: true
  }
];

// ============= STAGE BACKDROP TEMPLATES =============

export const STAGE_BACKDROP_TEMPLATES: EditableTemplate[] = [
  // 16x9 Stage Backdrop (HD Aspect)
  {
    id: 'stage-backdrop-16x9',
    name: 'Stage Backdrop 16×9 ft',
    description: 'HD aspect ratio stage backdrop for presentations',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: {
      widthInches: 192, // 16 ft
      heightInches: 108, // 9 ft
      widthPx: 28800,
      heightPx: 16200,
      bleedInches: 2,
      safeZoneInches: 12,
      orientation: 'landscape'
    },
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#3b82f6',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 100, // Very large format
    fields: [
      createLogoField('event-logo', 'Event Logo', 
        { x: 35, y: 10, width: 30, height: 20 },
        { placeholder: 'Event Logo (white/light version)' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 10, y: 35, width: 80, height: 15 },
        {
          placeholder: 'CONFERENCE 2024',
          required: true,
          style: { fontSize: 200, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 15, y: 52, width: 70, height: 8 },
        { placeholder: 'Inspiring Innovation', style: { fontSize: 72, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' } }
      ),
      createTextField('date-location', 'Date & Location',
        { x: 20, y: 75, width: 60, height: 8 },
        { placeholder: 'March 15-17, 2024 | San Francisco', style: { fontSize: 48, textAlign: 'center', color: '#3b82f6' } }
      ),
      // Sponsor bar at bottom
      {
        id: 'sponsor-bar',
        type: 'shape',
        name: 'Sponsor Bar',
        position: { x: 0, y: 88, width: 100, height: 12 },
        style: { backgroundColor: 'rgba(255,255,255,0.1)' }
      },
      createLogoField('sponsor-1', 'Sponsor 1', { x: 10, y: 90, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-2', 'Sponsor 2', { x: 25, y: 90, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-3', 'Sponsor 3', { x: 40, y: 90, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-4', 'Sponsor 4', { x: 55, y: 90, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sponsor-5', 'Sponsor 5', { x: 70, y: 90, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
    ],
    tags: ['stage', 'backdrop', '16x9', 'presentation', 'conference'],
    isSystemTemplate: true
  },

  // 20x10 Stage Backdrop
  {
    id: 'stage-backdrop-20x10',
    name: 'Stage Backdrop 20×10 ft',
    description: 'Large stage backdrop for major events',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: {
      widthInches: 240,
      heightInches: 120,
      widthPx: 24000,
      heightPx: 12000,
      bleedInches: 3,
      safeZoneInches: 18,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#ff6b00',
      text: '#ffffff',
      background: '#000000'
    },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      createLogoField('logo', 'Main Logo',
        { x: 38, y: 8, width: 24, height: 18 },
        { placeholder: 'Event Logo' }
      ),
      createTextField('headline', 'Event Title',
        { x: 5, y: 32, width: 90, height: 18 },
        {
          placeholder: 'GLOBAL SUMMIT',
          required: true,
          style: { fontSize: 280, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('year', 'Year',
        { x: 40, y: 52, width: 20, height: 10 },
        { placeholder: '2024', style: { fontSize: 120, fontWeight: 'bold', textAlign: 'center', color: '#ff6b00' } }
      ),
      createTextField('theme', 'Theme',
        { x: 20, y: 68, width: 60, height: 6 },
        { placeholder: 'SHAPING THE FUTURE', style: { fontSize: 48, textAlign: 'center', color: 'rgba(255,255,255,0.8)', letterSpacing: 8 } }
      ),
      // Abstract design elements
      {
        id: 'accent-line-1',
        type: 'shape',
        name: 'Accent Line',
        position: { x: 0, y: 48, width: 35, height: 0.5 },
        style: { backgroundColor: '#ff6b00' }
      },
      {
        id: 'accent-line-2',
        type: 'shape',
        name: 'Accent Line',
        position: { x: 65, y: 48, width: 35, height: 0.5 },
        style: { backgroundColor: '#ff6b00' }
      },
    ],
    tags: ['stage', 'backdrop', '20x10', 'large', 'summit'],
    isSystemTemplate: true
  }
];

// ============= TRADE SHOW BOOTH TEMPLATES =============

export const BOOTH_PANEL_TEMPLATES: EditableTemplate[] = [
  // 10x10 Booth Back Wall
  {
    id: 'booth-backwall-10x10',
    name: 'Trade Show Booth 10×10 ft',
    description: 'Standard 10x10 booth back wall panel',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: {
      widthInches: 120,
      heightInches: 96,
      widthPx: 18000,
      heightPx: 14400,
      bleedInches: 1,
      safeZoneInches: 6,
      orientation: 'landscape'
    },
    background: { type: 'gradient', value: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#667eea',
      secondary: '#ffffff',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#667eea'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('company-logo', 'Company Logo',
        { x: 35, y: 5, width: 30, height: 15 },
        { placeholder: 'Company Logo (white version)' }
      ),
      createTextField('company-name', 'Company Name',
        { x: 10, y: 22, width: 80, height: 12 },
        {
          placeholder: 'COMPANY NAME',
          required: true,
          style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 15, y: 36, width: 70, height: 6 },
        { placeholder: 'Innovative Solutions for Your Business', style: { fontSize: 32, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }
      ),
      createImageField('hero-image', 'Product/Hero Image',
        { x: 10, y: 45, width: 80, height: 30 },
        { placeholder: 'Product or hero image' }
      ),
      // Feature columns
      createTextField('feature-1', 'Feature 1',
        { x: 5, y: 78, width: 28, height: 10 },
        { placeholder: '✓ Feature One', style: { fontSize: 24, textAlign: 'center', color: '#ffffff' } }
      ),
      createTextField('feature-2', 'Feature 2',
        { x: 36, y: 78, width: 28, height: 10 },
        { placeholder: '✓ Feature Two', style: { fontSize: 24, textAlign: 'center', color: '#ffffff' } }
      ),
      createTextField('feature-3', 'Feature 3',
        { x: 67, y: 78, width: 28, height: 10 },
        { placeholder: '✓ Feature Three', style: { fontSize: 24, textAlign: 'center', color: '#ffffff' } }
      ),
      createTextField('booth-info', 'Booth Info',
        { x: 35, y: 92, width: 30, height: 5 },
        { placeholder: 'BOOTH #123', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24' } }
      ),
    ],
    tags: ['booth', 'trade-show', '10x10', 'back-wall'],
    isSystemTemplate: true
  },

  // 10x20 Booth (Island Display)
  {
    id: 'booth-backwall-10x20',
    name: 'Trade Show Booth 10×20 ft',
    description: 'Large island booth back wall',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: {
      widthInches: 240,
      heightInches: 96,
      widthPx: 36000,
      heightPx: 14400,
      bleedInches: 1,
      safeZoneInches: 6,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#0f172a',
      secondary: '#ffffff',
      accent: '#22d3ee',
      text: '#ffffff',
      background: '#0f172a'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 43, y: 5, width: 14, height: 12 },
        { placeholder: 'Logo' }
      ),
      createTextField('headline', 'Main Headline',
        { x: 5, y: 20, width: 90, height: 15 },
        {
          placeholder: 'TRANSFORM YOUR BUSINESS',
          required: true,
          style: { fontSize: 120, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 15, y: 38, width: 70, height: 6 },
        { placeholder: 'Next-generation solutions for modern enterprises', style: { fontSize: 36, textAlign: 'center', color: '#22d3ee' } }
      ),
      // Three product/service columns
      createImageField('product-1', 'Product 1',
        { x: 5, y: 48, width: 28, height: 25 },
        { placeholder: 'Product 1' }
      ),
      createTextField('product-1-title', 'Product 1 Title',
        { x: 5, y: 75, width: 28, height: 5 },
        { placeholder: 'Solution A', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }
      ),
      createImageField('product-2', 'Product 2',
        { x: 36, y: 48, width: 28, height: 25 },
        { placeholder: 'Product 2' }
      ),
      createTextField('product-2-title', 'Product 2 Title',
        { x: 36, y: 75, width: 28, height: 5 },
        { placeholder: 'Solution B', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }
      ),
      createImageField('product-3', 'Product 3',
        { x: 67, y: 48, width: 28, height: 25 },
        { placeholder: 'Product 3' }
      ),
      createTextField('product-3-title', 'Product 3 Title',
        { x: 67, y: 75, width: 28, height: 5 },
        { placeholder: 'Solution C', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }
      ),
      createTextField('cta', 'Call to Action',
        { x: 30, y: 85, width: 40, height: 6 },
        { placeholder: 'Schedule a Demo Today', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee' } }
      ),
      createTextField('website', 'Website',
        { x: 35, y: 93, width: 30, height: 4 },
        { placeholder: 'www.company.com', style: { fontSize: 20, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }
      ),
    ],
    tags: ['booth', 'trade-show', '10x20', 'island', 'large'],
    isSystemTemplate: true
  }
];

// ============= HANGING/CEILING SIGN TEMPLATES =============

export const HANGING_SIGN_TEMPLATES: EditableTemplate[] = [
  // 4x4 Hanging Sign
  {
    id: 'hanging-sign-4x4',
    name: 'Hanging Sign 4×4 ft',
    description: 'Square ceiling-mounted hanging sign',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: {
      widthInches: 48,
      heightInches: 48,
      widthPx: 7200,
      heightPx: 7200,
      bleedInches: 0.5,
      safeZoneInches: 2,
      orientation: 'square'
    },
    background: { type: 'solid', value: '#1e40af' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e40af',
      secondary: '#ffffff',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#1e40af'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 25, y: 10, width: 50, height: 25 },
        { placeholder: 'Company/Booth Logo' }
      ),
      createTextField('booth-number', 'Booth Number',
        { x: 10, y: 45, width: 80, height: 25 },
        {
          placeholder: '#123',
          required: true,
          style: { fontSize: 144, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('company-name', 'Company Name',
        { x: 10, y: 75, width: 80, height: 12 },
        { placeholder: 'Company Name', style: { fontSize: 36, textAlign: 'center', color: '#fbbf24' } }
      ),
    ],
    tags: ['hanging', 'ceiling', '4x4', 'booth-locator'],
    isSystemTemplate: true
  },

  // 8x4 Hanging Banner
  {
    id: 'hanging-banner-8x4',
    name: 'Hanging Banner 8×4 ft',
    description: 'Rectangular ceiling-mounted banner',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: {
      widthInches: 96,
      heightInches: 48,
      widthPx: 14400,
      heightPx: 7200,
      bleedInches: 0.5,
      safeZoneInches: 2,
      orientation: 'landscape'
    },
    background: { type: 'gradient', value: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#dc2626',
      secondary: '#ffffff',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#dc2626'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 5, y: 15, width: 20, height: 70 },
        { placeholder: 'Logo' }
      ),
      createTextField('zone-name', 'Zone/Area Name',
        { x: 28, y: 20, width: 68, height: 30 },
        {
          placeholder: 'INNOVATION ZONE',
          required: true,
          style: { fontSize: 96, fontWeight: 'bold', color: '#ffffff' }
        }
      ),
      createTextField('description', 'Description',
        { x: 28, y: 55, width: 68, height: 15 },
        { placeholder: 'Discover the Future of Technology', style: { fontSize: 32, color: 'rgba(255,255,255,0.9)' } }
      ),
      {
        id: 'arrow-indicator',
        type: 'icon',
        name: 'Direction Arrow',
        position: { x: 88, y: 35, width: 8, height: 30 },
        placeholder: '→',
        style: { color: '#fbbf24' }
      }
    ],
    tags: ['hanging', 'ceiling', '8x4', 'zone', 'wayfinding'],
    isSystemTemplate: true
  }
];

// ============= FLOOR GRAPHICS TEMPLATES =============

export const FLOOR_GRAPHICS_TEMPLATES: EditableTemplate[] = [
  // 4x4 Floor Decal
  {
    id: 'floor-decal-4x4',
    name: 'Floor Decal 4×4 ft',
    description: 'Square floor graphic for wayfinding',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: {
      widthInches: 48,
      heightInches: 48,
      widthPx: 7200,
      heightPx: 7200,
      bleedInches: 0.5,
      safeZoneInches: 2,
      orientation: 'square'
    },
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      {
        id: 'circle-bg',
        type: 'shape',
        name: 'Circle Background',
        position: { x: 5, y: 5, width: 90, height: 90 },
        style: { backgroundColor: '#1e3a5f', borderRadius: 50 }
      },
      createLogoField('logo', 'Logo',
        { x: 30, y: 15, width: 40, height: 25 },
        { placeholder: 'Logo' }
      ),
      createTextField('direction', 'Direction Text',
        { x: 10, y: 50, width: 80, height: 20 },
        {
          placeholder: 'THIS WAY',
          required: true,
          style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      {
        id: 'arrow',
        type: 'icon',
        name: 'Arrow',
        position: { x: 35, y: 72, width: 30, height: 18 },
        placeholder: '↑',
        style: { color: '#f59e0b' }
      }
    ],
    tags: ['floor', 'decal', '4x4', 'wayfinding', 'directional'],
    isSystemTemplate: true
  },

  // 3x6 Floor Runner
  {
    id: 'floor-runner-3x6',
    name: 'Floor Runner 3×6 ft',
    description: 'Rectangular floor graphic for pathways',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: {
      widthInches: 72,
      heightInches: 36,
      widthPx: 10800,
      heightPx: 5400,
      bleedInches: 0.5,
      safeZoneInches: 2,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#10b981' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#10b981',
      secondary: '#ffffff',
      accent: '#1a1a1a',
      text: '#ffffff',
      background: '#10b981'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 5, y: 15, width: 25, height: 70 },
        { placeholder: 'Logo' }
      ),
      createTextField('message', 'Message',
        { x: 32, y: 25, width: 63, height: 25 },
        {
          placeholder: 'REGISTRATION',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', color: '#ffffff' }
        }
      ),
      createTextField('arrow-text', 'Direction',
        { x: 32, y: 55, width: 63, height: 20 },
        { placeholder: '→ 50 METERS', style: { fontSize: 36, color: 'rgba(255,255,255,0.9)' } }
      ),
    ],
    tags: ['floor', 'runner', '3x6', 'pathway', 'directional'],
    isSystemTemplate: true
  }
];

// ============= WINDOW/BUILDING GRAPHICS TEMPLATES =============

export const WINDOW_GRAPHICS_TEMPLATES: EditableTemplate[] = [
  // 4x6 Window Cling
  {
    id: 'window-cling-4x6',
    name: 'Window Cling 4×6 ft',
    description: 'Large window graphic for storefronts',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: {
      widthInches: 48,
      heightInches: 72,
      widthPx: 7200,
      heightPx: 10800,
      bleedInches: 0.5,
      safeZoneInches: 2,
      orientation: 'portrait'
    },
    background: { type: 'solid', value: 'rgba(255,255,255,0.95)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e40af',
      secondary: '#ffffff',
      accent: '#dc2626',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Event Logo',
        { x: 20, y: 5, width: 60, height: 15 },
        { placeholder: 'Event Logo' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 22, width: 90, height: 12 },
        {
          placeholder: 'TECH SUMMIT',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#1e40af' }
        }
      ),
      createTextField('year', 'Year',
        { x: 30, y: 35, width: 40, height: 8 },
        { placeholder: '2024', style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#dc2626' } }
      ),
      createImageField('hero-image', 'Hero Image',
        { x: 5, y: 45, width: 90, height: 30 },
        { placeholder: 'Event imagery' }
      ),
      createTextField('date', 'Date',
        { x: 10, y: 78, width: 80, height: 6 },
        { placeholder: 'March 15-17, 2024', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' } }
      ),
      createTextField('location', 'Location',
        { x: 10, y: 85, width: 80, height: 5 },
        { placeholder: 'Convention Center', style: { fontSize: 20, textAlign: 'center', color: '#666666' } }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 92, width: 60, height: 5 },
        { placeholder: 'Register Now', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#dc2626' } }
      ),
    ],
    tags: ['window', 'cling', '4x6', 'storefront', 'promotional'],
    isSystemTemplate: true
  },

  // Building Wrap Panel
  {
    id: 'building-wrap-10x20',
    name: 'Building Wrap 10×20 ft',
    description: 'Large scale building wrap panel',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: {
      widthInches: 120,
      heightInches: 240,
      widthPx: 12000,
      heightPx: 24000,
      bleedInches: 3,
      safeZoneInches: 12,
      orientation: 'portrait'
    },
    background: { type: 'gradient', value: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#0f172a',
      secondary: '#ffffff',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#0f172a'
    },
    colorMode: 'CMYK',
    dpi: 72, // Very large format
    fields: [
      createLogoField('logo', 'Logo',
        { x: 25, y: 5, width: 50, height: 10 },
        { placeholder: 'Event/Brand Logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 18, width: 90, height: 15 },
        {
          placeholder: 'THE FUTURE',
          required: true,
          style: { fontSize: 200, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('headline-2', 'Headline Line 2',
        { x: 5, y: 32, width: 90, height: 15 },
        { placeholder: 'IS HERE', style: { fontSize: 200, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } }
      ),
      createImageField('hero', 'Hero Image',
        { x: 0, y: 50, width: 100, height: 35 },
        { placeholder: 'Dramatic hero image' }
      ),
      createTextField('event-info', 'Event Info',
        { x: 10, y: 88, width: 80, height: 5 },
        { placeholder: 'March 15-17, 2024 | Convention Center', style: { fontSize: 48, textAlign: 'center', color: '#ffffff' } }
      ),
      createTextField('website', 'Website',
        { x: 25, y: 94, width: 50, height: 4 },
        { placeholder: 'www.event.com', style: { fontSize: 36, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }
      ),
    ],
    tags: ['building', 'wrap', '10x20', 'large-scale', 'exterior'],
    isSystemTemplate: true
  }
];

// ============= A-FRAME / SANDWICH BOARD TEMPLATES =============

export const AFRAME_TEMPLATES: EditableTemplate[] = [
  // Standard A-Frame
  {
    id: 'aframe-24x36',
    name: 'A-Frame Sign 24×36',
    description: 'Standard sidewalk A-frame sign',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e40af',
      secondary: '#ffffff',
      accent: '#dc2626',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      {
        id: 'header-bar',
        type: 'shape',
        name: 'Header',
        position: { x: 0, y: 0, width: 100, height: 18 },
        style: { backgroundColor: '#1e40af' }
      },
      createLogoField('logo', 'Logo',
        { x: 5, y: 3, width: 25, height: 12 },
        { placeholder: 'Logo' }
      ),
      createTextField('event-type', 'Event Type',
        { x: 35, y: 4, width: 60, height: 10 },
        { placeholder: 'CONFERENCE', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'right', color: '#ffffff' } }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 22, width: 90, height: 15 },
        {
          placeholder: 'WELCOME',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#1e40af' }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 38, width: 90, height: 10 },
        { placeholder: 'Tech Summit 2024', style: { fontSize: 32, textAlign: 'center' } }
      ),
      createImageField('image', 'Event Image',
        { x: 10, y: 50, width: 80, height: 25 },
        { placeholder: 'Event photo' }
      ),
      createTextField('direction', 'Direction',
        { x: 10, y: 78, width: 80, height: 10 },
        { placeholder: 'Registration → Lobby', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#dc2626' } }
      ),
      createTextField('time', 'Time',
        { x: 15, y: 90, width: 70, height: 6 },
        { placeholder: 'Today 9AM - 5PM', style: { fontSize: 18, textAlign: 'center', color: '#666666' } }
      ),
    ],
    tags: ['aframe', 'sandwich-board', '24x36', 'sidewalk'],
    isSystemTemplate: true
  }
];

// Export all large event signage templates
export const ALL_LARGE_EVENT_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  ...STEP_REPEAT_TEMPLATES,
  ...STAGE_BACKDROP_TEMPLATES,
  ...BOOTH_PANEL_TEMPLATES,
  ...HANGING_SIGN_TEMPLATES,
  ...FLOOR_GRAPHICS_TEMPLATES,
  ...WINDOW_GRAPHICS_TEMPLATES,
  ...AFRAME_TEMPLATES
];
