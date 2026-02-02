// Merchandise Templates - T-shirts, hats, bags, etc.

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions
const createDimensions = (
  widthInches: number,
  heightInches: number,
  bleedInches: number = 0,
  safeZoneInches: number = 0.25,
  dpi: number = 300
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
    fontFamily: 'Inter',
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
  acceptedFormats: ['png', 'svg', 'eps'],
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
  acceptedFormats: ['jpg', 'png', 'webp'],
  ...options
});

export const TSHIRT_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-event-front',
    name: 'Event T-Shirt Front',
    description: 'Standard event t-shirt front design',
    assetType: AssetType.Tshirt,
    category: 'universal',
    dimensions: createDimensions(12, 16, 0, 0.5), // Standard print area
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Bebas Neue',
      body: 'Roboto'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#f59e0b',
      accent: '#ef4444',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB', // DTG printing uses RGB
    dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo',
        { x: 25, y: 5, width: 50, height: 25 },
        { placeholder: 'Event logo (PNG with transparency)' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 10, y: 35, width: 80, height: 15 },
        {
          placeholder: 'CONFERENCE 2024',
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 }
        }
      ),
      createTextField('tagline', 'Event Tagline',
        { x: 15, y: 52, width: 70, height: 8 },
        {
          placeholder: 'Innovation • Collaboration • Growth',
          style: { fontSize: 14, textAlign: 'center', color: '#f59e0b' }
        }
      ),
      createImageField('graphic', 'Graphic Element',
        { x: 20, y: 65, width: 60, height: 25 },
        { 
          placeholder: 'Optional graphic or illustration',
          style: { objectFit: 'contain' }
        }
      )
    ],
    tags: ['tshirt', 'front', 'event', 'apparel']
  },
  {
    id: 'tshirt-minimal-logo',
    name: 'Minimal Logo Tee',
    description: 'Simple left-chest logo placement',
    assetType: AssetType.Tshirt,
    category: 'universal',
    dimensions: createDimensions(4, 4, 0, 0.25), // Left chest print area
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#ffffff',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 10, y: 10, width: 80, height: 60 },
        { 
          placeholder: 'Company/Event logo',
          required: true
        }
      ),
      createTextField('text', 'Optional Text',
        { x: 10, y: 75, width: 80, height: 15 },
        {
          placeholder: 'Company Name',
          style: { fontSize: 12, textAlign: 'center', color: '#ffffff' }
        }
      )
    ],
    tags: ['tshirt', 'minimal', 'logo', 'chest']
  }
];

export const TSHIRT_BACK_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-back-sponsors',
    name: 'Sponsor Back Design',
    description: 'Back design with sponsor logos',
    assetType: AssetType.TshirtBack,
    category: 'universal',
    dimensions: createDimensions(12, 16, 0, 0.5),
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#d4d4d4',
      accent: '#f59e0b',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createTextField('event-info', 'Event Info',
        { x: 10, y: 5, width: 80, height: 10 },
        {
          placeholder: 'Annual Conference 2024',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('date-location', 'Date & Location',
        { x: 15, y: 16, width: 70, height: 6 },
        {
          placeholder: 'March 15-17, 2024 • San Francisco, CA',
          style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }
        }
      ),
      createTextField('sponsors-label', 'Sponsors Label',
        { x: 30, y: 28, width: 40, height: 5 },
        {
          placeholder: 'PRESENTED BY',
          style: { fontSize: 10, textAlign: 'center', color: '#f59e0b', letterSpacing: 2 }
        }
      ),
      {
        id: 'sponsor-grid',
        type: 'image',
        name: 'Sponsor Logos',
        position: { x: 10, y: 35, width: 80, height: 55 },
        placeholder: 'Sponsor logo grid',
        style: { objectFit: 'contain' }
      }
    ],
    tags: ['tshirt', 'back', 'sponsors', 'event']
  }
];

