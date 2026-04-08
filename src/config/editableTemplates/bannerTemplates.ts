// Banner Templates - Roll-up, retractable, vinyl banners

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions to avoid circular dependency
const createDimensions = (
  widthInches: number,
  heightInches: number,
  bleedInches: number = 0.125,
  safeZoneInches: number = 0.125,
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

// ============= UNIVERSAL BANNER TEMPLATES =============

export const BANNER_TEMPLATES: EditableTemplate[] = [
  // Corporate Professional Roll-Up
  {
    id: 'banner-corporate-rollup',
    name: 'Corporate Roll-Up',
    description: 'Professional retractable banner for trade shows and events',
    assetType: AssetType.Banner,
    category: 'universal',
    dimensions: createDimensions(33.5, 79, 0, 3), // Standard retractable: 33.5" x 79" with 3" bottom in stand
    background: {
      type: 'gradient',
      value: 'linear-gradient(180deg, #1e3a5f 0%, #0f2744 100%)'
    },
    defaultFonts: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 150, // Large format = 150 DPI is sufficient
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 10, y: 3, width: 80, height: 10 },
        { placeholder: 'Your logo (white/light version recommended)' }
      ),
      createTextField('headline', 'Main Headline',
        { x: 5, y: 18, width: 90, height: 12 },
        {
          placeholder: 'Transform Your Business',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 5, y: 32, width: 90, height: 6 },
        {
          placeholder: 'Innovative Solutions for Modern Enterprises',
          style: { fontSize: 28, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createImageField('hero-image', 'Hero Image',
        { x: 5, y: 42, width: 90, height: 25 },
        { placeholder: 'Product or lifestyle image' }
      ),
      createTextField('bullet-1', 'Key Point 1',
        { x: 8, y: 70, width: 84, height: 4 },
        {
          placeholder: '✓ Increase productivity by 50%',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('bullet-2', 'Key Point 2',
        { x: 8, y: 75, width: 84, height: 4 },
        {
          placeholder: '✓ 24/7 customer support',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('bullet-3', 'Key Point 3',
        { x: 8, y: 80, width: 84, height: 4 },
        {
          placeholder: '✓ Trusted by 10,000+ companies',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 15, y: 87, width: 70, height: 5 },
        {
          placeholder: 'Visit booth #123',
          style: { 
            fontSize: 24, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#1e3a5f',
            backgroundColor: '#f59e0b',
            borderRadius: 8
          }
        }
      ),
      createTextField('website', 'Website',
        { x: 10, y: 94, width: 80, height: 3 },
        {
          placeholder: 'www.yourcompany.com',
          style: { fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }
        }
      )
    ],
    tags: ['corporate', 'rollup', 'professional', 'trade-show']
  },

  // Event Announcement Banner
  {
    id: 'banner-event-announcement',
    name: 'Event Announcement',
    description: 'Bold banner for event promotion and announcements',
    assetType: AssetType.Banner,
    category: 'universal',
    dimensions: createDimensions(33.5, 79, 0, 3),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f472b6 100%)'
    },
    defaultFonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f472b6',
      text: '#ffffff',
      background: '#667eea'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('event-type', 'Event Type',
        { x: 10, y: 5, width: 80, height: 4 },
        {
          placeholder: 'ANNUAL CONFERENCE',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: 'rgba(255,255,255,0.9)', letterSpacing: 4, textTransform: 'uppercase' }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 12, width: 90, height: 18 },
        {
          placeholder: 'INNOVATE 2024',
          required: true,
          style: { fontSize: 96, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1 }
        }
      ),
      createTextField('tagline', 'Event Tagline',
        { x: 10, y: 32, width: 80, height: 5 },
        {
          placeholder: 'Where Ideas Come to Life',
          style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.95)', fontStyle: 'italic' }
        }
      ),
      {
        id: 'date-box',
        type: 'shape',
        name: 'Date Container',
        position: { x: 15, y: 42, width: 70, height: 15 },
        style: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 }
      },
      createTextField('date', 'Event Date',
        { x: 15, y: 44, width: 70, height: 8 },
        {
          placeholder: 'March 15-17, 2024',
          style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('location', 'Location',
        { x: 15, y: 52, width: 70, height: 4 },
        {
          placeholder: 'San Francisco Convention Center',
          style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createImageField('speaker-grid', 'Featured Speakers',
        { x: 10, y: 62, width: 80, height: 18 },
        { placeholder: 'Speaker photos or event imagery' }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 83, width: 60, height: 6 },
        {
          placeholder: 'REGISTER NOW',
          style: { 
            fontSize: 28, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#764ba2',
            backgroundColor: '#ffffff',
            borderRadius: 30
          }
        }
      ),
      createLogoField('logo', 'Event Logo',
        { x: 35, y: 92, width: 30, height: 6 },
        { placeholder: 'Event or company logo' }
      )
    ],
    tags: ['event', 'announcement', 'vibrant', 'conference']
  },

  // Product Showcase Banner
  {
    id: 'banner-product-showcase',
    name: 'Product Showcase',
    description: 'Clean banner design to highlight products or services',
    assetType: AssetType.Banner,
    category: 'universal',
    dimensions: createDimensions(33.5, 79, 0, 3),
    background: {
      type: 'solid',
      value: '#ffffff'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#111827',
      secondary: '#6b7280',
      accent: '#ef4444',
      text: '#111827',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Brand Logo',
        { x: 10, y: 4, width: 35, height: 8 },
        { placeholder: 'Your brand logo' }
      ),
      createTextField('category', 'Product Category',
        { x: 5, y: 16, width: 90, height: 3 },
        {
          placeholder: 'PREMIUM COLLECTION',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#ef4444', letterSpacing: 3, textTransform: 'uppercase' }
        }
      ),
      createTextField('product-name', 'Product Name',
        { x: 5, y: 21, width: 90, height: 10 },
        {
          placeholder: 'Innovation X Pro',
          required: true,
          style: { fontSize: 56, fontWeight: '800', textAlign: 'center', color: '#111827', lineHeight: 1.1 }
        }
      ),
      createImageField('product-image', 'Product Image',
        { x: 5, y: 35, width: 90, height: 35 },
        { 
          placeholder: 'High-quality product photo',
          style: { objectFit: 'contain' }
        }
      ),
      createTextField('feature-1', 'Feature 1',
        { x: 5, y: 73, width: 28, height: 8 },
        {
          placeholder: 'Ultra Fast\nPerformance',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#111827' }
        }
      ),
      createTextField('feature-2', 'Feature 2',
        { x: 36, y: 73, width: 28, height: 8 },
        {
          placeholder: 'All-Day\nBattery',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#111827' }
        }
      ),
      createTextField('feature-3', 'Feature 3',
        { x: 67, y: 73, width: 28, height: 8 },
        {
          placeholder: 'Premium\nDesign',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#111827' }
        }
      ),
      createTextField('price', 'Price/CTA',
        { x: 20, y: 85, width: 60, height: 6 },
        {
          placeholder: 'Starting at $999',
          style: { fontSize: 28, fontWeight: '700', textAlign: 'center', color: '#111827' }
        }
      ),
      createTextField('website', 'Website',
        { x: 25, y: 93, width: 50, height: 3 },
        {
          placeholder: 'www.yourproduct.com',
          style: { fontSize: 14, textAlign: 'center', color: '#6b7280' }
        }
      )
    ],
    tags: ['product', 'showcase', 'clean', 'minimal']
  },
  // Abstract Modern Banner
  {
    id: 'banner-abstract-modern',
    name: 'Abstract Modern',
    description: 'Artistic abstract design for creative brands',
    assetType: AssetType.Banner,
    category: 'universal',
    dimensions: createDimensions(33.5, 79, 0, 3),
    background: { type: 'image', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#2d2d2d', secondary: '#ffffff', accent: '#d4af37', text: '#ffffff', background: '#2d2d2d' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 10, y: 5, width: 30, height: 10 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 10, y: 20, width: 80, height: 15 }, { placeholder: 'Artistry in Motion', style: { fontSize: 64, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('subtext', 'Subtext', { x: 10, y: 38, width: 80, height: 8 }, { placeholder: 'Creative solutions for the modern age', style: { fontSize: 24, color: '#ffffff' } }),
      createTextField('website', 'Website', { x: 10, y: 90, width: 80, height: 4 }, { placeholder: 'www.creative.com', style: { fontSize: 18, color: '#ffffff' } })
    ],
    tags: ['banner', 'abstract', 'creative', 'modern']
  },
  // Minimalist Typographic Banner
  {
    id: 'banner-minimal-type',
    name: 'Minimalist Typographic',
    description: 'Clean design focused on bold typography',
    assetType: AssetType.Banner,
    category: 'universal',
    dimensions: createDimensions(33.5, 79, 0, 3),
    background: { type: 'solid', value: '#f3f4f6' },
    defaultFonts: { heading: 'Helvetica', body: 'Arial' },
    defaultColors: { primary: '#000000', secondary: '#9ca3af', accent: '#000000', text: '#000000', background: '#f3f4f6' },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createTextField('big-text', 'Big Text', { x: 5, y: 15, width: 90, height: 40 }, { placeholder: 'WE\nARE\nHERE', style: { fontSize: 120, fontWeight: '900', lineHeight: 0.9, color: '#000000' } }),
      createTextField('details', 'Details', { x: 5, y: 60, width: 90, height: 10 }, { placeholder: 'Join the revolution.', style: { fontSize: 24, color: '#4b5563' } }),
      createLogoField('logo', 'Logo', { x: 5, y: 85, width: 40, height: 10 }, { placeholder: 'Logo' })
    ],
    tags: ['banner', 'minimal', 'typography', 'clean']
  }
];

