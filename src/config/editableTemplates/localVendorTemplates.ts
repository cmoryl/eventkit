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

// ============= COSTCO PRINT TEMPLATES =============

export const COSTCO_PRINT_TEMPLATES: EditableTemplate[] = [
  // Costco Photo Print 8x10
  {
    id: 'costco-photo-8x10',
    name: 'Costco Photo Print 8×10',
    description: 'Standard photo print size for Costco Photo Center',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'costco-print',
    dimensions: createDimensions(10, 8, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e31837', // Costco red
      secondary: '#003da5', // Costco blue
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Upload high-resolution photo (300+ DPI)',
          required: true,
          style: { objectFit: 'cover' }
        }
      )
    ],
    tags: ['costco', 'photo', '8x10', 'print'],
    isSystemTemplate: true
  },

  // Costco Photo Canvas 16x20
  {
    id: 'costco-canvas-16x20',
    name: 'Costco Photo Canvas 16×20',
    description: 'Gallery-wrapped canvas print for Costco Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'costco-print',
    dimensions: {
      widthInches: 20,
      heightInches: 16,
      widthPx: 6000,
      heightPx: 4800,
      bleedInches: 1.5, // Canvas wrap
      safeZoneInches: 1.5,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e31837',
      secondary: '#003da5',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Canvas Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Photo for canvas (1.5" wrap area on edges)',
          required: true,
          style: { objectFit: 'cover' }
        }
      ),
      {
        id: 'wrap-zone',
        type: 'shape',
        name: 'Canvas Wrap Zone (Content extends to edges)',
        position: { x: 0, y: 0, width: 100, height: 100 },
        style: { 
          borderStyle: 'dashed', 
          borderColor: 'rgba(255,0,0,0.3)', 
          borderWidth: 2,
          backgroundColor: 'transparent'
        }
      }
    ],
    tags: ['costco', 'canvas', '16x20', 'gallery'],
    isSystemTemplate: true
  },

  // Costco Photo Poster 20x30
  {
    id: 'costco-poster-20x30',
    name: 'Costco Photo Poster 20×30',
    description: 'Large format photo poster for Costco Photo Center',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'costco-print',
    dimensions: createDimensions(20, 30, 0, 0.25, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#e31837',
      secondary: '#003da5',
      accent: '#fbbf24',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 35, y: 3, width: 30, height: 10 },
        { placeholder: 'Event/Company logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 16, width: 90, height: 12 },
        {
          placeholder: 'EVENT TITLE',
          required: true,
          style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createImageField('main-image', 'Main Image',
        { x: 5, y: 30, width: 90, height: 45 },
        { placeholder: 'Event photo' }
      ),
      createTextField('details', 'Event Details',
        { x: 10, y: 78, width: 80, height: 10 },
        {
          placeholder: 'Date • Time • Location',
          style: { fontSize: 24, textAlign: 'center' }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 20, y: 90, width: 60, height: 6 },
        {
          placeholder: 'www.event.com',
          style: { fontSize: 18, textAlign: 'center', color: '#003da5' }
        }
      )
    ],
    tags: ['costco', 'poster', '20x30', 'large-format'],
    isSystemTemplate: true
  },

  // Costco Photo Book Cover
  {
    id: 'costco-photobook-cover',
    name: 'Costco Photo Book Cover',
    description: 'Cover design for Costco Photo Book 11×14',
    assetType: AssetType.ProgramBooklet,
    category: 'vendor-specific',
    vendorId: 'costco-print',
    dimensions: createDimensions(11, 14, 0.125, 0.5),
    background: { type: 'solid', value: '#1a1a1a' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: {
      primary: '#ffffff',
      secondary: '#c9a962',
      accent: '#e31837',
      text: '#ffffff',
      background: '#1a1a1a'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('cover-image', 'Cover Image',
        { x: 0, y: 0, width: 100, height: 70 },
        { 
          placeholder: 'Main cover photo',
          style: { objectFit: 'cover' }
        }
      ),
      createTextField('title', 'Book Title',
        { x: 10, y: 75, width: 80, height: 12 },
        {
          placeholder: 'Our Family Memories',
          required: true,
          style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subtitle', 'Subtitle',
        { x: 15, y: 88, width: 70, height: 6 },
        {
          placeholder: '2024',
          style: { fontSize: 18, textAlign: 'center', color: '#c9a962' }
        }
      )
    ],
    tags: ['costco', 'photobook', 'cover', '11x14'],
    isSystemTemplate: true
  }
];

// ============= WALGREENS PHOTO TEMPLATES =============

export const WALGREENS_PHOTO_TEMPLATES: EditableTemplate[] = [
  // Walgreens Photo Print 4x6
  {
    id: 'walgreens-photo-4x6',
    name: 'Walgreens Photo Print 4×6',
    description: 'Standard photo print for Walgreens Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'walgreens-photo',
    dimensions: createDimensions(6, 4, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e31837', // Walgreens red
      secondary: '#ffffff',
      accent: '#333333',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Upload photo (300 DPI recommended)',
          required: true,
          style: { objectFit: 'cover' }
        }
      )
    ],
    tags: ['walgreens', 'photo', '4x6', 'print'],
    isSystemTemplate: true
  },

  // Walgreens Poster 11x14
  {
    id: 'walgreens-poster-11x14',
    name: 'Walgreens Photo Poster 11×14',
    description: 'Photo poster for Walgreens Photo Center',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'walgreens-photo',
    dimensions: createDimensions(11, 14, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e31837',
      secondary: '#333333',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Main Photo',
        { x: 5, y: 5, width: 90, height: 65 },
        { 
          placeholder: 'Featured photo',
          style: { objectFit: 'cover', borderRadius: 4 }
        }
      ),
      createTextField('title', 'Title',
        { x: 10, y: 73, width: 80, height: 10 },
        {
          placeholder: 'Special Moment',
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('caption', 'Caption',
        { x: 15, y: 85, width: 70, height: 8 },
        {
          placeholder: 'A memorable day with family',
          style: { fontSize: 14, textAlign: 'center', color: '#666666' }
        }
      )
    ],
    tags: ['walgreens', 'poster', '11x14', 'photo'],
    isSystemTemplate: true
  },

  // Walgreens Photo Card 5x7
  {
    id: 'walgreens-card-5x7',
    name: 'Walgreens Photo Card 5×7',
    description: 'Greeting/invitation card for Walgreens Photo',
    assetType: AssetType.InvitationCard,
    category: 'vendor-specific',
    vendorId: 'walgreens-photo',
    dimensions: createDimensions(7, 5, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: {
      primary: '#2c3e50',
      secondary: '#e31837',
      accent: '#c9a962',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 5, y: 8, width: 50, height: 84 },
        { 
          placeholder: 'Photo',
          style: { objectFit: 'cover', borderRadius: 4 }
        }
      ),
      createTextField('headline', 'Headline',
        { x: 58, y: 15, width: 38, height: 15 },
        {
          placeholder: "You're Invited!",
          required: true,
          style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' }
        }
      ),
      createTextField('event', 'Event Name',
        { x: 58, y: 32, width: 38, height: 12 },
        {
          placeholder: 'Birthday Party',
          style: { fontSize: 16, textAlign: 'center' }
        }
      ),
      createTextField('details', 'Details',
        { x: 58, y: 48, width: 38, height: 30 },
        {
          placeholder: 'Saturday, March 15\n3:00 PM\n123 Main Street',
          style: { fontSize: 11, textAlign: 'center', lineHeight: 1.5 }
        }
      ),
      createTextField('rsvp', 'RSVP',
        { x: 58, y: 80, width: 38, height: 10 },
        {
          placeholder: 'RSVP: (555) 123-4567',
          style: { fontSize: 10, textAlign: 'center', fontStyle: 'italic' }
        }
      )
    ],
    tags: ['walgreens', 'card', '5x7', 'invitation'],
    isSystemTemplate: true
  },

  // Walgreens Banner 2x6
  {
    id: 'walgreens-banner-2x6',
    name: 'Walgreens Photo Banner 2×6 ft',
    description: 'Vinyl banner for Walgreens Photo',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'walgreens-photo',
    dimensions: {
      widthInches: 72,
      heightInches: 24,
      widthPx: 10800,
      heightPx: 3600,
      bleedInches: 0.5,
      safeZoneInches: 1,
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#e31837',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'RGB',
    dpi: 150,
    fields: [
      createImageField('photo-1', 'Photo 1',
        { x: 2, y: 10, width: 18, height: 80 },
        { placeholder: 'Photo', style: { objectFit: 'cover', borderRadius: 4 } }
      ),
      createImageField('photo-2', 'Photo 2',
        { x: 80, y: 10, width: 18, height: 80 },
        { placeholder: 'Photo', style: { objectFit: 'cover', borderRadius: 4 } }
      ),
      createTextField('headline', 'Headline',
        { x: 22, y: 15, width: 56, height: 30 },
        {
          placeholder: 'Happy Birthday!',
          required: true,
          style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('name', 'Name',
        { x: 22, y: 50, width: 56, height: 20 },
        {
          placeholder: 'SARAH',
          style: { fontSize: 48, textAlign: 'center', color: '#e31837', fontWeight: 'bold' }
        }
      ),
      createTextField('message', 'Message',
        { x: 30, y: 75, width: 40, height: 15 },
        {
          placeholder: 'Wishing you the best!',
          style: { fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.9)' }
        }
      )
    ],
    tags: ['walgreens', 'banner', '2x6', 'birthday'],
    isSystemTemplate: true
  }
];

// ============= CVS PHOTO TEMPLATES =============

export const CVS_PHOTO_TEMPLATES: EditableTemplate[] = [
  // CVS Photo Print 4x6
  {
    id: 'cvs-photo-4x6',
    name: 'CVS Photo Print 4×6',
    description: 'Standard photo print for CVS Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(6, 4, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000', // CVS red
      secondary: '#ffffff',
      accent: '#333333',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Upload photo',
          required: true,
          style: { objectFit: 'cover' }
        }
      )
    ],
    tags: ['cvs', 'photo', '4x6', 'print'],
    isSystemTemplate: true
  },

  // CVS Photo Print 8x10
  {
    id: 'cvs-photo-8x10',
    name: 'CVS Photo Print 8×10',
    description: 'Large photo print for CVS Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(10, 8, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#ffffff',
      accent: '#333333',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Upload high-resolution photo',
          required: true,
          style: { objectFit: 'cover' }
        }
      )
    ],
    tags: ['cvs', 'photo', '8x10', 'print'],
    isSystemTemplate: true
  },

  // CVS Photo Collage Print 8x10
  {
    id: 'cvs-collage-8x10',
    name: 'CVS Photo Collage 8×10',
    description: '4-photo collage print for CVS Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(10, 8, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#333333',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo-1', 'Photo 1',
        { x: 2, y: 2, width: 47, height: 47 },
        { placeholder: 'Top left photo', style: { objectFit: 'cover' } }
      ),
      createImageField('photo-2', 'Photo 2',
        { x: 51, y: 2, width: 47, height: 47 },
        { placeholder: 'Top right photo', style: { objectFit: 'cover' } }
      ),
      createImageField('photo-3', 'Photo 3',
        { x: 2, y: 51, width: 47, height: 47 },
        { placeholder: 'Bottom left photo', style: { objectFit: 'cover' } }
      ),
      createImageField('photo-4', 'Photo 4',
        { x: 51, y: 51, width: 47, height: 47 },
        { placeholder: 'Bottom right photo', style: { objectFit: 'cover' } }
      )
    ],
    tags: ['cvs', 'photo', 'collage', '8x10'],
    isSystemTemplate: true
  },

  // CVS Photo Card 5x7
  {
    id: 'cvs-card-5x7',
    name: 'CVS Photo Card 5×7',
    description: 'Greeting card for CVS Photo',
    assetType: AssetType.InvitationCard,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(7, 5, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Georgia', body: 'Arial' },
    defaultColors: {
      primary: '#2c3e50',
      secondary: '#cc0000',
      accent: '#c9a962',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 65 },
        { 
          placeholder: 'Main photo',
          style: { objectFit: 'cover' }
        }
      ),
      createTextField('message', 'Message',
        { x: 10, y: 70, width: 80, height: 12 },
        {
          placeholder: 'Thinking of You',
          required: true,
          style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' }
        }
      ),
      createTextField('subtitle', 'Subtitle',
        { x: 15, y: 84, width: 70, height: 10 },
        {
          placeholder: 'With love from our family',
          style: { fontSize: 12, textAlign: 'center', color: '#666666', fontStyle: 'italic' }
        }
      )
    ],
    tags: ['cvs', 'card', '5x7', 'greeting'],
    isSystemTemplate: true
  },

  // CVS Photo Poster 11x14
  {
    id: 'cvs-poster-11x14',
    name: 'CVS Photo Poster 11×14',
    description: 'Photo poster for CVS Photo Center',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(11, 14, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#333333',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Main Photo',
        { x: 5, y: 5, width: 90, height: 70 },
        { 
          placeholder: 'Featured photo',
          style: { objectFit: 'cover' }
        }
      ),
      createTextField('title', 'Title',
        { x: 10, y: 78, width: 80, height: 10 },
        {
          placeholder: 'Family Reunion 2024',
          style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('caption', 'Caption',
        { x: 15, y: 90, width: 70, height: 6 },
        {
          placeholder: 'Summer at the Lake',
          style: { fontSize: 12, textAlign: 'center', color: '#666666' }
        }
      )
    ],
    tags: ['cvs', 'poster', '11x14', 'photo'],
    isSystemTemplate: true
  },

  // CVS Photo Magnet
  {
    id: 'cvs-magnet-4x6',
    name: 'CVS Photo Magnet 4×6',
    description: 'Photo magnet for CVS Photo',
    assetType: AssetType.PhotorealisticShot,
    category: 'vendor-specific',
    vendorId: 'cvs-photo',
    dimensions: createDimensions(6, 4, 0, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#cc0000',
      secondary: '#ffffff',
      accent: '#333333',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createImageField('photo', 'Photo',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Photo for magnet',
          required: true,
          style: { objectFit: 'cover' }
        }
      )
    ],
    tags: ['cvs', 'photo', 'magnet', '4x6'],
    isSystemTemplate: true
  }
];

