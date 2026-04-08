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

// ============= T-SHIRT SLEEVE TEMPLATES =============

export const TSHIRT_SLEEVE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'sleeve-logo-left', name: 'Left Sleeve Logo', description: 'Small logo on left sleeve',
    assetType: AssetType.TshirtSleeve, category: 'universal', dimensions: createDimensions(3.5, 3.5, 0, 0.25),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 10, y: 15, width: 80, height: 55 }, { placeholder: 'Small logo for sleeve', required: true }),
      createTextField('text', 'Text', { x: 10, y: 75, width: 80, height: 15 }, { placeholder: 'EST. 2024', style: { fontSize: 10, textAlign: 'center', color: '#ffffff', letterSpacing: 2 } })
    ],
    tags: ['tshirt', 'sleeve', 'logo', 'minimal']
  },
  {
    id: 'sleeve-text-vertical', name: 'Vertical Text Sleeve', description: 'Vertical text down the sleeve',
    assetType: AssetType.TshirtSleeve, category: 'universal', dimensions: createDimensions(3.5, 5, 0, 0.25),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#ef4444', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('text', 'Text', { x: 15, y: 5, width: 70, height: 90 }, { placeholder: 'SUMMIT', required: true, style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 } })
    ],
    tags: ['tshirt', 'sleeve', 'vertical', 'bold']
  },
  {
    id: 'sleeve-flag', name: 'Flag Patch Sleeve', description: 'Flag or icon patch placement',
    assetType: AssetType.TshirtSleeve, category: 'universal', dimensions: createDimensions(3, 2, 0, 0.125),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#3b82f6', accent: '#ef4444', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createImageField('patch', 'Patch/Flag', { x: 5, y: 5, width: 90, height: 70 }, { placeholder: 'Flag, patch, or icon', required: true, style: { objectFit: 'contain' } }),
      createTextField('label', 'Label', { x: 10, y: 78, width: 80, height: 16 }, { placeholder: 'TEAM USA', style: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['tshirt', 'sleeve', 'flag', 'patch']
  },
  {
    id: 'sleeve-sponsor-strip', name: 'Sponsor Sleeve Strip', description: 'Sponsor logo strip on sleeve',
    assetType: AssetType.TshirtSleeve, category: 'universal', dimensions: createDimensions(3.5, 4, 0, 0.25),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#ffffff', secondary: '#6b7280', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 5, width: 80, height: 12 }, { placeholder: 'POWERED BY', style: { fontSize: 7, textAlign: 'center', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 } }),
      createLogoField('sponsor1', 'Sponsor 1', { x: 15, y: 20, width: 70, height: 22 }, { placeholder: 'Sponsor logo 1' }),
      createLogoField('sponsor2', 'Sponsor 2', { x: 15, y: 48, width: 70, height: 22 }, { placeholder: 'Sponsor logo 2' }),
      createLogoField('sponsor3', 'Sponsor 3', { x: 15, y: 76, width: 70, height: 22 }, { placeholder: 'Sponsor logo 3' })
    ],
    tags: ['tshirt', 'sleeve', 'sponsor']
  },
  {
    id: 'sleeve-number', name: 'Jersey Number Sleeve', description: 'Sports-style number on sleeve',
    assetType: AssetType.TshirtSleeve, category: 'universal', dimensions: createDimensions(3.5, 3.5, 0, 0.25),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#f59e0b', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('number', 'Number', { x: 10, y: 10, width: 80, height: 55 }, { placeholder: '24', required: true, style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('label', 'Label', { x: 10, y: 70, width: 80, height: 18 }, { placeholder: 'VOLUNTEER', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b', letterSpacing: 2 } })
    ],
    tags: ['tshirt', 'sleeve', 'number', 'sports']
  }
];

// ============= LANYARD TEMPLATES =============