// ============= VENDOR-SPECIFIC BANNER TEMPLATES =============

export const FOUROVER_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'banner-4over-retractable-33x80',
    name: '4over Retractable 33x80',
    description: 'Optimized for 4over 33" x 80" retractable banner specifications',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: '4over',
    dimensions: {
      widthInches: 33.5,
      heightInches: 80,
      widthPx: 5025, // At 150 DPI
      heightPx: 12000,
      bleedInches: 0.5,
      safeZoneInches: 3, // 3" bottom clearance for stand
      orientation: 'portrait'
    },
    background: {
      type: 'solid',
      value: '#ffffff'
    },
    defaultFonts: {
      heading: 'Arial',
      body: 'Arial'
    },
    defaultColors: {
      primary: '#003366',
      secondary: '#0066cc',
      accent: '#ff6600',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 10, y: 3, width: 80, height: 8 },
        { 
          placeholder: 'Upload high-res logo (300+ DPI recommended)',
          vendorOverrides: {
            '4over': { y: 4 } // Account for 0.5" bleed
          }
        }
      ),
      createTextField('headline', 'Main Headline',
        { x: 5, y: 15, width: 90, height: 12 },
        {
          placeholder: 'Your Headline Here',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 8, y: 28, width: 84, height: 5 },
        {
          placeholder: 'Supporting message goes here',
          style: { fontSize: 24, textAlign: 'center', color: '#555555' }
        }
      ),
      createImageField('main-image', 'Main Image',
        { x: 5, y: 36, width: 90, height: 30 },
        { placeholder: 'Product or hero image' }
      ),
      createTextField('body', 'Body Text',
        { x: 8, y: 68, width: 84, height: 12 },
        {
          placeholder: 'Add your key selling points here. Keep text large enough to read from 6+ feet away.',
          style: { fontSize: 18, textAlign: 'center', lineHeight: 1.4 }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 15, y: 82, width: 70, height: 5 },
        {
          placeholder: 'Contact Us Today!',
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('contact', 'Contact Info',
        { x: 10, y: 89, width: 80, height: 4 },
        {
          placeholder: 'www.example.com | (555) 123-4567',
          style: { fontSize: 16, textAlign: 'center', color: '#666666' }
        }
      ),
      {
        id: 'bottom-safe-zone',
        type: 'shape',
        name: 'Stand Area (Do Not Place Content)',
        position: { x: 0, y: 96, width: 100, height: 4 },
        style: { backgroundColor: 'rgba(255,0,0,0.1)', borderStyle: 'dashed', borderColor: '#ff0000', borderWidth: 1 }
      }
    ],
    tags: ['4over', 'vendor', 'retractable', '33x80'],
    isSystemTemplate: true
  }
];

