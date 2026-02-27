// Merchandise Templates - T-shirts, hats, bags, etc.

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions
const createDimensions = (w: number, h: number, b: number = 0, s: number = 0.25, dpi: number = 300) => ({
  widthInches: w, heightInches: h, widthPx: Math.round(w * dpi), heightPx: Math.round(h * dpi), bleedInches: b, safeZoneInches: s,
  orientation: (w > h ? 'landscape' : h > w ? 'portrait' : 'square') as 'portrait' | 'landscape' | 'square'
});

const createTextField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'text', position, style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', textAlign: 'left', color: '#1a1a1a', ...options.style }, ...options
});

const createLogoField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'logo', position, style: { objectFit: 'contain', ...options.style }, acceptedFormats: ['png', 'svg', 'eps'], ...options
});

const createImageField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'image', position, style: { objectFit: 'cover', borderRadius: 0, ...options.style }, acceptedFormats: ['jpg', 'png', 'webp'], ...options
});

// ============= T-SHIRT FRONT TEMPLATES =============

export const TSHIRT_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-event-front', name: 'Event T-Shirt Front', description: 'Standard event t-shirt front design',
    assetType: AssetType.Tshirt, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#f59e0b', accent: '#ef4444', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 25, y: 5, width: 50, height: 25 }, { placeholder: 'Event logo (PNG with transparency)' }),
      createTextField('event-name', 'Event Name', { x: 10, y: 35, width: 80, height: 15 }, { placeholder: 'CONFERENCE 2024', style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 } }),
      createTextField('tagline', 'Event Tagline', { x: 15, y: 52, width: 70, height: 8 }, { placeholder: 'Innovation • Collaboration • Growth', style: { fontSize: 14, textAlign: 'center', color: '#f59e0b' } }),
      createImageField('graphic', 'Graphic Element', { x: 20, y: 65, width: 60, height: 25 }, { placeholder: 'Optional graphic or illustration', style: { objectFit: 'contain' } })
    ],
    tags: ['tshirt', 'front', 'event', 'apparel']
  },
  {
    id: 'tshirt-minimal-logo', name: 'Minimal Logo Tee', description: 'Simple left-chest logo placement',
    assetType: AssetType.Tshirt, category: 'universal', dimensions: createDimensions(4, 4, 0, 0.25),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 10, y: 10, width: 80, height: 60 }, { placeholder: 'Company/Event logo', required: true }),
      createTextField('text', 'Optional Text', { x: 10, y: 75, width: 80, height: 15 }, { placeholder: 'Company Name', style: { fontSize: 12, textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['tshirt', 'minimal', 'logo', 'chest']
  },
  {
    id: 'tshirt-retro-event', name: 'Retro Event Tee', description: 'Vintage-style event t-shirt',
    assetType: AssetType.Tshirt, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#f59e0b', secondary: '#ef4444', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('year', 'Year', { x: 25, y: 5, width: 50, height: 12 }, { placeholder: '2024', style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } }),
      createLogoField('logo', 'Logo', { x: 30, y: 20, width: 40, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event Name', { x: 10, y: 45, width: 80, height: 12 }, { placeholder: 'SUMMER FEST', style: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('location', 'Location', { x: 20, y: 60, width: 60, height: 8 }, { placeholder: 'New York City', style: { fontSize: 16, textAlign: 'center', color: '#f59e0b' } }),
      createTextField('tagline', 'Tagline', { x: 15, y: 72, width: 70, height: 8 }, { placeholder: 'Music • Art • Culture', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['tshirt', 'retro', 'vintage']
  },
  {
    id: 'tshirt-bold-graphic', name: 'Bold Graphic Tee', description: 'Full-front bold graphic design',
    assetType: AssetType.Tshirt, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#8b5cf6', secondary: '#22d3ee', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createImageField('graphic', 'Main Graphic', { x: 5, y: 5, width: 90, height: 50 }, { placeholder: 'Bold graphic design', style: { objectFit: 'contain' } }),
      createTextField('text-1', 'Text Line 1', { x: 10, y: 60, width: 80, height: 12 }, { placeholder: 'UNITE', style: { fontSize: 56, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('text-2', 'Text Line 2', { x: 10, y: 75, width: 80, height: 8 }, { placeholder: 'CONFERENCE 2024', style: { fontSize: 18, textAlign: 'center', color: '#22d3ee', letterSpacing: 4 } }),
      createLogoField('logo', 'Logo', { x: 38, y: 88, width: 24, height: 8 }, { placeholder: 'Logo' })
    ],
    tags: ['tshirt', 'bold', 'graphic']
  },
  {
    id: 'tshirt-staff-crew', name: 'Staff/Crew Tee', description: 'Identifiable staff t-shirt design',
    assetType: AssetType.Tshirt, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#000000', secondary: '#f59e0b', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 5, width: 40, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('label', 'Staff Label', { x: 10, y: 30, width: 80, height: 18 }, { placeholder: 'STAFF', style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } }),
      createTextField('event', 'Event', { x: 15, y: 52, width: 70, height: 8 }, { placeholder: 'Conference 2024', style: { fontSize: 16, textAlign: 'center', color: '#ffffff' } }),
      createTextField('role', 'Role', { x: 20, y: 65, width: 60, height: 8 }, { placeholder: 'PRODUCTION TEAM', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.7)', letterSpacing: 2 } })
    ],
    tags: ['tshirt', 'staff', 'crew', 'production']
  }
];

// ============= T-SHIRT BACK TEMPLATES =============

export const TSHIRT_BACK_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-back-sponsors', name: 'Sponsor Back Design', description: 'Back design with sponsor logos',
    assetType: AssetType.TshirtBack, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#ffffff', secondary: '#d4d4d4', accent: '#f59e0b', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('event-info', 'Event Info', { x: 10, y: 5, width: 80, height: 10 }, { placeholder: 'Annual Conference 2024', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-location', 'Date & Location', { x: 15, y: 16, width: 70, height: 6 }, { placeholder: 'March 15-17, 2024 • San Francisco, CA', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('sponsors-label', 'Sponsors Label', { x: 30, y: 28, width: 40, height: 5 }, { placeholder: 'PRESENTED BY', style: { fontSize: 10, textAlign: 'center', color: '#f59e0b', letterSpacing: 2 } }),
      { id: 'sponsor-grid', type: 'image', name: 'Sponsor Logos', position: { x: 10, y: 35, width: 80, height: 55 }, placeholder: 'Sponsor logo grid', style: { objectFit: 'contain' } }
    ],
    tags: ['tshirt', 'back', 'sponsors', 'event']
  },
  {
    id: 'tshirt-back-schedule', name: 'Tour/Schedule Back', description: 'Back with tour dates or schedule',
    assetType: AssetType.TshirtBack, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#ef4444', accent: '#f59e0b', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('title', 'Title', { x: 10, y: 5, width: 80, height: 10 }, { placeholder: 'TOUR DATES 2024', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ef4444' } }),
      createTextField('date-1', 'Date 1', { x: 10, y: 20, width: 80, height: 5 }, { placeholder: 'MAR 15 — NEW YORK', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-2', 'Date 2', { x: 10, y: 28, width: 80, height: 5 }, { placeholder: 'MAR 22 — CHICAGO', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-3', 'Date 3', { x: 10, y: 36, width: 80, height: 5 }, { placeholder: 'APR 5 — LOS ANGELES', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-4', 'Date 4', { x: 10, y: 44, width: 80, height: 5 }, { placeholder: 'APR 12 — MIAMI', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-5', 'Date 5', { x: 10, y: 52, width: 80, height: 5 }, { placeholder: 'APR 20 — ATLANTA', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 75, width: 30, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['tshirt', 'back', 'tour', 'schedule']
  },
  {
    id: 'tshirt-back-hashtag', name: 'Hashtag Back', description: 'Social media hashtag back design',
    assetType: AssetType.TshirtBack, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#3b82f6', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('hashtag', 'Hashtag', { x: 10, y: 20, width: 80, height: 20 }, { placeholder: '#TechSummit24', style: { fontSize: 48, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('handle', 'Social Handle', { x: 15, y: 45, width: 70, height: 8 }, { placeholder: '@techsummit', style: { fontSize: 18, textAlign: 'center', color: '#3b82f6' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 65, width: 30, height: 15 }, { placeholder: 'Logo' }),
      createTextField('url', 'Website', { x: 20, y: 85, width: 60, height: 6 }, { placeholder: 'techsummit.com', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['tshirt', 'back', 'hashtag', 'social']
  },
  {
    id: 'tshirt-back-map', name: 'Location Map Back', description: 'Back with venue map and info',
    assetType: AssetType.TshirtBack, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#10b981', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('event', 'Event Name', { x: 10, y: 5, width: 80, height: 10 }, { placeholder: 'CONFERENCE 2024', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('map', 'Venue Map', { x: 10, y: 18, width: 80, height: 45 }, { placeholder: 'Venue or city map image', style: { objectFit: 'contain' } }),
      createTextField('venue', 'Venue', { x: 10, y: 68, width: 80, height: 8 }, { placeholder: 'Convention Center', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#10b981' } }),
      createTextField('address', 'Address', { x: 10, y: 78, width: 80, height: 8 }, { placeholder: '123 Main St, San Francisco', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } }),
      createTextField('date', 'Date', { x: 10, y: 88, width: 80, height: 6 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['tshirt', 'back', 'map', 'location']
  },
  {
    id: 'tshirt-back-minimal', name: 'Minimal Back', description: 'Clean minimal back with logo',
    assetType: AssetType.TshirtBack, category: 'universal', dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#6b7280', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 5, width: 40, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('text', 'Text', { x: 15, y: 30, width: 70, height: 12 }, { placeholder: 'EVENT 2024', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('website', 'Website', { x: 25, y: 45, width: 50, height: 6 }, { placeholder: 'event.com', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['tshirt', 'back', 'minimal']
  }
];

// ============= HAT TEMPLATES =============

export const HAT_TEMPLATES: EditableTemplate[] = [
  {
    id: 'hat-embroidered', name: 'Embroidered Cap', description: 'Front panel embroidery design',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(4, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ef4444', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 15, y: 15, width: 70, height: 50 }, { placeholder: 'Logo (vector preferred for embroidery)', required: true }),
      createTextField('text', 'Text Below Logo', { x: 10, y: 70, width: 80, height: 20 }, { placeholder: 'COMPANY', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['hat', 'cap', 'embroidery', 'headwear']
  },
  {
    id: 'hat-text-only', name: 'Text-Only Cap', description: 'Bold text embroidery on cap',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(4, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('text', 'Main Text', { x: 5, y: 15, width: 90, height: 50 }, { placeholder: 'SUMMIT', required: true, style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('subtext', 'Subtext', { x: 10, y: 65, width: 80, height: 20 }, { placeholder: '2024', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['hat', 'cap', 'text', 'bold']
  },
  {
    id: 'hat-icon-logo', name: 'Icon & Logo Cap', description: 'Small icon above text on cap',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(4, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#10b981', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('icon', 'Icon/Symbol', { x: 30, y: 5, width: 40, height: 40 }, { placeholder: 'Small icon or symbol' }),
      createTextField('name', 'Name', { x: 10, y: 55, width: 80, height: 18 }, { placeholder: 'EVENT', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('year', 'Year', { x: 30, y: 75, width: 40, height: 15 }, { placeholder: '2024', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['hat', 'cap', 'icon']
  },
  {
    id: 'hat-curved-text', name: 'Curved Text Cap', description: 'Arched text design for cap front',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(4, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#ffffff', secondary: '#f59e0b', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('top-text', 'Top Text', { x: 10, y: 5, width: 80, height: 18 }, { placeholder: 'EST. 2024', style: { fontSize: 10, textAlign: 'center', color: '#f59e0b', letterSpacing: 3 } }),
      createLogoField('logo', 'Center Logo', { x: 25, y: 22, width: 50, height: 35 }, { placeholder: 'Logo' }),
      createTextField('bottom-text', 'Bottom Text', { x: 5, y: 65, width: 90, height: 18 }, { placeholder: 'CONFERENCE', required: true, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['hat', 'cap', 'curved', 'classic']
  },
  {
    id: 'hat-side-panel', name: 'Side Panel Cap', description: 'Side panel design for structured cap',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(4, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#dc2626', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 10, width: 45, height: 60 }, { placeholder: 'Logo' }),
      createTextField('text', 'Text', { x: 50, y: 20, width: 45, height: 40 }, { placeholder: 'TEAM', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('year', 'Year', { x: 50, y: 60, width: 45, height: 18 }, { placeholder: '2024', style: { fontSize: 10, color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['hat', 'cap', 'side-panel']
  },
  {
    id: 'hat-bucket', name: 'Bucket Hat', description: 'Trendy bucket hat design',
    assetType: AssetType.Hat, category: 'universal', dimensions: createDimensions(5, 2.5, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#000000', secondary: '#ffffff', accent: '#f59e0b', text: '#000000', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Center Logo', { x: 35, y: 10, width: 30, height: 60 }, { placeholder: 'Logo' }),
      createTextField('rim-text', 'Rim Text', { x: 10, y: 80, width: 80, height: 15 }, { placeholder: 'SUMMER VIBES', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 } })
    ],
    tags: ['hat', 'bucket', 'trendy', 'casual']
  }
];

// ============= SWAG BAG TEMPLATES =============

export const SWAG_BAG_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tote-bag-event', name: 'Event Tote Bag', description: 'Standard tote bag design',
    assetType: AssetType.SwagBag, category: 'universal', dimensions: createDimensions(10, 10, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a1a', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 20, y: 10, width: 60, height: 35 }, { placeholder: 'Event logo' }),
      createTextField('event-name', 'Event Name', { x: 10, y: 50, width: 80, height: 15 }, { placeholder: 'TECH SUMMIT 2024', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('date', 'Event Date', { x: 20, y: 68, width: 60, height: 8 }, { placeholder: 'March 15-17', style: { fontSize: 14, textAlign: 'center', color: '#6b7280' } }),
      createTextField('hashtag', 'Hashtag', { x: 25, y: 80, width: 50, height: 8 }, { placeholder: '#TechSummit2024', style: { fontSize: 12, textAlign: 'center', color: '#3b82f6' } })
    ],
    tags: ['tote', 'bag', 'swag', 'event']
  },
  {
    id: 'tote-bag-minimal', name: 'Minimal Tote', description: 'Clean minimal tote bag',
    assetType: AssetType.SwagBag, category: 'universal', dimensions: createDimensions(10, 10, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#000000', secondary: '#6b7280', accent: '#000000', text: '#000000', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 25, width: 40, height: 30 }, { placeholder: 'Logo', required: true }),
      createTextField('text', 'Text', { x: 20, y: 62, width: 60, height: 10 }, { placeholder: 'Company Name', style: { fontSize: 16, textAlign: 'center', color: '#000000' } })
    ],
    tags: ['tote', 'minimal', 'clean']
  },
  {
    id: 'tote-bag-pattern', name: 'Pattern Tote', description: 'All-over pattern tote bag design',
    assetType: AssetType.SwagBag, category: 'universal', dimensions: createDimensions(10, 10, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createImageField('pattern', 'Background Pattern', { x: 0, y: 0, width: 100, height: 100 }, { placeholder: 'Seamless pattern' }),
      createLogoField('logo', 'Logo', { x: 25, y: 30, width: 50, height: 25 }, { placeholder: 'Logo overlay' }),
      createTextField('name', 'Event Name', { x: 15, y: 60, width: 70, height: 10 }, { placeholder: 'EVENT 2024', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['tote', 'pattern', 'branded']
  },
  {
    id: 'tote-bag-eco', name: 'Eco-Friendly Tote', description: 'Nature-inspired eco-conscious design',
    assetType: AssetType.SwagBag, category: 'universal', dimensions: createDimensions(10, 10, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#166534', secondary: '#86efac', accent: '#166534', text: '#166534', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 10, width: 50, height: 25 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 10, y: 40, width: 80, height: 12 }, { placeholder: 'Green Summit 2024', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#166534' } }),
      createTextField('message', 'Eco Message', { x: 15, y: 58, width: 70, height: 8 }, { placeholder: 'Made from recycled materials', style: { fontSize: 11, textAlign: 'center', color: '#166534', fontStyle: 'italic' } }),
      createTextField('hashtag', 'Hashtag', { x: 20, y: 75, width: 60, height: 8 }, { placeholder: '#SustainableEvents', style: { fontSize: 12, textAlign: 'center', color: '#86efac' } })
    ],
    tags: ['tote', 'eco', 'sustainable', 'green']
  },
  {
    id: 'tote-bag-sponsor', name: 'Sponsor Tote', description: 'Tote with sponsor branding',
    assetType: AssetType.SwagBag, category: 'universal', dimensions: createDimensions(10, 10, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1a1a1a', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a1a', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 20, y: 5, width: 60, height: 25 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 10, y: 35, width: 80, height: 10 }, { placeholder: 'CONFERENCE 2024', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('label', 'Sponsor Label', { x: 25, y: 50, width: 50, height: 5 }, { placeholder: 'PRESENTED BY', style: { fontSize: 8, textAlign: 'center', color: '#6b7280', letterSpacing: 2 } }),
      createLogoField('sponsor-logo', 'Sponsor Logo', { x: 25, y: 58, width: 50, height: 18 }, { placeholder: 'Sponsor logo' }),
      createTextField('website', 'Website', { x: 20, y: 82, width: 60, height: 6 }, { placeholder: 'sponsor.com', style: { fontSize: 10, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['tote', 'sponsor', 'branded']
  }
];

// Vendor-specific templates
export const FOURIMPRINT_MERCH_TEMPLATES: EditableTemplate[] = [
  {
    id: 'hat-4imprint-embroidered', name: '4imprint Embroidered Cap', description: 'Optimized for 4imprint embroidery specifications',
    assetType: AssetType.Hat, category: 'vendor-specific', vendorId: '4imprint',
    dimensions: createDimensions(4, 2.25, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Arial', body: 'Arial' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ff0000', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 10, y: 10, width: 80, height: 55 }, { placeholder: 'Vector logo (AI, EPS, PDF preferred)', required: true, acceptedFormats: ['ai', 'eps', 'pdf', 'svg'] }),
      createTextField('text', 'Text', { x: 10, y: 70, width: 80, height: 20 }, { placeholder: 'BRAND', maxLength: 15, style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['4imprint', 'vendor', 'hat', 'embroidery'], isSystemTemplate: true
  }
];

export const PRINTFUL_MERCH_TEMPLATES: EditableTemplate[] = [
  {
    id: 'tshirt-printful-dtg', name: 'Printful DTG Print', description: 'Optimized for Printful direct-to-garment printing',
    assetType: AssetType.Tshirt, category: 'vendor-specific', vendorId: 'printful',
    dimensions: createDimensions(12, 16, 0, 0.5),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#3b82f6', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createImageField('design', 'Main Design', { x: 5, y: 5, width: 90, height: 90 }, { placeholder: 'Full design (PNG with transparency)', required: true, acceptedFormats: ['png'] })
    ],
    tags: ['printful', 'vendor', 'tshirt', 'dtg'], isSystemTemplate: true
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
