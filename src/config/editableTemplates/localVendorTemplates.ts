// Local Print Vendor Templates - Staples, FedEx Office, UPS Store, Office Depot

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions
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
    fontFamily: 'Arial', // Safe font for local vendors
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
  acceptedFormats: ['png', 'jpg', 'pdf'],
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

// ============= STAPLES PRINT TEMPLATES =============

export const STAPLES_TEMPLATES: EditableTemplate[] = [
  // Staples Business Card
  {
    id: 'staples-business-card',
    name: 'Staples Business Card',
    description: 'Standard business card for Staples Print & Marketing Services',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'staples',
    dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#333333',
      accent: '#0066cc',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 10, width: 35, height: 30 },
        { placeholder: 'Logo (high-res PDF or PNG)' }
      ),
      createTextField('name', 'Full Name',
        { x: 5, y: 45, width: 90, height: 15 },
        {
          placeholder: 'John Smith',
          required: true,
          maxLength: 30,
          style: { fontSize: 14, fontWeight: 'bold' }
        }
      ),
      createTextField('title', 'Job Title',
        { x: 5, y: 58, width: 90, height: 10 },
        {
          placeholder: 'Marketing Director',
          maxLength: 35,
          style: { fontSize: 10, color: '#666666' }
        }
      ),
      createTextField('phone', 'Phone',
        { x: 5, y: 72, width: 45, height: 8 },
        {
          placeholder: '(555) 123-4567',
          style: { fontSize: 9 }
        }
      ),
      createTextField('email', 'Email',
        { x: 5, y: 82, width: 60, height: 8 },
        {
          placeholder: 'john@company.com',
          style: { fontSize: 9 }
        }
      ),
      createTextField('website', 'Website',
        { x: 55, y: 72, width: 40, height: 8 },
        {
          placeholder: 'www.company.com',
          style: { fontSize: 9, textAlign: 'right' }
        }
      )
    ],
    tags: ['staples', 'business-card', 'local'],
    isSystemTemplate: true
  },

  // Staples Poster 18x24
  {
    id: 'staples-poster-18x24',
    name: 'Staples Poster 18×24',
    description: 'Standard poster size for Staples large format printing',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'staples',
    dimensions: createDimensions(18, 24, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#1a1a1a',
      accent: '#0066cc',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 35, y: 5, width: 30, height: 12 },
        { placeholder: 'Company/Event logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 20, width: 90, height: 15 },
        {
          placeholder: 'EVENT TITLE',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createImageField('main-image', 'Main Image',
        { x: 10, y: 38, width: 80, height: 35 },
        { placeholder: 'Event photo or graphic' }
      ),
      createTextField('details', 'Event Details',
        { x: 10, y: 76, width: 80, height: 10 },
        {
          placeholder: 'Date • Time • Location',
          style: { fontSize: 24, textAlign: 'center' }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 88, width: 60, height: 8 },
        {
          placeholder: 'Register at www.event.com',
          style: { fontSize: 18, textAlign: 'center', color: '#0066cc' }
        }
      )
    ],
    tags: ['staples', 'poster', '18x24', 'large-format'],
    isSystemTemplate: true
  },

  // Staples Retractable Banner
  {
    id: 'staples-retractable-banner',
    name: 'Staples Retractable Banner',
    description: 'Pull-up banner stand for Staples (33" × 81")',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'staples',
    dimensions: {
      widthInches: 33,
      heightInches: 81,
      widthPx: 4950,
      heightPx: 12150,
      bleedInches: 0,
      safeZoneInches: 2, // 2" bottom for stand mechanism
      orientation: 'portrait'
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
      createLogoField('logo', 'Company Logo',
        { x: 20, y: 3, width: 60, height: 10 },
        { placeholder: 'Logo (white/light version)' }
      ),
      createTextField('headline', 'Main Message',
        { x: 5, y: 16, width: 90, height: 12 },
        {
          placeholder: 'Your Message Here',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Supporting Text',
        { x: 10, y: 30, width: 80, height: 6 },
        {
          placeholder: 'Brief description of your offering',
          style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createImageField('hero-image', 'Hero Image',
        { x: 5, y: 40, width: 90, height: 30 },
        { placeholder: 'Product or service image' }
      ),
      createTextField('bullet-1', 'Key Point 1',
        { x: 8, y: 73, width: 84, height: 4 },
        {
          placeholder: '✓ First benefit or feature',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('bullet-2', 'Key Point 2',
        { x: 8, y: 78, width: 84, height: 4 },
        {
          placeholder: '✓ Second benefit or feature',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('bullet-3', 'Key Point 3',
        { x: 8, y: 83, width: 84, height: 4 },
        {
          placeholder: '✓ Third benefit or feature',
          style: { fontSize: 20, color: '#ffffff' }
        }
      ),
      createTextField('contact', 'Contact Info',
        { x: 10, y: 90, width: 80, height: 4 },
        {
          placeholder: 'www.yoursite.com | (555) 123-4567',
          style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }
        }
      ),
      {
        id: 'stand-zone',
        type: 'shape',
        name: 'Stand Area (Keep Clear)',
        position: { x: 0, y: 96, width: 100, height: 4 },
        style: { backgroundColor: 'rgba(255,0,0,0.1)', borderStyle: 'dashed', borderColor: '#ff6666', borderWidth: 1 }
      }
    ],
    tags: ['staples', 'banner', 'retractable', 'pull-up'],
    isSystemTemplate: true
  },

  // Staples Table Tent
  {
    id: 'staples-table-tent',
    name: 'Staples Table Tent',
    description: 'Folded table tent for Staples printing',
    assetType: AssetType.TableTent,
    category: 'vendor-specific',
    vendorId: 'staples',
    dimensions: createDimensions(4, 6, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#cc0000',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 30, y: 5, width: 40, height: 15 },
        { placeholder: 'Logo' }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 25, width: 90, height: 15 },
        {
          placeholder: 'MENU SPECIAL',
          required: true,
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createImageField('image', 'Featured Image',
        { x: 10, y: 42, width: 80, height: 30 },
        { placeholder: 'Product or promo image' }
      ),
      createTextField('description', 'Description',
        { x: 10, y: 75, width: 80, height: 12 },
        {
          placeholder: 'Brief description of your special offer',
          style: { fontSize: 12, textAlign: 'center', lineHeight: 1.4 }
        }
      ),
      createTextField('price', 'Price/CTA',
        { x: 25, y: 90, width: 50, height: 8 },
        {
          placeholder: '$9.99',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#cc0000' }
        }
      )
    ],
    tags: ['staples', 'table-tent', 'menu'],
    isSystemTemplate: true
  }
];

// ============= FEDEX OFFICE TEMPLATES =============

export const FEDEX_OFFICE_TEMPLATES: EditableTemplate[] = [
  // FedEx Office Poster 24x36
  {
    id: 'fedex-poster-24x36',
    name: 'FedEx Office Poster 24×36',
    description: 'Engineering print poster for FedEx Office',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'fedex-office',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#4d148c', // FedEx purple
      secondary: '#ff6600', // FedEx orange
      accent: '#ffffff',
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
        position: { x: 0, y: 0, width: 100, height: 15 },
        style: { backgroundColor: '#4d148c' }
      },
      createLogoField('logo', 'Logo',
        { x: 5, y: 2, width: 25, height: 11 },
        { placeholder: 'Logo (white version)' }
      ),
      createTextField('event-type', 'Event Type',
        { x: 40, y: 4, width: 55, height: 7 },
        {
          placeholder: 'COMPANY EVENT',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', color: '#ffffff', letterSpacing: 2 }
        }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 20, width: 90, height: 12 },
        {
          placeholder: 'Main Event Title',
          required: true,
          style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#4d148c' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 10, y: 33, width: 80, height: 6 },
        {
          placeholder: 'Supporting tagline or description',
          style: { fontSize: 20, textAlign: 'center', color: '#666666' }
        }
      ),
      createImageField('main-image', 'Main Image',
        { x: 5, y: 42, width: 90, height: 35 },
        { placeholder: 'Event photo or promotional image' }
      ),
      createTextField('date', 'Date & Time',
        { x: 10, y: 80, width: 80, height: 6 },
        {
          placeholder: 'Saturday, March 15, 2024 | 6:00 PM',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('location', 'Location',
        { x: 10, y: 87, width: 80, height: 5 },
        {
          placeholder: 'Convention Center, 123 Main Street',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 25, y: 93, width: 50, height: 5 },
        {
          placeholder: 'RSVP at www.event.com',
          style: { fontSize: 12, textAlign: 'center', color: '#ff6600', fontWeight: 'bold' }
        }
      )
    ],
    tags: ['fedex', 'poster', '24x36', 'large-format'],
    isSystemTemplate: true
  },

  // FedEx Office Yard Sign
  {
    id: 'fedex-yard-sign-18x24',
    name: 'FedEx Office Yard Sign',
    description: 'Corrugated plastic yard sign 18×24',
    assetType: AssetType.OutdoorSignage,
    category: 'vendor-specific',
    vendorId: 'fedex-office',
    dimensions: createDimensions(18, 24, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e40af',
      secondary: '#ffffff',
      accent: '#ef4444',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      {
        id: 'top-bar',
        type: 'shape',
        name: 'Top Bar',
        position: { x: 0, y: 0, width: 100, height: 20 },
        style: { backgroundColor: '#1e40af' }
      },
      createTextField('headline', 'Main Message',
        { x: 5, y: 3, width: 90, height: 14 },
        {
          placeholder: 'OPEN HOUSE',
          required: true,
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('date', 'Date',
        { x: 10, y: 25, width: 80, height: 15 },
        {
          placeholder: 'SUNDAY 2-4 PM',
          style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1e40af' }
        }
      ),
      createImageField('image', 'Property/Product Image',
        { x: 10, y: 42, width: 80, height: 30 },
        { placeholder: 'Featured image' }
      ),
      createTextField('details', 'Key Details',
        { x: 10, y: 75, width: 80, height: 10 },
        {
          placeholder: '3 BR | 2 BA | 2,000 sq ft',
          style: { fontSize: 18, textAlign: 'center' }
        }
      ),
      createLogoField('logo', 'Company Logo',
        { x: 30, y: 87, width: 40, height: 10 },
        { placeholder: 'Your logo' }
      )
    ],
    tags: ['fedex', 'yard-sign', 'outdoor', 'corrugated'],
    isSystemTemplate: true
  },

  // FedEx Office Banner 3x6
  {
    id: 'fedex-vinyl-banner-3x6',
    name: 'FedEx Office Vinyl Banner 3×6 ft',
    description: 'Outdoor vinyl banner with grommets',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'fedex-office',
    dimensions: {
      widthInches: 72,
      heightInches: 36,
      widthPx: 10800,
      heightPx: 5400,
      bleedInches: 1, // 1" for hem/grommet area
      safeZoneInches: 2,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 3, y: 15, width: 15, height: 70 },
        { placeholder: 'Logo (white)' }
      ),
      createTextField('headline', 'Main Message',
        { x: 20, y: 15, width: 60, height: 40 },
        {
          placeholder: 'GRAND OPENING',
          required: true,
          style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Details',
        { x: 20, y: 55, width: 60, height: 15 },
        {
          placeholder: 'Join Us Saturday, March 15th',
          style: { fontSize: 36, textAlign: 'center', color: '#fbbf24' }
        }
      ),
      createTextField('location', 'Location/Contact',
        { x: 20, y: 75, width: 60, height: 10 },
        {
          placeholder: '123 Main Street | www.business.com',
          style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      {
        id: 'grommet-zone-left',
        type: 'shape',
        name: 'Grommet Zone',
        position: { x: 0, y: 0, width: 3, height: 100 },
        style: { backgroundColor: 'rgba(255,0,0,0.1)', borderStyle: 'dashed', borderColor: '#ff6666', borderWidth: 1 }
      },
      {
        id: 'grommet-zone-right',
        type: 'shape',
        name: 'Grommet Zone',
        position: { x: 97, y: 0, width: 3, height: 100 },
        style: { backgroundColor: 'rgba(255,0,0,0.1)', borderStyle: 'dashed', borderColor: '#ff6666', borderWidth: 1 }
      }
    ],
    tags: ['fedex', 'banner', 'vinyl', 'outdoor', '3x6'],
    isSystemTemplate: true
  },

  // FedEx Office Door Sign
  {
    id: 'fedex-door-sign-8x10',
    name: 'FedEx Office Door Sign',
    description: 'Mounted foam board door sign 8×10',
    assetType: AssetType.DoorSignage,
    category: 'vendor-specific',
    vendorId: 'fedex-office',
    dimensions: createDimensions(8, 10, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#4d148c',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'header',
        type: 'shape',
        name: 'Header Bar',
        position: { x: 0, y: 0, width: 100, height: 18 },
        style: { backgroundColor: '#4d148c' }
      },
      createLogoField('logo', 'Logo',
        { x: 5, y: 3, width: 25, height: 12 },
        { placeholder: 'Logo (white)' }
      ),
      createTextField('room-name', 'Room/Office Name',
        { x: 5, y: 25, width: 90, height: 18 },
        {
          placeholder: 'Conference Room A',
          required: true,
          style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('capacity', 'Capacity',
        { x: 5, y: 45, width: 90, height: 8 },
        {
          placeholder: 'Capacity: 12',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      ),
      {
        id: 'divider',
        type: 'divider',
        name: 'Divider',
        position: { x: 20, y: 56, width: 60, height: 0.5 },
        style: { backgroundColor: '#e5e7eb' }
      },
      createTextField('amenities', 'Amenities',
        { x: 10, y: 62, width: 80, height: 20 },
        {
          placeholder: '• Video conferencing\n• Whiteboard\n• Phone line',
          style: { fontSize: 11, lineHeight: 1.6 }
        }
      ),
      createTextField('booking-info', 'Booking Info',
        { x: 10, y: 85, width: 80, height: 10 },
        {
          placeholder: 'Book at reception or ext. 100',
          style: { fontSize: 10, textAlign: 'center', color: '#4d148c' }
        }
      )
    ],
    tags: ['fedex', 'door-sign', 'foam-board', 'office'],
    isSystemTemplate: true
  }
];

// ============= UPS STORE TEMPLATES =============

export const UPS_STORE_TEMPLATES: EditableTemplate[] = [
  // UPS Store Flyer
  {
    id: 'ups-flyer-8x11',
    name: 'UPS Store Flyer 8.5×11',
    description: 'Standard letter-size flyer for UPS Store printing',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'ups-store',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#351c15', // UPS brown
      secondary: '#ffb500', // UPS yellow
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 35, y: 3, width: 30, height: 10 },
        { placeholder: 'Company/Event logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 16, width: 90, height: 12 },
        {
          placeholder: 'Special Announcement',
          required: true,
          style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 10, y: 29, width: 80, height: 6 },
        {
          placeholder: 'Supporting information goes here',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      ),
      createImageField('main-image', 'Main Image',
        { x: 10, y: 38, width: 80, height: 30 },
        { placeholder: 'Event or product image' }
      ),
      createTextField('body', 'Body Text',
        { x: 10, y: 70, width: 80, height: 15 },
        {
          placeholder: 'Add your main message here. Include key details about your event, product, or service.',
          style: { fontSize: 11, textAlign: 'center', lineHeight: 1.5 }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 87, width: 60, height: 6 },
        {
          placeholder: 'Call (555) 123-4567 or visit www.site.com',
          style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#351c15' }
        }
      ),
      {
        id: 'footer-bar',
        type: 'shape',
        name: 'Footer',
        position: { x: 0, y: 94, width: 100, height: 6 },
        style: { backgroundColor: '#ffb500' }
      }
    ],
    tags: ['ups', 'flyer', '8.5x11', 'letter'],
    isSystemTemplate: true
  },

  // UPS Store Postcard
  {
    id: 'ups-postcard-4x6',
    name: 'UPS Store Postcard 4×6',
    description: 'Standard postcard for UPS Store printing',
    assetType: AssetType.InvitationCard,
    category: 'vendor-specific',
    vendorId: 'ups-store',
    dimensions: createDimensions(6, 4, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#351c15',
      secondary: '#ffb500',
      accent: '#1a1a1a',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createImageField('image', 'Main Image',
        { x: 0, y: 0, width: 50, height: 100 },
        { placeholder: 'Photo or graphic' }
      ),
      createLogoField('logo', 'Logo',
        { x: 55, y: 5, width: 40, height: 15 },
        { placeholder: 'Logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 52, y: 25, width: 45, height: 20 },
        {
          placeholder: 'You\'re Invited!',
          required: true,
          style: { fontSize: 20, fontWeight: 'bold' }
        }
      ),
      createTextField('details', 'Details',
        { x: 52, y: 48, width: 45, height: 30 },
        {
          placeholder: 'Event Name\nDate & Time\nLocation',
          style: { fontSize: 10, lineHeight: 1.6 }
        }
      ),
      createTextField('cta', 'RSVP/CTA',
        { x: 52, y: 82, width: 45, height: 12 },
        {
          placeholder: 'RSVP: (555) 123-4567',
          style: { fontSize: 10, fontWeight: 'bold', color: '#351c15' }
        }
      )
    ],
    tags: ['ups', 'postcard', '4x6'],
    isSystemTemplate: true
  }
];

// ============= OFFICE DEPOT TEMPLATES =============

export const OFFICE_DEPOT_TEMPLATES: EditableTemplate[] = [
  // Office Depot Tri-Fold Brochure
  {
    id: 'officedepot-trifold-brochure',
    name: 'Office Depot Tri-Fold Brochure',
    description: 'Letter-size tri-fold brochure (outside panels)',
    assetType: AssetType.ProgramBooklet,
    category: 'vendor-specific',
    vendorId: 'office-depot',
    dimensions: createDimensions(11, 8.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000', // Office Depot red
      secondary: '#1a1a1a',
      accent: '#666666',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      // Front Panel (right third)
      {
        id: 'front-bg',
        type: 'shape',
        name: 'Front Panel BG',
        position: { x: 67, y: 0, width: 33, height: 100 },
        style: { backgroundColor: '#cc0000' }
      },
      createLogoField('logo', 'Logo',
        { x: 72, y: 15, width: 23, height: 20 },
        { placeholder: 'Logo (white)' }
      ),
      createTextField('title', 'Title',
        { x: 68, y: 40, width: 30, height: 20 },
        {
          placeholder: 'Company\nBrochure',
          style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', lineHeight: 1.2 }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 68, y: 65, width: 30, height: 10 },
        {
          placeholder: 'Your tagline here',
          style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createTextField('contact', 'Contact',
        { x: 68, y: 85, width: 30, height: 10 },
        {
          placeholder: 'www.company.com\n(555) 123-4567',
          style: { fontSize: 9, textAlign: 'center', color: '#ffffff', lineHeight: 1.4 }
        }
      ),
      
      // Back Panel (left third)
      createTextField('back-headline', 'Back Headline',
        { x: 2, y: 10, width: 30, height: 10 },
        {
          placeholder: 'Contact Us',
          style: { fontSize: 18, fontWeight: 'bold' }
        }
      ),
      createTextField('address', 'Address',
        { x: 2, y: 25, width: 30, height: 25 },
        {
          placeholder: 'Company Name\n123 Main Street\nCity, State 12345',
          style: { fontSize: 10, lineHeight: 1.5 }
        }
      ),
      {
        id: 'qr-code',
        type: 'qrcode',
        name: 'QR Code',
        position: { x: 8, y: 55, width: 18, height: 30 },
        placeholder: 'Website URL',
        style: {}
      },
      
      // Inside Flap (middle third)
      createTextField('flap-headline', 'Inside Flap',
        { x: 35, y: 10, width: 30, height: 8 },
        {
          placeholder: 'Our Services',
          style: { fontSize: 16, fontWeight: 'bold' }
        }
      ),
      createTextField('flap-content', 'Content',
        { x: 35, y: 22, width: 30, height: 70 },
        {
          placeholder: '• Service One\n• Service Two\n• Service Three\n• Service Four',
          style: { fontSize: 10, lineHeight: 1.8 }
        }
      )
    ],
    tags: ['office-depot', 'brochure', 'tri-fold'],
    isSystemTemplate: true
  },

  // Office Depot Name Badge
  {
    id: 'officedepot-name-badge',
    name: 'Office Depot Name Badge',
    description: 'Standard name badge insert 4×3',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'office-depot',
    dimensions: createDimensions(4, 3, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#1a1a1a',
      accent: '#666666',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'header',
        type: 'shape',
        name: 'Header',
        position: { x: 0, y: 0, width: 100, height: 22 },
        style: { backgroundColor: '#cc0000' }
      },
      createLogoField('logo', 'Logo',
        { x: 5, y: 3, width: 25, height: 16 },
        { placeholder: 'Logo (white)' }
      ),
      createTextField('company', 'Company/Event',
        { x: 35, y: 5, width: 60, height: 12 },
        {
          placeholder: 'Company Name',
          style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#ffffff' }
        }
      ),
      createTextField('name', 'Name',
        { x: 5, y: 30, width: 90, height: 25 },
        {
          placeholder: 'Jane Smith',
          required: true,
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 58, width: 90, height: 12 },
        {
          placeholder: 'Job Title',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      ),
      createTextField('department', 'Department/Team',
        { x: 5, y: 75, width: 90, height: 12 },
        {
          placeholder: 'Department',
          style: { fontSize: 12, textAlign: 'center' }
        }
      )
    ],
    tags: ['office-depot', 'name-badge', 'insert'],
    isSystemTemplate: true
  }
];

// ============= GENERIC LOCAL PRINT SHOP TEMPLATES =============

export const LOCAL_PRINTSHOP_TEMPLATES: EditableTemplate[] = [
  // Generic Professional Specs - Business Card
  {
    id: 'local-business-card-standard',
    name: 'Local Print - Business Card',
    description: 'Industry-standard business card specs for any local printer',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'local-print-shop',
    dimensions: createDimensions(3.5, 2, 0.125, 0.125),
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
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 5, y: 8, width: 30, height: 25 },
        { placeholder: 'Logo (CMYK, 300 DPI)' }
      ),
      createTextField('name', 'Name',
        { x: 5, y: 40, width: 90, height: 15 },
        {
          placeholder: 'Full Name',
          required: true,
          style: { fontSize: 14, fontWeight: 'bold' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 55, width: 90, height: 10 },
        {
          placeholder: 'Job Title',
          style: { fontSize: 10, color: '#666666' }
        }
      ),
      createTextField('contact', 'Contact Info',
        { x: 5, y: 70, width: 90, height: 22 },
        {
          placeholder: 'phone@email.com | (555) 123-4567\nwww.website.com',
          style: { fontSize: 9, lineHeight: 1.5 }
        }
      )
    ],
    tags: ['local', 'business-card', 'standard'],
    isSystemTemplate: true
  },

  // Generic Professional Specs - Poster
  {
    id: 'local-poster-11x17',
    name: 'Local Print - Poster 11×17',
    description: 'Tabloid-size poster for any local printer',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'local-print-shop',
    dimensions: createDimensions(11, 17, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 35, y: 3, width: 30, height: 10 },
        { placeholder: 'Logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 16, width: 90, height: 12 },
        {
          placeholder: 'Event Title',
          required: true,
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 10, y: 29, width: 80, height: 6 },
        {
          placeholder: 'Event tagline or description',
          style: { fontSize: 16, textAlign: 'center', color: '#666666' }
        }
      ),
      createImageField('image', 'Main Image',
        { x: 5, y: 38, width: 90, height: 35 },
        { placeholder: 'Event image' }
      ),
      createTextField('details', 'Details',
        { x: 10, y: 76, width: 80, height: 12 },
        {
          placeholder: 'Date: Saturday, March 15\nTime: 6:00 PM\nLocation: Main Hall',
          style: { fontSize: 14, textAlign: 'center', lineHeight: 1.6 }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 92, width: 60, height: 5 },
        {
          placeholder: 'www.event.com | (555) 123-4567',
          style: { fontSize: 12, textAlign: 'center', fontWeight: 'bold' }
        }
      )
    ],
    tags: ['local', 'poster', '11x17', 'tabloid'],
    isSystemTemplate: true
  },

  // Generic Large Format Banner
  {
    id: 'local-banner-2x4',
    name: 'Local Print - Banner 2×4 ft',
    description: 'Standard vinyl banner for local print shops',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'local-print-shop',
    dimensions: {
      widthInches: 48,
      heightInches: 24,
      widthPx: 7200,
      heightPx: 3600,
      bleedInches: 0.5,
      safeZoneInches: 1,
      orientation: 'landscape'
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
        { x: 3, y: 15, width: 20, height: 70 },
        { placeholder: 'Logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 25, y: 20, width: 55, height: 30 },
        {
          placeholder: 'MAIN MESSAGE',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 25, y: 55, width: 55, height: 15 },
        {
          placeholder: 'Supporting text here',
          style: { fontSize: 28, textAlign: 'center', color: '#fbbf24' }
        }
      ),
      createTextField('contact', 'Contact',
        { x: 25, y: 75, width: 55, height: 10 },
        {
          placeholder: 'www.business.com',
          style: { fontSize: 20, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      ),
      {
        id: 'qr-code',
        type: 'qrcode',
        name: 'QR Code',
        position: { x: 82, y: 20, width: 15, height: 60 },
        placeholder: 'Website URL',
        style: { backgroundColor: '#ffffff', borderRadius: 8 }
      }
    ],
    tags: ['local', 'banner', '2x4', 'vinyl'],
    isSystemTemplate: true
  }
];

// Export all local vendor templates
export const ALL_LOCAL_VENDOR_TEMPLATES: EditableTemplate[] = [
  ...STAPLES_TEMPLATES,
  ...FEDEX_OFFICE_TEMPLATES,
  ...UPS_STORE_TEMPLATES,
  ...OFFICE_DEPOT_TEMPLATES,
  ...LOCAL_PRINTSHOP_TEMPLATES
];