export const SIGNSCOM_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'banner-signscom-vinyl-3x6',
    name: 'Signs.com Vinyl 3x6 ft',
    description: 'Optimized for Signs.com 3ft x 6ft vinyl banner',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'signs-com',
    dimensions: {
      widthInches: 72, // 6 feet
      heightInches: 36, // 3 feet
      widthPx: 10800, // At 150 DPI
      heightPx: 5400,
      bleedInches: 0.5,
      safeZoneInches: 1,
      orientation: 'landscape'
    },
    background: {
      type: 'solid',
      value: '#1e40af'
    },
    defaultFonts: {
      heading: 'Impact',
      body: 'Arial'
    },
    defaultColors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#1e40af'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 3, y: 15, width: 15, height: 70 },
        { placeholder: 'Your logo' }
      ),
      createTextField('headline', 'Main Message',
        { x: 20, y: 20, width: 60, height: 35 },
        {
          placeholder: 'BIG SALE!',
          required: true,
          style: { fontSize: 120, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Details',
        { x: 20, y: 55, width: 60, height: 15 },
        {
          placeholder: 'Up to 50% Off Everything',
          style: { fontSize: 48, textAlign: 'center', color: '#fbbf24' }
        }
      ),
      createTextField('dates', 'Valid Dates',
        { x: 20, y: 75, width: 60, height: 10 },
        {
          placeholder: 'March 15-20, 2024',
          style: { fontSize: 28, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      {
        id: 'qr-code',
        type: 'qrcode',
        name: 'QR Code',
        position: { x: 82, y: 25, width: 15, height: 50 },
        placeholder: 'Website URL',
        style: { backgroundColor: '#ffffff', borderRadius: 8 }
      }
    ],
    tags: ['signs.com', 'vendor', 'vinyl', 'outdoor', '3x6'],
    isSystemTemplate: true
  }
];

// ============= FEATHER FLAG TEMPLATES =============

export const FEATHER_FLAG_TEMPLATES: EditableTemplate[] = [
  {
    id: 'feather-flag-minimal-mark', name: 'Minimal Mark Flag', description: 'Clean single-logo feather flag',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2, 7, 0.25, 0.5),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 20, y: 20, width: 60, height: 30 }, { placeholder: 'Logo', required: true }),
      createTextField('tagline', 'Tagline', { x: 10, y: 55, width: 80, height: 10 }, { placeholder: 'Your Event', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } })
    ],
    tags: ['feather-flag', 'outdoor', 'minimal', 'banner']
  },
  {
    id: 'feather-flag-bold-headline', name: 'Bold Headline Flag', description: 'Large text feather flag for visibility',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2, 7, 0.25, 0.5),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1e3a5f 0%, #0c2340 100%)' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#fbbf24', accent: '#fbbf24', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('headline', 'Headline', { x: 5, y: 8, width: 90, height: 25 }, { placeholder: 'WELCOME', required: true, style: { fontSize: 48, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 25, y: 38, width: 50, height: 20 }, { placeholder: 'Logo' }),
      createTextField('sub', 'Sub Text', { x: 10, y: 62, width: 80, height: 8 }, { placeholder: '2024 Conference', style: { fontSize: 14, textAlign: 'center', color: '#fbbf24' } })
    ],
    tags: ['feather-flag', 'outdoor', 'bold', 'headline', 'banner']
  },
  {
    id: 'feather-flag-directional', name: 'Directional Arrow Flag', description: 'Wayfinding feather flag with arrow',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2, 7, 0.25, 0.5),
    background: { type: 'solid', value: '#10b981' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#10b981', accent: '#ffffff', text: '#ffffff', background: '#10b981' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('arrow', 'Arrow', { x: 20, y: 10, width: 60, height: 20 }, { placeholder: '→', style: { fontSize: 72, textAlign: 'center', color: '#ffffff' } }),
      createTextField('label', 'Label', { x: 10, y: 35, width: 80, height: 15 }, { placeholder: 'REGISTRATION', required: true, style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 30, y: 55, width: 40, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['feather-flag', 'directional', 'wayfinding', 'outdoor', 'banner']
  },
  {
    id: 'feather-flag-sponsor', name: 'Sponsor Flag', description: 'Sponsor showcase feather flag',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2, 7, 0.25, 0.5),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#f8fafc', accent: '#3b82f6', text: '#1e3a5f', background: '#f8fafc' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('presented', 'Presented By', { x: 10, y: 8, width: 80, height: 6 }, { placeholder: 'PRESENTED BY', style: { fontSize: 10, textAlign: 'center', color: '#6b7280', letterSpacing: 2 } }),
      createLogoField('sponsor-logo', 'Sponsor Logo', { x: 15, y: 18, width: 70, height: 25 }, { placeholder: 'Sponsor logo', required: true }),
      { id: 'divider', type: 'divider' as any, name: 'Divider', position: { x: 20, y: 48, width: 60, height: 0.3 }, style: { backgroundColor: '#e5e7eb' } },
      createLogoField('event-logo', 'Event Logo', { x: 25, y: 55, width: 50, height: 18 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event Name', { x: 10, y: 76, width: 80, height: 8 }, { placeholder: 'Annual Conference 2024', style: { fontSize: 12, textAlign: 'center', color: '#1e3a5f' } })
    ],
    tags: ['feather-flag', 'sponsor', 'outdoor', 'banner']
  },
  {
    id: 'feather-flag-festival', name: 'Festival Pop Flag', description: 'Vibrant festival feather flag',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2, 7, 0.25, 0.5),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #e94560 0%, #764ba2 50%, #667eea 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#fbbf24', accent: '#fbbf24', text: '#ffffff', background: '#e94560' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('event', 'Event', { x: 5, y: 10, width: 90, height: 20 }, { placeholder: 'FEST\n2024', required: true, style: { fontSize: 42, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 } }),
      createLogoField('logo', 'Logo', { x: 25, y: 38, width: 50, height: 18 }, { placeholder: 'Logo' }),
      createTextField('dates', 'Dates', { x: 10, y: 60, width: 80, height: 8 }, { placeholder: 'AUG 15-18', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24' } }),
      createTextField('location', 'Location', { x: 10, y: 72, width: 80, height: 6 }, { placeholder: 'Central Park', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['feather-flag', 'festival', 'colorful', 'outdoor', 'banner']
  }
];

// ============= STAND-UP PILLAR BANNER TEMPLATES =============

export const PILLAR_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'pillar-corporate-vertical', name: 'Corporate Pillar', description: 'Professional stand-up pillar banner',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2.5, 6, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#3b82f6', text: '#1e3a5f', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 20, y: 5, width: 60, height: 15 }, { placeholder: 'Logo', required: true }),
      createTextField('headline', 'Headline', { x: 5, y: 25, width: 90, height: 15 }, { placeholder: 'Innovation\nSummit', style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f', lineHeight: 1.2 } }),
      createImageField('hero', 'Hero Image', { x: 5, y: 42, width: 90, height: 28 }, { placeholder: 'Event imagery' }),
      createTextField('cta', 'CTA', { x: 10, y: 74, width: 80, height: 8 }, { placeholder: 'Register Today', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' } }),
      createTextField('url', 'URL', { x: 15, y: 84, width: 70, height: 5 }, { placeholder: 'www.event.com', style: { fontSize: 12, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['pillar', 'banner', 'corporate', 'stand-up']
  },
  {
    id: 'pillar-tech-gradient', name: 'Tech Gradient Pillar', description: 'Modern gradient pillar banner',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2.5, 6, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #0a0a1a 0%, #1e1e5a 100%)' },
    defaultFonts: { heading: 'Space Grotesk', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#4f46e5', accent: '#a78bfa', text: '#ffffff', background: '#0a0a1a' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 5, width: 50, height: 12 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 5, y: 22, width: 90, height: 18 }, { placeholder: 'TECH\nCONF', required: true, style: { fontSize: 48, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1 } }),
      createTextField('year', 'Year', { x: 25, y: 42, width: 50, height: 8 }, { placeholder: '2024', style: { fontSize: 28, textAlign: 'center', color: '#a78bfa' } }),
      createTextField('date', 'Date', { x: 10, y: 55, width: 80, height: 6 }, { placeholder: 'September 12–14', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } }),
      createTextField('venue', 'Venue', { x: 10, y: 62, width: 80, height: 6 }, { placeholder: 'San Francisco, CA', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } }),
      { id: 'qr', type: 'qrcode' as any, name: 'QR Code', position: { x: 35, y: 72, width: 30, height: 18 }, placeholder: 'Registration URL', style: { backgroundColor: '#ffffff', borderRadius: 8 } }
    ],
    tags: ['pillar', 'banner', 'tech', 'gradient', 'stand-up']
  },
  {
    id: 'pillar-gala-premium', name: 'Gala Premium Pillar', description: 'Elegant gala pillar banner',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(2.5, 6, 0.125, 0.25),
    background: { type: 'solid', value: '#0d0d0d' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#c9a84c', secondary: '#0d0d0d', accent: '#f0d78c', text: '#c9a84c', background: '#0d0d0d' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('year', 'Year', { x: 20, y: 5, width: 60, height: 8 }, { placeholder: '2024', style: { fontSize: 16, textAlign: 'center', color: '#c9a84c', letterSpacing: 6 } }),
      createTextField('headline', 'Event Name', { x: 5, y: 15, width: 90, height: 20 }, { placeholder: 'Annual\nGala', required: true, style: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#c9a84c', lineHeight: 1.1 } }),
      { id: 'ornament', type: 'divider' as any, name: 'Ornament', position: { x: 30, y: 38, width: 40, height: 0.3 }, style: { backgroundColor: '#c9a84c' } },
      createLogoField('logo', 'Logo', { x: 25, y: 42, width: 50, height: 15 }, { placeholder: 'Logo' }),
      createTextField('date', 'Date & Venue', { x: 10, y: 60, width: 80, height: 10 }, { placeholder: 'December 14, 2024\nThe Grand Ballroom', style: { fontSize: 13, textAlign: 'center', color: 'rgba(201,168,76,0.7)', lineHeight: 1.5 } }),
      createTextField('dress', 'Dress Code', { x: 15, y: 78, width: 70, height: 5 }, { placeholder: 'Black Tie', style: { fontSize: 12, textAlign: 'center', color: '#c9a84c', letterSpacing: 3, textTransform: 'uppercase' } })
    ],
    tags: ['pillar', 'banner', 'gala', 'premium', 'stand-up']
  }
];

// ============= TABLE BANNER TEMPLATES =============

export const TABLE_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'table-banner-corporate', name: 'Corporate Table Banner', description: '6ft table throw banner',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(6, 2.5, 0.125, 0.25),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#1e3a5f', accent: '#3b82f6', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 15, width: 25, height: 70 }, { placeholder: 'Logo', required: true }),
      createTextField('name', 'Company', { x: 35, y: 20, width: 60, height: 25 }, { placeholder: 'Company Name', style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 35, y: 50, width: 60, height: 12 }, { placeholder: 'Your tagline here', style: { fontSize: 16, color: 'rgba(255,255,255,0.8)' } }),
      createTextField('url', 'Website', { x: 35, y: 68, width: 60, height: 8 }, { placeholder: 'www.company.com', style: { fontSize: 14, color: '#93c5fd' } })
    ],
    tags: ['table', 'banner', 'corporate', 'trade-show']
  },
  {
    id: 'table-banner-sponsor', name: 'Sponsor Table Banner', description: 'Multi-sponsor table display',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(6, 2.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 35, y: 10, width: 30, height: 25 }, { placeholder: 'Event logo', required: true }),
      createTextField('label', 'Label', { x: 25, y: 40, width: 50, height: 8 }, { placeholder: 'SPONSORED BY', style: { fontSize: 10, textAlign: 'center', color: '#6b7280', letterSpacing: 3 } }),
      createLogoField('s1', 'Sponsor 1', { x: 5, y: 55, width: 20, height: 20 }, { placeholder: 'Sponsor 1' }),
      createLogoField('s2', 'Sponsor 2', { x: 28, y: 55, width: 20, height: 20 }, { placeholder: 'Sponsor 2' }),
      createLogoField('s3', 'Sponsor 3', { x: 52, y: 55, width: 20, height: 20 }, { placeholder: 'Sponsor 3' }),
      createLogoField('s4', 'Sponsor 4', { x: 75, y: 55, width: 20, height: 20 }, { placeholder: 'Sponsor 4' })
    ],
    tags: ['table', 'banner', 'sponsor', 'trade-show']
  },
  {
    id: 'table-banner-registration', name: 'Registration Table', description: 'Registration desk table banner',
    assetType: AssetType.Banner, category: 'universal',
    dimensions: createDimensions(6, 2.5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#10b981', accent: '#ffffff', text: '#ffffff', background: '#10b981' },
    colorMode: 'CMYK', dpi: 150,
    fields: [
      createTextField('label', 'Label', { x: 25, y: 15, width: 50, height: 25 }, { placeholder: 'REGISTRATION', required: true, style: { fontSize: 42, fontWeight: '800', textAlign: 'center', color: '#ffffff', letterSpacing: 3 } }),
      createLogoField('logo', 'Logo', { x: 38, y: 48, width: 24, height: 18 }, { placeholder: 'Logo' }),
      createTextField('sub', 'Sub', { x: 20, y: 72, width: 60, height: 10 }, { placeholder: 'Check in here • Badge pickup', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.85)' } })
    ],
    tags: ['table', 'banner', 'registration', 'check-in']
  }
];

export const ALL_BANNER_TEMPLATES: EditableTemplate[] = [
  ...BANNER_TEMPLATES,
  ...FOUROVER_BANNER_TEMPLATES,
  ...SIGNSCOM_BANNER_TEMPLATES,
  ...FEATHER_FLAG_TEMPLATES,
  ...PILLAR_BANNER_TEMPLATES,
  ...TABLE_BANNER_TEMPLATES
];
