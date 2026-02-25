// Badge Templates - VIP, Backstage, Security, etc.

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
  style: { objectFit: 'cover', borderRadius: 0, ...options.style },
  acceptedFormats: ['jpg', 'png', 'webp'],
  ...options
});

// ============= VIP BADGE TEMPLATES =============

export const VIP_BADGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'vip-badge-luxury',
    name: 'VIP Luxury',
    description: 'Premium VIP badge with gold accents',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#ffffff', text: '#ffffff', background: '#1a1a1a' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'gold-border', type: 'shape', name: 'Gold Border', position: { x: 3, y: 5, width: 94, height: 90 }, style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid', borderRadius: 4 } },
      createLogoField('logo', 'Event Logo', { x: 10, y: 10, width: 30, height: 25 }, { placeholder: 'Event logo' }),
      createTextField('vip-label', 'VIP Label', { x: 45, y: 12, width: 45, height: 18 }, { placeholder: 'VIP', style: { fontSize: 36, fontWeight: 'bold', textAlign: 'right', color: '#d4af37', letterSpacing: 8 } }),
      createTextField('guest-name', 'Guest Name', { x: 10, y: 45, width: 80, height: 15 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' } }),
      createTextField('access-level', 'Access Level', { x: 10, y: 65, width: 80, height: 10 }, { placeholder: 'All Access', style: { fontSize: 12, textAlign: 'center', color: '#d4af37', textTransform: 'uppercase', letterSpacing: 2 } }),
      createTextField('event-name', 'Event Name', { x: 10, y: 80, width: 80, height: 10 }, { placeholder: 'Event Name 2024', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['vip', 'luxury', 'premium', 'gold']
  },
  {
    id: 'vip-badge-modern',
    name: 'VIP Modern Minimal',
    description: 'Clean modern VIP badge with bold typography',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#8b5cf6', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'accent-strip', type: 'shape', name: 'Accent Strip', position: { x: 0, y: 0, width: 5, height: 100 }, style: { backgroundColor: '#8b5cf6' } },
      createTextField('vip-label', 'VIP', { x: 10, y: 10, width: 30, height: 20 }, { placeholder: 'VIP', style: { fontSize: 32, fontWeight: '800', color: '#8b5cf6' } }),
      createLogoField('logo', 'Logo', { x: 70, y: 8, width: 25, height: 18 }, { placeholder: 'Logo' }),
      createTextField('guest-name', 'Guest Name', { x: 10, y: 38, width: 80, height: 18 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('access', 'Access Level', { x: 10, y: 60, width: 50, height: 10 }, { placeholder: 'ALL ACCESS PASS', style: { fontSize: 10, color: '#a78bfa', letterSpacing: 2, textTransform: 'uppercase' } }),
      createTextField('event', 'Event', { x: 10, y: 78, width: 80, height: 12 }, { placeholder: 'Annual Gala 2024', style: { fontSize: 11, color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['vip', 'modern', 'minimal', 'purple']
  },
  {
    id: 'vip-badge-gala',
    name: 'VIP Gala Elegant',
    description: 'Sophisticated VIP pass for galas and formal events',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#c084fc', secondary: '#1e1b4b', accent: '#fbbf24', text: '#ffffff', background: '#1e1b4b' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 18 }, { placeholder: 'Event logo' }),
      createTextField('vip', 'VIP Label', { x: 20, y: 28, width: 60, height: 15 }, { placeholder: 'V.I.P.', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 10 } }),
      { id: 'line', type: 'divider', name: 'Divider', position: { x: 25, y: 45, width: 50, height: 0.3 }, style: { backgroundColor: '#c084fc' } },
      createTextField('guest-name', 'Guest Name', { x: 10, y: 50, width: 80, height: 15 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#ffffff', fontStyle: 'italic' } }),
      createTextField('table', 'Table Number', { x: 10, y: 70, width: 80, height: 10 }, { placeholder: 'Table 1', style: { fontSize: 12, textAlign: 'center', color: '#c084fc' } }),
      createTextField('event', 'Event', { x: 10, y: 85, width: 80, height: 10 }, { placeholder: 'Charity Gala 2024', style: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['vip', 'gala', 'elegant', 'formal']
  },
  {
    id: 'vip-badge-corporate',
    name: 'VIP Corporate Executive',
    description: 'Professional executive VIP badge',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#c9a962', text: '#1e3a5f', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'top-bar', type: 'shape', name: 'Top Bar', position: { x: 0, y: 0, width: 100, height: 4 }, style: { backgroundColor: '#c9a962' } },
      createLogoField('logo', 'Logo', { x: 5, y: 10, width: 30, height: 20 }, { placeholder: 'Company logo' }),
      createTextField('vip', 'VIP', { x: 65, y: 10, width: 30, height: 15 }, { placeholder: 'VIP', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'right', color: '#1e3a5f' } }),
      createTextField('name', 'Name', { x: 5, y: 38, width: 90, height: 18 }, { placeholder: 'Executive Name', required: true, style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('title', 'Title', { x: 5, y: 60, width: 90, height: 10 }, { placeholder: 'Chief Executive Officer', style: { fontSize: 11, textAlign: 'center', color: '#6b7280' } }),
      createTextField('event', 'Event', { x: 5, y: 78, width: 90, height: 10 }, { placeholder: 'Leadership Summit 2024', style: { fontSize: 10, textAlign: 'center', color: '#1e3a5f', fontWeight: '600' } }),
      { id: 'bottom-bar', type: 'shape', name: 'Bottom Bar', position: { x: 0, y: 96, width: 100, height: 4 }, style: { backgroundColor: '#1e3a5f' } }
    ],
    tags: ['vip', 'corporate', 'executive', 'professional']
  },
  {
    id: 'vip-badge-neon',
    name: 'VIP Neon Night',
    description: 'Vibrant neon-style VIP badge for nightlife events',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#000000', accent: '#f472b6', text: '#ffffff', background: '#000000' },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      { id: 'glow-border', type: 'shape', name: 'Glow Border', position: { x: 2, y: 3, width: 96, height: 94 }, style: { borderColor: '#22d3ee', borderWidth: 2, borderStyle: 'solid', borderRadius: 8 } },
      createTextField('vip', 'VIP', { x: 10, y: 10, width: 80, height: 25 }, { placeholder: 'VIP', style: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee', letterSpacing: 12 } }),
      createTextField('name', 'Name', { x: 10, y: 40, width: 80, height: 15 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' } }),
      createTextField('access', 'Access', { x: 10, y: 60, width: 80, height: 10 }, { placeholder: 'BACKSTAGE + LOUNGE', style: { fontSize: 10, textAlign: 'center', color: '#f472b6', letterSpacing: 2 } }),
      createLogoField('logo', 'Logo', { x: 35, y: 75, width: 30, height: 15 }, { placeholder: 'Event logo' })
    ],
    tags: ['vip', 'neon', 'nightlife', 'club']
  }
];

// ============= SECURITY BADGE TEMPLATES =============

export const SECURITY_BADGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'security-badge-standard',
    name: 'Security Standard',
    description: 'Professional security badge with photo ID',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ef4444', accent: '#ffffff', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'security-header', type: 'shape', name: 'Security Header', position: { x: 0, y: 0, width: 100, height: 25 }, style: { backgroundColor: '#ef4444' } },
      createTextField('security-label', 'Security Label', { x: 5, y: 5, width: 90, height: 15 }, { placeholder: 'SECURITY', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 } }),
      { id: 'photo', type: 'image', name: 'ID Photo', position: { x: 5, y: 30, width: 30, height: 50 }, placeholder: 'Staff photo', style: { objectFit: 'cover', borderRadius: 4, borderColor: '#ffffff', borderWidth: 2 } },
      createTextField('staff-name', 'Staff Name', { x: 40, y: 35, width: 55, height: 12 }, { placeholder: 'Staff Name', required: true, style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('role', 'Role', { x: 40, y: 50, width: 55, height: 10 }, { placeholder: 'Security Officer', style: { fontSize: 11, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('id-number', 'ID Number', { x: 40, y: 65, width: 55, height: 10 }, { placeholder: 'ID: SEC-001', style: { fontSize: 10, color: 'rgba(255,255,255,0.7)' } }),
      createLogoField('logo', 'Company Logo', { x: 75, y: 80, width: 20, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['security', 'staff', 'id-badge']
  },
  {
    id: 'security-badge-tactical',
    name: 'Security Tactical',
    description: 'High-visibility tactical security badge',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#111827' },
    defaultFonts: { heading: 'Roboto', body: 'Roboto' },
    defaultColors: { primary: '#111827', secondary: '#f59e0b', accent: '#ffffff', text: '#ffffff', background: '#111827' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'warning-stripe', type: 'shape', name: 'Warning Stripe', position: { x: 0, y: 0, width: 100, height: 6 }, style: { backgroundColor: '#f59e0b' } },
      createTextField('label', 'Security Label', { x: 5, y: 10, width: 60, height: 15 }, { placeholder: 'SECURITY', style: { fontSize: 22, fontWeight: 'bold', color: '#f59e0b', letterSpacing: 3 } }),
      createLogoField('logo', 'Logo', { x: 72, y: 8, width: 23, height: 18 }, { placeholder: 'Logo' }),
      createImageField('photo', 'Photo', { x: 5, y: 30, width: 28, height: 45 }, { placeholder: 'Staff photo' }),
      createTextField('name', 'Name', { x: 38, y: 32, width: 57, height: 12 }, { placeholder: 'Officer Name', required: true, style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('zone', 'Zone', { x: 38, y: 48, width: 57, height: 10 }, { placeholder: 'Zone: Alpha', style: { fontSize: 11, color: '#f59e0b' } }),
      createTextField('shift', 'Shift', { x: 38, y: 62, width: 57, height: 10 }, { placeholder: 'Shift: Day', style: { fontSize: 10, color: 'rgba(255,255,255,0.7)' } }),
      { id: 'bottom-stripe', type: 'shape', name: 'Bottom Stripe', position: { x: 0, y: 82, width: 100, height: 18 }, style: { backgroundColor: '#f59e0b' } },
      createTextField('id', 'Badge ID', { x: 5, y: 85, width: 90, height: 12 }, { placeholder: 'SEC-2024-001', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#111827' } })
    ],
    tags: ['security', 'tactical', 'high-vis']
  },
  {
    id: 'security-badge-event',
    name: 'Event Security',
    description: 'Event-branded security credential',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#dc2626', accent: '#ffffff', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 5, y: 5, width: 25, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('label', 'Label', { x: 35, y: 8, width: 60, height: 12 }, { placeholder: 'EVENT SECURITY', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#dc2626', letterSpacing: 2 } }),
      createImageField('photo', 'Photo', { x: 5, y: 30, width: 30, height: 45 }, { placeholder: 'Photo' }),
      createTextField('name', 'Name', { x: 40, y: 32, width: 55, height: 12 }, { placeholder: 'Guard Name', required: true, style: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('role', 'Role', { x: 40, y: 48, width: 55, height: 8 }, { placeholder: 'Lead Security', style: { fontSize: 11, color: 'rgba(255,255,255,0.8)' } }),
      createTextField('area', 'Assigned Area', { x: 40, y: 60, width: 55, height: 8 }, { placeholder: 'Main Hall', style: { fontSize: 10, color: '#3b82f6' } }),
      createTextField('event', 'Event Name', { x: 5, y: 82, width: 90, height: 12 }, { placeholder: 'Tech Conference 2024', style: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['security', 'event', 'branded']
  },
  {
    id: 'security-badge-corporate',
    name: 'Corporate Security',
    description: 'Professional corporate security ID',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#dc2626', accent: '#e5e7eb', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'header', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 20 }, style: { backgroundColor: '#1e3a5f' } },
      createLogoField('logo', 'Logo', { x: 5, y: 3, width: 25, height: 14 }, { placeholder: 'Logo' }),
      createTextField('label', 'Label', { x: 40, y: 4, width: 55, height: 12 }, { placeholder: 'SECURITY', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', color: '#ffffff', letterSpacing: 3 } }),
      createImageField('photo', 'Photo', { x: 5, y: 25, width: 28, height: 50 }, { placeholder: 'Photo' }),
      createTextField('name', 'Name', { x: 38, y: 28, width: 57, height: 12 }, { placeholder: 'Full Name', required: true, style: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('title', 'Title', { x: 38, y: 42, width: 57, height: 8 }, { placeholder: 'Security Supervisor', style: { fontSize: 10, color: '#6b7280' } }),
      createTextField('id', 'Badge #', { x: 38, y: 55, width: 57, height: 8 }, { placeholder: 'Badge #: S-4521', style: { fontSize: 10, color: '#1e3a5f', fontWeight: '600' } }),
      { id: 'footer', type: 'shape', name: 'Footer', position: { x: 0, y: 82, width: 100, height: 18 }, style: { backgroundColor: '#dc2626' } },
      createTextField('clearance', 'Clearance', { x: 5, y: 85, width: 90, height: 12 }, { placeholder: 'CLEARANCE: LEVEL 3', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['security', 'corporate', 'professional']
  },
  {
    id: 'security-badge-minimal',
    name: 'Security Minimal',
    description: 'Clean minimal security badge',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#ef4444', accent: '#e2e8f0', text: '#0f172a', background: '#f8fafc' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'red-strip', type: 'shape', name: 'Red Strip', position: { x: 0, y: 0, width: 100, height: 3 }, style: { backgroundColor: '#ef4444' } },
      createTextField('label', 'Label', { x: 5, y: 8, width: 40, height: 10 }, { placeholder: 'SECURITY', style: { fontSize: 10, fontWeight: 'bold', color: '#ef4444', letterSpacing: 3 } }),
      createLogoField('logo', 'Logo', { x: 70, y: 5, width: 25, height: 15 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 5, y: 28, width: 90, height: 18 }, { placeholder: 'Officer Name', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' } }),
      createTextField('role', 'Role', { x: 5, y: 50, width: 90, height: 8 }, { placeholder: 'Event Security', style: { fontSize: 11, color: '#64748b' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 5, y: 62, width: 90, height: 0.3 }, style: { backgroundColor: '#e2e8f0' } },
      createTextField('id', 'ID', { x: 5, y: 68, width: 45, height: 8 }, { placeholder: 'ID: SEC-001', style: { fontSize: 9, color: '#94a3b8' } }),
      createTextField('date', 'Valid Date', { x: 50, y: 68, width: 45, height: 8 }, { placeholder: 'Valid: March 15', style: { fontSize: 9, textAlign: 'right', color: '#94a3b8' } }),
      createTextField('event', 'Event', { x: 5, y: 82, width: 90, height: 10 }, { placeholder: 'Annual Conference 2024', style: { fontSize: 10, color: '#0f172a', fontWeight: '500' } })
    ],
    tags: ['security', 'minimal', 'clean']
  }
];

// ============= BACKSTAGE PASS TEMPLATES =============

export const BACKSTAGE_PASS_TEMPLATES: EditableTemplate[] = [
  {
    id: 'backstage-pass-rock',
    name: 'Backstage Rock',
    description: 'Bold backstage pass for concerts and events',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: { type: 'solid', value: '#0a0a0a' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#ef4444', secondary: '#0a0a0a', accent: '#ffffff', text: '#ffffff', background: '#0a0a0a' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 10, y: 5, width: 80, height: 15 }, { placeholder: 'Event/Tour logo' }),
      createTextField('backstage', 'Backstage Label', { x: 5, y: 25, width: 90, height: 15 }, { placeholder: 'BACKSTAGE', style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ef4444', letterSpacing: 6 } }),
      createTextField('access-type', 'Access Type', { x: 5, y: 42, width: 90, height: 8 }, { placeholder: 'ALL ACCESS', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 } }),
      { id: 'photo', type: 'image', name: 'Photo', position: { x: 30, y: 52, width: 40, height: 25 }, placeholder: 'Artist or event image', style: { objectFit: 'cover' } },
      createTextField('event-name', 'Event/Tour Name', { x: 5, y: 80, width: 90, height: 8 }, { placeholder: 'WORLD TOUR 2024', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-venue', 'Date & Venue', { x: 5, y: 90, width: 90, height: 6 }, { placeholder: 'March 15, 2024 • Madison Square Garden', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['backstage', 'concert', 'music', 'event']
  },
  {
    id: 'backstage-pass-festival',
    name: 'Festival Backstage',
    description: 'Colorful festival-style backstage pass',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #f472b6 0%, #8b5cf6 50%, #06b6d4 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f472b6', secondary: '#8b5cf6', accent: '#ffffff', text: '#ffffff', background: '#f472b6' },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      createLogoField('logo', 'Festival Logo', { x: 20, y: 5, width: 60, height: 18 }, { placeholder: 'Festival logo' }),
      createTextField('backstage', 'Label', { x: 5, y: 26, width: 90, height: 12 }, { placeholder: 'BACKSTAGE', style: { fontSize: 40, fontWeight: '800', textAlign: 'center', color: '#ffffff', letterSpacing: 8 } }),
      createTextField('type', 'Pass Type', { x: 15, y: 40, width: 70, height: 7 }, { placeholder: 'ARTIST PASS', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 } }),
      createImageField('photo', 'Photo', { x: 25, y: 50, width: 50, height: 22 }, { placeholder: 'Photo', style: { borderRadius: 12 } }),
      createTextField('name', 'Name', { x: 10, y: 75, width: 80, height: 8 }, { placeholder: 'Artist Name', required: true, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('dates', 'Festival Dates', { x: 10, y: 85, width: 80, height: 6 }, { placeholder: 'June 20-23, 2024', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('venue', 'Venue', { x: 10, y: 92, width: 80, height: 5 }, { placeholder: 'City Park Arena', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['backstage', 'festival', 'colorful', 'music']
  },
  {
    id: 'backstage-pass-corporate',
    name: 'Corporate Backstage',
    description: 'Professional backstage credential for corporate events',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#f59e0b', accent: '#ffffff', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'top-band', type: 'shape', name: 'Top Band', position: { x: 0, y: 0, width: 100, height: 5 }, style: { backgroundColor: '#f59e0b' } },
      createLogoField('logo', 'Logo', { x: 25, y: 8, width: 50, height: 15 }, { placeholder: 'Company logo' }),
      createTextField('label', 'Label', { x: 5, y: 28, width: 90, height: 10 }, { placeholder: 'BACKSTAGE ACCESS', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b', letterSpacing: 3 } }),
      createImageField('photo', 'Photo', { x: 30, y: 42, width: 40, height: 22 }, { placeholder: 'Staff photo', style: { borderRadius: 8 } }),
      createTextField('name', 'Name', { x: 10, y: 67, width: 80, height: 8 }, { placeholder: 'Staff Name', required: true, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('role', 'Role', { x: 10, y: 77, width: 80, height: 6 }, { placeholder: 'Stage Manager', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 20, y: 86, width: 60, height: 0.3 }, style: { backgroundColor: '#f59e0b' } },
      createTextField('event', 'Event', { x: 10, y: 89, width: 80, height: 8 }, { placeholder: 'Annual Awards Ceremony 2024', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['backstage', 'corporate', 'professional']
  },
  {
    id: 'backstage-pass-theater',
    name: 'Theater Production',
    description: 'Elegant backstage pass for theater and performing arts',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #7c2d12 0%, #431407 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#7c2d12', accent: '#ffffff', text: '#ffffff', background: '#7c2d12' },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      { id: 'gold-frame', type: 'shape', name: 'Frame', position: { x: 4, y: 3, width: 92, height: 94 }, style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 25, y: 6, width: 50, height: 15 }, { placeholder: 'Theater logo' }),
      createTextField('label', 'Label', { x: 10, y: 24, width: 80, height: 10 }, { placeholder: 'BACKSTAGE', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 6 } }),
      createTextField('production', 'Production', { x: 10, y: 36, width: 80, height: 10 }, { placeholder: 'The Grand Performance', style: { fontSize: 16, textAlign: 'center', color: '#ffffff', fontStyle: 'italic' } }),
      createImageField('image', 'Image', { x: 20, y: 48, width: 60, height: 22 }, { placeholder: 'Production image' }),
      createTextField('name', 'Name', { x: 10, y: 73, width: 80, height: 8 }, { placeholder: 'Cast/Crew Name', required: true, style: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#ffffff' } }),
      createTextField('role', 'Role', { x: 10, y: 83, width: 80, height: 6 }, { placeholder: 'Lead Director', style: { fontSize: 11, textAlign: 'center', color: '#d4af37' } }),
      createTextField('dates', 'Dates', { x: 10, y: 91, width: 80, height: 5 }, { placeholder: 'March 10-24, 2024', style: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['backstage', 'theater', 'performing-arts', 'elegant']
  },
  {
    id: 'backstage-pass-sports',
    name: 'Sports Event Backstage',
    description: 'Athletic-style backstage pass for sports events',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Roboto' },
    defaultColors: { primary: '#10b981', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB',
    dpi: 300,
    fields: [
      { id: 'top-accent', type: 'shape', name: 'Top Accent', position: { x: 0, y: 0, width: 100, height: 3 }, style: { backgroundColor: '#10b981' } },
      createLogoField('logo', 'Logo', { x: 10, y: 6, width: 35, height: 15 }, { placeholder: 'Team/Event logo' }),
      createTextField('access', 'Access', { x: 55, y: 8, width: 40, height: 10 }, { placeholder: 'FIELD ACCESS', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#10b981', letterSpacing: 2 } }),
      createTextField('label', 'Label', { x: 5, y: 25, width: 90, height: 12 }, { placeholder: 'BACKSTAGE', style: { fontSize: 44, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('photo', 'Photo', { x: 25, y: 40, width: 50, height: 25 }, { placeholder: 'Photo' }),
      createTextField('name', 'Name', { x: 10, y: 68, width: 80, height: 8 }, { placeholder: 'Media Name', required: true, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('org', 'Organization', { x: 10, y: 78, width: 80, height: 6 }, { placeholder: 'Sports Network', style: { fontSize: 12, textAlign: 'center', color: '#10b981' } }),
      createTextField('event', 'Event', { x: 10, y: 88, width: 80, height: 8 }, { placeholder: 'Championship Finals 2024', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['backstage', 'sports', 'athletic', 'field-access']
  }
];

export const ALL_BADGE_TEMPLATES: EditableTemplate[] = [
  ...VIP_BADGE_TEMPLATES,
  ...SECURITY_BADGE_TEMPLATES,
  ...BACKSTAGE_PASS_TEMPLATES
];
