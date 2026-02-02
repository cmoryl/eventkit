// Name Tag / Badge Templates

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

// ============= UNIVERSAL NAME TAG TEMPLATES =============

export const NAME_TAG_TEMPLATES: EditableTemplate[] = [
  // Corporate Modern - Clean professional design
  {
    id: 'nametag-corporate-modern',
    name: 'Corporate Modern',
    description: 'Clean, professional name tag with logo header and modern typography',
    assetType: AssetType.NameTag,
    category: 'universal',
    dimensions: createDimensions(4, 3, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#ffffff'
    },
    defaultFonts: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    defaultColors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo', 
        { x: 5, y: 5, width: 30, height: 20 },
        { placeholder: 'Upload your logo' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 40, y: 8, width: 55, height: 12 },
        { 
          placeholder: 'ANNUAL CONFERENCE 2024',
          style: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1 }
        }
      ),
      createTextField('attendee-name', 'Attendee Name',
        { x: 5, y: 35, width: 90, height: 20 },
        { 
          placeholder: 'Jane Smith',
          required: true,
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('title', 'Title/Role',
        { x: 5, y: 55, width: 90, height: 12 },
        { 
          placeholder: 'Senior Marketing Director',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      ),
      createTextField('company', 'Company',
        { x: 5, y: 68, width: 90, height: 12 },
        { 
          placeholder: 'Acme Corporation',
          style: { fontSize: 16, fontWeight: '600', textAlign: 'center' }
        }
      ),
      {
        id: 'accent-bar',
        type: 'shape',
        name: 'Accent Bar',
        position: { x: 0, y: 85, width: 100, height: 15 },
        style: { backgroundColor: '#2563eb' }
      }
    ],
    tags: ['corporate', 'modern', 'professional', 'clean']
  },

  // Creative Bold - Vibrant modern design
  {
    id: 'nametag-creative-bold',
    name: 'Creative Bold',
    description: 'Eye-catching design with bold colors and dynamic layout',
    assetType: AssetType.NameTag,
    category: 'universal',
    dimensions: createDimensions(4, 3, 0.125, 0.125),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo', 
        { x: 70, y: 5, width: 25, height: 18 },
        { placeholder: 'Upload your logo', style: { opacity: 0.9 } }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 5, width: 60, height: 12 },
        { 
          placeholder: 'DESIGN SUMMIT',
          style: { fontSize: 12, fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2 }
        }
      ),
      {
        id: 'name-bg',
        type: 'shape',
        name: 'Name Background',
        position: { x: 0, y: 28, width: 100, height: 35 },
        style: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 0 }
      },
      createTextField('attendee-name', 'Attendee Name',
        { x: 5, y: 32, width: 90, height: 18 },
        { 
          placeholder: 'ALEX RIVERA',
          required: true,
          style: { fontSize: 26, fontWeight: '800', textAlign: 'center', color: '#1a1a1a', textTransform: 'uppercase' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 50, width: 90, height: 10 },
        { 
          placeholder: 'Creative Director',
          style: { fontSize: 12, textAlign: 'center', color: '#6b7280' }
        }
      ),
      createTextField('company', 'Company',
        { x: 5, y: 70, width: 90, height: 12 },
        { 
          placeholder: 'Studio Creative Co.',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('tagline', 'Event Tagline',
        { x: 5, y: 88, width: 90, height: 8 },
        { 
          placeholder: '#DesignSummit2024',
          style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }
        }
      )
    ],
    tags: ['creative', 'bold', 'gradient', 'modern']
  },

  // Minimalist Elegant - Sophisticated understated design
  {
    id: 'nametag-minimalist-elegant',
    name: 'Minimalist Elegant',
    description: 'Sophisticated design with refined typography and subtle details',
    assetType: AssetType.NameTag,
    category: 'universal',
    dimensions: createDimensions(4, 3, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#fafafa'
    },
    defaultFonts: {
      heading: 'Playfair Display',
      body: 'Lato'
    },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#374151',
      accent: '#d4af37',
      text: '#1a1a1a',
      background: '#fafafa'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'top-line',
        type: 'divider',
        name: 'Top Accent Line',
        position: { x: 10, y: 8, width: 80, height: 0.5 },
        style: { backgroundColor: '#d4af37' }
      },
      createLogoField('logo', 'Company Logo', 
        { x: 35, y: 12, width: 30, height: 15 },
        { placeholder: 'Upload your logo' }
      ),
      createTextField('attendee-name', 'Attendee Name',
        { x: 5, y: 35, width: 90, height: 20 },
        { 
          placeholder: 'Victoria Hamilton',
          required: true,
          style: { fontSize: 24, fontWeight: 'normal', textAlign: 'center', fontStyle: 'italic' }
        }
      ),
      {
        id: 'middle-line',
        type: 'divider',
        name: 'Divider',
        position: { x: 35, y: 56, width: 30, height: 0.3 },
        style: { backgroundColor: '#d4d4d4' }
      },
      createTextField('title', 'Title',
        { x: 5, y: 62, width: 90, height: 10 },
        { 
          placeholder: 'Chief Executive Officer',
          style: { fontSize: 11, textAlign: 'center', color: '#6b7280', letterSpacing: 0.5 }
        }
      ),
      createTextField('company', 'Company',
        { x: 5, y: 74, width: 90, height: 12 },
        { 
          placeholder: 'Hamilton & Associates',
          style: { fontSize: 13, fontWeight: '500', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }
        }
      ),
      {
        id: 'bottom-line',
        type: 'divider',
        name: 'Bottom Accent Line',
        position: { x: 10, y: 92, width: 80, height: 0.5 },
        style: { backgroundColor: '#d4af37' }
      }
    ],
    tags: ['minimalist', 'elegant', 'sophisticated', 'formal']
  },

  // Tech Conference - Modern tech-focused design
  {
    id: 'nametag-tech-conference',
    name: 'Tech Conference',
    description: 'Modern design for technology events with QR code integration',
    assetType: AssetType.NameTag,
    category: 'universal',
    dimensions: createDimensions(4, 3, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#0f172a'
    },
    defaultFonts: {
      heading: 'JetBrains Mono',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#22d3ee',
      secondary: '#8b5cf6',
      accent: '#10b981',
      text: '#ffffff',
      background: '#0f172a'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Event Logo', 
        { x: 5, y: 5, width: 25, height: 18 },
        { placeholder: 'Event logo' }
      ),
      createTextField('event-name', 'Event Name',
        { x: 32, y: 8, width: 45, height: 12 },
        { 
          placeholder: 'DEVCON 2024',
          style: { fontSize: 14, fontWeight: 'bold', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: 2 }
        }
      ),
      {
        id: 'qr-code',
        type: 'qrcode',
        name: 'Contact QR Code',
        position: { x: 78, y: 3, width: 18, height: 24 },
        placeholder: 'LinkedIn or contact URL',
        style: { backgroundColor: '#ffffff', borderRadius: 4 }
      },
      createTextField('attendee-name', 'Attendee Name',
        { x: 5, y: 35, width: 90, height: 18 },
        { 
          placeholder: 'Sarah Chen',
          required: true,
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'left', color: '#ffffff' }
        }
      ),
      createTextField('handle', 'Social Handle',
        { x: 5, y: 53, width: 90, height: 10 },
        { 
          placeholder: '@sarahcodes',
          style: { fontSize: 14, color: '#22d3ee' }
        }
      ),
      createTextField('title', 'Role',
        { x: 5, y: 66, width: 90, height: 10 },
        { 
          placeholder: 'Senior Software Engineer',
          style: { fontSize: 12, color: '#94a3b8' }
        }
      ),
      createTextField('company', 'Company',
        { x: 5, y: 78, width: 50, height: 10 },
        { 
          placeholder: 'TechCorp',
          style: { fontSize: 12, fontWeight: '600', color: '#e2e8f0' }
        }
      ),
      {
        id: 'badge-type',
        type: 'text',
        name: 'Badge Type',
        position: { x: 70, y: 78, width: 25, height: 10 },
        placeholder: 'SPEAKER',
        style: { 
          fontSize: 10, 
          fontWeight: 'bold', 
          textAlign: 'center', 
          color: '#0f172a',
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      },
      {
        id: 'accent-line',
        type: 'shape',
        name: 'Bottom Gradient',
        position: { x: 0, y: 92, width: 100, height: 8 },
        style: { backgroundColor: 'linear-gradient(90deg, #22d3ee, #8b5cf6, #10b981)' }
      }
    ],
    tags: ['tech', 'conference', 'developer', 'modern', 'qr-code']
  }
];

