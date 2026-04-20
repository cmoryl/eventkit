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
  },
  {
    id: 'step-repeat-geometric',
    name: 'Step & Repeat Geometric',
    description: 'Modern geometric pattern step and repeat',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: createDimensions(96, 96, 2, 6),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#e5e7eb', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      { id: 'pattern', type: 'shape', name: 'Pattern Overlay', position: { x: 0, y: 0, width: 100, height: 100 }, style: { backgroundColor: '#e5e7eb', opacity: 0.1 } },
      createLogoField('logo-center', 'Main Logo', { x: 35, y: 40, width: 30, height: 20 }, { placeholder: 'Main Logo' }),
      createLogoField('logo-tl', 'Logo TL', { x: 5, y: 5, width: 15, height: 10 }, { placeholder: 'Logo' }),
      createLogoField('logo-tr', 'Logo TR', { x: 80, y: 5, width: 15, height: 10 }, { placeholder: 'Logo' }),
      createLogoField('logo-bl', 'Logo BL', { x: 5, y: 85, width: 15, height: 10 }, { placeholder: 'Logo' }),
      createLogoField('logo-br', 'Logo BR', { x: 80, y: 85, width: 15, height: 10 }, { placeholder: 'Logo' })
    ],
    tags: ['step-repeat', 'geometric', 'modern'],
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
  },
  // Panel Design
  {
    id: 'stage-backdrop-panel',
    name: 'Stage Backdrop - Panel Design',
    description: 'Three-panel vertical design layout',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(240, 120, 3, 12, 100),
    background: { type: 'solid', value: '#1f2937' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#1f2937', accent: '#60a5fa', text: '#ffffff', background: '#1f2937' },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      { id: 'left-panel', type: 'shape', name: 'Left Panel', position: { x: 5, y: 5, width: 28, height: 90 }, style: { backgroundColor: '#111827', borderRadius: 0 } },
      { id: 'center-panel', type: 'shape', name: 'Center Panel', position: { x: 36, y: 5, width: 28, height: 90 }, style: { backgroundColor: '#111827', borderRadius: 0 } },
      { id: 'right-panel', type: 'shape', name: 'Right Panel', position: { x: 67, y: 5, width: 28, height: 90 }, style: { backgroundColor: '#111827', borderRadius: 0 } },
      createLogoField('logo-center', 'Center Logo', { x: 40, y: 20, width: 20, height: 20 }, { placeholder: 'Logo' }),
      createTextField('title', 'Event Title', { x: 38, y: 50, width: 24, height: 10 }, { placeholder: 'SUMMIT', style: { fontSize: 80, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('img-left', 'Left Image', { x: 7, y: 10, width: 24, height: 80 }, { placeholder: 'Visual 1' }),
      createImageField('img-right', 'Right Image', { x: 69, y: 10, width: 24, height: 80 }, { placeholder: 'Visual 2' })
    ],
    tags: ['stage', 'backdrop', 'panels', 'triptych'],
    isSystemTemplate: true
  },
  // Curved LED Simulation
  {
    id: 'stage-backdrop-led',
    name: 'Stage Backdrop - LED Video Wall',
    description: 'High-impact graphics for LED walls',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(360, 120, 0, 0, 100),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#ffffff', secondary: '#4f46e5', accent: '#06b6d4', text: '#ffffff', background: '#4f46e5' },
    colorMode: 'RGB', // LED walls are RGB
    dpi: 100,
    fields: [
      createTextField('headline', 'Headline', { x: 5, y: 35, width: 90, height: 30 }, { placeholder: 'IMMERSIVE EXPERIENCE', style: { fontSize: 200, fontWeight: '900', textAlign: 'center', color: '#ffffff', letterSpacing: 10 } }),
      createLogoField('logo', 'Logo', { x: 45, y: 10, width: 10, height: 15 }, { placeholder: 'Logo' }),
      { id: 'glow-bar', type: 'shape', name: 'Glow Bar', position: { x: 0, y: 80, width: 100, height: 2 }, style: { backgroundColor: '#ffffff', opacity: 0.5, shadow: '0 0 50px white' } }
    ],
    tags: ['stage', 'backdrop', 'led', 'video-wall'],
    isSystemTemplate: true
  },
  // Minimalist Center
  {
    id: 'stage-backdrop-minimal',
    name: 'Stage Backdrop - Minimalist',
    description: 'Clean, focus-pulling center design',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(240, 120, 3, 12, 100),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Helvetica', body: 'Arial' },
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#000000', text: '#000000', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      createLogoField('logo', 'Center Logo', { x: 35, y: 35, width: 30, height: 30 }, { placeholder: 'Logo' }),
      createTextField('url', 'Website', { x: 35, y: 70, width: 30, height: 5 }, { placeholder: 'event.com', style: { fontSize: 48, textAlign: 'center', color: '#000000' } })
    ],
    tags: ['stage', 'backdrop', 'minimal', 'clean'],
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
  },
  // Product Demo Wall
  {
    id: 'booth-backwall-demo',
    name: 'Booth - Product Demo',
    description: 'Backwall with product focus areas',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(120, 96, 1, 6),
    background: { type: 'solid', value: '#f3f4f6' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#111827', secondary: '#e5e7eb', accent: '#3b82f6', text: '#111827', background: '#f3f4f6' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('header', 'Header', { x: 5, y: 10, width: 90, height: 10 }, { placeholder: 'Our Products', style: { fontSize: 72, fontWeight: 'bold', color: '#111827' } }),
      createImageField('prod-1', 'Product 1', { x: 10, y: 30, width: 20, height: 20 }, { placeholder: 'Image' }),
      createTextField('desc-1', 'Desc 1', { x: 10, y: 55, width: 20, height: 10 }, { placeholder: 'Description 1', style: { fontSize: 24 } }),
      createImageField('prod-2', 'Product 2', { x: 40, y: 30, width: 20, height: 20 }, { placeholder: 'Image' }),
      createTextField('desc-2', 'Desc 2', { x: 40, y: 55, width: 20, height: 10 }, { placeholder: 'Description 2', style: { fontSize: 24 } }),
      createImageField('prod-3', 'Product 3', { x: 70, y: 30, width: 20, height: 20 }, { placeholder: 'Image' }),
      createTextField('desc-3', 'Desc 3', { x: 70, y: 55, width: 20, height: 10 }, { placeholder: 'Description 3', style: { fontSize: 24 } })
    ],
    tags: ['booth', 'demo', 'products'],
    isSystemTemplate: true
  },
  // Lounge Setting
  {
    id: 'booth-backwall-lounge',
    name: 'Booth - Lounge Vibe',
    description: 'Relaxed atmosphere backwall',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(120, 96, 1, 6),
    background: { type: 'image', value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#d4af37', text: '#ffffff', background: '#000000' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      { id: 'overlay', type: 'shape', name: 'Dark Overlay', position: { x: 0, y: 0, width: 100, height: 100 }, style: { backgroundColor: 'rgba(0,0,0,0.4)' } },
      createLogoField('logo', 'Logo', { x: 35, y: 20, width: 30, height: 20 }, { placeholder: 'Logo (White)' }),
      createTextField('welcome', 'Welcome', { x: 20, y: 50, width: 60, height: 10 }, { placeholder: 'Relax & Connect', style: { fontSize: 64, color: '#ffffff', textAlign: 'center', fontStyle: 'italic' } })
    ],
    tags: ['booth', 'lounge', 'relaxed'],
    isSystemTemplate: true
  },
  // Interactive Screen
  {
    id: 'booth-backwall-screen',
    name: 'Booth - Screen Integration',
    description: 'Backwall designed for mounted TV/Monitor',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(120, 96, 1, 6),
    background: { type: 'solid', value: '#2563eb' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#2563eb', accent: '#1e40af', text: '#ffffff', background: '#2563eb' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('title', 'Title', { x: 5, y: 10, width: 90, height: 10 }, { placeholder: 'Interactive Demo', style: { fontSize: 72, fontWeight: 'bold', color: '#ffffff' } }),
      { id: 'screen-area', type: 'shape', name: 'TV Mount Area', position: { x: 30, y: 30, width: 40, height: 40 }, style: { backgroundColor: '#1e40af', borderStyle: 'dashed', borderColor: '#ffffff', borderWidth: 2 } },
      createTextField('screen-label', 'Screen Placeholder', { x: 35, y: 45, width: 30, height: 10 }, { placeholder: 'MOUNT TV HERE', style: { fontSize: 36, textAlign: 'center', color: '#ffffff', opacity: 0.5 } }),
      createLogoField('logo', 'Logo', { x: 80, y: 80, width: 15, height: 10 }, { placeholder: 'Logo' })
    ],
    tags: ['booth', 'tv', 'screen', 'interactive'],
    isSystemTemplate: true
  },
  // Circular Hanging Sign
  {
    id: 'hanging-sign-circular',
    name: 'Circular Hanging Sign',
    description: 'Round ceiling sign for visibility',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(60, 60, 0, 0),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#000000', text: '#000000', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      { id: 'ring', type: 'shape', name: 'Ring', position: { x: 0, y: 0, width: 100, height: 100 }, style: { backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 5, borderRadius: 50 } },
      createLogoField('logo', 'Logo', { x: 25, y: 25, width: 50, height: 50 }, { placeholder: 'Logo' })
    ],
    tags: ['hanging', 'circle', 'round'],
    isSystemTemplate: true
  },
  // Triangle Hanging Sign
  {
    id: 'hanging-sign-triangle',
    name: 'Triangle Hanging Sign',
    description: 'Three-sided hanging display',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(96, 48, 0, 0),
    background: { type: 'solid', value: '#2563eb' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#2563eb', accent: '#1e40af', text: '#ffffff', background: '#2563eb' },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      createTextField('text', 'Message', { x: 10, y: 30, width: 80, height: 40 }, { placeholder: 'ZONE A', style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['hanging', 'triangle', '3-sided'],
    isSystemTemplate: true
  },
  // Tapered Circle
  {
    id: 'hanging-sign-tapered',
    name: 'Tapered Circle Sign',
    description: 'Tapered round hanging structure',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(120, 60, 0, 0),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1f2937 0%, #000000 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#fbbf24', text: '#ffffff', background: '#000000' },
    colorMode: 'CMYK',
    dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 10, width: 40, height: 40 }, { placeholder: 'Logo' }),
      createTextField('url', 'Website', { x: 20, y: 70, width: 60, height: 10 }, { placeholder: 'www.brand.com', style: { fontSize: 32, textAlign: 'center', color: '#fbbf24' } })
    ],
    tags: ['hanging', 'tapered', 'structure'],
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
  },
  // Social Distancing / Queue
  {
    id: 'floor-decal-queue',
    name: 'Queue Marker',
    description: 'Floor marker for line management',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(18, 18, 0, 0),
    background: { type: 'solid', value: '#ef4444' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#ef4444', accent: '#ffffff', text: '#ffffff', background: '#ef4444' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      { id: 'circle', type: 'shape', name: 'Circle', position: { x: 0, y: 0, width: 100, height: 100 }, style: { backgroundColor: '#ef4444', borderRadius: 50 } },
      createTextField('text', 'Text', { x: 10, y: 40, width: 80, height: 20 }, { placeholder: 'WAIT HERE', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['floor', 'queue', 'marker'],
    isSystemTemplate: true
  },
  // Welcome Mat
  {
    id: 'floor-decal-welcome',
    name: 'Welcome Floor Graphic',
    description: 'Entrance welcome floor decal',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(48, 36, 0, 0),
    background: { type: 'solid', value: '#111827' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#111827', accent: '#d4af37', text: '#ffffff', background: '#111827' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('welcome', 'Welcome', { x: 10, y: 30, width: 80, height: 40 }, { placeholder: 'Welcome', style: { fontSize: 72, textAlign: 'center', color: '#ffffff', fontStyle: 'italic' } }),
      createLogoField('logo', 'Logo', { x: 40, y: 70, width: 20, height: 20 }, { placeholder: 'Logo' })
    ],
    tags: ['floor', 'welcome', 'entrance'],
    isSystemTemplate: true
  },
  // 3D Illusion
  {
    id: 'floor-decal-3d',
    name: '3D Illusion Graphic',
    description: 'Eye-catching 3D effect floor graphic',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(60, 60, 0, 0),
    background: { type: 'image', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#ff0000', text: '#000000', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('stop', 'Stop', { x: 20, y: 40, width: 60, height: 20 }, { placeholder: 'STOP', style: { fontSize: 72, fontWeight: '900', textAlign: 'center', color: '#ffffff', shadow: '5px 5px 0px #000000' } })
    ],
    tags: ['floor', '3d', 'illusion'],
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
  },
  // Frosted Effect
  {
    id: 'window-cling-frosted',
    name: 'Frosted Window Design',
    description: 'Subtle frosted glass effect',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(48, 48, 0, 0),
    background: { type: 'solid', value: 'rgba(255,255,255,0.7)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#000000', secondary: 'transparent', accent: '#000000', text: '#000000', background: 'rgba(255,255,255,0.7)' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 30, width: 40, height: 40 }, { placeholder: 'Logo Cutout' })
    ],
    tags: ['window', 'frosted', 'subtle'],
    isSystemTemplate: true
  },
  // Hours & Info
  {
    id: 'window-cling-hours',
    name: 'Hours & Info Cling',
    description: 'Store hours and contact info',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0, 0),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Helvetica', body: 'Helvetica' },
    defaultColors: { primary: '#ffffff', secondary: 'transparent', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('hours', 'Hours', { x: 10, y: 10, width: 80, height: 80 }, { placeholder: 'OPEN DAILY\n9AM - 9PM', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['window', 'hours', 'info'],
    isSystemTemplate: true
  },
  // Sale Promo
  {
    id: 'window-cling-sale',
    name: 'Sale Promo Cling',
    description: 'Bright sale promotion window cling',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(36, 36, 0, 0),
    background: { type: 'solid', value: '#ef4444' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#ef4444', accent: '#f59e0b', text: '#ffffff', background: '#ef4444' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('sale', 'Sale', { x: 10, y: 35, width: 80, height: 30 }, { placeholder: '50% OFF', style: { fontSize: 64, fontWeight: '900', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['window', 'sale', 'promo'],
    isSystemTemplate: true
  },
  // Menu Board
  {
    id: 'aframe-menu',
    name: 'A-Frame Menu',
    description: 'Sidewalk menu board',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0, 0),
    background: { type: 'solid', value: '#1f2937' },
    defaultFonts: { heading: 'Chalkboard SE', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#1f2937', accent: '#f59e0b', text: '#ffffff', background: '#1f2937' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('specials', 'Specials', { x: 10, y: 10, width: 80, height: 10 }, { placeholder: 'TODAY\'S SPECIALS', style: { fontSize: 36, textAlign: 'center', color: '#ffffff' } }),
      createTextField('items', 'Items', { x: 10, y: 30, width: 80, height: 60 }, { placeholder: 'Coffee...$3\nLatte...$4\nMuffin...$3', style: { fontSize: 24, textAlign: 'center', color: '#d1d5db' } })
    ],
    tags: ['aframe', 'menu', 'chalkboard'],
    isSystemTemplate: true
  },
  // Directional Arrow
  {
    id: 'aframe-directional',
    name: 'Directional A-Frame',
    description: 'Big arrow directional sign',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0, 0),
    background: { type: 'solid', value: '#2563eb' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#2563eb', accent: '#ffffff', text: '#ffffff', background: '#2563eb' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      { id: 'arrow', type: 'icon', name: 'Arrow', position: { x: 20, y: 20, width: 60, height: 40 }, placeholder: '↑', style: { color: '#ffffff' } },
      createTextField('text', 'Text', { x: 10, y: 70, width: 80, height: 20 }, { placeholder: 'CHECK-IN', style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['aframe', 'directional', 'arrow'],
    isSystemTemplate: true
  },
  // QR Code Scan
  {
    id: 'aframe-qr',
    name: 'QR Scan A-Frame',
    description: 'Large QR code for scanning',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0, 0),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#000000', text: '#000000', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 10, y: 10, width: 80, height: 50 }, placeholder: 'Scan Me', style: { backgroundColor: '#ffffff' } },
      createTextField('text', 'Text', { x: 10, y: 70, width: 80, height: 20 }, { placeholder: 'SCAN TO ORDER', style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#000000' } })
    ],
    tags: ['aframe', 'qr', 'scan'],
    isSystemTemplate: true
  },
  // Event Schedule
  {
    id: 'aframe-schedule',
    name: 'Event Schedule A-Frame',
    description: 'Schedule of events display',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0, 0),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('title', 'Title', { x: 10, y: 5, width: 80, height: 10 }, { placeholder: 'SCHEDULE', style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' } }),
      createTextField('list', 'List', { x: 10, y: 20, width: 80, height: 70 }, { placeholder: '9:00 AM - Keynote\n10:30 AM - Break\n11:00 AM - Session 1', style: { fontSize: 24, lineHeight: 1.5, color: '#1a1a1a' } })
    ],
    tags: ['aframe', 'schedule', 'list'],
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

// ============= ADDITIONAL STEP & REPEAT TEMPLATES =============

const STEP_REPEAT_EXTRA: EditableTemplate[] = [
  {
    id: 'step-repeat-6x8-elegant',
    name: 'Step & Repeat 6×8 ft – Elegant',
    description: 'Elegant step and repeat with centered branding',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: createDimensions(72, 96, 2, 6, 150),
    background: { type: 'solid', value: '#0a0a0a' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: { primary: '#0a0a0a', secondary: '#c9a962', accent: '#ffffff', text: '#ffffff', background: '#0a0a0a' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo-center', 'Event Logo', { x: 35, y: 35, width: 30, height: 30 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event Name', { x: 10, y: 70, width: 80, height: 10 }, { placeholder: 'GALA AWARDS 2024', style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#c9a962', letterSpacing: 4 } }),
      createLogoField('sp-tl', 'Sponsor TL', { x: 5, y: 5, width: 15, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('sp-tr', 'Sponsor TR', { x: 80, y: 5, width: 15, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('sp-bl', 'Sponsor BL', { x: 5, y: 83, width: 15, height: 12 }, { placeholder: 'Sponsor' }),
      createLogoField('sp-br', 'Sponsor BR', { x: 80, y: 83, width: 15, height: 12 }, { placeholder: 'Sponsor' }),
    ],
    tags: ['step-repeat', 'elegant', 'gala'], isSystemTemplate: true
  },
  {
    id: 'step-repeat-10x8-grid',
    name: 'Step & Repeat 10×8 ft – Grid',
    description: 'Uniform grid pattern step and repeat',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: createDimensions(120, 96, 2, 6, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#1a1a1a', accent: '#0066cc', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: Array.from({ length: 20 }, (_, i) => createLogoField(`logo-g-${i}`, `Logo ${i + 1}`, { x: 5 + (i % 5) * 19, y: 5 + Math.floor(i / 5) * 23, width: 14, height: 18 }, { placeholder: 'Logo/Sponsor' })),
    tags: ['step-repeat', 'grid', 'uniform'], isSystemTemplate: true
  },
  {
    id: 'step-repeat-8x8-branded',
    name: 'Step & Repeat 8×8 ft – Branded',
    description: 'Single-brand focused step and repeat with pattern',
    assetType: AssetType.StepAndRepeat,
    category: 'universal',
    dimensions: createDimensions(96, 96, 2, 6, 150),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      ...Array.from({ length: 12 }, (_, i) => createLogoField(`logo-p-${i}`, `Logo ${i + 1}`, { x: 8 + (i % 4) * 23, y: 5 + Math.floor(i / 4) * 28, width: 18, height: 22 }, { placeholder: 'Brand Logo' })),
      createTextField('hashtag', 'Hashtag', { x: 10, y: 90, width: 80, height: 6 }, { placeholder: '#EventName2024', style: { fontSize: 48, textAlign: 'center', color: '#fbbf24', fontWeight: 'bold' } }),
    ],
    tags: ['step-repeat', 'branded', 'single-brand'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL STAGE BACKDROP TEMPLATES =============

const STAGE_BACKDROP_EXTRA: EditableTemplate[] = [
  {
    id: 'stage-backdrop-12x8-minimal',
    name: 'Stage Backdrop 12×8 ft – Minimal',
    description: 'Clean minimal stage backdrop',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(144, 96, 2, 12, 100),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#1a1a1a', secondary: '#666666', accent: '#0066cc', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 38, y: 15, width: 24, height: 18 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 15, y: 42, width: 70, height: 16 }, { placeholder: 'EVENT NAME', required: true, style: { fontSize: 160, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('date', 'Date', { x: 25, y: 65, width: 50, height: 8 }, { placeholder: 'March 15–17, 2024', style: { fontSize: 48, textAlign: 'center', color: '#666666' } }),
    ],
    tags: ['stage', 'backdrop', 'minimal', 'clean'], isSystemTemplate: true
  },
  {
    id: 'stage-backdrop-16x9-neon',
    name: 'Stage Backdrop 16×9 ft – Neon',
    description: 'Bold neon-accented stage backdrop',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(192, 108, 2, 12, 100),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f0f0f 0%, #1a0a2e 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#0f0f0f', secondary: '#00ff88', accent: '#ff00ff', text: '#ffffff', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 38, y: 8, width: 24, height: 16 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 5, y: 30, width: 90, height: 20 }, { placeholder: 'TECH SUMMIT', required: true, style: { fontSize: 220, fontWeight: 'bold', textAlign: 'center', color: '#00ff88' } }),
      createTextField('year', 'Year', { x: 35, y: 52, width: 30, height: 12 }, { placeholder: '2024', style: { fontSize: 100, fontWeight: 'bold', textAlign: 'center', color: '#ff00ff' } }),
      createTextField('tagline', 'Tagline', { x: 20, y: 70, width: 60, height: 8 }, { placeholder: 'CODE THE FUTURE', style: { fontSize: 48, textAlign: 'center', color: '#ffffff', letterSpacing: 6 } }),
    ],
    tags: ['stage', 'backdrop', 'neon', 'tech'], isSystemTemplate: true
  },
  {
    id: 'stage-backdrop-20x10-corporate',
    name: 'Stage Backdrop 20×10 ft – Corporate',
    description: 'Professional corporate stage backdrop',
    assetType: AssetType.MainStageBackdrop,
    category: 'universal',
    dimensions: createDimensions(240, 120, 3, 18, 100),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1e3a5f 0%, #0a1628 100%)' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#c9a962', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 40, y: 5, width: 20, height: 15 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 10, y: 25, width: 80, height: 15 }, { placeholder: 'ANNUAL MEETING', required: true, style: { fontSize: 180, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('subtitle', 'Subtitle', { x: 20, y: 42, width: 60, height: 8 }, { placeholder: 'Leading with Purpose', style: { fontSize: 60, textAlign: 'center', color: '#c9a962', fontStyle: 'italic' } }),
      { id: 'divider', type: 'divider' as const, name: 'Divider', position: { x: 30, y: 55, width: 40, height: 0.3 }, style: { backgroundColor: '#c9a962' } },
      createTextField('date', 'Date & Location', { x: 15, y: 60, width: 70, height: 8 }, { placeholder: 'March 15–17 • New York', style: { fontSize: 48, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createLogoField('sp1', 'Sponsor 1', { x: 15, y: 85, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sp2', 'Sponsor 2', { x: 32, y: 85, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sp3', 'Sponsor 3', { x: 49, y: 85, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
      createLogoField('sp4', 'Sponsor 4', { x: 66, y: 85, width: 12, height: 8 }, { placeholder: 'Sponsor' }),
    ],
    tags: ['stage', 'backdrop', 'corporate', 'annual-meeting'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL BACK WALL TEMPLATES =============

const BOOTH_PANEL_EXTRA: EditableTemplate[] = [
  {
    id: 'booth-backwall-8x8-minimal',
    name: 'Trade Show Booth 8×8 ft – Minimal',
    description: 'Clean minimal booth back wall',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(96, 96, 1, 6, 150),
    background: { type: 'solid', value: '#f8f9fa' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#1a1a1a', secondary: '#666666', accent: '#0066cc', text: '#1a1a1a', background: '#f8f9fa' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 10, width: 40, height: 20 }, { placeholder: 'Logo' }),
      createTextField('tagline', 'Tagline', { x: 15, y: 38, width: 70, height: 10 }, { placeholder: 'Simple. Powerful. Effective.', style: { fontSize: 48, textAlign: 'center', color: '#666666' } }),
      createImageField('product', 'Product', { x: 20, y: 55, width: 60, height: 30 }, { placeholder: 'Hero product image' }),
      createTextField('url', 'Website', { x: 30, y: 90, width: 40, height: 5 }, { placeholder: 'www.company.com', style: { fontSize: 24, textAlign: 'center', color: '#0066cc' } }),
    ],
    tags: ['booth', 'minimal', '8x8'], isSystemTemplate: true
  },
  {
    id: 'booth-backwall-10x10-split',
    name: 'Trade Show Booth 10×10 ft – Split',
    description: 'Two-tone split booth back wall',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(120, 96, 1, 6, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#dc2626', secondary: '#1a1a1a', accent: '#ffffff', text: '#ffffff', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      { id: 'left-panel', type: 'shape' as const, name: 'Left Panel', position: { x: 0, y: 0, width: 50, height: 100 }, style: { backgroundColor: '#dc2626' } },
      createLogoField('logo', 'Logo', { x: 8, y: 15, width: 34, height: 20 }, { placeholder: 'Logo (white)' }),
      createTextField('headline', 'Headline', { x: 5, y: 42, width: 42, height: 18 }, { placeholder: 'LEADING\nINNOVATION', required: true, style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 } }),
      createImageField('img1', 'Image 1', { x: 55, y: 5, width: 40, height: 28 }, { placeholder: 'Product 1' }),
      createImageField('img2', 'Image 2', { x: 55, y: 36, width: 40, height: 28 }, { placeholder: 'Product 2' }),
      createImageField('img3', 'Image 3', { x: 55, y: 67, width: 40, height: 28 }, { placeholder: 'Product 3' }),
    ],
    tags: ['booth', 'split', '10x10'], isSystemTemplate: true
  },
  {
    id: 'booth-backwall-10x10-tech',
    name: 'Trade Show Booth 10×10 ft – Tech',
    description: 'Technology-focused booth back wall',
    assetType: AssetType.BackWall,
    category: 'universal',
    dimensions: createDimensions(120, 96, 1, 6, 150),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#0f172a', secondary: '#38bdf8', accent: '#22d3ee', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 15 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 10, y: 25, width: 80, height: 15 }, { placeholder: 'AI-POWERED', required: true, style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#38bdf8' } }),
      createTextField('sub', 'Subtitle', { x: 15, y: 42, width: 70, height: 8 }, { placeholder: 'The Future of Enterprise', style: { fontSize: 36, textAlign: 'center', color: '#ffffff' } }),
      createImageField('demo', 'Demo Screenshot', { x: 15, y: 55, width: 70, height: 25 }, { placeholder: 'Product demo screenshot' }),
      createTextField('booth', 'Booth', { x: 35, y: 88, width: 30, height: 6 }, { placeholder: 'BOOTH #A100', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee' } }),
    ],
    tags: ['booth', 'tech', '10x10'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL HANGING SIGN TEMPLATES =============

const HANGING_SIGN_EXTRA: EditableTemplate[] = [
  {
    id: 'hanging-sign-3x3-circle',
    name: 'Hanging Sign 3×3 ft – Circular',
    description: 'Circular hanging sign for zones',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(36, 36, 0.5, 2, 150),
    background: { type: 'solid', value: '#10b981' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#10b981', secondary: '#ffffff', accent: '#1a1a1a', text: '#ffffff', background: '#10b981' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      { id: 'bg-circle', type: 'shape' as const, name: 'Background', position: { x: 5, y: 5, width: 90, height: 90 }, style: { backgroundColor: '#10b981', borderRadius: 50 } },
      createLogoField('logo', 'Logo', { x: 30, y: 12, width: 40, height: 25 }, { placeholder: 'Logo' }),
      createTextField('zone', 'Zone', { x: 10, y: 48, width: 80, height: 25 }, { placeholder: 'FOOD', required: true, style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('desc', 'Description', { x: 15, y: 75, width: 70, height: 10 }, { placeholder: 'Hall B', style: { fontSize: 28, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }),
    ],
    tags: ['hanging', 'circular', '3x3'], isSystemTemplate: true
  },
  {
    id: 'hanging-banner-6x3-directional',
    name: 'Hanging Banner 6×3 ft – Directional',
    description: 'Directional hanging banner with arrows',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(72, 36, 0.5, 2, 150),
    background: { type: 'solid', value: '#f59e0b' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#f59e0b', secondary: '#1a1a1a', accent: '#ffffff', text: '#1a1a1a', background: '#f59e0b' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('direction', 'Direction', { x: 5, y: 15, width: 70, height: 35 }, { placeholder: 'REGISTRATION →', required: true, style: { fontSize: 72, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('floor', 'Floor/Area', { x: 5, y: 55, width: 70, height: 20 }, { placeholder: 'Ground Floor, East Wing', style: { fontSize: 32, color: 'rgba(0,0,0,0.7)' } }),
      createLogoField('logo', 'Logo', { x: 78, y: 15, width: 18, height: 70 }, { placeholder: 'Logo' }),
    ],
    tags: ['hanging', 'directional', '6x3'], isSystemTemplate: true
  },
  {
    id: 'hanging-sign-4x4-premium',
    name: 'Hanging Sign 4×4 ft – Premium',
    description: 'Premium illuminated-style hanging sign',
    assetType: AssetType.HangingSignage,
    category: 'universal',
    dimensions: createDimensions(48, 48, 0.5, 2, 150),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: { primary: '#1a1a2e', secondary: '#c9a962', accent: '#ffffff', text: '#c9a962', background: '#1a1a2e' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      { id: 'border', type: 'shape' as const, name: 'Border', position: { x: 3, y: 3, width: 94, height: 94 }, style: { borderWidth: 2, borderColor: '#c9a962', borderStyle: 'solid', backgroundColor: 'transparent' } },
      createLogoField('logo', 'Logo', { x: 25, y: 10, width: 50, height: 25 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 10, y: 42, width: 80, height: 25 }, { placeholder: 'VIP', required: true, style: { fontSize: 120, fontWeight: 'bold', textAlign: 'center', color: '#c9a962' } }),
      createTextField('sub', 'Subtitle', { x: 15, y: 72, width: 70, height: 12 }, { placeholder: 'LOUNGE', style: { fontSize: 40, textAlign: 'center', color: '#ffffff', letterSpacing: 8 } }),
    ],
    tags: ['hanging', 'premium', '4x4'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL FLOOR DECAL TEMPLATES =============

const FLOOR_GRAPHICS_EXTRA: EditableTemplate[] = [
  {
    id: 'floor-decal-3x3-arrow',
    name: 'Floor Decal 3×3 ft – Arrow',
    description: 'Arrow-shaped floor directional',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(36, 36, 0.5, 2, 150),
    background: { type: 'solid', value: '#dc2626' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#dc2626', secondary: '#ffffff', accent: '#1a1a1a', text: '#ffffff', background: '#dc2626' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('direction', 'Direction', { x: 10, y: 20, width: 80, height: 30 }, { placeholder: '↑', required: true, style: { fontSize: 120, textAlign: 'center', color: '#ffffff' } }),
      createTextField('label', 'Label', { x: 10, y: 55, width: 80, height: 20 }, { placeholder: 'EXIT', style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
    ],
    tags: ['floor', 'arrow', '3x3'], isSystemTemplate: true
  },
  {
    id: 'floor-decal-4x4-branded',
    name: 'Floor Decal 4×4 ft – Branded',
    description: 'Brand logo floor decal for high-traffic areas',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(48, 48, 0.5, 2, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#1a1a1a', secondary: '#666666', accent: '#0066cc', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Brand Logo', { x: 15, y: 15, width: 70, height: 50 }, { placeholder: 'Large brand logo' }),
      createTextField('tagline', 'Tagline', { x: 10, y: 70, width: 80, height: 12 }, { placeholder: 'Welcome to Innovation', style: { fontSize: 36, textAlign: 'center', color: '#1a1a1a' } }),
    ],
    tags: ['floor', 'branded', '4x4'], isSystemTemplate: true
  },
  {
    id: 'floor-runner-2x8-pathway',
    name: 'Floor Runner 2×8 ft – Pathway',
    description: 'Long floor runner for corridors',
    assetType: AssetType.FloorDecal,
    category: 'universal',
    dimensions: createDimensions(96, 24, 0.5, 2, 150),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#1e40af' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('text', 'Direction', { x: 5, y: 20, width: 60, height: 60 }, { placeholder: 'MAIN STAGE →', required: true, style: { fontSize: 64, fontWeight: 'bold', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 72, y: 15, width: 25, height: 70 }, { placeholder: 'Logo' }),
    ],
    tags: ['floor', 'runner', '2x8', 'pathway'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL WINDOW CLING TEMPLATES =============

const WINDOW_GRAPHICS_EXTRA: EditableTemplate[] = [
  {
    id: 'window-cling-3x4-promo',
    name: 'Window Cling 3×4 ft – Promo',
    description: 'Promotional window cling',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(36, 48, 0.5, 2, 150),
    background: { type: 'solid', value: 'rgba(255,255,255,0.9)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#dc2626', secondary: '#1a1a1a', accent: '#fbbf24', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 20, y: 5, width: 60, height: 15 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 5, y: 25, width: 90, height: 15 }, { placeholder: 'SALE', required: true, style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#dc2626' } }),
      createTextField('details', 'Details', { x: 10, y: 45, width: 80, height: 20 }, { placeholder: 'Up to 50% Off\nThis Weekend Only', style: { fontSize: 28, textAlign: 'center', lineHeight: 1.4 } }),
      createTextField('dates', 'Dates', { x: 15, y: 75, width: 70, height: 10 }, { placeholder: 'March 15–17', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' } }),
    ],
    tags: ['window', 'cling', 'promo', '3x4'], isSystemTemplate: true
  },
  {
    id: 'window-cling-6x4-landscape',
    name: 'Window Cling 6×4 ft – Landscape',
    description: 'Wide landscape window graphic',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(72, 48, 0.5, 2, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#0f172a', secondary: '#ffffff', accent: '#3b82f6', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createImageField('hero', 'Hero Image', { x: 0, y: 0, width: 55, height: 100 }, { placeholder: 'Event hero image' }),
      createLogoField('logo', 'Logo', { x: 60, y: 8, width: 35, height: 18 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 58, y: 32, width: 40, height: 18 }, { placeholder: 'SUMMIT\n2024', required: true, style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#0f172a', lineHeight: 1.1 } }),
      createTextField('info', 'Info', { x: 58, y: 58, width: 40, height: 20 }, { placeholder: 'March 15–17\nConvention Center', style: { fontSize: 20, textAlign: 'center', lineHeight: 1.5 } }),
      createTextField('cta', 'CTA', { x: 60, y: 82, width: 35, height: 10 }, { placeholder: 'Register Now', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' } }),
    ],
    tags: ['window', 'cling', 'landscape', '6x4'], isSystemTemplate: true
  },
  {
    id: 'window-frosted-4x6',
    name: 'Window Frosted Film 4×6 ft',
    description: 'Frosted window film with cutout design',
    assetType: AssetType.WindowCling,
    category: 'universal',
    dimensions: createDimensions(48, 72, 0.5, 2, 150),
    background: { type: 'solid', value: 'rgba(255,255,255,0.7)' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#334155', secondary: '#ffffff', accent: '#0ea5e9', text: '#334155', background: 'rgba(255,255,255,0.7)' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 10, width: 50, height: 20 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 10, y: 38, width: 80, height: 12 }, { placeholder: 'MEETING ROOM', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#334155' } }),
      createTextField('capacity', 'Capacity', { x: 20, y: 55, width: 60, height: 8 }, { placeholder: 'Capacity: 20', style: { fontSize: 24, textAlign: 'center', color: '#64748b' } }),
      createTextField('hours', 'Hours', { x: 15, y: 70, width: 70, height: 12 }, { placeholder: 'Available 8AM – 6PM', style: { fontSize: 20, textAlign: 'center', color: '#64748b' } }),
    ],
    tags: ['window', 'frosted', 'meeting-room', '4x6'], isSystemTemplate: true
  }
];

// ============= ADDITIONAL A-FRAME TEMPLATES =============

const AFRAME_EXTRA: EditableTemplate[] = [
  {
    id: 'aframe-24x36-cafe',
    name: 'A-Frame Sign 24×36 – Café',
    description: 'Café/restaurant sidewalk A-frame',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#2d1b0e' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: { primary: '#2d1b0e', secondary: '#f5e6d3', accent: '#c9a962', text: '#f5e6d3', background: '#2d1b0e' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 5, width: 50, height: 15 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 5, y: 25, width: 90, height: 15 }, { placeholder: 'TODAY\'S SPECIALS', required: true, style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#c9a962' } }),
      createTextField('items', 'Menu Items', { x: 10, y: 45, width: 80, height: 35 }, { placeholder: '☕ Latte · $5\n🥐 Croissant · $4\n🥗 Salad · $12', style: { fontSize: 20, textAlign: 'center', color: '#f5e6d3', lineHeight: 2 } }),
      createTextField('hours', 'Hours', { x: 15, y: 85, width: 70, height: 10 }, { placeholder: 'Open 7AM – 9PM', style: { fontSize: 16, textAlign: 'center', color: 'rgba(245,230,211,0.7)' } }),
    ],
    tags: ['aframe', 'cafe', 'restaurant', 'menu'], isSystemTemplate: true
  },
  {
    id: 'aframe-24x36-directional',
    name: 'A-Frame Sign 24×36 – Directional',
    description: 'Directional wayfinding A-frame',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#1e40af' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#1e40af' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 20, y: 5, width: 60, height: 15 }, { placeholder: 'Event Logo' }),
      createTextField('arrow', 'Arrow', { x: 10, y: 25, width: 80, height: 25 }, { placeholder: '←', required: true, style: { fontSize: 120, textAlign: 'center', color: '#fbbf24' } }),
      createTextField('destination', 'Destination', { x: 5, y: 55, width: 90, height: 20 }, { placeholder: 'BALLROOM', style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('detail', 'Detail', { x: 10, y: 78, width: 80, height: 10 }, { placeholder: '2nd Floor, Turn Left', style: { fontSize: 20, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
    ],
    tags: ['aframe', 'directional', 'wayfinding'], isSystemTemplate: true
  },
  {
    id: 'aframe-24x36-promo',
    name: 'A-Frame Sign 24×36 – Promo',
    description: 'Promotional event A-frame sign',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: { primary: '#dc2626', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#dc2626' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 3, width: 50, height: 12 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 5, y: 18, width: 90, height: 15 }, { placeholder: 'FREE\nADMISSION', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 } }),
      createImageField('image', 'Image', { x: 10, y: 38, width: 80, height: 30 }, { placeholder: 'Promotional image' }),
      createTextField('event', 'Event', { x: 5, y: 72, width: 90, height: 10 }, { placeholder: 'Art Exhibition 2024', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24' } }),
      createTextField('info', 'Info', { x: 10, y: 85, width: 80, height: 10 }, { placeholder: 'March 15 · 10AM–6PM', style: { fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }),
    ],
    tags: ['aframe', 'promo', 'event'], isSystemTemplate: true
  },
  {
    id: 'aframe-24x36-registration',
    name: 'A-Frame Sign 24×36 – Registration',
    description: 'Registration desk A-frame with QR code',
    assetType: AssetType.AFrameSign,
    category: 'universal',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#1a1a1a', secondary: '#666666', accent: '#0066cc', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 5, width: 50, height: 12 }, { placeholder: 'Event Logo' }),
      createTextField('headline', 'Headline', { x: 5, y: 22, width: 90, height: 12 }, { placeholder: 'CHECK IN', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('instructions', 'Instructions', { x: 10, y: 38, width: 80, height: 12 }, { placeholder: 'Scan the QR code below\nto check in', style: { fontSize: 18, textAlign: 'center', color: '#666666', lineHeight: 1.5 } }),
      { id: 'qr', type: 'qrcode' as const, name: 'QR Code', position: { x: 25, y: 55, width: 50, height: 30 }, placeholder: 'Registration URL', style: {} },
      createTextField('help', 'Help', { x: 15, y: 88, width: 70, height: 8 }, { placeholder: 'Need help? Visit the info desk', style: { fontSize: 14, textAlign: 'center', color: '#0066cc' } }),
    ],
    tags: ['aframe', 'registration', 'check-in', 'qr'], isSystemTemplate: true
  }
];

// ============= MAIN STAGE BACKDROP EXTRAS =============

export const MAIN_STAGE_BACKDROP_EXTRA: EditableTemplate[] = [
  {
    id: 'main-stage-keynote', name: 'Keynote Main Stage', description: 'Massive keynote stage backdrop with branding',
    assetType: AssetType.MainStageBackdrop, category: 'universal',
    dimensions: createDimensions(40, 20, 0.5, 1, 100),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0a0a1a 0%, #1e1e5a 50%, #4f46e5 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#fbbf24', secondary: '#0a0a1a', accent: '#fff', text: '#ffffff', background: '#0a0a1a' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo-l', 'Logo Left', { x: 5, y: 8, width: 14, height: 18 }, { placeholder: 'Logo' }),
      createLogoField('logo-r', 'Logo Right', { x: 81, y: 8, width: 14, height: 18 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event Name', { x: 10, y: 35, width: 80, height: 22 }, { placeholder: 'INNOVATION 2026', required: true, style: { fontSize: 200, fontWeight: 'bold', textAlign: 'center', color: '#fff', letterSpacing: 8 } }),
      createTextField('tagline', 'Tagline', { x: 15, y: 62, width: 70, height: 8 }, { placeholder: 'Building the future, together', style: { fontSize: 56, textAlign: 'center', color: '#fbbf24', fontStyle: 'italic' } }),
      createTextField('hashtag', 'Hashtag', { x: 30, y: 78, width: 40, height: 8 }, { placeholder: '#INNOVATE2026', style: { fontSize: 42, textAlign: 'center', color: 'rgba(255,255,255,0.6)', letterSpacing: 4 } }),
    ],
    tags: ['main-stage', 'keynote', 'massive', 'branded'], isSystemTemplate: true
  },
  {
    id: 'main-stage-concert', name: 'Concert Main Stage', description: 'Bold concert/festival main stage',
    assetType: AssetType.MainStageBackdrop, category: 'universal',
    dimensions: createDimensions(40, 20, 0.5, 1, 100),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#fff', secondary: '#ec4899', accent: '#fbbf24', text: '#ffffff', background: '#ec4899' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createTextField('festival', 'Festival', { x: 5, y: 25, width: 90, height: 30 }, { placeholder: 'BLOOM\nFEST', required: true, style: { fontSize: 320, fontWeight: '900', textAlign: 'center', color: '#fff', lineHeight: 0.9 } }),
      createTextField('year', 'Year', { x: 35, y: 64, width: 30, height: 10 }, { placeholder: '2026', style: { fontSize: 110, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24' } }),
      createTextField('location', 'Location', { x: 20, y: 82, width: 60, height: 6 }, { placeholder: 'AUSTIN  •  TEXAS  •  JUNE 14-16', style: { fontSize: 36, textAlign: 'center', color: '#fff', letterSpacing: 6 } }),
    ],
    tags: ['main-stage', 'concert', 'festival', 'bold'], isSystemTemplate: true
  },
  {
    id: 'main-stage-corporate', name: 'Corporate Summit Stage', description: 'Clean corporate summit stage backdrop',
    assetType: AssetType.MainStageBackdrop, category: 'universal',
    dimensions: createDimensions(40, 20, 0.5, 1, 100),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#06b6d4', text: '#1e40af', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      { id: 'accent-bar', type: 'shape', name: 'Accent Bar', position: { x: 0, y: 88, width: 100, height: 12 }, style: { backgroundColor: '#1e40af' } },
      createLogoField('logo', 'Logo', { x: 42, y: 8, width: 16, height: 14 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 10, y: 30, width: 80, height: 18 }, { placeholder: 'GLOBAL LEADERSHIP SUMMIT', required: true, style: { fontSize: 130, fontWeight: 'bold', textAlign: 'center', color: '#1e40af', letterSpacing: 4 } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 40, y: 54, width: 20, height: 0.5 }, style: { backgroundColor: '#06b6d4' } },
      createTextField('subtitle', 'Subtitle', { x: 15, y: 60, width: 70, height: 8 }, { placeholder: 'Driving Tomorrow\'s Innovation', style: { fontSize: 46, textAlign: 'center', color: '#06b6d4', fontStyle: 'italic' } }),
      createTextField('dates', 'Dates', { x: 25, y: 75, width: 50, height: 8 }, { placeholder: 'October 12-14, 2026', style: { fontSize: 36, textAlign: 'center', color: '#1e40af' } }),
      createTextField('footer', 'Footer', { x: 5, y: 91, width: 90, height: 6 }, { placeholder: 'PRESENTED BY ACME CORPORATION', style: { fontSize: 28, textAlign: 'center', color: '#fff', letterSpacing: 8 } }),
    ],
    tags: ['main-stage', 'corporate', 'summit', 'clean'], isSystemTemplate: true
  },
];

// ============= REGISTRATION COUNTER EXTRAS =============

export const REGISTRATION_COUNTER_EXTRA: EditableTemplate[] = [
  {
    id: 'reg-counter-modern', name: 'Modern Registration Counter', description: 'Clean front-facing registration desk wrap',
    assetType: AssetType.RegistrationCounter, category: 'universal',
    dimensions: createDimensions(72, 36, 0.5, 1, 100),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#fbbf24', secondary: '#0f172a', accent: '#fff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createTextField('headline', 'Headline', { x: 5, y: 22, width: 90, height: 30 }, { placeholder: 'CHECK IN HERE', required: true, style: { fontSize: 180, fontWeight: 'bold', textAlign: 'center', color: '#fff', letterSpacing: 6 } }),
      createTextField('subline', 'Subline', { x: 15, y: 56, width: 70, height: 12 }, { placeholder: 'Welcome to Innovation Summit 2026', style: { fontSize: 64, textAlign: 'center', color: '#fbbf24', fontStyle: 'italic' } }),
      createLogoField('logo-l', 'Logo Left', { x: 8, y: 8, width: 14, height: 12 }, { placeholder: 'Logo' }),
      createLogoField('logo-r', 'Logo Right', { x: 78, y: 8, width: 14, height: 12 }, { placeholder: 'Logo' }),
    ],
    tags: ['registration', 'counter', 'check-in', 'modern'], isSystemTemplate: true
  },
  {
    id: 'reg-counter-vibrant', name: 'Vibrant Festival Counter', description: 'Bright registration counter for festivals',
    assetType: AssetType.RegistrationCounter, category: 'universal',
    dimensions: createDimensions(72, 36, 0.5, 1, 100),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #f97316 0%, #ec4899 100%)' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#fff', secondary: '#f97316', accent: '#fbbf24', text: '#ffffff', background: '#f97316' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 18, width: 80, height: 12 }, { placeholder: 'GET YOUR WRISTBAND', style: { fontSize: 90, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 4 } }),
      createTextField('event', 'Event', { x: 5, y: 36, width: 90, height: 25 }, { placeholder: 'BLOOM FEST', required: true, style: { fontSize: 240, fontWeight: '900', textAlign: 'center', color: '#fff' } }),
      createTextField('lines', 'Line Labels', { x: 5, y: 70, width: 90, height: 10 }, { placeholder: 'GA  •  VIP  •  ARTIST', style: { fontSize: 70, textAlign: 'center', color: '#fff', letterSpacing: 8 } }),
    ],
    tags: ['registration', 'festival', 'vibrant'], isSystemTemplate: true
  },
];

// ============= TECHNOLOGY/KIOSK EXTRAS =============

export const KIOSK_EXTRA: EditableTemplate[] = [
  {
    id: 'kiosk-self-service', name: 'Self-Service Kiosk', description: 'Self check-in kiosk wrap design',
    assetType: AssetType.Kiosk, category: 'universal',
    dimensions: createDimensions(24, 60, 0.25, 0.5, 100),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#06b6d4', secondary: '#0f172a', accent: '#fff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 5, width: 50, height: 8 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 5, y: 18, width: 90, height: 10 }, { placeholder: 'SELF CHECK-IN', required: true, style: { fontSize: 80, fontWeight: 'bold', textAlign: 'center', color: '#06b6d4', letterSpacing: 4 } }),
      createTextField('step1', 'Step 1', { x: 10, y: 36, width: 80, height: 8 }, { placeholder: '1. Tap to begin', style: { fontSize: 40, textAlign: 'center', color: '#fff' } }),
      createTextField('step2', 'Step 2', { x: 10, y: 46, width: 80, height: 8 }, { placeholder: '2. Enter your email', style: { fontSize: 40, textAlign: 'center', color: '#fff' } }),
      createTextField('step3', 'Step 3', { x: 10, y: 56, width: 80, height: 8 }, { placeholder: '3. Print your badge', style: { fontSize: 40, textAlign: 'center', color: '#fff' } }),
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 30, y: 72, width: 40, height: 18 }, placeholder: 'Help URL', style: {} },
      createTextField('help', 'Help', { x: 10, y: 92, width: 80, height: 5 }, { placeholder: 'Need help? Scan to chat with staff', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } }),
    ],
    tags: ['kiosk', 'self-service', 'check-in'], isSystemTemplate: true
  },
];

// ============= GLASS DOOR DECAL EXTRAS =============

export const GLASS_DOOR_EXTRA: EditableTemplate[] = [
  {
    id: 'glass-door-welcome', name: 'Glass Door Welcome', description: 'Frosted glass door welcome decal',
    assetType: AssetType.GlassDoor, category: 'universal',
    dimensions: createDimensions(36, 84, 0.25, 1, 100),
    background: { type: 'solid', value: 'rgba(255,255,255,0.85)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#fff', accent: '#3b82f6', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 18, width: 40, height: 14 }, { placeholder: 'Logo' }),
      createTextField('welcome', 'Welcome', { x: 5, y: 38, width: 90, height: 14 }, { placeholder: 'WELCOME', required: true, style: { fontSize: 110, fontWeight: 'bold', textAlign: 'center', color: '#0f172a', letterSpacing: 8 } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 35, y: 56, width: 30, height: 0.5 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('event', 'Event', { x: 10, y: 60, width: 80, height: 8 }, { placeholder: 'Innovation Summit 2026', style: { fontSize: 48, textAlign: 'center', color: '#3b82f6', fontStyle: 'italic' } }),
      createTextField('hours', 'Hours', { x: 10, y: 78, width: 80, height: 6 }, { placeholder: 'Doors open 8:00 AM', style: { fontSize: 32, textAlign: 'center', color: '#0f172a' } }),
    ],
    tags: ['glass-door', 'welcome', 'frosted'], isSystemTemplate: true
  },
  {
    id: 'glass-door-sponsor', name: 'Glass Door Sponsor', description: 'Sponsor recognition on glass door',
    assetType: AssetType.GlassDoor, category: 'universal',
    dimensions: createDimensions(36, 84, 0.25, 1, 100),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#fff', accent: '#fbbf24', text: '#1e40af', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 100,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 12, width: 80, height: 6 }, { placeholder: 'PROUDLY SPONSORED BY', style: { fontSize: 32, textAlign: 'center', color: '#1e40af', letterSpacing: 6 } }),
      createLogoField('sponsor1', 'Sponsor 1', { x: 20, y: 22, width: 60, height: 14 }, { placeholder: 'Sponsor logo' }),
      createLogoField('sponsor2', 'Sponsor 2', { x: 20, y: 40, width: 60, height: 14 }, { placeholder: 'Sponsor logo' }),
      createLogoField('sponsor3', 'Sponsor 3', { x: 20, y: 58, width: 60, height: 14 }, { placeholder: 'Sponsor logo' }),
      createTextField('thanks', 'Thanks', { x: 10, y: 78, width: 80, height: 8 }, { placeholder: 'Thank you for your support', style: { fontSize: 28, textAlign: 'center', color: '#fbbf24', fontStyle: 'italic' } }),
    ],
    tags: ['glass-door', 'sponsor', 'recognition'], isSystemTemplate: true
  },
];

// Export all large event signage templates
export const ALL_LARGE_EVENT_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  ...STEP_REPEAT_TEMPLATES,
  ...STEP_REPEAT_EXTRA,
  ...STAGE_BACKDROP_TEMPLATES,
  ...STAGE_BACKDROP_EXTRA,
  ...BOOTH_PANEL_TEMPLATES,
  ...BOOTH_PANEL_EXTRA,
  ...HANGING_SIGN_TEMPLATES,
  ...HANGING_SIGN_EXTRA,
  ...FLOOR_GRAPHICS_TEMPLATES,
  ...FLOOR_GRAPHICS_EXTRA,
  ...WINDOW_GRAPHICS_TEMPLATES,
  ...WINDOW_GRAPHICS_EXTRA,
  ...AFRAME_TEMPLATES,
  ...AFRAME_EXTRA,
  ...MAIN_STAGE_BACKDROP_EXTRA,
  ...REGISTRATION_COUNTER_EXTRA,
  ...KIOSK_EXTRA,
  ...GLASS_DOOR_EXTRA
];
