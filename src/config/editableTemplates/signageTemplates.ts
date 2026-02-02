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

export const DOOR_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'door-sign-professional',
    name: 'Professional Door Sign',
    description: 'Clean door signage for meeting rooms',
    assetType: AssetType.DoorSignage,
    category: 'universal',
    dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: {
      type: 'solid',
      value: '#ffffff'
    },
    defaultFonts: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#10b981',
      text: '#1a1a1a',
      background: '#ffffff'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'header-bar',
        type: 'shape',
        name: 'Header',
        position: { x: 0, y: 0, width: 100, height: 20 },
        style: { backgroundColor: '#1e3a5f' }
      },
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 4, width: 25, height: 12 },
        { placeholder: 'Logo (light version)' }
      ),
      createTextField('room-name', 'Room Name',
        { x: 5, y: 28, width: 90, height: 15 },
        {
          placeholder: 'Conference Room A',
          required: true,
          style: { fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' }
        }
      ),
      createTextField('capacity', 'Room Capacity',
        { x: 5, y: 45, width: 90, height: 6 },
        {
          placeholder: 'Capacity: 12 people',
          style: { fontSize: 16, textAlign: 'center', color: '#6b7280' }
        }
      ),
      {
        id: 'divider',
        type: 'divider',
        name: 'Divider',
        position: { x: 20, y: 55, width: 60, height: 0.3 },
        style: { backgroundColor: '#e5e7eb' }
      },
      createTextField('current-session', 'Current Session',
        { x: 5, y: 60, width: 90, height: 8 },
        {
          placeholder: 'Strategy Planning Workshop',
          style: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#1a1a1a' }
        }
      ),
      createTextField('session-time', 'Session Time',
        { x: 5, y: 70, width: 90, height: 6 },
        {
          placeholder: '2:00 PM - 4:00 PM',
          style: { fontSize: 16, textAlign: 'center', color: '#6b7280' }
        }
      ),
      {
        id: 'status-indicator',
        type: 'shape',
        name: 'Status',
        position: { x: 35, y: 82, width: 30, height: 8 },
        style: { backgroundColor: '#10b981', borderRadius: 20 }
      },
      createTextField('status', 'Status',
        { x: 35, y: 83, width: 30, height: 6 },
        {
          placeholder: 'IN SESSION',
          style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      )
    ],
    tags: ['door', 'room', 'meeting', 'professional']
  }
];

export const ROOM_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'room-sign-wayfinding',
    name: 'Wayfinding Room Sign',
    description: 'Clear directional room signage',
    assetType: AssetType.RoomSignage,
    category: 'universal',
    dimensions: createDimensions(12, 8, 0.125, 0.25),
    background: {
      type: 'solid',
      value: '#1e3a5f'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#ffffff',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      createTextField('room-number', 'Room Number',
        { x: 5, y: 10, width: 30, height: 30 },
        {
          placeholder: '101',
          style: { fontSize: 72, fontWeight: 'bold', color: '#ffffff' }
        }
      ),
      createTextField('room-name', 'Room Name',
        { x: 5, y: 45, width: 90, height: 15 },
        {
          placeholder: 'Main Ballroom',
          required: true,
          style: { fontSize: 36, fontWeight: '600', color: '#ffffff' }
        }
      ),
      {
        id: 'arrow-indicator',
        type: 'icon',
        name: 'Direction Arrow',
        position: { x: 75, y: 15, width: 20, height: 25 },
        placeholder: '→',
        style: { color: '#f59e0b' }
      },
      createTextField('floor-info', 'Floor Info',
        { x: 5, y: 70, width: 50, height: 8 },
        {
          placeholder: 'Floor 1 • East Wing',
          style: { fontSize: 14, color: 'rgba(255,255,255,0.8)' }
        }
      ),
      createLogoField('logo', 'Event Logo',
        { x: 75, y: 70, width: 20, height: 20 },
        { placeholder: 'Logo' }
      )
    ],
    tags: ['room', 'wayfinding', 'directional']
  }
];

export const WIFI_SIGN_TEMPLATES: EditableTemplate[] = [
  {
    id: 'wifi-sign-modern',
    name: 'Modern WiFi Sign',
    description: 'Clean WiFi credentials display',
    assetType: AssetType.WifiSign,
    category: 'universal',
    dimensions: createDimensions(8.5, 5.5, 0.125, 0.25),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'JetBrains Mono'
    },
    defaultColors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#667eea'
    },
    colorMode: 'CMYK',
    dpi: 300,
    fields: [
      {
        id: 'wifi-icon',
        type: 'icon',
        name: 'WiFi Icon',
        position: { x: 40, y: 8, width: 20, height: 18 },
        placeholder: '📶',
        style: { color: '#ffffff' }
      },
      createTextField('title', 'Title',
        { x: 5, y: 30, width: 90, height: 10 },
        {
          placeholder: 'Connect to WiFi',
          style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      {
        id: 'credentials-box',
        type: 'shape',
        name: 'Credentials Box',
        position: { x: 10, y: 45, width: 80, height: 45 },
        style: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12 }
      },
      createTextField('network-label', 'Network Label',
        { x: 15, y: 50, width: 70, height: 6 },
        {
          placeholder: 'Network Name',
          style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }
        }
      ),
      createTextField('network-name', 'Network Name',
        { x: 15, y: 56, width: 70, height: 10 },
        {
          placeholder: 'EventWiFi_Guest',
          required: true,
          style: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }
        }
      ),
      createTextField('password-label', 'Password Label',
        { x: 15, y: 70, width: 70, height: 6 },
        {
          placeholder: 'Password',
          style: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }
        }
      ),
      createTextField('password', 'Password',
        { x: 15, y: 76, width: 70, height: 10 },
        {
          placeholder: 'Welcome2024!',
          required: true,
          style: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }
        }
      )
    ],
    tags: ['wifi', 'network', 'credentials', 'guest']
  }
];

export const ALL_SIGNAGE_TEMPLATES: EditableTemplate[] = [
  ...DOOR_SIGNAGE_TEMPLATES,
  ...ROOM_SIGNAGE_TEMPLATES,
  ...WIFI_SIGN_TEMPLATES
];
