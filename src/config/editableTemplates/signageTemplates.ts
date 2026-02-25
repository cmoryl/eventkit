// Signage Templates - Door signs, room signs, wayfinding

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
  return { widthInches, heightInches, widthPx: Math.round(widthInches * dpi), heightPx: Math.round(heightInches * dpi), bleedInches, safeZoneInches, orientation };
};

const createTextField = (
  id: string, name: string, position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id, name, type: 'text', position,
  style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', textAlign: 'left', color: '#1a1a1a', ...options.style },
  ...options
});

const createLogoField = (
  id: string, name: string, position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id, name, type: 'logo', position,
  style: { objectFit: 'contain', ...options.style },
  acceptedFormats: ['png', 'svg', 'eps'], ...options
});

// ============= DOOR SIGNAGE TEMPLATES =============

export const DOOR_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'door-sign-professional',
    name: 'Professional Door Sign',
    description: 'Clean door signage for meeting rooms',
    assetType: AssetType.DoorSignage, category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#3b82f6', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'header-bar', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 20 }, style: { backgroundColor: '#1e3a5f' } },
      createLogoField('logo', 'Company Logo', { x: 5, y: 4, width: 25, height: 12 }, { placeholder: 'Logo (light version)' }),
      createTextField('room-name', 'Room Name', { x: 5, y: 28, width: 90, height: 15 }, { placeholder: 'Conference Room A', required: true, style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('capacity', 'Room Capacity', { x: 5, y: 45, width: 90, height: 6 }, { placeholder: 'Capacity: 12 people', style: { fontSize: 16, textAlign: 'center', color: '#6b7280' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 20, y: 55, width: 60, height: 0.3 }, style: { backgroundColor: '#e5e7eb' } },
      createTextField('current-session', 'Current Session', { x: 5, y: 60, width: 90, height: 8 }, { placeholder: 'Strategy Planning Workshop', style: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('session-time', 'Session Time', { x: 5, y: 70, width: 90, height: 6 }, { placeholder: '2:00 PM - 4:00 PM', style: { fontSize: 16, textAlign: 'center', color: '#6b7280' } }),
      { id: 'status-indicator', type: 'shape', name: 'Status', position: { x: 35, y: 82, width: 30, height: 8 }, style: { backgroundColor: '#10b981', borderRadius: 20 } },
      createTextField('status', 'Status', { x: 35, y: 83, width: 30, height: 6 }, { placeholder: 'IN SESSION', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['door', 'room', 'meeting', 'professional']
  },
  {
    id: 'door-sign-minimal',
    name: 'Minimal Door Sign',
    description: 'Ultra-clean minimal door sign',
    assetType: AssetType.DoorSignage, category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#fafafa' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#64748b', accent: '#3b82f6', text: '#0f172a', background: '#fafafa' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('room-number', 'Room Number', { x: 5, y: 10, width: 90, height: 20 }, { placeholder: '201', style: { fontSize: 96, fontWeight: '800', textAlign: 'center', color: '#0f172a' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 30, y: 35, width: 40, height: 0.3 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('room-name', 'Room Name', { x: 5, y: 40, width: 90, height: 12 }, { placeholder: 'Boardroom', required: true, style: { fontSize: 32, fontWeight: '500', textAlign: 'center', color: '#0f172a' } }),
      createTextField('capacity', 'Capacity', { x: 5, y: 55, width: 90, height: 6 }, { placeholder: 'Max 8 persons', style: { fontSize: 14, textAlign: 'center', color: '#94a3b8' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 80, width: 30, height: 12 }, { placeholder: 'Logo' })
    ],
    tags: ['door', 'minimal', 'clean']
  },
  {
    id: 'door-sign-bold-color',
    name: 'Bold Color Door Sign',
    description: 'High-contrast colored door signage',
    assetType: AssetType.DoorSignage, category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#1e40af' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#1e40af' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 25, height: 12 }, { placeholder: 'Logo' }),
      createTextField('room-name', 'Room Name', { x: 5, y: 25, width: 90, height: 18 }, { placeholder: 'Innovation Lab', required: true, style: { fontSize: 52, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('floor', 'Floor', { x: 5, y: 48, width: 90, height: 6 }, { placeholder: '2nd Floor • West Wing', style: { fontSize: 16, textAlign: 'center', color: '#fbbf24' } }),
      createTextField('amenities', 'Amenities', { x: 10, y: 60, width: 80, height: 15 }, { placeholder: '• Projector • Whiteboard • WiFi', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      { id: 'status-box', type: 'shape', name: 'Status', position: { x: 25, y: 82, width: 50, height: 10 }, style: { backgroundColor: '#fbbf24', borderRadius: 8 } },
      createTextField('status', 'Status', { x: 25, y: 84, width: 50, height: 6 }, { placeholder: 'AVAILABLE', style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#1e40af' } })
    ],
    tags: ['door', 'bold', 'color']
  },
  {
    id: 'door-sign-session',
    name: 'Session Door Sign',
    description: 'Conference session room sign with schedule',
    assetType: AssetType.DoorSignage, category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#7c3aed', secondary: '#1a1a1a', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'header', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 15 }, style: { backgroundColor: '#7c3aed' } },
      createLogoField('logo', 'Logo', { x: 5, y: 3, width: 20, height: 9 }, { placeholder: 'Logo' }),
      createTextField('track', 'Track Name', { x: 30, y: 4, width: 65, height: 7 }, { placeholder: 'TRACK A: LEADERSHIP', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#ffffff', letterSpacing: 1 } }),
      createTextField('room', 'Room', { x: 5, y: 20, width: 90, height: 10 }, { placeholder: 'Room 101 — Grand Hall', required: true, style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('session-1', 'Session 1', { x: 5, y: 35, width: 90, height: 8 }, { placeholder: '9:00 AM — Opening Keynote', style: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' } }),
      createTextField('session-2', 'Session 2', { x: 5, y: 46, width: 90, height: 8 }, { placeholder: '10:30 AM — Panel Discussion', style: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' } }),
      createTextField('session-3', 'Session 3', { x: 5, y: 57, width: 90, height: 8 }, { placeholder: '1:00 PM — Workshop', style: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' } }),
      createTextField('session-4', 'Session 4', { x: 5, y: 68, width: 90, height: 8 }, { placeholder: '3:00 PM — Breakout Session', style: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' } }),
      createTextField('wifi', 'WiFi Info', { x: 5, y: 85, width: 90, height: 6 }, { placeholder: 'WiFi: EventGuest | Pass: Welcome2024', style: { fontSize: 12, textAlign: 'center', color: '#7c3aed' } })
    ],
    tags: ['door', 'session', 'schedule', 'conference']
  },
  {
    id: 'door-sign-dark',
    name: 'Dark Premium Door Sign',
    description: 'Dark theme premium door signage',
    assetType: AssetType.DoorSignage, category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#f59e0b', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 12 }, { placeholder: 'Logo' }),
      createTextField('room-name', 'Room Name', { x: 5, y: 25, width: 90, height: 18 }, { placeholder: 'Executive Suite', required: true, style: { fontSize: 44, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      { id: 'gold-line', type: 'divider', name: 'Gold Line', position: { x: 25, y: 48, width: 50, height: 0.5 }, style: { backgroundColor: '#f59e0b' } },
      createTextField('details', 'Details', { x: 10, y: 55, width: 80, height: 8 }, { placeholder: 'Private Meeting Room • Floor 5', style: { fontSize: 16, textAlign: 'center', color: '#f59e0b' } }),
      createTextField('current', 'Current Event', { x: 10, y: 68, width: 80, height: 8 }, { placeholder: 'Board Meeting in Progress', style: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' } }),
      createTextField('time', 'Time', { x: 10, y: 78, width: 80, height: 6 }, { placeholder: '2:00 PM - 5:00 PM', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['door', 'dark', 'premium', 'executive']
  }
];

// ============= ROOM SIGNAGE TEMPLATES =============

export const ROOM_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'room-sign-wayfinding',
    name: 'Wayfinding Room Sign',
    description: 'Clear directional room signage',
    assetType: AssetType.RoomSignage, category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('room-number', 'Room Number', { x: 5, y: 10, width: 30, height: 30 }, { placeholder: '101', style: { fontSize: 72, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('room-name', 'Room Name', { x: 5, y: 45, width: 90, height: 15 }, { placeholder: 'Main Ballroom', required: true, style: { fontSize: 36, fontWeight: '600', color: '#ffffff' } }),
      { id: 'arrow-indicator', type: 'icon', name: 'Direction Arrow', position: { x: 75, y: 15, width: 20, height: 25 }, placeholder: '→', style: { color: '#f59e0b' } },
      createTextField('floor-info', 'Floor Info', { x: 5, y: 70, width: 50, height: 8 }, { placeholder: 'Floor 1 • East Wing', style: { fontSize: 14, color: 'rgba(255,255,255,0.8)' } }),
      createLogoField('logo', 'Event Logo', { x: 75, y: 70, width: 20, height: 20 }, { placeholder: 'Logo' })
    ],
    tags: ['room', 'wayfinding', 'directional']
  },
  {
    id: 'room-sign-modern',
    name: 'Modern Room Identifier',
    description: 'Sleek modern room identification sign',
    assetType: AssetType.RoomSignage, category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'accent', type: 'shape', name: 'Accent', position: { x: 0, y: 0, width: 3, height: 100 }, style: { backgroundColor: '#22d3ee' } },
      createTextField('number', 'Room Number', { x: 8, y: 10, width: 25, height: 35 }, { placeholder: 'A1', style: { fontSize: 64, fontWeight: '800', color: '#22d3ee' } }),
      createTextField('name', 'Room Name', { x: 8, y: 50, width: 85, height: 15 }, { placeholder: 'Innovation Hub', required: true, style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('info', 'Info', { x: 8, y: 70, width: 60, height: 8 }, { placeholder: 'Capacity: 50 • AV Ready', style: { fontSize: 13, color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 78, y: 70, width: 15, height: 20 }, { placeholder: 'Logo' })
    ],
    tags: ['room', 'modern', 'sleek']
  },
  {
    id: 'room-sign-dual-language',
    name: 'Dual-Language Room Sign',
    description: 'Bilingual room signage for international events',
    assetType: AssetType.RoomSignage, category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ef4444', accent: '#f59e0b', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top-bar', type: 'shape', name: 'Top Bar', position: { x: 0, y: 0, width: 100, height: 8 }, style: { backgroundColor: '#1e3a5f' } },
      createTextField('name-en', 'Room Name (English)', { x: 5, y: 15, width: 90, height: 18 }, { placeholder: 'Grand Ballroom', required: true, style: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('name-local', 'Room Name (Local)', { x: 5, y: 35, width: 90, height: 12 }, { placeholder: 'Salon Principal', style: { fontSize: 24, textAlign: 'center', color: '#6b7280', fontStyle: 'italic' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 20, y: 52, width: 60, height: 0.3 }, style: { backgroundColor: '#e5e7eb' } },
      createTextField('capacity', 'Capacity', { x: 5, y: 58, width: 90, height: 8 }, { placeholder: 'Capacity / Capacidad: 200', style: { fontSize: 16, textAlign: 'center', color: '#6b7280' } }),
      createTextField('floor', 'Floor', { x: 5, y: 70, width: 45, height: 8 }, { placeholder: 'Level 1', style: { fontSize: 14, color: '#1e3a5f', fontWeight: '600' } }),
      createLogoField('logo', 'Logo', { x: 70, y: 68, width: 25, height: 18 }, { placeholder: 'Logo' })
    ],
    tags: ['room', 'bilingual', 'international']
  },
  {
    id: 'room-sign-color-coded',
    name: 'Color-Coded Zone Sign',
    description: 'Color-coded zone signage for large venues',
    assetType: AssetType.RoomSignage, category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#10b981' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#10b981', secondary: '#ffffff', accent: '#065f46', text: '#ffffff', background: '#10b981' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('zone', 'Zone Label', { x: 5, y: 8, width: 30, height: 15 }, { placeholder: 'ZONE B', style: { fontSize: 20, fontWeight: 'bold', color: '#065f46', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8 } }),
      createTextField('room-name', 'Room Name', { x: 5, y: 30, width: 90, height: 20 }, { placeholder: 'Innovation Theater', required: true, style: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('type', 'Room Type', { x: 5, y: 55, width: 90, height: 8 }, { placeholder: 'Breakout Session Room', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }),
      { id: 'arrow', type: 'icon', name: 'Arrow', position: { x: 80, y: 30, width: 15, height: 20 }, placeholder: '→', style: { color: '#ffffff' } },
      createTextField('floor', 'Floor', { x: 5, y: 75, width: 50, height: 8 }, { placeholder: '3rd Floor • West', style: { fontSize: 14, color: 'rgba(255,255,255,0.8)' } }),
      createLogoField('logo', 'Logo', { x: 72, y: 72, width: 22, height: 18 }, { placeholder: 'Logo' })
    ],
    tags: ['room', 'zone', 'color-coded']
  },
  {
    id: 'room-sign-elegant',
    name: 'Elegant Room Sign',
    description: 'Sophisticated room signage with gold accents',
    assetType: AssetType.RoomSignage, category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#1a1a1a' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#ffffff', text: '#ffffff', background: '#1a1a1a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'frame', type: 'shape', name: 'Frame', position: { x: 3, y: 5, width: 94, height: 90 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 35, y: 8, width: 30, height: 15 }, { placeholder: 'Venue logo' }),
      createTextField('name', 'Room Name', { x: 5, y: 30, width: 90, height: 18 }, { placeholder: 'The Windsor Room', required: true, style: { fontSize: 36, textAlign: 'center', color: '#d4af37', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 30, y: 52, width: 40, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('event', 'Current Event', { x: 10, y: 58, width: 80, height: 10 }, { placeholder: 'Private Reception', style: { fontSize: 18, textAlign: 'center', color: '#ffffff' } }),
      createTextField('time', 'Time', { x: 10, y: 72, width: 80, height: 8 }, { placeholder: '7:00 PM — 10:00 PM', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['room', 'elegant', 'formal', 'gold']
  }
];

// ============= WIFI SIGN TEMPLATES =============

export const WIFI_SIGN_TEMPLATES: EditableTemplate[] = [
  {
    id: 'wifi-sign-modern',
    name: 'Modern WiFi Sign',
    description: 'Clean WiFi credentials display',
    assetType: AssetType.WifiSign, category: 'universal',
    dimensions: createDimensions(8.5, 5.5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Inter', body: 'JetBrains Mono' },
    defaultColors: { primary: '#667eea', secondary: '#764ba2', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'wifi-icon', type: 'icon', name: 'WiFi Icon', position: { x: 40, y: 8, width: 20, height: 18 }, placeholder: '📶', style: { color: '#ffffff' } },
      createTextField('title', 'Title', { x: 5, y: 30, width: 90, height: 10 }, { placeholder: 'Connect to WiFi', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      { id: 'credentials-box', type: 'shape', name: 'Credentials Box', position: { x: 10, y: 45, width: 80, height: 45 }, style: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12 } },
      createTextField('network-label', 'Network Label', { x: 15, y: 50, width: 70, height: 6 }, { placeholder: 'Network Name', style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 } }),
      createTextField('network-name', 'Network Name', { x: 15, y: 56, width: 70, height: 10 }, { placeholder: 'EventWiFi_Guest', required: true, style: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('password-label', 'Password Label', { x: 15, y: 70, width: 70, height: 6 }, { placeholder: 'Password', style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 } }),
      createTextField('password', 'Password', { x: 15, y: 76, width: 70, height: 10 }, { placeholder: 'Welcome2024!', required: true, style: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' } })
    ],
    tags: ['wifi', 'network', 'credentials', 'guest']
  },
  {
    id: 'wifi-sign-dark',
    name: 'Dark WiFi Card',
    description: 'Dark theme WiFi credentials card',
    assetType: AssetType.WifiSign, category: 'universal',
    dimensions: createDimensions(8.5, 5.5, 0.125, 0.25),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'JetBrains Mono' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'wifi-icon', type: 'icon', name: 'WiFi Icon', position: { x: 5, y: 10, width: 15, height: 20 }, placeholder: '📶', style: { color: '#22d3ee' } },
      createTextField('title', 'Title', { x: 22, y: 12, width: 70, height: 10 }, { placeholder: 'WiFi Access', style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('network', 'Network', { x: 5, y: 38, width: 40, height: 6 }, { placeholder: 'NETWORK', style: { fontSize: 10, color: '#22d3ee', letterSpacing: 2 } }),
      createTextField('ssid', 'SSID', { x: 5, y: 46, width: 40, height: 12 }, { placeholder: 'Event_WiFi', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('pass-label', 'Password Label', { x: 55, y: 38, width: 40, height: 6 }, { placeholder: 'PASSWORD', style: { fontSize: 10, color: '#22d3ee', letterSpacing: 2 } }),
      createTextField('password', 'Password', { x: 55, y: 46, width: 40, height: 12 }, { placeholder: 'Pass2024!', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('support', 'Support', { x: 5, y: 75, width: 90, height: 8 }, { placeholder: 'Need help? Visit the info desk or call ext. 100', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } }),
      createLogoField('logo', 'Logo', { x: 80, y: 8, width: 15, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['wifi', 'dark', 'tech']
  },
  {
    id: 'wifi-sign-qr',
    name: 'WiFi QR Code Sign',
    description: 'WiFi sign with scannable QR code',
    assetType: AssetType.WifiSign, category: 'universal',
    dimensions: createDimensions(8.5, 5.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('title', 'Title', { x: 5, y: 8, width: 55, height: 12 }, { placeholder: 'Scan to Connect', style: { fontSize: 28, fontWeight: 'bold', color: '#7c3aed' } }),
      { id: 'qr', type: 'qrcode', name: 'WiFi QR', position: { x: 68, y: 8, width: 28, height: 50 }, placeholder: 'WiFi QR code', style: { backgroundColor: '#ffffff' } },
      createTextField('network-label', 'Network', { x: 5, y: 28, width: 55, height: 5 }, { placeholder: 'NETWORK NAME', style: { fontSize: 10, color: '#6b7280', letterSpacing: 1 } }),
      createTextField('ssid', 'SSID', { x: 5, y: 34, width: 55, height: 10 }, { placeholder: 'GuestWiFi', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('pass-label', 'Password', { x: 5, y: 50, width: 55, height: 5 }, { placeholder: 'PASSWORD', style: { fontSize: 10, color: '#6b7280', letterSpacing: 1 } }),
      createTextField('password', 'Password', { x: 5, y: 56, width: 55, height: 10 }, { placeholder: 'Welcome24', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('note', 'Note', { x: 5, y: 75, width: 90, height: 8 }, { placeholder: 'Or scan the QR code with your phone camera', style: { fontSize: 12, textAlign: 'center', color: '#6b7280' } }),
      createLogoField('logo', 'Logo', { x: 5, y: 85, width: 20, height: 10 }, { placeholder: 'Logo' })
    ],
    tags: ['wifi', 'qr-code', 'scan']
  },
  {
    id: 'wifi-sign-table',
    name: 'WiFi Table Card',
    description: 'Small WiFi card for tables and desks',
    assetType: AssetType.WifiSign, category: 'universal',
    dimensions: createDimensions(5, 3, 0.125, 0.125),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#f8fafc', accent: '#1a1a1a', text: '#1a1a1a', background: '#f8fafc' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top-bar', type: 'shape', name: 'Top Bar', position: { x: 0, y: 0, width: 100, height: 5 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('title', 'WiFi', { x: 5, y: 12, width: 90, height: 12 }, { placeholder: 'WiFi', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' } }),
      createTextField('ssid', 'Network', { x: 10, y: 32, width: 80, height: 12 }, { placeholder: 'EventGuest', required: true, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      createTextField('password', 'Password', { x: 10, y: 52, width: 80, height: 12 }, { placeholder: 'Pass: Welcome2024', required: true, style: { fontSize: 16, textAlign: 'center', color: '#6b7280' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 75, width: 30, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['wifi', 'table', 'small', 'card']
  },
  {
    id: 'wifi-sign-corporate',
    name: 'Corporate WiFi Sign',
    description: 'Professional corporate WiFi display',
    assetType: AssetType.WifiSign, category: 'universal',
    dimensions: createDimensions(8.5, 5.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'header', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 22 }, style: { backgroundColor: '#1e3a5f' } },
      createLogoField('logo', 'Logo', { x: 5, y: 4, width: 20, height: 14 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 30, y: 5, width: 65, height: 12 }, { placeholder: 'Guest WiFi Access', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', color: '#ffffff' } }),
      createTextField('network-label', 'Network', { x: 5, y: 30, width: 45, height: 5 }, { placeholder: 'Network Name', style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 } }),
      createTextField('ssid', 'SSID', { x: 5, y: 36, width: 45, height: 12 }, { placeholder: 'CorpGuest', required: true, style: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f' } }),
      createTextField('pass-label', 'Password', { x: 55, y: 30, width: 40, height: 5 }, { placeholder: 'Password', style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 } }),
      createTextField('password', 'Password', { x: 55, y: 36, width: 40, height: 12 }, { placeholder: 'Welcome24', required: true, style: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 5, y: 58, width: 90, height: 0.3 }, style: { backgroundColor: '#e5e7eb' } },
      createTextField('instructions', 'Instructions', { x: 5, y: 65, width: 90, height: 15 }, { placeholder: '1. Open WiFi settings\n2. Select network\n3. Enter password\n4. Accept terms', style: { fontSize: 11, color: '#6b7280', lineHeight: 1.5 } }),
      createTextField('support', 'Support', { x: 5, y: 85, width: 90, height: 8 }, { placeholder: 'IT Support: ext. 2100 | it@company.com', style: { fontSize: 10, textAlign: 'center', color: '#10b981' } })
    ],
    tags: ['wifi', 'corporate', 'professional']
  }
];

export const ALL_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  ...DOOR_SIGNAGE_TEMPLATES,
  ...ROOM_SIGNAGE_TEMPLATES,
  ...WIFI_SIGN_TEMPLATES
];
