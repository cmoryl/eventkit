// Digital & Miscellaneous Templates - Email Headers, WiFi Signs, Thank You Notes, Photo Booth, Speaker Cards

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

const createPixelDimensions = (w: number, h: number) => ({
  widthInches: w / 72, heightInches: h / 72, widthPx: w, heightPx: h, bleedInches: 0, safeZoneInches: 0,
  orientation: (w > h ? 'landscape' : h > w ? 'portrait' : 'square') as 'portrait' | 'landscape' | 'square'
});

const createDimensions = (w: number, h: number, b: number = 0.125, s: number = 0.125, dpi: number = 300) => ({
  widthInches: w, heightInches: h, widthPx: Math.round(w * dpi), heightPx: Math.round(h * dpi), bleedInches: b, safeZoneInches: s,
  orientation: (w > h ? 'landscape' : h > w ? 'portrait' : 'square') as 'portrait' | 'landscape' | 'square'
});

const createTextField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'text', position, style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', textAlign: 'left', color: '#1a1a1a', ...options.style }, ...options
});

const createLogoField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'logo', position, style: { objectFit: 'contain', ...options.style }, acceptedFormats: ['png', 'svg'], ...options
});

const createImageField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'image', position, style: { objectFit: 'cover', borderRadius: 0, ...options.style }, acceptedFormats: ['jpg', 'png', 'webp'], ...options
});

// ============= EMAIL HEADER TEMPLATES =============