export const LANYARD_TEMPLATES: EditableTemplate[] = [
  {
    id: 'lanyard-repeat-logo', name: 'Repeat Logo Lanyard', description: 'Repeating logo pattern lanyard',
    assetType: AssetType.Lanyard, category: 'universal', dimensions: createDimensions(36, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#1a1a2e' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a2e', secondary: '#ffffff', accent: '#3b82f6', text: '#ffffff', background: '#1a1a2e' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo (repeats)', { x: 2, y: 10, width: 12, height: 80 }, { placeholder: 'Logo repeats along lanyard', required: true }),
      createTextField('name', 'Event Name', { x: 16, y: 15, width: 20, height: 70 }, { placeholder: 'SUMMIT 2024', style: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 1 } })
    ],
    tags: ['lanyard', 'repeat', 'logo', 'badge']
  },
  {
    id: 'lanyard-text-pattern', name: 'Text Pattern Lanyard', description: 'Repeating text pattern',
    assetType: AssetType.Lanyard, category: 'universal', dimensions: createDimensions(36, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#000000', secondary: '#f59e0b', accent: '#ffffff', text: '#f59e0b', background: '#000000' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('text', 'Repeating Text', { x: 2, y: 10, width: 96, height: 80 }, { placeholder: 'CONFERENCE 2024 • CONFERENCE 2024 •', required: true, style: { fontSize: 8, fontWeight: 'bold', color: '#f59e0b', letterSpacing: 1 } })
    ],
    tags: ['lanyard', 'text', 'pattern']
  },
  {
    id: 'lanyard-dual-brand', name: 'Dual Brand Lanyard', description: 'Event + sponsor branding',
    assetType: AssetType.Lanyard, category: 'universal', dimensions: createDimensions(36, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 2, y: 10, width: 10, height: 80 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event Name', { x: 14, y: 15, width: 18, height: 70 }, { placeholder: 'SUMMIT', style: { fontSize: 8, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('separator', '•', { x: 33, y: 25, width: 2, height: 50 }, { defaultValue: '•', style: { fontSize: 8, textAlign: 'center', color: '#f59e0b' } }),
      createLogoField('sponsor-logo', 'Sponsor Logo', { x: 37, y: 10, width: 10, height: 80 }, { placeholder: 'Sponsor logo' })
    ],
    tags: ['lanyard', 'dual', 'sponsor', 'brand']
  },
  {
    id: 'lanyard-gradient', name: 'Gradient Lanyard', description: 'Modern gradient design',
    assetType: AssetType.Lanyard, category: 'universal', dimensions: createDimensions(36, 0.75, 0, 0.0625),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#6366f1', secondary: '#a855f7', accent: '#ffffff', text: '#ffffff', background: '#6366f1' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 3, y: 10, width: 10, height: 80 }, { placeholder: 'Logo (white recommended)', required: true }),
      createTextField('event', 'Event', { x: 15, y: 15, width: 25, height: 70 }, { placeholder: 'DEVCON 2024', style: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 } })
    ],
    tags: ['lanyard', 'gradient', 'modern']
  },
  {
    id: 'lanyard-vip', name: 'VIP Lanyard', description: 'Premium VIP-style lanyard',
    assetType: AssetType.Lanyard, category: 'premium', dimensions: createDimensions(36, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#0d0d0d' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#0d0d0d', secondary: '#c9a84c', accent: '#ffffff', text: '#c9a84c', background: '#0d0d0d' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('vip', 'VIP Label', { x: 2, y: 10, width: 10, height: 80 }, { defaultValue: 'VIP', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#c9a84c', letterSpacing: 2 } }),
      createLogoField('logo', 'Logo', { x: 14, y: 10, width: 10, height: 80 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 26, y: 15, width: 20, height: 70 }, { placeholder: 'GALA 2024', style: { fontSize: 8, fontWeight: 'bold', color: '#c9a84c' } })
    ],
    tags: ['lanyard', 'vip', 'premium', 'gold'],
    isPremium: true
  }
];

// ============= WATER BOTTLE TEMPLATES =============

