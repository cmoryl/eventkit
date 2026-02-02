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

export const ALL_BANNER_TEMPLATES: EditableTemplate[] = [
  ...BANNER_TEMPLATES,
  ...FOUROVER_BANNER_TEMPLATES,
  ...SIGNSCOM_BANNER_TEMPLATES
];