export const EMAIL_HEADER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'email-header-branded', name: 'Branded Email Header', description: 'Standard branded email header banner',
    assetType: AssetType.EmailHeader, category: 'universal', dimensions: createPixelDimensions(600, 200),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 5, y: 15, width: 25, height: 70 }, { placeholder: 'Event logo' }),
      createTextField('event-name', 'Event Name', { x: 35, y: 20, width: 60, height: 30 }, { placeholder: 'TECH SUMMIT 2024', required: true, style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 35, y: 55, width: 60, height: 15 }, { placeholder: 'Innovation • Leadership • Growth', style: { fontSize: 11, color: '#f59e0b' } }),
      createTextField('date', 'Date', { x: 35, y: 75, width: 60, height: 12 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 10, color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['email', 'header', 'branded', 'newsletter']
  },
  {
    id: 'email-header-announcement', name: 'Announcement Email Header', description: 'Bold announcement email header',
    assetType: AssetType.EmailHeader, category: 'universal', dimensions: createPixelDimensions(600, 200),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#667eea', secondary: '#764ba2', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Logo' }),
      createTextField('headline', 'Headline', { x: 25, y: 15, width: 70, height: 35 }, { placeholder: 'You\'re Invited!', required: true, style: { fontSize: 28, fontWeight: '800', color: '#ffffff' } }),
      createTextField('subheadline', 'Subheadline', { x: 25, y: 55, width: 70, height: 20 }, { placeholder: 'Join us for an exclusive event', style: { fontSize: 13, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('cta', 'CTA', { x: 25, y: 78, width: 30, height: 15 }, { placeholder: 'RSVP Now →', style: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' } })
    ],
    tags: ['email', 'header', 'announcement']
  },
  {
    id: 'email-header-countdown', name: 'Countdown Email Header', description: 'Event countdown email header',
    assetType: AssetType.EmailHeader, category: 'universal', dimensions: createPixelDimensions(600, 200),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#f59e0b', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Logo' }),
      createTextField('days', 'Days Count', { x: 25, y: 10, width: 20, height: 45 }, { placeholder: '5', style: { fontSize: 48, fontWeight: '800', color: '#22d3ee' } }),
      createTextField('days-label', 'Days Label', { x: 25, y: 58, width: 20, height: 12 }, { placeholder: 'DAYS', style: { fontSize: 10, fontWeight: 'bold', color: '#22d3ee', letterSpacing: 2 } }),
      createTextField('until', 'Until', { x: 50, y: 15, width: 45, height: 15 }, { placeholder: 'until', style: { fontSize: 12, color: 'rgba(255,255,255,0.6)' } }),
      createTextField('event', 'Event', { x: 50, y: 32, width: 45, height: 25 }, { placeholder: 'Tech Summit 2024', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('cta', 'CTA', { x: 50, y: 68, width: 35, height: 18 }, { placeholder: 'Register Now', style: { fontSize: 11, fontWeight: 'bold', color: '#0f172a', backgroundColor: '#f59e0b', borderRadius: 4 } })
    ],
    tags: ['email', 'header', 'countdown']
  },
  {
    id: 'email-header-thank-you', name: 'Thank You Email Header', description: 'Post-event thank you email header',
    assetType: AssetType.EmailHeader, category: 'universal', dimensions: createPixelDimensions(600, 200),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#fbbf24', secondary: '#7c3aed', accent: '#ffffff', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Logo' }),
      createTextField('thanks', 'Thank You', { x: 25, y: 18, width: 70, height: 30 }, { placeholder: 'Thank You!', style: { fontSize: 32, fontWeight: 'bold', color: '#fbbf24', fontStyle: 'italic' } }),
      createTextField('message', 'Message', { x: 25, y: 55, width: 70, height: 20 }, { placeholder: 'For attending Tech Summit 2024', style: { fontSize: 13, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('cta', 'CTA', { x: 25, y: 78, width: 40, height: 12 }, { placeholder: 'View Event Photos →', style: { fontSize: 10, color: '#fbbf24' } })
    ],
    tags: ['email', 'header', 'thank-you', 'post-event']
  },
  {
    id: 'email-header-minimal', name: 'Minimal Email Header', description: 'Clean minimal email header',
    assetType: AssetType.EmailHeader, category: 'universal', dimensions: createPixelDimensions(600, 150),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#ffffff', accent: '#3b82f6', text: '#0f172a', background: '#ffffff' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 15, width: 20, height: 70 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 30, y: 25, width: 65, height: 25 }, { placeholder: 'Event Newsletter', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' } }),
      createTextField('date', 'Date', { x: 30, y: 60, width: 65, height: 15 }, { placeholder: 'March 2024 Edition', style: { fontSize: 11, color: '#6b7280' } }),
      { id: 'accent', type: 'shape', name: 'Bottom Accent', position: { x: 0, y: 92, width: 100, height: 8 }, style: { backgroundColor: '#3b82f6' } }
    ],
    tags: ['email', 'header', 'minimal', 'clean']
  }
];

// ============= WIFI SIGN TEMPLATES =============

export const WIFI_SIGN_TEMPLATES: EditableTemplate[] = [
  {
    id: 'wifi-sign-modern', name: 'Modern WiFi Sign', description: 'Clean modern WiFi info sign',
    assetType: AssetType.WifiSign, category: 'universal', dimensions: createDimensions(8.5, 5.5, 0, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#10b981', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 18, height: 20 }, { placeholder: 'Event logo' }),
      createTextField('wifi-icon', 'WiFi Icon', { x: 75, y: 5, width: 20, height: 20 }, { placeholder: '📶', style: { fontSize: 36, textAlign: 'center' } }),
      createTextField('title', 'Title', { x: 5, y: 32, width: 90, height: 12 }, { placeholder: 'FREE WiFi', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1e40af' } }),
      createTextField('network-label', 'Network Label', { x: 10, y: 50, width: 35, height: 8 }, { placeholder: 'NETWORK', style: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', letterSpacing: 2 } }),
      createTextField('network', 'Network Name', { x: 10, y: 58, width: 35, height: 12 }, { placeholder: 'EventGuest', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' } }),
      createTextField('password-label', 'Password Label', { x: 55, y: 50, width: 35, height: 8 }, { placeholder: 'PASSWORD', style: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', letterSpacing: 2 } }),
      createTextField('password', 'Password', { x: 55, y: 58, width: 35, height: 12 }, { placeholder: 'Welcome2024', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' } }),
      { id: 'qr', type: 'qrcode', name: 'WiFi QR', position: { x: 75, y: 45, width: 18, height: 30 }, placeholder: 'WiFi QR Code', style: { borderRadius: 4 } },
      createTextField('note', 'Note', { x: 10, y: 80, width: 80, height: 8 }, { placeholder: 'Connect for complimentary internet access during the event', style: { fontSize: 10, textAlign: 'center', color: '#94a3b8' } })
    ],
    tags: ['wifi', 'sign', 'modern', 'internet']
  },
  {
    id: 'wifi-sign-dark', name: 'Dark WiFi Sign', description: 'Dark theme WiFi access sign',
    assetType: AssetType.WifiSign, category: 'universal', dimensions: createDimensions(8.5, 5.5, 0, 0.25),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 18, height: 20 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 5, y: 28, width: 90, height: 12 }, { placeholder: 'CONNECT TO WiFi', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee' } }),
      createTextField('network', 'Network', { x: 10, y: 48, width: 35, height: 15 }, { placeholder: 'EventGuest', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('network-label', 'Label', { x: 10, y: 65, width: 35, height: 6 }, { placeholder: 'NETWORK NAME', style: { fontSize: 8, color: '#22d3ee', letterSpacing: 2 } }),
      createTextField('password', 'Password', { x: 50, y: 48, width: 35, height: 15 }, { placeholder: 'Welcome2024', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('password-label', 'Label', { x: 50, y: 65, width: 35, height: 6 }, { placeholder: 'PASSWORD', style: { fontSize: 8, color: '#22d3ee', letterSpacing: 2 } }),
      createTextField('note', 'Note', { x: 10, y: 82, width: 80, height: 8 }, { placeholder: 'Scan QR code for instant connection', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['wifi', 'sign', 'dark', 'tech']
  },
  {
    id: 'wifi-sign-simple', name: 'Simple WiFi Card', description: 'Small simple WiFi info card',
    assetType: AssetType.WifiSign, category: 'universal', dimensions: createDimensions(5, 3, 0, 0.125),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#f8fafc', accent: '#3b82f6', text: '#0f172a', background: '#f8fafc' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('icon', 'Icon', { x: 5, y: 10, width: 15, height: 30 }, { placeholder: '📶', style: { fontSize: 24 } }),
      createTextField('title', 'WiFi', { x: 22, y: 10, width: 50, height: 15 }, { placeholder: 'WiFi Access', style: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' } }),
      createTextField('network', 'Network', { x: 22, y: 35, width: 50, height: 12 }, { placeholder: 'Network: EventGuest', required: true, style: { fontSize: 12, color: '#0f172a' } }),
      createTextField('password', 'Password', { x: 22, y: 55, width: 50, height: 12 }, { placeholder: 'Password: Welcome2024', required: true, style: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6' } }),
      createTextField('note', 'Note', { x: 22, y: 78, width: 50, height: 12 }, { placeholder: 'Enjoy free internet!', style: { fontSize: 9, color: '#94a3b8' } }),
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 78, y: 15, width: 18, height: 60 }, placeholder: 'WiFi QR', style: { borderRadius: 4 } }
    ],
    tags: ['wifi', 'card', 'simple', 'table']
  },
  {
    id: 'wifi-sign-elegant', name: 'Elegant WiFi Sign', description: 'Formal venue WiFi sign',
    assetType: AssetType.WifiSign, category: 'universal', dimensions: createDimensions(8.5, 5.5, 0, 0.25),
    background: { type: 'solid', value: '#1a1a1a' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#ffffff', text: '#ffffff', background: '#1a1a1a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Border', position: { x: 4, y: 5, width: 92, height: 90 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 35, y: 8, width: 30, height: 12 }, { placeholder: 'Venue logo' }),
      createTextField('title', 'Title', { x: 10, y: 26, width: 80, height: 10 }, { placeholder: 'Complimentary WiFi', style: { fontSize: 22, textAlign: 'center', color: '#d4af37', fontStyle: 'italic' } }),
      createTextField('network', 'Network', { x: 15, y: 44, width: 70, height: 12 }, { placeholder: 'VenueGuest', required: true, style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('password', 'Password', { x: 15, y: 60, width: 70, height: 12 }, { placeholder: 'Gala2024', required: true, style: { fontSize: 20, textAlign: 'center', color: '#d4af37' } }),
      createTextField('enjoy', 'Note', { x: 15, y: 80, width: 70, height: 8 }, { placeholder: 'Please enjoy our complimentary internet service', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' } })
    ],
    tags: ['wifi', 'sign', 'elegant', 'venue']
  },
  {
    id: 'wifi-sign-branded-color', name: 'Branded Color WiFi', description: 'Event-branded WiFi sign',
    assetType: AssetType.WifiSign, category: 'universal', dimensions: createDimensions(8.5, 5.5, 0, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#667eea', accent: '#fbbf24', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 18 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 5, y: 30, width: 55, height: 12 }, { placeholder: 'GET CONNECTED', style: { fontSize: 24, fontWeight: '800', color: '#ffffff' } }),
      createTextField('network', 'Network', { x: 5, y: 48, width: 55, height: 10 }, { placeholder: 'Network: EventWiFi', required: true, style: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('password', 'Password', { x: 5, y: 62, width: 55, height: 10 }, { placeholder: 'Password: Innovate24', required: true, style: { fontSize: 16, color: '#fbbf24' } }),
      createTextField('hashtag', 'Hashtag', { x: 5, y: 82, width: 55, height: 8 }, { placeholder: 'Share with #TechSummit2024', style: { fontSize: 11, color: 'rgba(255,255,255,0.7)' } }),
      { id: 'qr-bg', type: 'shape', name: 'QR Background', position: { x: 65, y: 15, width: 30, height: 70 }, style: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 } },
      { id: 'qr', type: 'qrcode', name: 'QR Code', position: { x: 70, y: 22, width: 20, height: 48 }, placeholder: 'WiFi QR', style: { backgroundColor: '#ffffff', borderRadius: 8 } },
      createTextField('scan', 'Scan Text', { x: 65, y: 74, width: 30, height: 8 }, { placeholder: 'Scan to connect', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['wifi', 'sign', 'branded', 'colorful']
  }
];

// ============= THANK YOU NOTE TEMPLATES =============

export const THANK_YOU_NOTE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'thank-you-elegant', name: 'Elegant Thank You', description: 'Formal thank you card',
    assetType: AssetType.ThankYouNote, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#fffef5' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#fffef5', accent: '#1a1a1a', text: '#1a1a1a', background: '#fffef5' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Border', position: { x: 4, y: 5, width: 92, height: 90 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createTextField('thank-you', 'Thank You', { x: 10, y: 12, width: 80, height: 18 }, { placeholder: 'Thank You', style: { fontSize: 36, textAlign: 'center', color: '#d4af37', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 30, y: 32, width: 40, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('message', 'Message', { x: 10, y: 38, width: 80, height: 25 }, { placeholder: 'Your presence at our annual gala made the evening truly special. We are grateful for your generosity and support.', required: true, style: { fontSize: 13, textAlign: 'center', color: '#4b5563', lineHeight: 1.6, fontStyle: 'italic' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 68, width: 30, height: 10 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 15, y: 82, width: 70, height: 6 }, { placeholder: 'Annual Gala 2024', style: { fontSize: 10, textAlign: 'center', color: '#d4af37' } })
    ],
    tags: ['thank-you', 'elegant', 'formal']
  },
  {
    id: 'thank-you-modern', name: 'Modern Thank You', description: 'Contemporary thank you card',
    assetType: AssetType.ThankYouNote, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#667eea', accent: '#fbbf24', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 18, height: 15 }, { placeholder: 'Logo' }),
      createTextField('thanks', 'Thanks', { x: 5, y: 28, width: 90, height: 16 }, { placeholder: 'THANK YOU!', style: { fontSize: 36, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('message', 'Message', { x: 10, y: 50, width: 80, height: 20 }, { placeholder: 'For attending and making our event a huge success. We hope you gained valuable insights!', required: true, style: { fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 } }),
      createTextField('see-you', 'See You', { x: 20, y: 78, width: 60, height: 8 }, { placeholder: 'See you at our next event! 🎉', style: { fontSize: 12, textAlign: 'center', color: '#fbbf24' } }),
      createTextField('website', 'Website', { x: 25, y: 90, width: 50, height: 5 }, { placeholder: 'event.com', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['thank-you', 'modern', 'colorful']
  },
  {
    id: 'thank-you-corporate', name: 'Corporate Thank You', description: 'Professional corporate thanks',
    assetType: AssetType.ThankYouNote, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#c9a962', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top', type: 'shape', name: 'Top', position: { x: 0, y: 0, width: 100, height: 3 }, style: { backgroundColor: '#c9a962' } },
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 12 }, { placeholder: 'Logo' }),
      createTextField('thanks', 'Thanks', { x: 5, y: 25, width: 90, height: 12 }, { placeholder: 'Thank You for Attending', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('message', 'Message', { x: 10, y: 42, width: 80, height: 22 }, { placeholder: 'Your participation in the Leadership Summit made the event truly impactful. We value your contributions and look forward to continued partnership.', required: true, style: { fontSize: 12, textAlign: 'center', color: '#4b5563', lineHeight: 1.6 } }),
      createTextField('regards', 'Regards', { x: 25, y: 70, width: 50, height: 8 }, { placeholder: 'With warm regards,\nThe Event Team', style: { fontSize: 11, textAlign: 'center', color: '#1e3a5f', lineHeight: 1.4 } }),
      createTextField('event', 'Event', { x: 20, y: 86, width: 60, height: 5 }, { placeholder: 'Leadership Summit 2024', style: { fontSize: 9, textAlign: 'center', color: '#c9a962' } }),
      { id: 'bottom', type: 'shape', name: 'Bottom', position: { x: 0, y: 97, width: 100, height: 3 }, style: { backgroundColor: '#1e3a5f' } }
    ],
    tags: ['thank-you', 'corporate', 'professional']
  },
  {
    id: 'thank-you-speaker', name: 'Speaker Thank You', description: 'Thank you card for speakers',
    assetType: AssetType.ThankYouNote, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#8b5cf6', secondary: '#0f172a', accent: '#22d3ee', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 18, height: 12 }, { placeholder: 'Logo' }),
      createTextField('thanks', 'Thanks', { x: 5, y: 24, width: 90, height: 12 }, { placeholder: 'Thank You, Speaker!', style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#8b5cf6' } }),
      createTextField('name', 'Speaker Name', { x: 15, y: 40, width: 70, height: 10 }, { placeholder: 'Dr. Sarah Chen', style: { fontSize: 18, textAlign: 'center', color: '#ffffff' } }),
      createTextField('message', 'Message', { x: 10, y: 54, width: 80, height: 18 }, { placeholder: 'Your talk on "The Future of AI" was the highlight of our conference. The audience was captivated!', required: true, style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontStyle: 'italic' } }),
      createTextField('event', 'Event', { x: 20, y: 78, width: 60, height: 6 }, { placeholder: 'Tech Summit 2024', style: { fontSize: 10, textAlign: 'center', color: '#22d3ee' } }),
      createTextField('hope', 'Hope', { x: 15, y: 88, width: 70, height: 5 }, { placeholder: 'We hope to welcome you back next year!', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['thank-you', 'speaker', 'presenter']
  },
  {
    id: 'thank-you-sponsor', name: 'Sponsor Thank You', description: 'Thank you card for event sponsors',
    assetType: AssetType.ThankYouNote, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#f59e0b', secondary: '#1e3a5f', accent: '#ffffff', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 5, y: 8, width: 20, height: 12 }, { placeholder: 'Event logo' }),
      createLogoField('sponsor-logo', 'Sponsor Logo', { x: 70, y: 8, width: 25, height: 12 }, { placeholder: 'Sponsor logo' }),
      createTextField('thanks', 'Thanks', { x: 5, y: 28, width: 90, height: 12 }, { placeholder: 'Thank You for Your Sponsorship', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b' } }),
      createTextField('message', 'Message', { x: 10, y: 44, width: 80, height: 22 }, { placeholder: 'Your generous support as a Platinum Sponsor was instrumental in making this event possible. Together, we delivered an outstanding experience for 500+ attendees.', required: true, style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 } }),
      createTextField('impact', 'Impact', { x: 15, y: 72, width: 70, height: 8 }, { placeholder: '500+ Attendees • 30+ Speakers • 3 Days', style: { fontSize: 11, textAlign: 'center', color: '#f59e0b' } }),
      createTextField('event', 'Event', { x: 20, y: 86, width: 60, height: 5 }, { placeholder: 'Tech Summit 2024', style: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['thank-you', 'sponsor', 'partnership']
  }
];

// ============= PHOTO BOOTH FRAME TEMPLATES =============

export const PHOTO_BOOTH_FRAME_TEMPLATES: EditableTemplate[] = [
  {
    id: 'photo-frame-classic', name: 'Classic Photo Frame', description: 'Classic photo booth frame with event branding',
    assetType: AssetType.PhotoBoothFrame, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#d4af37', secondary: 'transparent', accent: '#ffffff', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      { id: 'frame-top', type: 'shape', name: 'Frame Top', position: { x: 0, y: 0, width: 100, height: 12 }, style: { backgroundColor: '#d4af37' } },
      createLogoField('logo', 'Event Logo', { x: 5, y: 2, width: 20, height: 8 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event Name', { x: 30, y: 3, width: 65, height: 6 }, { placeholder: 'ANNUAL GALA 2024', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', color: '#0f0f0f' } }),
      { id: 'frame-bottom', type: 'shape', name: 'Frame Bottom', position: { x: 0, y: 85, width: 100, height: 15 }, style: { backgroundColor: '#d4af37' } },
      createTextField('hashtag', 'Hashtag', { x: 10, y: 88, width: 80, height: 8 }, { placeholder: '#GalaVibes2024', style: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#0f0f0f' } })
    ],
    tags: ['photo-booth', 'frame', 'classic', 'gold']
  },
  {
    id: 'photo-frame-neon', name: 'Neon Photo Frame', description: 'Vibrant neon-style photo frame overlay',
    assetType: AssetType.PhotoBoothFrame, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: 'transparent', accent: '#f472b6', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      { id: 'glow-border', type: 'shape', name: 'Glow Border', position: { x: 3, y: 3, width: 94, height: 94 }, style: { borderColor: '#22d3ee', borderWidth: 3, borderStyle: 'solid', borderRadius: 12 } },
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 18, height: 8 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 25, y: 5, width: 70, height: 6 }, { placeholder: 'TECH SUMMIT 2024', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#22d3ee' } }),
      createTextField('hashtag', 'Hashtag', { x: 10, y: 90, width: 80, height: 6 }, { placeholder: '#TechSummit24', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#f472b6' } })
    ],
    tags: ['photo-booth', 'frame', 'neon', 'glow']
  },
  {
    id: 'photo-frame-branded', name: 'Branded Photo Frame', description: 'Full-branded photo frame with corners',
    assetType: AssetType.PhotoBoothFrame, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: 'transparent', accent: '#f59e0b', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      { id: 'corner-tl', type: 'shape', name: 'Top Left', position: { x: 0, y: 0, width: 30, height: 15 }, style: { backgroundColor: '#1e3a5f', borderRadius: 0 } },
      createLogoField('logo', 'Logo', { x: 3, y: 3, width: 18, height: 9 }, { placeholder: 'Logo' }),
      { id: 'corner-br', type: 'shape', name: 'Bottom Right', position: { x: 0, y: 85, width: 100, height: 15 }, style: { backgroundColor: '#1e3a5f' } },
      createTextField('event', 'Event', { x: 5, y: 88, width: 55, height: 8 }, { placeholder: 'Conference 2024', style: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('hashtag', 'Hashtag', { x: 60, y: 88, width: 35, height: 8 }, { placeholder: '#Conf2024', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#f59e0b' } })
    ],
    tags: ['photo-booth', 'frame', 'branded', 'corporate']
  },
  {
    id: 'photo-frame-polaroid', name: 'Polaroid Style Frame', description: 'Retro polaroid-style photo frame',
    assetType: AssetType.PhotoBoothFrame, category: 'universal', dimensions: createPixelDimensions(1080, 1350),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ef4444', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      { id: 'photo-area', type: 'shape', name: 'Photo Area', position: { x: 5, y: 3, width: 90, height: 75 }, style: { backgroundColor: '#e5e7eb', borderRadius: 0 } },
      createTextField('caption', 'Caption', { x: 8, y: 80, width: 84, height: 8 }, { placeholder: 'Best night ever! ✨', style: { fontSize: 24, textAlign: 'center', color: '#1a1a1a' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 90, width: 30, height: 6 }, { placeholder: 'Event logo' }),
      createTextField('date', 'Date', { x: 25, y: 96, width: 50, height: 3 }, { placeholder: 'March 15, 2024', style: { fontSize: 11, textAlign: 'center', color: '#94a3b8' } })
    ],
    tags: ['photo-booth', 'polaroid', 'retro']
  },
  {
    id: 'photo-frame-festival', name: 'Festival Photo Frame', description: 'Colorful festival photo frame',
    assetType: AssetType.PhotoBoothFrame, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: 'transparent' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f472b6', secondary: 'transparent', accent: '#8b5cf6', text: '#ffffff', background: 'transparent' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      { id: 'top-band', type: 'shape', name: 'Top Band', position: { x: 0, y: 0, width: 100, height: 10 }, style: { backgroundColor: 'linear-gradient(90deg, #f472b6, #8b5cf6, #06b6d4)' } },
      createLogoField('logo', 'Logo', { x: 5, y: 1, width: 15, height: 8 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 25, y: 2, width: 70, height: 6 }, { placeholder: 'BLOOM FEST 2024', style: { fontSize: 16, fontWeight: '800', textAlign: 'right', color: '#ffffff' } }),
      { id: 'bottom-band', type: 'shape', name: 'Bottom', position: { x: 0, y: 88, width: 100, height: 12 }, style: { backgroundColor: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f472b6)' } },
      createTextField('hashtag', 'Hashtag', { x: 10, y: 90, width: 80, height: 8 }, { placeholder: '#BloomFest24 🌸', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['photo-booth', 'frame', 'festival', 'colorful']
  }
];

// ============= SPEAKER INTRO CARD TEMPLATES =============

export const SPEAKER_INTRO_TEMPLATES: EditableTemplate[] = [
  {
    id: 'speaker-intro-corporate', name: 'Corporate Speaker Card', description: 'Professional speaker introduction card',
    assetType: AssetType.SpeakerIntroCard, category: 'universal', dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#3b82f6', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('event-logo', 'Event Logo', { x: 5, y: 5, width: 15, height: 8 }, { placeholder: 'Event logo' }),
      createImageField('speaker-photo', 'Speaker Photo', { x: 60, y: 10, width: 35, height: 80 }, { placeholder: 'Speaker headshot', required: true, style: { borderRadius: 12 } }),
      createTextField('speaker-name', 'Speaker Name', { x: 5, y: 25, width: 50, height: 12 }, { placeholder: 'Dr. Sarah Chen', required: true, style: { fontSize: 48, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('speaker-title', 'Title', { x: 5, y: 40, width: 50, height: 6 }, { placeholder: 'Chief Technology Officer, TechCorp', style: { fontSize: 20, color: '#3b82f6' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 5, y: 50, width: 20, height: 0.3 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('topic', 'Talk Topic', { x: 5, y: 55, width: 50, height: 10 }, { placeholder: '"The Future of AI in Enterprise"', style: { fontSize: 22, color: '#ffffff', fontStyle: 'italic' } }),
      createTextField('time-room', 'Time & Room', { x: 5, y: 70, width: 50, height: 6 }, { placeholder: '2:00 PM — 3:00 PM | Main Stage', style: { fontSize: 16, color: 'rgba(255,255,255,0.7)' } }),
      createTextField('bio-snippet', 'Bio', { x: 5, y: 80, width: 50, height: 10 }, { placeholder: '20+ years in technology leadership. Former VP at Google. Forbes Top 50 Women in Tech.', style: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 } })
    ],
    tags: ['speaker', 'intro', 'corporate', 'presentation']
  },
  {
    id: 'speaker-intro-keynote', name: 'Keynote Speaker Card', description: 'Bold keynote speaker introduction',
    assetType: AssetType.SpeakerIntroCard, category: 'universal', dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#22d3ee', text: '#ffffff', background: '#000000' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 12, height: 8 }, { placeholder: 'Logo' }),
      createTextField('keynote', 'Keynote Label', { x: 5, y: 18, width: 30, height: 5 }, { placeholder: 'KEYNOTE SPEAKER', style: { fontSize: 12, fontWeight: 'bold', color: '#22d3ee', letterSpacing: 3 } }),
      createImageField('photo', 'Photo', { x: 5, y: 28, width: 35, height: 60 }, { placeholder: 'Speaker photo', required: true, style: { borderRadius: 8 } }),
      createTextField('name', 'Name', { x: 45, y: 28, width: 50, height: 12 }, { placeholder: 'Alex Rivera', required: true, style: { fontSize: 52, fontWeight: '800', color: '#ffffff' } }),
      createTextField('title', 'Title', { x: 45, y: 42, width: 50, height: 8 }, { placeholder: 'CEO & Founder, InnovateCo', style: { fontSize: 18, color: '#22d3ee' } }),
      createTextField('topic', 'Topic', { x: 45, y: 56, width: 50, height: 12 }, { placeholder: '"Building the Impossible:\nHow AI Changes Everything"', style: { fontSize: 24, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.3 } }),
      createTextField('time', 'Time', { x: 45, y: 75, width: 50, height: 6 }, { placeholder: '9:00 AM — Main Stage', style: { fontSize: 16, color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['speaker', 'intro', 'keynote', 'bold']
  },
  {
    id: 'speaker-intro-panel', name: 'Panel Speaker Card', description: 'Panelist introduction card',
    assetType: AssetType.SpeakerIntroCard, category: 'universal', dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#fbbf24', secondary: '#7c3aed', accent: '#ffffff', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 12, height: 8 }, { placeholder: 'Logo' }),
      createTextField('panel-label', 'Panel Label', { x: 20, y: 5, width: 75, height: 5 }, { placeholder: 'PANEL DISCUSSION', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right', color: '#fbbf24', letterSpacing: 3 } }),
      createTextField('panel-title', 'Panel Title', { x: 5, y: 16, width: 90, height: 10 }, { placeholder: '"Ethics in AI: Where Do We Draw the Line?"', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('photo-1', 'Panelist 1', { x: 5, y: 32, width: 20, height: 35 }, { placeholder: 'Panelist 1', style: { borderRadius: 8 } }),
      createTextField('name-1', 'Name 1', { x: 5, y: 70, width: 20, height: 6 }, { placeholder: 'Dr. Smith', style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title-1', 'Title 1', { x: 5, y: 77, width: 20, height: 5 }, { placeholder: 'CTO, TechCo', style: { fontSize: 10, textAlign: 'center', color: '#fbbf24' } }),
      createImageField('photo-2', 'Panelist 2', { x: 28, y: 32, width: 20, height: 35 }, { placeholder: 'Panelist 2', style: { borderRadius: 8 } }),
      createTextField('name-2', 'Name 2', { x: 28, y: 70, width: 20, height: 6 }, { placeholder: 'Jane Doe', style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title-2', 'Title 2', { x: 28, y: 77, width: 20, height: 5 }, { placeholder: 'VP, InnovateCo', style: { fontSize: 10, textAlign: 'center', color: '#fbbf24' } }),
      createImageField('photo-3', 'Panelist 3', { x: 51, y: 32, width: 20, height: 35 }, { placeholder: 'Panelist 3', style: { borderRadius: 8 } }),
      createTextField('name-3', 'Name 3', { x: 51, y: 70, width: 20, height: 6 }, { placeholder: 'Alex Chen', style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title-3', 'Title 3', { x: 51, y: 77, width: 20, height: 5 }, { placeholder: 'Professor, MIT', style: { fontSize: 10, textAlign: 'center', color: '#fbbf24' } }),
      createImageField('photo-4', 'Moderator', { x: 74, y: 32, width: 20, height: 35 }, { placeholder: 'Moderator', style: { borderRadius: 8 } }),
      createTextField('name-4', 'Moderator', { x: 74, y: 70, width: 20, height: 6 }, { placeholder: 'Sam Lee', style: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title-4', 'Role', { x: 74, y: 77, width: 20, height: 5 }, { placeholder: 'MODERATOR', style: { fontSize: 10, textAlign: 'center', color: '#fbbf24', letterSpacing: 1 } }),
      createTextField('time', 'Time', { x: 30, y: 88, width: 40, height: 5 }, { placeholder: '2:00 PM — Room A | 60 min', style: { fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['speaker', 'intro', 'panel', 'discussion']
  },
  {
    id: 'speaker-intro-minimal', name: 'Minimal Speaker Card', description: 'Clean minimal speaker introduction',
    assetType: AssetType.SpeakerIntroCard, category: 'universal', dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'solid', value: '#fafafa' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#fafafa', accent: '#3b82f6', text: '#0f172a', background: '#fafafa' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 12, height: 8 }, { placeholder: 'Logo' }),
      createImageField('photo', 'Photo', { x: 5, y: 20, width: 30, height: 55 }, { placeholder: 'Speaker photo', required: true, style: { borderRadius: 8 } }),
      createTextField('name', 'Name', { x: 40, y: 25, width: 55, height: 12 }, { placeholder: 'Victoria Hamilton', required: true, style: { fontSize: 42, fontWeight: 'bold', color: '#0f172a' } }),
      { id: 'accent', type: 'divider', name: 'Accent', position: { x: 40, y: 40, width: 15, height: 0.5 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('title', 'Title', { x: 40, y: 45, width: 55, height: 8 }, { placeholder: 'Chief Innovation Officer, FutureCorp', style: { fontSize: 18, color: '#6b7280' } }),
      createTextField('topic', 'Topic', { x: 40, y: 58, width: 55, height: 10 }, { placeholder: '"Designing for the Next Decade"', style: { fontSize: 22, color: '#0f172a', fontStyle: 'italic' } }),
      createTextField('time', 'Time', { x: 40, y: 72, width: 55, height: 5 }, { placeholder: '11:00 AM — Track A | Hall 1', style: { fontSize: 14, color: '#94a3b8' } })
    ],
    tags: ['speaker', 'intro', 'minimal', 'clean']
  },
  {
    id: 'speaker-intro-vibrant', name: 'Vibrant Speaker Card', description: 'Colorful speaker introduction card',
    assetType: AssetType.SpeakerIntroCard, category: 'universal', dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #f472b6 0%, #8b5cf6 50%, #06b6d4 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#8b5cf6', accent: '#fbbf24', text: '#ffffff', background: '#8b5cf6' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 5, width: 12, height: 8 }, { placeholder: 'Logo' }),
      createTextField('up-next', 'Up Next', { x: 5, y: 18, width: 30, height: 5 }, { placeholder: '⚡ UP NEXT', style: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' } }),
      createImageField('photo', 'Photo', { x: 65, y: 15, width: 30, height: 70 }, { placeholder: 'Speaker photo', required: true, style: { borderRadius: 16 } }),
      createTextField('name', 'Name', { x: 5, y: 28, width: 55, height: 14 }, { placeholder: 'Maya Johnson', required: true, style: { fontSize: 52, fontWeight: '800', color: '#ffffff' } }),
      createTextField('title', 'Title', { x: 5, y: 45, width: 55, height: 6 }, { placeholder: 'Creative Director, DesignStudio', style: { fontSize: 18, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('topic', 'Topic', { x: 5, y: 58, width: 55, height: 12 }, { placeholder: '"Breaking Creative Boundaries\nwith Generative Design"', style: { fontSize: 20, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.3 } }),
      createTextField('time', 'Time', { x: 5, y: 78, width: 55, height: 5 }, { placeholder: '3:30 PM — Innovation Stage', style: { fontSize: 15, color: 'rgba(255,255,255,0.7)' } }),
      createTextField('hashtag', 'Hashtag', { x: 5, y: 88, width: 55, height: 5 }, { placeholder: '#DesignConf2024', style: { fontSize: 14, color: '#fbbf24' } })
    ],
    tags: ['speaker', 'intro', 'vibrant', 'creative']
  }
];

export const ALL_DIGITAL_MISC_TEMPLATES: EditableTemplate[] = [
  ...EMAIL_HEADER_TEMPLATES,
  ...WIFI_SIGN_TEMPLATES,
  ...THANK_YOU_NOTE_TEMPLATES,
  ...PHOTO_BOOTH_FRAME_TEMPLATES,
  ...SPEAKER_INTRO_TEMPLATES
];