export const WATER_BOTTLE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'bottle-wrap-logo', name: 'Logo Bottle Wrap', description: 'Full wrap with centered logo',
    assetType: AssetType.WaterBottle, category: 'universal', dimensions: createDimensions(8.25, 2, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a2e', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a2e', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 10, width: 30, height: 45 }, { placeholder: 'Event logo', required: true }),
      createTextField('name', 'Event Name', { x: 10, y: 60, width: 80, height: 18 }, { placeholder: 'TECH SUMMIT 2024', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e' } }),
      createTextField('tagline', 'Tagline', { x: 15, y: 80, width: 70, height: 12 }, { placeholder: 'Stay Hydrated • Stay Inspired', style: { fontSize: 8, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['water-bottle', 'wrap', 'logo']
  },
  {
    id: 'bottle-wrap-bold', name: 'Bold Event Bottle', description: 'Bold colored bottle label',
    assetType: AssetType.WaterBottle, category: 'universal', dimensions: createDimensions(8.25, 2, 0.125, 0.25),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('event', 'Event Name', { x: 5, y: 10, width: 50, height: 40 }, { placeholder: 'SUMMIT\n2024', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 60, y: 10, width: 35, height: 40 }, { placeholder: 'Logo' }),
      createTextField('hashtag', 'Hashtag', { x: 5, y: 58, width: 90, height: 15 }, { placeholder: '#TechSummit2024', style: { fontSize: 10, color: '#f59e0b' } }),
      createTextField('website', 'Website', { x: 5, y: 78, width: 90, height: 12 }, { placeholder: 'summit2024.com', style: { fontSize: 8, color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['water-bottle', 'bold', 'event']
  },
  {
    id: 'bottle-wrap-minimal', name: 'Minimal Bottle Label', description: 'Clean minimal water bottle',
    assetType: AssetType.WaterBottle, category: 'universal', dimensions: createDimensions(8.25, 2, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#000000', secondary: '#6b7280', accent: '#000000', text: '#000000', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 40, y: 15, width: 20, height: 40 }, { placeholder: 'Logo', required: true }),
      createTextField('name', 'Name', { x: 20, y: 62, width: 60, height: 16 }, { placeholder: 'Company Name', style: { fontSize: 11, textAlign: 'center', color: '#000000' } }),
      createTextField('info', 'Info', { x: 25, y: 82, width: 50, height: 10 }, { placeholder: 'Purified Water • 500ml', style: { fontSize: 7, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['water-bottle', 'minimal', 'clean']
  },
  {
    id: 'bottle-wrap-sponsor', name: 'Sponsor Bottle', description: 'Sponsor-branded water bottle',
    assetType: AssetType.WaterBottle, category: 'universal', dimensions: createDimensions(8.25, 2, 0.125, 0.25),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1a1a1a', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a1a', background: '#f8fafc' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 5, y: 10, width: 25, height: 50 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 5, y: 65, width: 25, height: 15 }, { placeholder: 'SUMMIT 2024', style: { fontSize: 7, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('sponsor-label', 'Sponsor Label', { x: 40, y: 10, width: 20, height: 12 }, { placeholder: 'HYDRATION BY', style: { fontSize: 6, textAlign: 'center', color: '#6b7280', letterSpacing: 1 } }),
      createLogoField('sponsor-logo', 'Sponsor Logo', { x: 35, y: 28, width: 30, height: 40 }, { placeholder: 'Sponsor logo' }),
      createTextField('website', 'Website', { x: 35, y: 72, width: 30, height: 12 }, { placeholder: 'sponsor.com', style: { fontSize: 7, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['water-bottle', 'sponsor', 'branded']
  },
  {
    id: 'bottle-wrap-wellness', name: 'Wellness Bottle', description: 'Health/wellness themed bottle',
    assetType: AssetType.WaterBottle, category: 'universal', dimensions: createDimensions(8.25, 2, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#059669', secondary: '#10b981', accent: '#064e3b', text: '#064e3b', background: '#ecfdf5' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 35 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 10, y: 42, width: 80, height: 18 }, { placeholder: 'WELLNESS RETREAT', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#064e3b' } }),
      createTextField('message', 'Message', { x: 15, y: 65, width: 70, height: 12 }, { placeholder: 'Hydrate. Refresh. Renew.', style: { fontSize: 9, textAlign: 'center', color: '#059669', fontStyle: 'italic' } }),
      createTextField('year', 'Year', { x: 35, y: 82, width: 30, height: 10 }, { placeholder: '2024', style: { fontSize: 8, textAlign: 'center', color: '#10b981' } })
    ],
    tags: ['water-bottle', 'wellness', 'health', 'retreat']
  }
];

// ============= STICKER SHEET TEMPLATES =============

export const STICKER_SHEET_TEMPLATES: EditableTemplate[] = [
  {
    id: 'sticker-logo-set', name: 'Logo Sticker Set', description: 'Variety of logo stickers in different sizes',
    assetType: AssetType.StickerSheet, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a2e', secondary: '#3b82f6', accent: '#f59e0b', text: '#1a1a2e', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo-large', 'Large Logo', { x: 10, y: 5, width: 35, height: 25 }, { placeholder: 'Main logo sticker', required: true }),
      createLogoField('logo-med-1', 'Medium Logo 1', { x: 55, y: 5, width: 20, height: 12 }, { placeholder: 'Medium sticker' }),
      createLogoField('logo-med-2', 'Medium Logo 2', { x: 55, y: 20, width: 20, height: 12 }, { placeholder: 'Medium sticker' }),
      createTextField('event', 'Event Name', { x: 10, y: 35, width: 80, height: 10 }, { placeholder: 'SUMMIT 2024', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e' } }),
      createTextField('hashtag', 'Hashtag Sticker', { x: 10, y: 50, width: 35, height: 10 }, { placeholder: '#Summit2024', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' } }),
      createTextField('tagline', 'Tagline Sticker', { x: 55, y: 50, width: 35, height: 10 }, { placeholder: 'Innovate Today', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } })
    ],
    tags: ['sticker', 'logo', 'set', 'variety']
  },
  {
    id: 'sticker-die-cut', name: 'Die-Cut Stickers', description: 'Custom shape die-cut stickers',
    assetType: AssetType.StickerSheet, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b', text: '#ffffff', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createImageField('sticker-1', 'Sticker 1', { x: 5, y: 5, width: 28, height: 20 }, { placeholder: 'Die-cut design 1', style: { objectFit: 'contain' } }),
      createImageField('sticker-2', 'Sticker 2', { x: 37, y: 5, width: 28, height: 20 }, { placeholder: 'Die-cut design 2', style: { objectFit: 'contain' } }),
      createImageField('sticker-3', 'Sticker 3', { x: 68, y: 5, width: 28, height: 20 }, { placeholder: 'Die-cut design 3', style: { objectFit: 'contain' } }),
      createLogoField('logo', 'Logo Sticker', { x: 5, y: 30, width: 28, height: 20 }, { placeholder: 'Logo die-cut' }),
      createTextField('text-sticker', 'Text Sticker', { x: 37, y: 30, width: 28, height: 20 }, { placeholder: 'BELIEVE', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#8b5cf6' } }),
      createImageField('sticker-6', 'Sticker 6', { x: 68, y: 30, width: 28, height: 20 }, { placeholder: 'Design 6', style: { objectFit: 'contain' } })
    ],
    tags: ['sticker', 'die-cut', 'custom']
  },
  {
    id: 'sticker-emoji-pack', name: 'Event Emoji Pack', description: 'Fun emoji-style event stickers',
    assetType: AssetType.StickerSheet, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f59e0b', secondary: '#ef4444', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('title', 'Sheet Title', { x: 10, y: 2, width: 80, height: 6 }, { placeholder: 'SUMMIT STICKER PACK', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createImageField('s1', 'Emoji 1', { x: 5, y: 12, width: 18, height: 14 }, { placeholder: '🎉', style: { objectFit: 'contain' } }),
      createImageField('s2', 'Emoji 2', { x: 28, y: 12, width: 18, height: 14 }, { placeholder: '🚀', style: { objectFit: 'contain' } }),
      createImageField('s3', 'Emoji 3', { x: 52, y: 12, width: 18, height: 14 }, { placeholder: '💡', style: { objectFit: 'contain' } }),
      createImageField('s4', 'Emoji 4', { x: 76, y: 12, width: 18, height: 14 }, { placeholder: '🔥', style: { objectFit: 'contain' } }),
      createLogoField('logo', 'Event Logo', { x: 30, y: 80, width: 40, height: 15 }, { placeholder: 'Event logo' })
    ],
    tags: ['sticker', 'emoji', 'fun', 'pack']
  },
  {
    id: 'sticker-qr-social', name: 'Social QR Stickers', description: 'QR codes for social media profiles',
    assetType: AssetType.StickerSheet, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#3b82f6', accent: '#6366f1', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 3, width: 40, height: 12 }, { placeholder: 'Event logo' }),
      { id: 'qr1', type: 'qrcode' as any, name: 'QR Code 1', position: { x: 10, y: 20, width: 22, height: 18 }, placeholder: 'Website URL', style: {} },
      createTextField('label1', 'Label 1', { x: 10, y: 40, width: 22, height: 5 }, { placeholder: 'Website', style: { fontSize: 8, textAlign: 'center', color: '#1a1a1a' } }),
      { id: 'qr2', type: 'qrcode' as any, name: 'QR Code 2', position: { x: 40, y: 20, width: 22, height: 18 }, placeholder: 'LinkedIn URL', style: {} },
      createTextField('label2', 'Label 2', { x: 40, y: 40, width: 22, height: 5 }, { placeholder: 'LinkedIn', style: { fontSize: 8, textAlign: 'center', color: '#3b82f6' } }),
      { id: 'qr3', type: 'qrcode' as any, name: 'QR Code 3', position: { x: 68, y: 20, width: 22, height: 18 }, placeholder: 'Instagram URL', style: {} },
      createTextField('label3', 'Label 3', { x: 68, y: 40, width: 22, height: 5 }, { placeholder: 'Instagram', style: { fontSize: 8, textAlign: 'center', color: '#6366f1' } })
    ],
    tags: ['sticker', 'qr', 'social', 'media']
  },
  {
    id: 'sticker-laptop', name: 'Laptop Stickers', description: 'Laptop-sized branded stickers',
    assetType: AssetType.StickerSheet, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#22d3ee', accent: '#f43f5e', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo-main', 'Main Logo (3")', { x: 10, y: 5, width: 35, height: 22 }, { placeholder: 'Large laptop sticker', required: true }),
      createTextField('slogan', 'Slogan Sticker', { x: 55, y: 5, width: 38, height: 10 }, { placeholder: 'BUILD THE FUTURE', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#0f172a' } }),
      createLogoField('icon-1', 'Icon 1 (1.5")', { x: 55, y: 18, width: 16, height: 10 }, { placeholder: 'Small sticker' }),
      createLogoField('icon-2', 'Icon 2 (1.5")', { x: 75, y: 18, width: 16, height: 10 }, { placeholder: 'Small sticker' }),
      createTextField('event', 'Event Badge', { x: 10, y: 32, width: 30, height: 12 }, { placeholder: 'ATTENDEE\nSUMMIT 2024', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee' } }),
      createImageField('graphic', 'Graphic Sticker', { x: 45, y: 32, width: 20, height: 12 }, { placeholder: 'Custom graphic', style: { objectFit: 'contain' } })
    ],
    tags: ['sticker', 'laptop', 'tech', 'developer']
  }
];

// ============= WRISTBAND TEMPLATES =============

export const WRISTBAND_TEMPLATES: EditableTemplate[] = [
  {
    id: 'wristband-tyvek', name: 'Tyvek Wristband', description: 'Standard Tyvek event wristband',
    assetType: AssetType.WristbandDesign, category: 'universal', dimensions: createDimensions(10, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#ef4444' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ef4444', secondary: '#ffffff', accent: '#000000', text: '#ffffff', background: '#ef4444' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 2, y: 10, width: 12, height: 80 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 16, y: 10, width: 35, height: 80 }, { placeholder: 'SUMMIT 2024', required: true, style: { fontSize: 10, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('access', 'Access Level', { x: 55, y: 10, width: 20, height: 80 }, { placeholder: 'GA', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 78, y: 10, width: 20, height: 80 }, { placeholder: 'MAR 15', style: { fontSize: 8, textAlign: 'right', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['wristband', 'tyvek', 'access']
  },
  {
    id: 'wristband-vip', name: 'VIP Wristband', description: 'Premium VIP wristband design',
    assetType: AssetType.WristbandDesign, category: 'premium', dimensions: createDimensions(10, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#0d0d0d' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#0d0d0d', secondary: '#c9a84c', accent: '#ffffff', text: '#c9a84c', background: '#0d0d0d' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('vip', 'VIP', { x: 2, y: 10, width: 12, height: 80 }, { defaultValue: '★ VIP', style: { fontSize: 10, fontWeight: 'bold', color: '#c9a84c' } }),
      createLogoField('logo', 'Logo', { x: 16, y: 10, width: 10, height: 80 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 28, y: 10, width: 40, height: 80 }, { placeholder: 'GALA EVENING 2024', style: { fontSize: 9, fontWeight: 'bold', color: '#c9a84c' } }),
      createTextField('access', 'Access', { x: 72, y: 10, width: 26, height: 80 }, { placeholder: 'ALL ACCESS', style: { fontSize: 8, textAlign: 'right', color: '#ffffff' } })
    ],
    tags: ['wristband', 'vip', 'premium', 'gold'],
    isPremium: true
  },
  {
    id: 'wristband-neon', name: 'Neon Wristband', description: 'Bright neon party wristband',
    assetType: AssetType.WristbandDesign, category: 'universal', dimensions: createDimensions(10, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#2dd4a8' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#2dd4a8', secondary: '#0d1b2a', accent: '#ffffff', text: '#0d1b2a', background: '#2dd4a8' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('event', 'Event', { x: 3, y: 10, width: 50, height: 80 }, { placeholder: 'NEON NIGHTS 2024', required: true, style: { fontSize: 10, fontWeight: 'bold', color: '#0d1b2a' } }),
      createTextField('day', 'Day', { x: 60, y: 10, width: 15, height: 80 }, { placeholder: 'FRI', style: { fontSize: 12, fontWeight: '800', textAlign: 'center', color: '#0d1b2a' } }),
      createTextField('number', 'Number', { x: 78, y: 10, width: 20, height: 80 }, { placeholder: '#0001', style: { fontSize: 8, textAlign: 'right', color: '#0d1b2a' } })
    ],
    tags: ['wristband', 'neon', 'party', 'festival']
  },
  {
    id: 'wristband-multi-day', name: 'Multi-Day Wristband', description: 'Wristband with day indicators',
    assetType: AssetType.WristbandDesign, category: 'universal', dimensions: createDimensions(10, 0.75, 0, 0.0625),
    background: { type: 'solid', value: '#3b82f6' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#3b82f6', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#3b82f6' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 2, y: 10, width: 10, height: 80 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 14, y: 10, width: 30, height: 80 }, { placeholder: 'CONF 2024', style: { fontSize: 9, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('day1', 'Day 1', { x: 48, y: 10, width: 14, height: 80 }, { placeholder: 'DAY 1', style: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('day2', 'Day 2', { x: 64, y: 10, width: 14, height: 80 }, { placeholder: 'DAY 2', style: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('day3', 'Day 3', { x: 80, y: 10, width: 14, height: 80 }, { placeholder: 'DAY 3', style: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['wristband', 'multi-day', 'festival', 'conference']
  },
  {
    id: 'wristband-charity', name: 'Charity Wristband', description: 'Cause-awareness silicone wristband',
    assetType: AssetType.WristbandDesign, category: 'universal', dimensions: createDimensions(8, 0.5, 0, 0.0625),
    background: { type: 'solid', value: '#ec4899' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ec4899', secondary: '#ffffff', accent: '#ffffff', text: '#ffffff', background: '#ec4899' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createTextField('message', 'Message', { x: 5, y: 10, width: 60, height: 80 }, { placeholder: 'STAND TOGETHER', required: true, style: { fontSize: 10, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 } }),
      createTextField('year', 'Year', { x: 70, y: 10, width: 25, height: 80 }, { placeholder: '2024', style: { fontSize: 9, textAlign: 'right', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['wristband', 'charity', 'cause', 'awareness']
  }
];

// ============= COASTER TEMPLATES =============

export const COASTER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'coaster-round-logo', name: 'Round Logo Coaster', description: 'Circular coaster with centered logo',
    assetType: AssetType.CoasterDesign, category: 'universal', dimensions: createDimensions(4, 4, 0.125, 0.25),
    background: { type: 'solid', value: '#1a1a2e' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a2e', secondary: '#ffffff', accent: '#3b82f6', text: '#ffffff', background: '#1a1a2e' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 20, y: 15, width: 60, height: 40 }, { placeholder: 'Logo', required: true }),
      createTextField('name', 'Event Name', { x: 10, y: 60, width: 80, height: 15 }, { placeholder: 'SUMMIT 2024', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 15, y: 78, width: 70, height: 10 }, { placeholder: 'Cheers to Innovation', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['coaster', 'round', 'logo', 'bar']
  },
  {
    id: 'coaster-square-branded', name: 'Square Branded Coaster', description: 'Square coaster with branding',
    assetType: AssetType.CoasterDesign, category: 'universal', dimensions: createDimensions(3.5, 3.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#1e3a5f', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 10, width: 50, height: 35 }, { placeholder: 'Logo', required: true }),
      createTextField('event', 'Event', { x: 10, y: 52, width: 80, height: 14 }, { placeholder: 'GALA 2024', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('venue', 'Venue', { x: 15, y: 70, width: 70, height: 10 }, { placeholder: 'Grand Ballroom', style: { fontSize: 8, textAlign: 'center', color: '#6b7280' } }),
      createTextField('hashtag', 'Hashtag', { x: 15, y: 84, width: 70, height: 10 }, { placeholder: '#CheersToSuccess', style: { fontSize: 7, textAlign: 'center', color: '#f59e0b' } })
    ],
    tags: ['coaster', 'square', 'branded']
  },
  {
    id: 'coaster-sponsor', name: 'Sponsor Coaster', description: 'Sponsor-branded bar coaster',
    assetType: AssetType.CoasterDesign, category: 'universal', dimensions: createDimensions(4, 4, 0.125, 0.25),
    background: { type: 'solid', value: '#0d0d0d' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#0d0d0d', secondary: '#c9a84c', accent: '#ffffff', text: '#c9a84c', background: '#0d0d0d' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('label', 'Label', { x: 15, y: 8, width: 70, height: 10 }, { placeholder: 'TONIGHT\'S DRINKS BY', style: { fontSize: 7, textAlign: 'center', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 } }),
      createLogoField('sponsor', 'Sponsor Logo', { x: 15, y: 22, width: 70, height: 35 }, { placeholder: 'Sponsor logo', required: true }),
      { id: 'line', type: 'divider' as any, name: 'Divider', position: { x: 20, y: 62, width: 60, height: 0.5 }, style: { backgroundColor: '#c9a84c' } },
      createLogoField('event-logo', 'Event Logo', { x: 30, y: 68, width: 40, height: 20 }, { placeholder: 'Event logo' })
    ],
    tags: ['coaster', 'sponsor', 'bar', 'premium']
  },
  {
    id: 'coaster-cocktail', name: 'Cocktail Menu Coaster', description: 'Coaster with signature drink',
    assetType: AssetType.CoasterDesign, category: 'universal', dimensions: createDimensions(4, 4, 0.125, 0.25),
    background: { type: 'solid', value: '#1a0a2e' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#1a0a2e', secondary: '#a855f7', accent: '#f59e0b', text: '#ffffff', background: '#1a0a2e' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('drink', 'Drink Name', { x: 10, y: 10, width: 80, height: 16 }, { placeholder: 'THE INNOVATOR', required: true, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } }),
      createTextField('recipe', 'Recipe', { x: 15, y: 30, width: 70, height: 30 }, { placeholder: 'Vodka • Elderflower\nLemon • Prosecco', style: { fontSize: 9, textAlign: 'center', color: '#ffffff', lineHeight: 1.6 } }),
      { id: 'line', type: 'divider' as any, name: 'Divider', position: { x: 25, y: 65, width: 50, height: 0.3 }, style: { backgroundColor: '#a855f7' } },
      createLogoField('logo', 'Event Logo', { x: 30, y: 72, width: 40, height: 18 }, { placeholder: 'Event logo' })
    ],
    tags: ['coaster', 'cocktail', 'drink', 'menu']
  },
  {
    id: 'coaster-fun-quote', name: 'Fun Quote Coaster', description: 'Playful quote coaster for events',
    assetType: AssetType.CoasterDesign, category: 'universal', dimensions: createDimensions(4, 4, 0.125, 0.25),
    background: { type: 'solid', value: '#fef3c7' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f59e0b', secondary: '#1a1a1a', accent: '#ef4444', text: '#1a1a1a', background: '#fef3c7' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('quote', 'Quote', { x: 10, y: 15, width: 80, height: 35 }, { placeholder: 'THIS IS MY\nNETWORKING\nFACE', required: true, style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', lineHeight: 1.3 } }),
      createTextField('subtext', 'Subtext', { x: 15, y: 58, width: 70, height: 10 }, { placeholder: '— every introvert at this event', style: { fontSize: 8, textAlign: 'center', color: '#6b7280', fontStyle: 'italic' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 75, width: 30, height: 15 }, { placeholder: 'Event logo' })
    ],
    tags: ['coaster', 'fun', 'quote', 'humor']
  }
];

// ============= NAPKIN TEMPLATES =============

export const NAPKIN_TEMPLATES: EditableTemplate[] = [
  {
    id: 'napkin-corner-logo', name: 'Corner Logo Napkin', description: 'Elegant corner logo placement',
    assetType: AssetType.NapkinDesign, category: 'universal', dimensions: createDimensions(5, 5, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#c9a84c', secondary: '#1a1a1a', accent: '#c9a84c', text: '#c9a84c', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 55, y: 55, width: 35, height: 35 }, { placeholder: 'Logo (gold foil recommended)', required: true })
    ],
    tags: ['napkin', 'corner', 'elegant', 'minimal']
  },
  {
    id: 'napkin-monogram', name: 'Monogram Napkin', description: 'Centered monogram initials',
    assetType: AssetType.NapkinDesign, category: 'universal', dimensions: createDimensions(5, 5, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#1e3a5f', secondary: '#c9a84c', accent: '#1e3a5f', text: '#1e3a5f', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('initials', 'Monogram', { x: 25, y: 20, width: 50, height: 40 }, { placeholder: 'AB', required: true, style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('name', 'Full Name', { x: 15, y: 65, width: 70, height: 12 }, { placeholder: 'Annual Benefit', style: { fontSize: 10, textAlign: 'center', color: '#c9a84c', letterSpacing: 2 } })
    ],
    tags: ['napkin', 'monogram', 'wedding', 'formal']
  },
  {
    id: 'napkin-event-branded', name: 'Event Branded Napkin', description: 'Full branded cocktail napkin',
    assetType: AssetType.NapkinDesign, category: 'universal', dimensions: createDimensions(5, 5, 0, 0.25),
    background: { type: 'solid', value: '#1a1a2e' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1a1a2e', secondary: '#ffffff', accent: '#3b82f6', text: '#ffffff', background: '#1a1a2e' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 10, width: 50, height: 30 }, { placeholder: 'Event logo', required: true }),
      createTextField('event', 'Event', { x: 10, y: 48, width: 80, height: 14 }, { placeholder: 'SUMMIT 2024', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 20, y: 66, width: 60, height: 10 }, { placeholder: 'March 15, 2024', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createTextField('hashtag', 'Hashtag', { x: 20, y: 80, width: 60, height: 10 }, { placeholder: '#Summit2024', style: { fontSize: 8, textAlign: 'center', color: '#3b82f6' } })
    ],
    tags: ['napkin', 'branded', 'event', 'cocktail']
  },
  {
    id: 'napkin-wedding', name: 'Wedding Napkin', description: 'Romantic wedding napkin design',
    assetType: AssetType.NapkinDesign, category: 'universal', dimensions: createDimensions(5, 5, 0, 0.25),
    background: { type: 'solid', value: '#fff7ed' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#c9a84c', secondary: '#2d5016', accent: '#d97706', text: '#2d5016', background: '#fff7ed' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('names', 'Names', { x: 10, y: 20, width: 80, height: 25 }, { placeholder: 'Sarah & James', required: true, style: { fontSize: 22, textAlign: 'center', color: '#2d5016', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider' as any, name: 'Divider', position: { x: 30, y: 50, width: 40, height: 0.3 }, style: { backgroundColor: '#c9a84c' } },
      createTextField('date', 'Date', { x: 15, y: 56, width: 70, height: 12 }, { placeholder: 'June 22, 2024', style: { fontSize: 10, textAlign: 'center', color: '#d97706' } }),
      createTextField('venue', 'Venue', { x: 15, y: 72, width: 70, height: 10 }, { placeholder: 'The Rose Garden', style: { fontSize: 8, textAlign: 'center', color: '#6b7280', fontStyle: 'italic' } })
    ],
    tags: ['napkin', 'wedding', 'romantic', 'elegant']
  },
  {
    id: 'napkin-party', name: 'Party Napkin', description: 'Fun party napkin with bold design',
    assetType: AssetType.NapkinDesign, category: 'universal', dimensions: createDimensions(5, 5, 0, 0.25),
    background: { type: 'solid', value: '#0d1b2a' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#0d1b2a', secondary: '#22d3ee', accent: '#f43f5e', text: '#ffffff', background: '#0d1b2a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('message', 'Message', { x: 10, y: 20, width: 80, height: 30 }, { placeholder: 'LET\'S\nCELEBRATE', required: true, style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee', lineHeight: 1.2 } }),
      createLogoField('logo', 'Logo', { x: 30, y: 58, width: 40, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('year', 'Year', { x: 35, y: 82, width: 30, height: 10 }, { placeholder: '2024', style: { fontSize: 10, textAlign: 'center', color: '#f43f5e' } })
    ],
    tags: ['napkin', 'party', 'celebration', 'fun']
  }
];

export const ALL_MERCHANDISE_TEMPLATES: EditableTemplate[] = [
  ...TSHIRT_TEMPLATES,
  ...TSHIRT_BACK_TEMPLATES,
  ...TSHIRT_SLEEVE_TEMPLATES,
  ...HAT_TEMPLATES,
  ...LANYARD_TEMPLATES,
  ...SWAG_BAG_TEMPLATES,
  ...WATER_BOTTLE_TEMPLATES,
  ...STICKER_SHEET_TEMPLATES,
  ...WRISTBAND_TEMPLATES,
  ...COASTER_TEMPLATES,
  ...NAPKIN_TEMPLATES,
  ...FOURIMPRINT_MERCH_TEMPLATES,
  ...PRINTFUL_MERCH_TEMPLATES
];