// ============= VENDOR-SPECIFIC NAME TAG TEMPLATES =============

export const VISTAPRINT_NAMETAG_TEMPLATES: EditableTemplate[] = [
  {
    id: 'nametag-vistaprint-standard',
    name: 'Vistaprint Standard Badge',
    description: 'Optimized for Vistaprint standard name badge printing',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'vistaprint',
    dimensions: createDimensions(4, 3, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#ffffff'
    },
    defaultFonts: {
      heading: 'Arial',
      body: 'Arial'
    },
    defaultColors: {
      primary: '#003087',
      secondary: '#0066cc',
      accent: '#ff6600',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'header-bar',
        type: 'shape',
        name: 'Header Bar',
        position: { x: 0, y: 0, width: 100, height: 25 },
        style: { backgroundColor: '#003087' }
      },
      createLogoField('logo', 'Company Logo', 
        { x: 5, y: 3, width: 25, height: 19 },
        { 
          placeholder: 'Your logo here',
          vendorOverrides: {
            vistaprint: { width: 23 } // Slightly smaller for Vistaprint's margin requirements
          }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 35, y: 7, width: 60, height: 12 },
        { 
          placeholder: 'COMPANY EVENT 2024',
          style: { fontSize: 12, fontWeight: 'bold', color: '#ffffff', textAlign: 'right', textTransform: 'uppercase' }
        }
      ),
      createTextField('attendee-name', 'Attendee Name',
        { x: 5, y: 32, width: 90, height: 22 },
        { 
          placeholder: 'John Smith',
          required: true,
          maxLength: 25, // Vistaprint character limit for clean printing
          style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 55, width: 90, height: 12 },
        { 
          placeholder: 'Job Title',
          maxLength: 35,
          style: { fontSize: 14, textAlign: 'center', color: '#555555' }
        }
      ),
      createTextField('company', 'Company',
        { x: 5, y: 70, width: 90, height: 14 },
        { 
          placeholder: 'Company Name',
          maxLength: 30,
          style: { fontSize: 16, fontWeight: '600', textAlign: 'center' }
        }
      )
    ],
    tags: ['vistaprint', 'vendor', 'standard', 'badge'],
    isSystemTemplate: true
  }
];

export const ALL_NAMETAG_TEMPLATES: EditableTemplate[] = [
  ...NAME_TAG_TEMPLATES,
  ...VISTAPRINT_NAMETAG_TEMPLATES
];