export const HAT_TEMPLATES: EditableTemplate[] = [
  {
    id: 'hat-embroidered',
    name: 'Embroidered Cap',
    description: 'Front panel embroidery design',
    assetType: AssetType.Hat,
    category: 'universal',
    dimensions: createDimensions(4, 2.5, 0, 0.125), // Standard cap embroidery area
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Arial',
      body: 'Arial'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#ef4444',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 15, y: 15, width: 70, height: 50 },
        { 
          placeholder: 'Logo (vector preferred for embroidery)',
          required: true
        }
      ),
      createTextField('text', 'Text Below Logo',
        { x: 10, y: 70, width: 80, height: 20 },
        {
          placeholder: 'COMPANY',
          style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      )
    ],
    tags: ['hat', 'cap', 'embroidery', 'headwear']
  }
];

export const SWAG_BAG_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tote-bag-event',
    name: 'Event Tote Bag',
    description: 'Standard tote bag design',
    assetType: AssetType.SwagBag,
    category: 'universal',
    dimensions: createDimensions(10, 10, 0, 0.5),
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
      accent: '#3b82f6',
      text: '#1a1a1a',
      background: 'transparent'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Event Logo',
        { x: 20, y: 10, width: 60, height: 35 },
        { placeholder: 'Event logo' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 10, y: 50, width: 80, height: 15 },
        {
          placeholder: 'TECH SUMMIT 2024',
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' }
        }
      ),
      createTextField('date', 'Event Date',
        { x: 20, y: 68, width: 60, height: 8 },
        {
          placeholder: 'March 15-17',
          style: { fontSize: 14, textAlign: 'center', color: '#6b7280' }
        }
      ),
      createTextField('hashtag', 'Hashtag',
        { x: 25, y: 80, width: 50, height: 8 },
        {
          placeholder: '#TechSummit2024',
          style: { fontSize: 12, textAlign: 'center', color: '#3b82f6' }
        }
      )
    ],
    tags: ['tote', 'bag', 'swag', 'event']
  }
];

// Vendor-specific merchandise templates
export const FOURIMPRINT_MERCH_TEMPLATES: EditableTemplate[] = [
  {
    id: 'hat-4imprint-embroidered',
    name: '4imprint Embroidered Cap',
    description: 'Optimized for 4imprint embroidery specifications',
    assetType: AssetType.Hat,
    category: 'vendor-specific',
    vendorId: '4imprint',
    dimensions: createDimensions(4, 2.25, 0, 0.125),
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Arial',
      body: 'Arial'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#ff0000',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 10, y: 10, width: 80, height: 55 },
        { 
          placeholder: 'Vector logo (AI, EPS, PDF preferred)',
          required: true,
          acceptedFormats: ['ai', 'eps', 'pdf', 'svg']
        }
      ),
      createTextField('text', 'Text',
        { x: 10, y: 70, width: 80, height: 20 },
        {
          placeholder: 'BRAND',
          maxLength: 15, // Embroidery character limit
          style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      )
    ],
    tags: ['4imprint', 'vendor', 'hat', 'embroidery'],
    isSystemTemplate: true
  }
];

export const PRINTFUL_MERCH_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-printful-dtg',
    name: 'Printful DTG Print',
    description: 'Optimized for Printful direct-to-garment printing',
    assetType: AssetType.Tshirt,
    category: 'vendor-specific',
    vendorId: 'printful',
    dimensions: createDimensions(12, 16, 0, 0.5),
    background: {
      type: 'solid',
      value: 'transparent'
    },
    defaultFonts: {
      heading: 'Roboto',
      body: 'Roboto'
    },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#000000',
      accent: '#3b82f6',
      text: '#ffffff',
      background: 'transparent'
    },
    colorMode: 'RGB', // DTG uses RGB
    dpi: 300,
    fields: [
      createImageField('design', 'Main Design',
        { x: 5, y: 5, width: 90, height: 90 },
        { 
          placeholder: 'Full design (PNG with transparency)',
          required: true,
          acceptedFormats: ['png']
        }
      )
    ],
    tags: ['printful', 'vendor', 'tshirt', 'dtg'],
    isSystemTemplate: true
  }
];

export const ALL_MERCHANDISE_TEMPLATES: EditableTemplate[] = [
  ...TSHIRT_TEMPLATES,
  ...TSHIRT_BACK_TEMPLATES,
  ...HAT_TEMPLATES,
  ...SWAG_BAG_TEMPLATES,
  ...FOURIMPRINT_MERCH_TEMPLATES,
  ...PRINTFUL_MERCH_TEMPLATES
];