// ============= MINUTEMAN PRESS TEMPLATES =============

export const MINUTEMAN_PRESS_TEMPLATES: EditableTemplate[] = [
  // Minuteman Press Business Card
  {
    id: 'minuteman-business-card',
    name: 'Minuteman Press Business Card',
    description: 'Premium business card for Minuteman Press',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'minuteman-press',
    dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Helvetica', body: 'Helvetica' },
    defaultColors: {
      primary: '#003366', // Minuteman blue
      secondary: '#cc0000',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 8, width: 35, height: 28 },
        { placeholder: 'High-res logo (300 DPI, CMYK)' }
      ),
      createTextField('name', 'Full Name',
        { x: 5, y: 42, width: 90, height: 14 },
        {
          placeholder: 'John Smith',
          required: true,
          style: { fontSize: 14, fontWeight: 'bold', color: '#003366' }
        }
      ),
      createTextField('title', 'Job Title',
        { x: 5, y: 55, width: 90, height: 10 },
        {
          placeholder: 'Senior Account Manager',
          maxLength: 40,
          style: { fontSize: 10, color: '#666666' }
        }
      ),
      createTextField('phone', 'Phone',
        { x: 5, y: 70, width: 45, height: 8 },
        { placeholder: '(555) 123-4567', style: { fontSize: 9 } }
      ),
      createTextField('email', 'Email',
        { x: 5, y: 80, width: 55, height: 8 },
        { placeholder: 'john@company.com', style: { fontSize: 9 } }
      ),
      createTextField('website', 'Website',
        { x: 55, y: 70, width: 40, height: 8 },
        { placeholder: 'www.company.com', style: { fontSize: 9, textAlign: 'right' } }
      ),
      createTextField('address', 'Address',
        { x: 55, y: 80, width: 40, height: 8 },
        { placeholder: 'City, State', style: { fontSize: 8, textAlign: 'right', color: '#888888' } }
      )
    ],
    tags: ['minuteman', 'business-card', 'franchise'],
    isSystemTemplate: true
  },

  // Minuteman Press Brochure Tri-Fold
  {
    id: 'minuteman-brochure-trifold',
    name: 'Minuteman Press Tri-Fold Brochure',
    description: 'Professional tri-fold brochure (8.5×11 folded)',
    assetType: AssetType.ProgramBooklet,
    category: 'vendor-specific',
    vendorId: 'minuteman-press',
    dimensions: createDimensions(11, 8.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Helvetica', body: 'Helvetica' },
    defaultColors: {
      primary: '#003366',
      secondary: '#0066cc',
      accent: '#f5f5f5',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      // Panel 1 (Cover - right side)
      createLogoField('logo', 'Logo',
        { x: 70, y: 8, width: 25, height: 15 },
        { placeholder: 'Company logo' }
      ),
      createTextField('title', 'Title',
        { x: 68, y: 30, width: 30, height: 20 },
        {
          placeholder: 'Company\nBrochure',
          required: true,
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#003366' }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 68, y: 55, width: 30, height: 10 },
        { placeholder: 'Your tagline here', style: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' } }
      ),
      // Panel 2 (Back - left side)
      createTextField('contact-title', 'Contact Header',
        { x: 3, y: 8, width: 28, height: 8 },
        { placeholder: 'Contact Us', style: { fontSize: 16, fontWeight: 'bold', color: '#003366' } }
      ),
      createTextField('contact-info', 'Contact Details',
        { x: 3, y: 18, width: 28, height: 35 },
        {
          placeholder: 'Company Name\n123 Main Street\nCity, ST 12345\n\n(555) 123-4567\ninfo@company.com',
          style: { fontSize: 10, lineHeight: 1.5 }
        }
      ),
      // Panel 3 (Inside flap - center)
      createTextField('intro-title', 'Introduction',
        { x: 35, y: 8, width: 28, height: 8 },
        { placeholder: 'About Us', style: { fontSize: 16, fontWeight: 'bold', color: '#003366' } }
      ),
      createTextField('intro-text', 'Intro Text',
        { x: 35, y: 18, width: 28, height: 40 },
        { placeholder: 'Brief introduction to your company...', style: { fontSize: 10, lineHeight: 1.5 } }
      ),
      {
        id: 'fold-line-1',
        type: 'divider',
        name: 'Fold Line 1',
        position: { x: 33.33, y: 0, width: 0.1, height: 100 },
        style: { borderStyle: 'dashed', borderColor: '#cccccc', borderWidth: 1 }
      },
      {
        id: 'fold-line-2',
        type: 'divider',
        name: 'Fold Line 2',
        position: { x: 66.66, y: 0, width: 0.1, height: 100 },
        style: { borderStyle: 'dashed', borderColor: '#cccccc', borderWidth: 1 }
      }
    ],
    tags: ['minuteman', 'brochure', 'tri-fold', 'franchise'],
    isSystemTemplate: true
  },

  // Minuteman Press Poster 24x36
  {
    id: 'minuteman-poster-24x36',
    name: 'Minuteman Press Poster 24×36',
    description: 'Large format poster for Minuteman Press',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'minuteman-press',
    dimensions: createDimensions(24, 36, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Helvetica', body: 'Helvetica' },
    defaultColors: {
      primary: '#003366',
      secondary: '#cc0000',
      accent: '#fbbf24',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 35, y: 3, width: 30, height: 10 },
        { placeholder: 'Event/Company logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 16, width: 90, height: 12 },
        {
          placeholder: 'EVENT TITLE',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#003366' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 10, y: 29, width: 80, height: 6 },
        { placeholder: 'Event tagline or description', style: { fontSize: 20, textAlign: 'center', color: '#666666' } }
      ),
      createImageField('main-image', 'Main Image',
        { x: 5, y: 38, width: 90, height: 38 },
        { placeholder: 'Event photo or graphic' }
      ),
      createTextField('details', 'Event Details',
        { x: 10, y: 79, width: 80, height: 10 },
        {
          placeholder: 'Saturday, March 15, 2024 | 6:00 PM',
          style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('location', 'Location',
        { x: 15, y: 90, width: 70, height: 6 },
        { placeholder: 'Convention Center, 123 Main Street', style: { fontSize: 14, textAlign: 'center', color: '#666666' } }
      )
    ],
    tags: ['minuteman', 'poster', '24x36', 'large-format'],
    isSystemTemplate: true
  },

  // Minuteman Press Vinyl Banner
  {
    id: 'minuteman-banner-3x6',
    name: 'Minuteman Press Banner 3×6 ft',
    description: 'Outdoor vinyl banner with grommets',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'minuteman-press',
    dimensions: {
      widthInches: 72,
      heightInches: 36,
      widthPx: 10800,
      heightPx: 5400,
      bleedInches: 0.5,
      safeZoneInches: 2, // Grommet/hem area
      orientation: 'landscape'
    },
    background: { type: 'solid', value: '#003366' },
    defaultFonts: { heading: 'Helvetica', body: 'Helvetica' },
    defaultColors: {
      primary: '#003366',
      secondary: '#ffffff',
      accent: '#cc0000',
      text: '#ffffff',
      background: '#003366'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Logo',
        { x: 3, y: 15, width: 18, height: 70 },
        { placeholder: 'Logo (white version)' }
      ),
      createTextField('headline', 'Headline',
        { x: 23, y: 18, width: 54, height: 28 },
        {
          placeholder: 'GRAND OPENING',
          required: true,
          style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Details',
        { x: 23, y: 50, width: 54, height: 18 },
        { placeholder: 'Saturday, March 15 | 10 AM', style: { fontSize: 32, textAlign: 'center', color: '#fbbf24' } }
      ),
      createTextField('cta', 'Call to Action',
        { x: 23, y: 72, width: 54, height: 12 },
        { placeholder: 'www.business.com', style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }
      ),
      {
        id: 'qr-code',
        type: 'qrcode',
        name: 'QR Code',
        position: { x: 80, y: 20, width: 16, height: 60 },
        placeholder: 'Website URL',
        style: { backgroundColor: '#ffffff', borderRadius: 8 }
      }
    ],
    tags: ['minuteman', 'banner', '3x6', 'vinyl', 'outdoor'],
    isSystemTemplate: true
  }
];

// ============= ALPHAGRAPHICS TEMPLATES =============

export const ALPHAGRAPHICS_TEMPLATES: EditableTemplate[] = [
  // AlphaGraphics Business Card
  {
    id: 'alphagraphics-business-card',
    name: 'AlphaGraphics Business Card',
    description: 'Premium business card for AlphaGraphics',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'alphagraphics',
    dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e4002b', // AlphaGraphics red
      secondary: '#1a1a1a',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 8, width: 40, height: 30 },
        { placeholder: 'Logo (CMYK, 300 DPI)' }
      ),
      createTextField('name', 'Full Name',
        { x: 5, y: 44, width: 90, height: 14 },
        {
          placeholder: 'Jane Doe',
          required: true,
          style: { fontSize: 14, fontWeight: 'bold' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 57, width: 90, height: 10 },
        { placeholder: 'Marketing Director', style: { fontSize: 10, color: '#666666' } }
      ),
      createTextField('phone', 'Phone',
        { x: 5, y: 72, width: 45, height: 8 },
        { placeholder: '(555) 123-4567', style: { fontSize: 9 } }
      ),
      createTextField('email', 'Email',
        { x: 5, y: 82, width: 55, height: 8 },
        { placeholder: 'jane@company.com', style: { fontSize: 9 } }
      ),
      createTextField('website', 'Website',
        { x: 55, y: 72, width: 40, height: 8 },
        { placeholder: 'www.company.com', style: { fontSize: 9, textAlign: 'right' } }
      )
    ],
    tags: ['alphagraphics', 'business-card', 'franchise'],
    isSystemTemplate: true
  },

  // AlphaGraphics Trade Show Banner
  {
    id: 'alphagraphics-tradeshow-banner',
    name: 'AlphaGraphics Trade Show Banner',
    description: 'Retractable banner for trade shows (33×81)',
    assetType: AssetType.Banner,
    category: 'vendor-specific',
    vendorId: 'alphagraphics',
    dimensions: {
      widthInches: 33,
      heightInches: 81,
      widthPx: 4950,
      heightPx: 12150,
      bleedInches: 0,
      safeZoneInches: 2,
      orientation: 'portrait'
    },
    background: { type: 'gradient', value: 'linear-gradient(180deg, #e4002b 0%, #8b0000 100%)' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#e4002b',
      secondary: '#ffffff',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#e4002b'
    },
    colorMode: 'CMYK',
    dpi: 150,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 20, y: 3, width: 60, height: 10 },
        { placeholder: 'Logo (white/light version)' }
      ),
      createTextField('headline', 'Main Message',
        { x: 5, y: 15, width: 90, height: 12 },
        {
          placeholder: 'INNOVATE',
          required: true,
          style: { fontSize: 80, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('subheadline', 'Tagline',
        { x: 10, y: 28, width: 80, height: 6 },
        { placeholder: 'Transform Your Business', style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }
      ),
      createImageField('hero-image', 'Hero Image',
        { x: 5, y: 38, width: 90, height: 28 },
        { placeholder: 'Product or service image' }
      ),
      createTextField('feature-1', 'Feature 1',
        { x: 8, y: 69, width: 84, height: 4 },
        { placeholder: '✓ Industry-leading solutions', style: { fontSize: 18, color: '#ffffff' } }
      ),
      createTextField('feature-2', 'Feature 2',
        { x: 8, y: 74, width: 84, height: 4 },
        { placeholder: '✓ 24/7 customer support', style: { fontSize: 18, color: '#ffffff' } }
      ),
      createTextField('feature-3', 'Feature 3',
        { x: 8, y: 79, width: 84, height: 4 },
        { placeholder: '✓ Proven track record', style: { fontSize: 18, color: '#ffffff' } }
      ),
      createTextField('cta', 'Call to Action',
        { x: 15, y: 86, width: 70, height: 5 },
        { placeholder: 'Visit us at Booth #123', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24' } }
      ),
      createTextField('contact', 'Contact',
        { x: 20, y: 92, width: 60, height: 3 },
        { placeholder: 'www.company.com', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }
      )
    ],
    tags: ['alphagraphics', 'banner', 'trade-show', 'retractable'],
    isSystemTemplate: true
  },

  // AlphaGraphics Foam Board Sign
  {
    id: 'alphagraphics-foamboard-18x24',
    name: 'AlphaGraphics Foam Board 18×24',
    description: 'Rigid foam board sign for indoor display',
    assetType: AssetType.EaselSignage,
    category: 'vendor-specific',
    vendorId: 'alphagraphics',
    dimensions: createDimensions(18, 24, 0, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#e4002b',
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
        { placeholder: 'Company logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 20, width: 90, height: 15 },
        {
          placeholder: 'WELCOME',
          required: true,
          style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#e4002b' }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 10, y: 37, width: 80, height: 12 },
        { placeholder: 'Annual Conference 2024', style: { fontSize: 28, textAlign: 'center' } }
      ),
      createImageField('image', 'Featured Image',
        { x: 10, y: 52, width: 80, height: 28 },
        { placeholder: 'Event or product image' }
      ),
      createTextField('details', 'Details',
        { x: 15, y: 83, width: 70, height: 8 },
        { placeholder: 'Registration → Main Lobby', style: { fontSize: 16, textAlign: 'center' } }
      ),
      createTextField('date', 'Date',
        { x: 20, y: 92, width: 60, height: 5 },
        { placeholder: 'March 15-17, 2024', style: { fontSize: 14, textAlign: 'center', color: '#666666' } }
      )
    ],
    tags: ['alphagraphics', 'foam-board', '18x24', 'indoor'],
    isSystemTemplate: true
  },

  // AlphaGraphics Postcards
  {
    id: 'alphagraphics-postcard-6x4',
    name: 'AlphaGraphics Postcard 6×4',
    description: 'Standard marketing postcard',
    assetType: AssetType.InvitationCard,
    category: 'vendor-specific',
    vendorId: 'alphagraphics',
    dimensions: createDimensions(6, 4, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#e4002b',
      secondary: '#1a1a1a',
      accent: '#0066cc',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createImageField('image', 'Hero Image',
        { x: 0, y: 0, width: 55, height: 100 },
        { placeholder: 'Promotional image', style: { objectFit: 'cover' } }
      ),
      createLogoField('logo', 'Logo',
        { x: 60, y: 5, width: 35, height: 15 },
        { placeholder: 'Logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 58, y: 25, width: 40, height: 18 },
        {
          placeholder: 'Special Offer!',
          required: true,
          style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#e4002b' }
        }
      ),
      createTextField('offer', 'Offer',
        { x: 58, y: 45, width: 40, height: 25 },
        { placeholder: '20% OFF\nYour First Order', style: { fontSize: 16, textAlign: 'center', fontWeight: 'bold' } }
      ),
      createTextField('cta', 'Call to Action',
        { x: 58, y: 75, width: 40, height: 10 },
        { placeholder: 'Use code: SAVE20', style: { fontSize: 11, textAlign: 'center', color: '#0066cc' } }
      ),
      createTextField('website', 'Website',
        { x: 58, y: 88, width: 40, height: 8 },
        { placeholder: 'www.company.com', style: { fontSize: 10, textAlign: 'center', color: '#666666' } }
      )
    ],
    tags: ['alphagraphics', 'postcard', '6x4', 'marketing'],
    isSystemTemplate: true
  }
];

// ============= SIR SPEEDY TEMPLATES =============

export const SIR_SPEEDY_TEMPLATES: EditableTemplate[] = [
  // Sir Speedy Business Card
  {
    id: 'sirspeedy-business-card',
    name: 'Sir Speedy Business Card',
    description: 'Professional business card for Sir Speedy',
    assetType: AssetType.NameTag,
    category: 'vendor-specific',
    vendorId: 'sir-speedy',
    dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Times New Roman', body: 'Arial' },
    defaultColors: {
      primary: '#00529b', // Sir Speedy blue
      secondary: '#cc0000',
      accent: '#ffffff',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 8, width: 38, height: 28 },
        { placeholder: 'Logo (CMYK, high resolution)' }
      ),
      createTextField('name', 'Full Name',
        { x: 5, y: 42, width: 90, height: 14 },
        {
          placeholder: 'Robert Johnson',
          required: true,
          style: { fontSize: 14, fontWeight: 'bold', color: '#00529b' }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 55, width: 90, height: 10 },
        { placeholder: 'Vice President, Sales', style: { fontSize: 10, color: '#666666' } }
      ),
      createTextField('phone', 'Phone',
        { x: 5, y: 70, width: 45, height: 8 },
        { placeholder: '(555) 123-4567', style: { fontSize: 9 } }
      ),
      createTextField('email', 'Email',
        { x: 5, y: 80, width: 55, height: 8 },
        { placeholder: 'robert@company.com', style: { fontSize: 9 } }
      ),
      createTextField('website', 'Website',
        { x: 55, y: 70, width: 40, height: 8 },
        { placeholder: 'www.company.com', style: { fontSize: 9, textAlign: 'right' } }
      ),
      createTextField('address', 'Address',
        { x: 55, y: 80, width: 40, height: 8 },
        { placeholder: 'City, State 12345', style: { fontSize: 8, textAlign: 'right', color: '#888888' } }
      )
    ],
    tags: ['sirspeedy', 'business-card', 'franchise'],
    isSystemTemplate: true
  },

  // Sir Speedy Flyer 8.5x11
  {
    id: 'sirspeedy-flyer-letter',
    name: 'Sir Speedy Flyer 8.5×11',
    description: 'Letter-size promotional flyer',
    assetType: AssetType.EventSignage,
    category: 'vendor-specific',
    vendorId: 'sir-speedy',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#00529b',
      secondary: '#cc0000',
      accent: '#fbbf24',
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
        position: { x: 0, y: 0, width: 100, height: 12 },
        style: { backgroundColor: '#00529b' }
      },
      createLogoField('logo', 'Logo',
        { x: 5, y: 2, width: 20, height: 8 },
        { placeholder: 'Logo (white version)' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 15, width: 90, height: 12 },
        {
          placeholder: 'BIG SALE EVENT',
          required: true,
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#00529b' }
        }
      ),
      createTextField('subheadline', 'Subheadline',
        { x: 10, y: 28, width: 80, height: 6 },
        { placeholder: 'Limited Time Only!', style: { fontSize: 20, textAlign: 'center', color: '#cc0000' } }
      ),
      createImageField('main-image', 'Main Image',
        { x: 5, y: 36, width: 90, height: 35 },
        { placeholder: 'Product or event photo' }
      ),
      createTextField('details', 'Details',
        { x: 10, y: 74, width: 80, height: 12 },
        {
          placeholder: 'Up to 50% off selected items\nFree shipping on orders over $50',
          style: { fontSize: 16, textAlign: 'center', lineHeight: 1.5 }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 15, y: 88, width: 70, height: 8 },
        { placeholder: 'Shop Now at www.company.com', style: { fontSize: 14, textAlign: 'center', fontWeight: 'bold', color: '#00529b' } }
      )
    ],
    tags: ['sirspeedy', 'flyer', '8.5x11', 'letter'],
    isSystemTemplate: true
  },

  // Sir Speedy Presentation Folder
  {
    id: 'sirspeedy-presentation-folder',
    name: 'Sir Speedy Presentation Folder',
    description: 'Professional presentation folder (9×12 with pockets)',
    assetType: AssetType.Folder,
    category: 'vendor-specific',
    vendorId: 'sir-speedy',
    dimensions: createDimensions(18.5, 12, 0.125, 0.5),
    background: { type: 'solid', value: '#00529b' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: {
      primary: '#00529b',
      secondary: '#ffffff',
      accent: '#c9a962',
      text: '#ffffff',
      background: '#00529b'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      // Front cover (right side)
      createLogoField('logo', 'Logo',
        { x: 58, y: 15, width: 35, height: 20 },
        { placeholder: 'Company logo (white/light version)' }
      ),
      createTextField('company-name', 'Company Name',
        { x: 55, y: 40, width: 40, height: 10 },
        {
          placeholder: 'Company Name',
          style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 55, y: 52, width: 40, height: 8 },
        { placeholder: 'Your Partner in Success', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }
      ),
      // Back cover (left side)
      createTextField('contact-title', 'Contact',
        { x: 5, y: 15, width: 40, height: 8 },
        { placeholder: 'Contact Us', style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' } }
      ),
      createTextField('contact-info', 'Contact Info',
        { x: 5, y: 25, width: 40, height: 30 },
        {
          placeholder: '123 Business Avenue\nCity, State 12345\n\n(555) 123-4567\ninfo@company.com',
          style: { fontSize: 11, lineHeight: 1.6, color: '#ffffff' }
        }
      ),
      createTextField('website', 'Website',
        { x: 5, y: 58, width: 40, height: 6 },
        { placeholder: 'www.company.com', style: { fontSize: 14, color: '#c9a962' } }
      ),
      {
        id: 'spine',
        type: 'divider',
        name: 'Spine (Fold Line)',
        position: { x: 50, y: 0, width: 0.5, height: 100 },
        style: { borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1 }
      }
    ],
    tags: ['sirspeedy', 'folder', 'presentation', '9x12'],
    isSystemTemplate: true
  },

  // Sir Speedy Yard Sign
  {
    id: 'sirspeedy-yard-sign-24x18',
    name: 'Sir Speedy Yard Sign 24×18',
    description: 'Corrugated plastic yard sign',
    assetType: AssetType.OutdoorSignage,
    category: 'vendor-specific',
    vendorId: 'sir-speedy',
    dimensions: createDimensions(24, 18, 0.25, 0.5, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#00529b',
      secondary: '#cc0000',
      accent: '#ffffff',
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
        position: { x: 0, y: 0, width: 100, height: 25 },
        style: { backgroundColor: '#00529b' }
      },
      createTextField('headline', 'Headline',
        { x: 5, y: 3, width: 90, height: 18 },
        {
          placeholder: 'FOR SALE',
          required: true,
          style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createLogoField('logo', 'Agent/Company Logo',
        { x: 5, y: 30, width: 30, height: 35 },
        { placeholder: 'Logo' }
      ),
      createTextField('details', 'Property Details',
        { x: 38, y: 30, width: 57, height: 20 },
        {
          placeholder: '4 BR | 3 BA | 2,500 SF',
          style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' }
        }
      ),
      createTextField('price', 'Price',
        { x: 38, y: 52, width: 57, height: 15 },
        { placeholder: '$425,000', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#cc0000' } }
      ),
      createTextField('agent', 'Agent Info',
        { x: 5, y: 70, width: 90, height: 12 },
        {
          placeholder: 'John Smith | (555) 123-4567',
          style: { fontSize: 16, textAlign: 'center' }
        }
      ),
      createTextField('website', 'Website',
        { x: 20, y: 85, width: 60, height: 10 },
        { placeholder: 'www.realtycompany.com', style: { fontSize: 14, textAlign: 'center', color: '#00529b' } }
      )
    ],
    tags: ['sirspeedy', 'yard-sign', '24x18', 'real-estate'],
    isSystemTemplate: true
  },

  // Sir Speedy Door Hanger
  {
    id: 'sirspeedy-door-hanger',
    name: 'Sir Speedy Door Hanger',
    description: 'Standard door hanger (4.25×11)',
    assetType: AssetType.DoorSignage,
    category: 'vendor-specific',
    vendorId: 'sir-speedy',
    dimensions: createDimensions(4.25, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Arial Black', body: 'Arial' },
    defaultColors: {
      primary: '#00529b',
      secondary: '#cc0000',
      accent: '#fbbf24',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'die-cut-hole',
        type: 'shape',
        name: 'Door Knob Hole (Die Cut)',
        position: { x: 30, y: 2, width: 40, height: 8 },
        style: { 
          backgroundColor: 'transparent', 
          borderStyle: 'dashed', 
          borderColor: '#ff0000', 
          borderWidth: 2,
          borderRadius: 50
        }
      },
      createLogoField('logo', 'Logo',
        { x: 20, y: 12, width: 60, height: 12 },
        { placeholder: 'Company logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 5, y: 26, width: 90, height: 10 },
        {
          placeholder: 'WE STOPPED BY!',
          required: true,
          style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#00529b' }
        }
      ),
      createImageField('image', 'Image',
        { x: 8, y: 38, width: 84, height: 25 },
        { placeholder: 'Service image' }
      ),
      createTextField('message', 'Message',
        { x: 8, y: 65, width: 84, height: 15 },
        {
          placeholder: 'Sorry we missed you!\nCall us to schedule.',
          style: { fontSize: 12, textAlign: 'center', lineHeight: 1.5 }
        }
      ),
      createTextField('phone', 'Phone',
        { x: 15, y: 82, width: 70, height: 8 },
        { placeholder: '(555) 123-4567', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#cc0000' } }
      ),
      createTextField('website', 'Website',
        { x: 20, y: 92, width: 60, height: 6 },
        { placeholder: 'www.company.com', style: { fontSize: 10, textAlign: 'center', color: '#666666' } }
      )
    ],
    tags: ['sirspeedy', 'door-hanger', '4.25x11', 'marketing'],
    isSystemTemplate: true
  }
];

// Export all local vendor templates
export const ALL_LOCAL_VENDOR_TEMPLATES: EditableTemplate[] = [
  ...STAPLES_TEMPLATES,
  ...FEDEX_OFFICE_TEMPLATES,
  ...UPS_STORE_TEMPLATES,
  ...OFFICE_DEPOT_TEMPLATES,
  ...LOCAL_PRINTSHOP_TEMPLATES,
  ...COSTCO_PRINT_TEMPLATES,
  ...WALGREENS_PHOTO_TEMPLATES,
  ...CVS_PHOTO_TEMPLATES,
  ...MINUTEMAN_PRESS_TEMPLATES,
  ...ALPHAGRAPHICS_TEMPLATES,
  ...SIR_SPEEDY_TEMPLATES
];
