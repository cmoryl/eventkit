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

export const VIP_BADGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'vip-badge-luxury',
    name: 'VIP Luxury',
    description: 'Premium VIP badge with gold accents',
    assetType: AssetType.VIPBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    },
    defaultFonts: {
      heading: 'Playfair Display',
      body: 'Lato'
    },
    defaultColors: {
      primary: '#d4af37',
      secondary: '#1a1a1a',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#1a1a1a'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'gold-border',
        type: 'shape',
        name: 'Gold Border',
        position: { x: 3, y: 5, width: 94, height: 90 },
        style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid', borderRadius: 4 }
      },
      createLogoField('logo', 'Event Logo',
        { x: 10, y: 10, width: 30, height: 25 },
        { placeholder: 'Event logo' }
      ),
      createTextField('vip-label', 'VIP Label',
        { x: 45, y: 12, width: 45, height: 18 },
        {
          placeholder: 'VIP',
          style: { fontSize: 36, fontWeight: 'bold', textAlign: 'right', color: '#d4af37', letterSpacing: 8 }
        }
      ),
      createTextField('guest-name', 'Guest Name',
        { x: 10, y: 45, width: 80, height: 15 },
        {
          placeholder: 'Guest Name',
          required: true,
          style: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('access-level', 'Access Level',
        { x: 10, y: 65, width: 80, height: 10 },
        {
          placeholder: 'All Access',
          style: { fontSize: 12, textAlign: 'center', color: '#d4af37', textTransform: 'uppercase', letterSpacing: 2 }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 10, y: 80, width: 80, height: 10 },
        {
          placeholder: 'Event Name 2024',
          style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }
        }
      )
    ],
    tags: ['vip', 'luxury', 'premium', 'gold']
  }
];

export const SECURITY_BADGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'security-badge-standard',
    name: 'Security Standard',
    description: 'Professional security badge with photo ID',
    assetType: AssetType.SecurityBadge,
    category: 'universal',
    dimensions: createDimensions(3.375, 2.125, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#1e3a5f'
    },
    defaultFonts: {
      heading: 'Roboto',
      body: 'Roboto'
    },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ef4444',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'security-header',
        type: 'shape',
        name: 'Security Header',
        position: { x: 0, y: 0, width: 100, height: 25 },
        style: { backgroundColor: '#ef4444' }
      },
      createTextField('security-label', 'Security Label',
        { x: 5, y: 5, width: 90, height: 15 },
        {
          placeholder: 'SECURITY',
          style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 }
        }
      ),
      {
        id: 'photo',
        type: 'image',
        name: 'ID Photo',
        position: { x: 5, y: 30, width: 30, height: 50 },
        placeholder: 'Staff photo',
        style: { objectFit: 'cover', borderRadius: 4, borderColor: '#ffffff', borderWidth: 2 }
      },
      createTextField('staff-name', 'Staff Name',
        { x: 40, y: 35, width: 55, height: 12 },
        {
          placeholder: 'Staff Name',
          required: true,
          style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' }
        }
      ),
      createTextField('role', 'Role',
        { x: 40, y: 50, width: 55, height: 10 },
        {
          placeholder: 'Security Officer',
          style: { fontSize: 11, color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createTextField('id-number', 'ID Number',
        { x: 40, y: 65, width: 55, height: 10 },
        {
          placeholder: 'ID: SEC-001',
          style: { fontSize: 10, color: 'rgba(255,255,255,0.7)' }
        }
      ),
      createLogoField('logo', 'Company Logo',
        { x: 75, y: 80, width: 20, height: 15 },
        { placeholder: 'Logo' }
      )
    ],
    tags: ['security', 'staff', 'id-badge']
  }
];

export const BACKSTAGE_PASS_TEMPLATES: EditableTemplate[] = [
  {
    id: 'backstage-pass-rock',
    name: 'Backstage Rock',
    description: 'Bold backstage pass for concerts and events',
    assetType: AssetType.BackstagePass,
    category: 'universal',
    dimensions: createDimensions(4, 6, 0.125, 0.125),
    background: {
      type: 'solid',
      value: '#0a0a0a'
    },
    defaultFonts: {
      heading: 'Bebas Neue',
      body: 'Roboto'
    },
    defaultColors: {
      primary: '#ef4444',
      secondary: '#0a0a0a',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#0a0a0a'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo',
        { x: 10, y: 5, width: 80, height: 15 },
        { placeholder: 'Event/Tour logo' }
      ),
      createTextField('backstage', 'Backstage Label',
        { x: 5, y: 25, width: 90, height: 15 },
        {
          placeholder: 'BACKSTAGE',
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#ef4444', letterSpacing: 6 }
        }
      ),
      createTextField('access-type', 'Access Type',
        { x: 5, y: 42, width: 90, height: 8 },
        {
          placeholder: 'ALL ACCESS',
          style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', letterSpacing: 4 }
        }
      ),
      {
        id: 'photo',
        type: 'image',
        name: 'Photo',
        position: { x: 30, y: 52, width: 40, height: 25 },
        placeholder: 'Artist or event image',
        style: { objectFit: 'cover' }
      },
      createTextField('event-name', 'Event/Tour Name',
        { x: 5, y: 80, width: 90, height: 8 },
        {
          placeholder: 'WORLD TOUR 2024',
          style: { fontSize: 14, textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('date-venue', 'Date & Venue',
        { x: 5, y: 90, width: 90, height: 6 },
        {
          placeholder: 'March 15, 2024 • Madison Square Garden',
          style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }
        }
      )
    ],
    tags: ['backstage', 'concert', 'music', 'event']
  }
];

export const ALL_BADGE_TEMPLATES: EditableTemplate[] = [
  ...VIP_BADGE_TEMPLATES,
  ...SECURITY_BADGE_TEMPLATES,
  ...BACKSTAGE_PASS_TEMPLATES
];
