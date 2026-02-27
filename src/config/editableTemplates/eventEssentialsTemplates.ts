// Event Essentials Templates - Invitations, Tickets, Certificates, Menus, Programs

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

const createDimensions = (w: number, h: number, b: number = 0.125, s: number = 0.125, dpi: number = 300) => ({
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

// ============= INVITATION CARD TEMPLATES =============

export const INVITATION_TEMPLATES: EditableTemplate[] = [
  {
    id: 'invitation-formal-gala', name: 'Formal Gala Invitation', description: 'Elegant invitation with gold accents for formal events',
    assetType: AssetType.InvitationCard, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#0f0f0f' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#0f0f0f', accent: '#ffffff', text: '#ffffff', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Gold Border', position: { x: 3, y: 4, width: 94, height: 92 }, style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid' } },
      createLogoField('logo', 'Event Logo', { x: 35, y: 8, width: 30, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('you-are-invited', 'Invitation Line', { x: 10, y: 24, width: 80, height: 6 }, { placeholder: 'You are cordially invited to', style: { fontSize: 12, textAlign: 'center', color: '#d4af37', fontStyle: 'italic' } }),
      createTextField('event-name', 'Event Name', { x: 5, y: 32, width: 90, height: 14 }, { placeholder: 'The Annual Gala', required: true, style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 15, y: 50, width: 70, height: 8 }, { placeholder: 'Saturday, March 15, 2024', style: { fontSize: 16, textAlign: 'center', color: '#d4af37' } }),
      createTextField('time', 'Time', { x: 15, y: 58, width: 70, height: 6 }, { placeholder: '7:00 PM — Cocktails | 8:00 PM — Dinner', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('venue', 'Venue', { x: 10, y: 68, width: 80, height: 8 }, { placeholder: 'The Grand Ballroom, Ritz-Carlton', style: { fontSize: 14, textAlign: 'center', color: '#ffffff' } }),
      createTextField('dress-code', 'Dress Code', { x: 20, y: 78, width: 60, height: 6 }, { placeholder: 'Black Tie', style: { fontSize: 11, textAlign: 'center', color: '#d4af37', letterSpacing: 2, textTransform: 'uppercase' } }),
      createTextField('rsvp', 'RSVP', { x: 15, y: 86, width: 70, height: 6 }, { placeholder: 'RSVP by March 1 | rsvp@event.com', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['invitation', 'formal', 'gala', 'elegant', 'gold']
  },
  {
    id: 'invitation-modern-conference', name: 'Modern Conference Invite', description: 'Bold modern invitation for conferences',
    assetType: AssetType.InvitationCard, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#667eea', secondary: '#764ba2', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 15 }, { placeholder: 'Logo' }),
      createTextField('invite-label', 'Label', { x: 30, y: 10, width: 65, height: 5 }, { placeholder: 'YOU\'RE INVITED', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', color: 'rgba(255,255,255,0.8)', letterSpacing: 4 } }),
      createTextField('event-name', 'Event Name', { x: 5, y: 28, width: 90, height: 16 }, { placeholder: 'INNOVATE 2024', required: true, style: { fontSize: 42, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 10, y: 46, width: 80, height: 6 }, { placeholder: 'Where Ideas Come to Life', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' } }),
      createTextField('date-time', 'Date & Time', { x: 10, y: 58, width: 80, height: 8 }, { placeholder: 'March 15-17, 2024 | 9:00 AM - 6:00 PM', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('venue', 'Venue', { x: 10, y: 68, width: 80, height: 6 }, { placeholder: 'San Francisco Convention Center', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('rsvp', 'RSVP / Register', { x: 20, y: 80, width: 60, height: 8 }, { placeholder: 'REGISTER NOW', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#764ba2', backgroundColor: '#ffffff', borderRadius: 20 } }),
      createTextField('website', 'Website', { x: 25, y: 92, width: 50, height: 5 }, { placeholder: 'innovate2024.com', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['invitation', 'modern', 'conference', 'bold']
  },
  {
    id: 'invitation-garden-party', name: 'Garden Party Invitation', description: 'Light floral invitation for outdoor events',
    assetType: AssetType.InvitationCard, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#fef9f0' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#2d5016', secondary: '#fef9f0', accent: '#d97706', text: '#2d5016', background: '#fef9f0' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('invite', 'Invitation', { x: 10, y: 20, width: 80, height: 5 }, { placeholder: 'Please join us for', style: { fontSize: 12, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } }),
      createTextField('event', 'Event Name', { x: 5, y: 28, width: 90, height: 14 }, { placeholder: 'A Summer Garden Party', required: true, style: { fontSize: 32, textAlign: 'center', color: '#2d5016', fontStyle: 'italic' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 30, y: 45, width: 40, height: 0.3 }, style: { backgroundColor: '#d97706' } },
      createTextField('date', 'Date', { x: 15, y: 50, width: 70, height: 8 }, { placeholder: 'Saturday, June 22, 2024', style: { fontSize: 16, textAlign: 'center', color: '#2d5016' } }),
      createTextField('time', 'Time', { x: 20, y: 58, width: 60, height: 6 }, { placeholder: '4:00 PM — 8:00 PM', style: { fontSize: 12, textAlign: 'center', color: '#6b7280' } }),
      createTextField('venue', 'Venue', { x: 10, y: 68, width: 80, height: 8 }, { placeholder: 'Botanica Gardens, 123 Park Avenue', style: { fontSize: 13, textAlign: 'center', color: '#2d5016' } }),
      createTextField('rsvp', 'RSVP', { x: 15, y: 82, width: 70, height: 6 }, { placeholder: 'Kindly RSVP by June 10 | events@garden.com', style: { fontSize: 10, textAlign: 'center', color: '#d97706' } })
    ],
    tags: ['invitation', 'garden', 'outdoor', 'floral', 'elegant']
  },
  {
    id: 'invitation-corporate-dinner', name: 'Corporate Dinner Invite', description: 'Professional dinner invitation',
    assetType: AssetType.InvitationCard, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#1e3a5f' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#c9a962', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top-accent', type: 'shape', name: 'Gold Line', position: { x: 0, y: 0, width: 100, height: 2 }, style: { backgroundColor: '#c9a962' } },
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 25, height: 15 }, { placeholder: 'Company logo' }),
      createTextField('label', 'Label', { x: 35, y: 10, width: 60, height: 5 }, { placeholder: 'EXECUTIVE DINNER INVITATION', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right', color: '#c9a962', letterSpacing: 2 } }),
      createTextField('event', 'Event', { x: 5, y: 30, width: 90, height: 12 }, { placeholder: 'Leadership Summit Dinner', required: true, style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date', 'Date & Time', { x: 15, y: 48, width: 70, height: 8 }, { placeholder: 'Thursday, March 14, 2024 | 7:00 PM', style: { fontSize: 14, textAlign: 'center', color: '#c9a962' } }),
      createTextField('venue', 'Venue', { x: 10, y: 58, width: 80, height: 8 }, { placeholder: 'The Metropolitan Club, 1 E 60th Street', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('dress', 'Dress Code', { x: 25, y: 70, width: 50, height: 6 }, { placeholder: 'Business Formal', style: { fontSize: 11, textAlign: 'center', color: '#c9a962', letterSpacing: 1 } }),
      createTextField('rsvp', 'RSVP', { x: 10, y: 82, width: 80, height: 6 }, { placeholder: 'RSVP to events@company.com by March 7', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      { id: 'bottom-accent', type: 'shape', name: 'Bottom', position: { x: 0, y: 98, width: 100, height: 2 }, style: { backgroundColor: '#c9a962' } }
    ],
    tags: ['invitation', 'corporate', 'dinner', 'professional']
  },
  {
    id: 'invitation-tech-launch', name: 'Tech Launch Invite', description: 'High-tech product launch invitation',
    assetType: AssetType.InvitationCard, category: 'universal', dimensions: createDimensions(7, 5, 0.125, 0.25),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#000000', accent: '#8b5cf6', text: '#ffffff', background: '#000000' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 12 }, { placeholder: 'Logo' }),
      createTextField('label', 'Label', { x: 30, y: 10, width: 65, height: 5 }, { placeholder: 'EXCLUSIVE INVITE', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', color: '#22d3ee', letterSpacing: 3 } }),
      createTextField('event', 'Event', { x: 5, y: 28, width: 90, height: 16 }, { placeholder: 'PRODUCT LAUNCH', required: true, style: { fontSize: 40, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('product', 'Product Name', { x: 15, y: 46, width: 70, height: 8 }, { placeholder: 'Innovation X Pro', style: { fontSize: 18, textAlign: 'center', color: '#22d3ee' } }),
      createTextField('date', 'Date', { x: 15, y: 60, width: 70, height: 6 }, { placeholder: 'April 1, 2024 | 6:00 PM PST', style: { fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('venue', 'Venue', { x: 10, y: 68, width: 80, height: 6 }, { placeholder: 'Yerba Buena Center, San Francisco', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createTextField('rsvp', 'RSVP', { x: 20, y: 80, width: 60, height: 8 }, { placeholder: 'ACCEPT INVITATION', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#000000', backgroundColor: '#22d3ee', borderRadius: 4 } }),
      { id: 'glow', type: 'shape', name: 'Glow Line', position: { x: 0, y: 96, width: 100, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #22d3ee, #8b5cf6)' } }
    ],
    tags: ['invitation', 'tech', 'launch', 'modern']
  }
];

// ============= TICKET TEMPLATES =============

export const TICKET_TEMPLATES: EditableTemplate[] = [
  {
    id: 'ticket-classic-event', name: 'Classic Event Ticket', description: 'Traditional event ticket with tear-off stub',
    assetType: AssetType.TicketDesign, category: 'universal', dimensions: createDimensions(8, 3, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#ef4444', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'left-bar', type: 'shape', name: 'Left Bar', position: { x: 0, y: 0, width: 4, height: 100 }, style: { backgroundColor: '#1e3a5f' } },
      createLogoField('logo', 'Logo', { x: 6, y: 8, width: 18, height: 30 }, { placeholder: 'Event logo' }),
      createTextField('event-name', 'Event Name', { x: 26, y: 8, width: 48, height: 18 }, { placeholder: 'ANNUAL CONFERENCE', required: true, style: { fontSize: 22, fontWeight: 'bold', color: '#1e3a5f' } }),
      createTextField('date', 'Date', { x: 26, y: 30, width: 24, height: 12 }, { placeholder: 'MAR 15, 2024', style: { fontSize: 12, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('time', 'Time', { x: 50, y: 30, width: 24, height: 12 }, { placeholder: '7:00 PM', style: { fontSize: 12, color: '#6b7280' } }),
      createTextField('venue', 'Venue', { x: 26, y: 48, width: 48, height: 10 }, { placeholder: 'Convention Center, Main Hall', style: { fontSize: 11, color: '#6b7280' } }),
      createTextField('seat', 'Seat Info', { x: 26, y: 62, width: 48, height: 12 }, { placeholder: 'Section A | Row 5 | Seat 12', style: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' } }),
      createTextField('price', 'Price', { x: 26, y: 78, width: 20, height: 10 }, { placeholder: '$75.00', style: { fontSize: 14, fontWeight: 'bold', color: '#1e3a5f' } }),
      createTextField('ticket-no', 'Ticket #', { x: 46, y: 78, width: 28, height: 10 }, { placeholder: 'No. 00001', style: { fontSize: 10, textAlign: 'right', color: '#6b7280' } }),
      { id: 'tear-line', type: 'divider', name: 'Tear Line', position: { x: 76, y: 0, width: 0.3, height: 100 }, style: { backgroundColor: '#d4d4d4', borderStyle: 'dashed' } },
      // Stub section
      createTextField('stub-event', 'Stub Event', { x: 78, y: 10, width: 20, height: 15 }, { placeholder: 'CONF 2024', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f' } }),
      createTextField('stub-seat', 'Stub Seat', { x: 78, y: 40, width: 20, height: 15 }, { placeholder: 'A-5-12', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#ef4444' } }),
      createTextField('stub-no', 'Stub #', { x: 78, y: 70, width: 20, height: 15 }, { placeholder: '00001', style: { fontSize: 9, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['ticket', 'classic', 'event', 'stub']
  },
  {
    id: 'ticket-concert-neon', name: 'Concert Neon Ticket', description: 'Bold neon-style concert ticket',
    assetType: AssetType.TicketDesign, category: 'universal', dimensions: createDimensions(8, 3, 0.125, 0.125),
    background: { type: 'solid', value: '#0a0a0a' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0a0a0a', accent: '#f472b6', text: '#ffffff', background: '#0a0a0a' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 3, y: 10, width: 15, height: 40 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 20, y: 8, width: 55, height: 22 }, { placeholder: 'SUMMER FEST', required: true, style: { fontSize: 32, fontWeight: 'bold', color: '#22d3ee' } }),
      createTextField('artist', 'Artist/Speaker', { x: 20, y: 32, width: 55, height: 12 }, { placeholder: 'Featured Artist', style: { fontSize: 14, color: '#f472b6' } }),
      createTextField('date-venue', 'Date & Venue', { x: 20, y: 52, width: 55, height: 12 }, { placeholder: 'March 15 | City Arena', style: { fontSize: 12, color: 'rgba(255,255,255,0.7)' } }),
      createTextField('type', 'Ticket Type', { x: 20, y: 72, width: 25, height: 12 }, { placeholder: 'VIP', style: { fontSize: 14, fontWeight: 'bold', color: '#f472b6' } }),
      createTextField('price', 'Price', { x: 50, y: 72, width: 25, height: 12 }, { placeholder: '$150', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#22d3ee' } }),
      { id: 'qr', type: 'qrcode', name: 'QR Code', position: { x: 80, y: 15, width: 16, height: 55 }, placeholder: 'Ticket validation QR', style: { backgroundColor: '#ffffff', borderRadius: 4 } },
      createTextField('ticket-id', 'ID', { x: 80, y: 78, width: 16, height: 10 }, { placeholder: 'T-00001', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['ticket', 'concert', 'neon', 'music']
  },
  {
    id: 'ticket-gala-premium', name: 'Gala Premium Ticket', description: 'Luxury ticket for galas and formal events',
    assetType: AssetType.TicketDesign, category: 'universal', dimensions: createDimensions(8, 3, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#ffffff', text: '#ffffff', background: '#1a1a1a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'gold-border', type: 'shape', name: 'Border', position: { x: 2, y: 5, width: 96, height: 90 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 5, y: 12, width: 20, height: 30 }, { placeholder: 'Logo' }),
      createTextField('admit', 'Admit Label', { x: 28, y: 10, width: 45, height: 8 }, { placeholder: 'ADMIT ONE', style: { fontSize: 10, fontWeight: 'bold', color: '#d4af37', letterSpacing: 4 } }),
      createTextField('event', 'Event', { x: 28, y: 22, width: 45, height: 16 }, { placeholder: 'Charity Gala', required: true, style: { fontSize: 24, color: '#ffffff', fontStyle: 'italic' } }),
      createTextField('date', 'Date', { x: 28, y: 45, width: 45, height: 10 }, { placeholder: 'March 15, 2024', style: { fontSize: 14, color: '#d4af37' } }),
      createTextField('venue', 'Venue', { x: 28, y: 58, width: 45, height: 10 }, { placeholder: 'The Grand Ballroom', style: { fontSize: 11, color: 'rgba(255,255,255,0.7)' } }),
      createTextField('table', 'Table/Seat', { x: 28, y: 72, width: 22, height: 12 }, { placeholder: 'Table 1', style: { fontSize: 14, fontWeight: 'bold', color: '#d4af37' } }),
      createTextField('no', 'Number', { x: 52, y: 72, width: 22, height: 12 }, { placeholder: '#00001', style: { fontSize: 10, textAlign: 'right', color: 'rgba(255,255,255,0.5)' } }),
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 80, y: 18, width: 15, height: 50 }, placeholder: 'Ticket QR', style: { backgroundColor: '#ffffff', borderRadius: 4 } }
    ],
    tags: ['ticket', 'gala', 'premium', 'luxury']
  },
  {
    id: 'ticket-workshop-minimal', name: 'Workshop Ticket', description: 'Clean minimal workshop admission',
    assetType: AssetType.TicketDesign, category: 'universal', dimensions: createDimensions(8, 3, 0.125, 0.125),
    background: { type: 'solid', value: '#fafafa' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#fafafa', accent: '#10b981', text: '#0f172a', background: '#fafafa' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'left-accent', type: 'shape', name: 'Accent', position: { x: 0, y: 0, width: 2, height: 100 }, style: { backgroundColor: '#7c3aed' } },
      createLogoField('logo', 'Logo', { x: 5, y: 15, width: 15, height: 30 }, { placeholder: 'Logo' }),
      createTextField('workshop', 'Workshop Title', { x: 22, y: 10, width: 50, height: 18 }, { placeholder: 'UX Design Workshop', required: true, style: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' } }),
      createTextField('instructor', 'Instructor', { x: 22, y: 32, width: 50, height: 8 }, { placeholder: 'with Sarah Chen', style: { fontSize: 12, color: '#7c3aed' } }),
      createTextField('date-time', 'Date & Time', { x: 22, y: 50, width: 50, height: 8 }, { placeholder: 'Mar 15, 2024 | 2:00 - 5:00 PM', style: { fontSize: 11, color: '#6b7280' } }),
      createTextField('room', 'Room', { x: 22, y: 62, width: 25, height: 8 }, { placeholder: 'Room 201', style: { fontSize: 11, fontWeight: '600', color: '#0f172a' } }),
      createTextField('type', 'Type', { x: 47, y: 62, width: 25, height: 8 }, { placeholder: 'HANDS-ON', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'right', color: '#10b981', letterSpacing: 1 } }),
      createTextField('attendee', 'Attendee', { x: 22, y: 78, width: 50, height: 10 }, { placeholder: 'Attendee Name', style: { fontSize: 10, color: '#94a3b8' } }),
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 78, y: 15, width: 18, height: 60 }, placeholder: 'Check-in QR', style: { backgroundColor: '#ffffff', borderRadius: 4 } }
    ],
    tags: ['ticket', 'workshop', 'minimal', 'clean']
  },
  {
    id: 'ticket-festival-vibrant', name: 'Festival Ticket', description: 'Colorful festival admission ticket',
    assetType: AssetType.TicketDesign, category: 'universal', dimensions: createDimensions(8, 3, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #f472b6 0%, #8b5cf6 50%, #06b6d4 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f472b6', secondary: '#8b5cf6', accent: '#ffffff', text: '#ffffff', background: '#8b5cf6' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 3, y: 10, width: 18, height: 35 }, { placeholder: 'Festival logo' }),
      createTextField('festival', 'Festival', { x: 23, y: 8, width: 50, height: 20 }, { placeholder: 'BLOOM FEST', required: true, style: { fontSize: 32, fontWeight: '800', color: '#ffffff' } }),
      createTextField('dates', 'Dates', { x: 23, y: 32, width: 50, height: 10 }, { placeholder: 'June 20-23, 2024', style: { fontSize: 14, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' } }),
      createTextField('location', 'Location', { x: 23, y: 48, width: 50, height: 8 }, { placeholder: 'Riverside Park', style: { fontSize: 11, color: 'rgba(255,255,255,0.8)' } }),
      createTextField('pass-type', 'Pass Type', { x: 23, y: 65, width: 25, height: 14 }, { placeholder: 'WEEKEND', style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 } }),
      createTextField('gate', 'Gate', { x: 52, y: 65, width: 20, height: 14 }, { placeholder: 'Gate A', style: { fontSize: 11, color: 'rgba(255,255,255,0.7)' } }),
      { id: 'qr', type: 'qrcode', name: 'QR', position: { x: 78, y: 12, width: 18, height: 60 }, placeholder: 'Entry QR', style: { backgroundColor: '#ffffff', borderRadius: 8 } },
      createTextField('id', 'ID', { x: 78, y: 78, width: 18, height: 12 }, { placeholder: '#00001', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['ticket', 'festival', 'colorful', 'vibrant']
  }
];

// ============= CERTIFICATE TEMPLATES =============

export const CERTIFICATE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'certificate-formal', name: 'Formal Certificate', description: 'Traditional formal certificate of achievement',
    assetType: AssetType.CertificateAward, category: 'universal', dimensions: createDimensions(11, 8.5, 0.125, 0.5),
    background: { type: 'solid', value: '#fffef5' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#1a1a1a', accent: '#8b6914', text: '#1a1a1a', background: '#fffef5' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'outer-border', type: 'shape', name: 'Outer Border', position: { x: 3, y: 4, width: 94, height: 92 }, style: { borderColor: '#d4af37', borderWidth: 3, borderStyle: 'solid' } },
      { id: 'inner-border', type: 'shape', name: 'Inner Border', position: { x: 5, y: 6, width: 90, height: 88 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createLogoField('logo', 'Organization Logo', { x: 38, y: 8, width: 24, height: 12 }, { placeholder: 'Organization logo' }),
      createTextField('cert-type', 'Certificate Type', { x: 10, y: 22, width: 80, height: 6 }, { placeholder: 'Certificate of Achievement', style: { fontSize: 14, textAlign: 'center', color: '#8b6914', letterSpacing: 4, textTransform: 'uppercase' } }),
      createTextField('presented-to', 'Presented To', { x: 10, y: 32, width: 80, height: 5 }, { placeholder: 'This certificate is presented to', style: { fontSize: 12, textAlign: 'center', color: '#6b7280', fontStyle: 'italic' } }),
      createTextField('recipient', 'Recipient Name', { x: 10, y: 40, width: 80, height: 14 }, { placeholder: 'John Alexander Smith', required: true, style: { fontSize: 36, textAlign: 'center', color: '#1a1a1a', fontStyle: 'italic' } }),
      { id: 'name-line', type: 'divider', name: 'Name Line', position: { x: 20, y: 55, width: 60, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('achievement', 'Achievement', { x: 10, y: 58, width: 80, height: 10 }, { placeholder: 'In recognition of outstanding contributions to the Annual Technology Conference 2024', style: { fontSize: 13, textAlign: 'center', color: '#4b5563', lineHeight: 1.5 } }),
      createTextField('date', 'Date', { x: 10, y: 72, width: 35, height: 6 }, { placeholder: 'March 17, 2024', style: { fontSize: 11, textAlign: 'center', color: '#6b7280' } }),
      createTextField('signature', 'Signature', { x: 55, y: 72, width: 35, height: 6 }, { placeholder: 'Executive Director', style: { fontSize: 11, textAlign: 'center', color: '#6b7280' } }),
      { id: 'date-line', type: 'divider', name: 'Date Line', position: { x: 15, y: 71, width: 25, height: 0.3 }, style: { backgroundColor: '#1a1a1a' } },
      { id: 'sig-line', type: 'divider', name: 'Sig Line', position: { x: 60, y: 71, width: 25, height: 0.3 }, style: { backgroundColor: '#1a1a1a' } },
      createTextField('org-name', 'Organization', { x: 10, y: 82, width: 80, height: 6 }, { placeholder: 'Organization Name', style: { fontSize: 11, textAlign: 'center', color: '#8b6914', letterSpacing: 2 } })
    ],
    tags: ['certificate', 'formal', 'achievement', 'traditional']
  },
  {
    id: 'certificate-modern', name: 'Modern Certificate', description: 'Contemporary certificate design',
    assetType: AssetType.CertificateAward, category: 'universal', dimensions: createDimensions(11, 8.5, 0.125, 0.5),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#f59e0b', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'left-bar', type: 'shape', name: 'Left Bar', position: { x: 0, y: 0, width: 5, height: 100 }, style: { backgroundColor: '#1e40af' } },
      createLogoField('logo', 'Logo', { x: 8, y: 8, width: 20, height: 12 }, { placeholder: 'Organization logo' }),
      createTextField('cert-type', 'Type', { x: 8, y: 24, width: 85, height: 6 }, { placeholder: 'CERTIFICATE OF COMPLETION', style: { fontSize: 12, fontWeight: 'bold', color: '#1e40af', letterSpacing: 3 } }),
      createTextField('recipient', 'Recipient', { x: 8, y: 36, width: 85, height: 14 }, { placeholder: 'Jane Smith', required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a' } }),
      { id: 'accent-line', type: 'divider', name: 'Accent', position: { x: 8, y: 52, width: 30, height: 0.5 }, style: { backgroundColor: '#f59e0b' } },
      createTextField('description', 'Description', { x: 8, y: 56, width: 85, height: 12 }, { placeholder: 'Has successfully completed the Advanced Leadership Program at the 2024 Global Summit', style: { fontSize: 14, color: '#4b5563', lineHeight: 1.5 } }),
      createTextField('date', 'Date', { x: 8, y: 74, width: 30, height: 6 }, { placeholder: 'March 17, 2024', style: { fontSize: 11, color: '#6b7280' } }),
      createTextField('signature-name', 'Signatory', { x: 60, y: 74, width: 33, height: 6 }, { placeholder: 'Dr. Sarah Johnson', style: { fontSize: 11, fontWeight: '600', textAlign: 'right', color: '#1a1a1a' } }),
      createTextField('signature-title', 'Title', { x: 60, y: 80, width: 33, height: 5 }, { placeholder: 'Program Director', style: { fontSize: 10, textAlign: 'right', color: '#6b7280' } }),
      createTextField('cert-id', 'Certificate ID', { x: 8, y: 90, width: 40, height: 5 }, { placeholder: 'Certificate ID: CERT-2024-00001', style: { fontSize: 8, color: '#94a3b8' } })
    ],
    tags: ['certificate', 'modern', 'completion', 'clean']
  },
  {
    id: 'certificate-tech-badge', name: 'Tech Certification', description: 'Technology-style certification badge',
    assetType: AssetType.CertificateAward, category: 'universal', dimensions: createDimensions(11, 8.5, 0.125, 0.5),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#10b981', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 12 }, { placeholder: 'Logo' }),
      createTextField('cert', 'Certification', { x: 30, y: 8, width: 65, height: 5 }, { placeholder: 'PROFESSIONAL CERTIFICATION', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'right', color: '#22d3ee', letterSpacing: 3 } }),
      createTextField('badge', 'Badge Title', { x: 10, y: 26, width: 80, height: 12 }, { placeholder: 'Certified Cloud Architect', required: true, style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('recipient', 'Recipient', { x: 10, y: 42, width: 80, height: 10 }, { placeholder: 'Alex Rivera', style: { fontSize: 22, textAlign: 'center', color: '#22d3ee' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 30, y: 55, width: 40, height: 0.3 }, style: { backgroundColor: '#22d3ee' } },
      createTextField('description', 'Description', { x: 15, y: 60, width: 70, height: 10 }, { placeholder: 'Has demonstrated proficiency in cloud architecture, deployment, and security best practices', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 } }),
      createTextField('date', 'Date Issued', { x: 10, y: 76, width: 35, height: 5 }, { placeholder: 'Issued: March 2024', style: { fontSize: 10, color: '#10b981' } }),
      createTextField('expires', 'Expiry', { x: 55, y: 76, width: 35, height: 5 }, { placeholder: 'Valid Until: March 2026', style: { fontSize: 10, textAlign: 'right', color: '#10b981' } }),
      createTextField('cert-id', 'ID', { x: 10, y: 86, width: 80, height: 5 }, { placeholder: 'Credential ID: ARCH-2024-00001 | Verify at verify.techcert.com', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.4)' } })
    ],
    tags: ['certificate', 'tech', 'certification', 'digital']
  },
  {
    id: 'certificate-appreciation', name: 'Appreciation Certificate', description: 'Warm appreciation certificate for volunteers/speakers',
    assetType: AssetType.CertificateAward, category: 'universal', dimensions: createDimensions(11, 8.5, 0.125, 0.5),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#fbbf24', secondary: '#7c3aed', accent: '#ffffff', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 38, y: 5, width: 24, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('title', 'Title', { x: 10, y: 20, width: 80, height: 8 }, { placeholder: 'Certificate of Appreciation', style: { fontSize: 20, textAlign: 'center', color: '#fbbf24', letterSpacing: 2 } }),
      createTextField('recipient', 'Recipient', { x: 10, y: 34, width: 80, height: 14 }, { placeholder: 'Dr. Maria Santos', required: true, style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 25, y: 50, width: 50, height: 0.3 }, style: { backgroundColor: '#fbbf24' } },
      createTextField('for', 'For', { x: 10, y: 55, width: 80, height: 12 }, { placeholder: 'For your inspiring keynote presentation at the International Technology Summit 2024', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontStyle: 'italic' } }),
      createTextField('date', 'Date', { x: 30, y: 74, width: 40, height: 6 }, { placeholder: 'March 17, 2024', style: { fontSize: 12, textAlign: 'center', color: '#fbbf24' } }),
      createTextField('signatory', 'Signatory', { x: 30, y: 84, width: 40, height: 6 }, { placeholder: 'Event Director', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['certificate', 'appreciation', 'speaker', 'volunteer']
  },
  {
    id: 'certificate-participation', name: 'Participation Certificate', description: 'Standard participation certificate',
    assetType: AssetType.CertificateAward, category: 'universal', dimensions: createDimensions(11, 8.5, 0.125, 0.5),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#10b981', secondary: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top-bar', type: 'shape', name: 'Top', position: { x: 0, y: 0, width: 100, height: 4 }, style: { backgroundColor: '#10b981' } },
      createLogoField('logo', 'Logo', { x: 38, y: 8, width: 24, height: 12 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 10, y: 24, width: 80, height: 6 }, { placeholder: 'CERTIFICATE OF PARTICIPATION', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#10b981', letterSpacing: 3 } }),
      createTextField('confirms', 'Confirms', { x: 10, y: 34, width: 80, height: 5 }, { placeholder: 'This certifies that', style: { fontSize: 12, textAlign: 'center', color: '#6b7280' } }),
      createTextField('name', 'Name', { x: 10, y: 42, width: 80, height: 14 }, { placeholder: 'Participant Name', required: true, style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 20, y: 57, width: 60, height: 0.3 }, style: { backgroundColor: '#10b981' } },
      createTextField('event', 'Event', { x: 10, y: 62, width: 80, height: 10 }, { placeholder: 'Has participated in the 2024 Annual Conference & Workshop Series', style: { fontSize: 14, textAlign: 'center', color: '#4b5563', lineHeight: 1.5 } }),
      createTextField('date', 'Date', { x: 15, y: 78, width: 30, height: 5 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 10, textAlign: 'center', color: '#6b7280' } }),
      createTextField('signatory', 'Signatory', { x: 55, y: 78, width: 30, height: 5 }, { placeholder: 'Program Chair', style: { fontSize: 10, textAlign: 'center', color: '#6b7280' } }),
      { id: 'bottom-bar', type: 'shape', name: 'Bottom', position: { x: 0, y: 96, width: 100, height: 4 }, style: { backgroundColor: '#10b981' } }
    ],
    tags: ['certificate', 'participation', 'standard']
  }
];

// ============= MENU TEMPLATES =============

export const MENU_TEMPLATES: EditableTemplate[] = [
  {
    id: 'menu-elegant-dinner', name: 'Elegant Dinner Menu', description: 'Sophisticated multi-course dinner menu',
    assetType: AssetType.Menu, category: 'universal', dimensions: createDimensions(5, 8, 0.125, 0.25),
    background: { type: 'solid', value: '#0f0f0f' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#0f0f0f', accent: '#ffffff', text: '#ffffff', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Border', position: { x: 4, y: 3, width: 92, height: 94 }, style: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid' } },
      createLogoField('logo', 'Event Logo', { x: 30, y: 5, width: 40, height: 8 }, { placeholder: 'Logo' }),
      createTextField('title', 'Menu Title', { x: 10, y: 16, width: 80, height: 6 }, { placeholder: 'DINNER MENU', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 4 } }),
      { id: 'line1', type: 'divider', name: 'Line', position: { x: 30, y: 24, width: 40, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('course-1-label', 'First Course', { x: 10, y: 28, width: 80, height: 4 }, { placeholder: 'FIRST COURSE', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 2 } }),
      createTextField('course-1', 'First Course Item', { x: 10, y: 33, width: 80, height: 8 }, { placeholder: 'Seared Scallops\nwith citrus beurre blanc & microgreens', style: { fontSize: 12, textAlign: 'center', color: '#ffffff', lineHeight: 1.4 } }),
      createTextField('course-2-label', 'Second Course', { x: 10, y: 44, width: 80, height: 4 }, { placeholder: 'SECOND COURSE', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 2 } }),
      createTextField('course-2', 'Second Course Item', { x: 10, y: 49, width: 80, height: 8 }, { placeholder: 'Filet Mignon\nwith truffle mashed potato & asparagus', style: { fontSize: 12, textAlign: 'center', color: '#ffffff', lineHeight: 1.4 } }),
      createTextField('course-3-label', 'Dessert', { x: 10, y: 60, width: 80, height: 4 }, { placeholder: 'DESSERT', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 2 } }),
      createTextField('course-3', 'Dessert Item', { x: 10, y: 65, width: 80, height: 8 }, { placeholder: 'Dark Chocolate Fondant\nwith vanilla gelato & berry coulis', style: { fontSize: 12, textAlign: 'center', color: '#ffffff', lineHeight: 1.4 } }),
      { id: 'line2', type: 'divider', name: 'Line', position: { x: 30, y: 76, width: 40, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('dietary', 'Dietary Note', { x: 10, y: 80, width: 80, height: 6 }, { placeholder: 'Please inform your server of any dietary requirements', style: { fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' } }),
      createTextField('event', 'Event', { x: 10, y: 88, width: 80, height: 5 }, { placeholder: 'Annual Gala Dinner 2024', style: { fontSize: 10, textAlign: 'center', color: '#d4af37' } })
    ],
    tags: ['menu', 'dinner', 'elegant', 'formal']
  },
  {
    id: 'menu-modern-buffet', name: 'Modern Buffet Menu', description: 'Clean buffet-style menu display',
    assetType: AssetType.Menu, category: 'universal', dimensions: createDimensions(8.5, 11, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'header', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 15 }, style: { backgroundColor: '#1e3a5f' } },
      createLogoField('logo', 'Logo', { x: 5, y: 3, width: 15, height: 9 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 25, y: 4, width: 70, height: 7 }, { placeholder: 'LUNCH MENU', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', color: '#ffffff', letterSpacing: 2 } }),
      createTextField('section-1', 'Section 1', { x: 5, y: 18, width: 40, height: 4 }, { placeholder: 'APPETIZERS', style: { fontSize: 12, fontWeight: 'bold', color: '#10b981', letterSpacing: 2 } }),
      createTextField('items-1', 'Items 1', { x: 5, y: 23, width: 40, height: 20 }, { placeholder: 'Mediterranean Mezze Platter\nBruschetta Trio\nSeasonal Soup', style: { fontSize: 11, color: '#1a1a1a', lineHeight: 1.8 } }),
      createTextField('section-2', 'Section 2', { x: 55, y: 18, width: 40, height: 4 }, { placeholder: 'MAIN COURSES', style: { fontSize: 12, fontWeight: 'bold', color: '#10b981', letterSpacing: 2 } }),
      createTextField('items-2', 'Items 2', { x: 55, y: 23, width: 40, height: 20 }, { placeholder: 'Grilled Salmon\nRoasted Chicken\nVegetable Risotto', style: { fontSize: 11, color: '#1a1a1a', lineHeight: 1.8 } }),
      createTextField('section-3', 'Section 3', { x: 5, y: 48, width: 40, height: 4 }, { placeholder: 'SIDES', style: { fontSize: 12, fontWeight: 'bold', color: '#10b981', letterSpacing: 2 } }),
      createTextField('items-3', 'Items 3', { x: 5, y: 53, width: 40, height: 15 }, { placeholder: 'Mixed Green Salad\nRoasted Vegetables\nArtisan Breads', style: { fontSize: 11, color: '#1a1a1a', lineHeight: 1.8 } }),
      createTextField('section-4', 'Section 4', { x: 55, y: 48, width: 40, height: 4 }, { placeholder: 'DESSERTS', style: { fontSize: 12, fontWeight: 'bold', color: '#10b981', letterSpacing: 2 } }),
      createTextField('items-4', 'Items 4', { x: 55, y: 53, width: 40, height: 15 }, { placeholder: 'Chocolate Mousse\nFruit Tart\nCheesecake', style: { fontSize: 11, color: '#1a1a1a', lineHeight: 1.8 } }),
      createTextField('section-5', 'Beverages', { x: 5, y: 73, width: 90, height: 4 }, { placeholder: 'BEVERAGES', style: { fontSize: 12, fontWeight: 'bold', color: '#10b981', letterSpacing: 2 } }),
      createTextField('items-5', 'Bev Items', { x: 5, y: 78, width: 90, height: 6 }, { placeholder: 'Coffee & Tea Station | Sparkling Water | Fresh Juices | Soft Drinks', style: { fontSize: 11, color: '#1a1a1a' } }),
      createTextField('dietary', 'Dietary Note', { x: 5, y: 88, width: 90, height: 6 }, { placeholder: '🌱 Vegetarian | 🌾 Gluten-Free | 🥜 Contains Nuts — Please ask staff for allergen information', style: { fontSize: 9, color: '#6b7280', fontStyle: 'italic' } })
    ],
    tags: ['menu', 'buffet', 'modern', 'lunch']
  },
  {
    id: 'menu-cocktail-bar', name: 'Cocktail Bar Menu', description: 'Dark themed bar menu card',
    assetType: AssetType.BarMenu, category: 'universal', dimensions: createDimensions(5, 8, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#c084fc', secondary: '#1a1a1a', accent: '#fbbf24', text: '#ffffff', background: '#1a1a1a' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 4, width: 40, height: 8 }, { placeholder: 'Event logo' }),
      createTextField('title', 'Title', { x: 10, y: 14, width: 80, height: 6 }, { placeholder: 'COCKTAIL MENU', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#c084fc', letterSpacing: 4 } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 25, y: 22, width: 50, height: 0.3 }, style: { backgroundColor: '#c084fc' } },
      createTextField('signature', 'Signature', { x: 10, y: 26, width: 80, height: 4 }, { placeholder: 'SIGNATURE COCKTAILS', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 2 } }),
      createTextField('drink-1', 'Drink 1', { x: 8, y: 32, width: 65, height: 8 }, { placeholder: 'The Summit Spritz\nAperol, prosecco, orange, soda', style: { fontSize: 11, color: '#ffffff', lineHeight: 1.5 } }),
      createTextField('price-1', 'Price 1', { x: 75, y: 33, width: 17, height: 5 }, { placeholder: '$14', style: { fontSize: 12, textAlign: 'right', color: '#fbbf24' } }),
      createTextField('drink-2', 'Drink 2', { x: 8, y: 42, width: 65, height: 8 }, { placeholder: 'Innovation Old Fashioned\nBourbon, demerara, bitters, orange', style: { fontSize: 11, color: '#ffffff', lineHeight: 1.5 } }),
      createTextField('price-2', 'Price 2', { x: 75, y: 43, width: 17, height: 5 }, { placeholder: '$16', style: { fontSize: 12, textAlign: 'right', color: '#fbbf24' } }),
      createTextField('drink-3', 'Drink 3', { x: 8, y: 52, width: 65, height: 8 }, { placeholder: 'Keynote Martini\nVodka, elderflower, lime, cucumber', style: { fontSize: 11, color: '#ffffff', lineHeight: 1.5 } }),
      createTextField('price-3', 'Price 3', { x: 75, y: 53, width: 17, height: 5 }, { placeholder: '$15', style: { fontSize: 12, textAlign: 'right', color: '#fbbf24' } }),
      createTextField('classics', 'Classics Label', { x: 10, y: 65, width: 80, height: 4 }, { placeholder: 'CLASSIC SELECTIONS', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 2 } }),
      createTextField('classics-list', 'Classics', { x: 8, y: 70, width: 84, height: 12 }, { placeholder: 'Wine (Red / White / Rosé)  $12\nCraft Beer  $8\nMocktail  $10', style: { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 } }),
      createTextField('note', 'Note', { x: 10, y: 86, width: 80, height: 6 }, { placeholder: 'Please drink responsibly | 21+ ID required', style: { fontSize: 8, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' } }),
      createTextField('event', 'Event', { x: 10, y: 92, width: 80, height: 4 }, { placeholder: 'Tech Summit 2024 — After Party', style: { fontSize: 8, textAlign: 'center', color: '#c084fc' } })
    ],
    tags: ['menu', 'bar', 'cocktail', 'dark']
  },
  {
    id: 'menu-place-card-combo', name: 'Place Setting Menu', description: 'Slim menu card for place settings',
    assetType: AssetType.Menu, category: 'universal', dimensions: createDimensions(4, 9, 0.125, 0.25),
    background: { type: 'solid', value: '#fafaf5' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#2d5016', secondary: '#fafaf5', accent: '#d97706', text: '#2d5016', background: '#fafaf5' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 25, y: 3, width: 50, height: 6 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 10, y: 11, width: 80, height: 4 }, { placeholder: 'MENU', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#d97706', letterSpacing: 6 } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 30, y: 17, width: 40, height: 0.3 }, style: { backgroundColor: '#d97706' } },
      createTextField('starter-label', 'Starter Label', { x: 10, y: 20, width: 80, height: 3 }, { placeholder: 'To Start', style: { fontSize: 9, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } }),
      createTextField('starter', 'Starter', { x: 8, y: 24, width: 84, height: 8 }, { placeholder: 'Burrata & Heirloom Tomato\nwith basil pesto & aged balsamic', style: { fontSize: 11, textAlign: 'center', color: '#2d5016', lineHeight: 1.4 } }),
      createTextField('main-label', 'Main Label', { x: 10, y: 36, width: 80, height: 3 }, { placeholder: 'Main Course', style: { fontSize: 9, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } }),
      createTextField('main', 'Main', { x: 8, y: 40, width: 84, height: 8 }, { placeholder: 'Pan-Roasted Sea Bass\nwith saffron risotto & asparagus', style: { fontSize: 11, textAlign: 'center', color: '#2d5016', lineHeight: 1.4 } }),
      createTextField('dessert-label', 'Dessert Label', { x: 10, y: 52, width: 80, height: 3 }, { placeholder: 'Dessert', style: { fontSize: 9, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } }),
      createTextField('dessert', 'Dessert', { x: 8, y: 56, width: 84, height: 8 }, { placeholder: 'Lemon Posset\nwith seasonal berries & shortbread', style: { fontSize: 11, textAlign: 'center', color: '#2d5016', lineHeight: 1.4 } }),
      createTextField('wines', 'Wine Pairing', { x: 10, y: 68, width: 80, height: 3 }, { placeholder: 'Wine Pairing', style: { fontSize: 9, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } }),
      createTextField('wine-list', 'Wines', { x: 8, y: 72, width: 84, height: 10 }, { placeholder: 'White: Sancerre 2021\nRed: Barolo 2018', style: { fontSize: 10, textAlign: 'center', color: '#2d5016', lineHeight: 1.6 } }),
      createTextField('dietary', 'Dietary', { x: 10, y: 86, width: 80, height: 4 }, { placeholder: 'V Vegetarian available | GF Gluten-free on request', style: { fontSize: 8, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' } }),
      createTextField('event', 'Event', { x: 10, y: 93, width: 80, height: 4 }, { placeholder: 'Gala Dinner — March 15, 2024', style: { fontSize: 8, textAlign: 'center', color: '#d97706' } })
    ],
    tags: ['menu', 'place-setting', 'dinner', 'elegant']
  },
  {
    id: 'menu-conference-catering', name: 'Conference Catering Card', description: 'Simple catering info card',
    assetType: AssetType.Menu, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#10b981', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'header', type: 'shape', name: 'Header', position: { x: 0, y: 0, width: 100, height: 12 }, style: { backgroundColor: '#1e40af' } },
      createLogoField('logo', 'Logo', { x: 5, y: 2, width: 15, height: 8 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 25, y: 3, width: 70, height: 6 }, { placeholder: 'LUNCH MENU', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#ffffff' } }),
      createTextField('items', 'Menu Items', { x: 8, y: 16, width: 84, height: 55 }, { placeholder: 'SANDWICHES\nTurkey Club\nCaprese Panini\nChicken Caesar Wrap\n\nSIDES\nGarden Salad\nFresh Fruit\nKettle Chips\n\nBEVERAGES\nCoffee & Tea\nSparkling Water\nSoft Drinks', style: { fontSize: 11, color: '#1a1a1a', lineHeight: 1.6 } }),
      createTextField('dietary', 'Dietary Info', { x: 8, y: 76, width: 84, height: 8 }, { placeholder: '🌱 Vegetarian options available\n🌾 Gluten-free options marked with (GF)', style: { fontSize: 9, color: '#10b981', lineHeight: 1.5 } }),
      createTextField('allergens', 'Allergen Notice', { x: 8, y: 88, width: 84, height: 6 }, { placeholder: 'Please inform staff of any allergies or dietary requirements', style: { fontSize: 8, color: '#94a3b8', fontStyle: 'italic' } })
    ],
    tags: ['menu', 'conference', 'catering', 'simple']
  }
];

// ============= PLACE CARD TEMPLATES =============

export const PLACE_CARD_TEMPLATES: EditableTemplate[] = [
  {
    id: 'place-card-elegant', name: 'Elegant Place Card', description: 'Classic fold-over place card',
    assetType: AssetType.PlaceCard, category: 'universal', dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#fffef5' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#fffef5', accent: '#1a1a1a', text: '#1a1a1a', background: '#fffef5' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'top-line', type: 'divider', name: 'Top Line', position: { x: 15, y: 10, width: 70, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('guest-name', 'Guest Name', { x: 5, y: 25, width: 90, height: 35 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 22, textAlign: 'center', color: '#1a1a1a', fontStyle: 'italic' } }),
      { id: 'bottom-line', type: 'divider', name: 'Bottom Line', position: { x: 15, y: 70, width: 70, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('table', 'Table', { x: 20, y: 78, width: 60, height: 12 }, { placeholder: 'Table 1', style: { fontSize: 11, textAlign: 'center', color: '#d4af37' } })
    ],
    tags: ['place-card', 'elegant', 'formal']
  },
  {
    id: 'place-card-modern', name: 'Modern Place Card', description: 'Clean modern place card',
    assetType: AssetType.PlaceCard, category: 'universal', dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#1e40af', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'accent', type: 'shape', name: 'Accent', position: { x: 0, y: 0, width: 100, height: 4 }, style: { backgroundColor: '#1e40af' } },
      createTextField('name', 'Name', { x: 5, y: 20, width: 90, height: 35 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#0f172a' } }),
      createTextField('table', 'Table', { x: 20, y: 65, width: 60, height: 12 }, { placeholder: 'Table 5', style: { fontSize: 12, textAlign: 'center', color: '#1e40af' } }),
      createTextField('meal', 'Meal Choice', { x: 20, y: 80, width: 60, height: 10 }, { placeholder: '🐟 Fish', style: { fontSize: 10, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['place-card', 'modern', 'clean']
  },
  {
    id: 'place-card-dark-luxe', name: 'Dark Luxe Place Card', description: 'Dark luxury place card',
    assetType: AssetType.PlaceCard, category: 'universal', dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#0f0f0f' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#d4af37', secondary: '#0f0f0f', accent: '#ffffff', text: '#ffffff', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('name', 'Name', { x: 5, y: 28, width: 90, height: 30 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 20, textAlign: 'center', color: '#d4af37' } }),
      createTextField('table', 'Table', { x: 25, y: 68, width: 50, height: 12 }, { placeholder: 'Table 1', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createTextField('seat', 'Seat', { x: 25, y: 82, width: 50, height: 10 }, { placeholder: 'Seat 3', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.4)' } })
    ],
    tags: ['place-card', 'dark', 'luxury']
  },
  {
    id: 'place-card-branded', name: 'Branded Place Card', description: 'Place card with event branding',
    assetType: AssetType.PlaceCard, category: 'universal', dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#667eea', accent: '#fbbf24', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 8, width: 20, height: 20 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 5, y: 32, width: 90, height: 28 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title', 'Title', { x: 10, y: 62, width: 80, height: 10 }, { placeholder: 'Speaker', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('table', 'Table', { x: 25, y: 80, width: 50, height: 12 }, { placeholder: 'Table 1 — Seat 3', style: { fontSize: 10, textAlign: 'center', color: '#fbbf24' } })
    ],
    tags: ['place-card', 'branded', 'colorful']
  },
  {
    id: 'place-card-botanical', name: 'Botanical Place Card', description: 'Nature-inspired place card',
    assetType: AssetType.PlaceCard, category: 'universal', dimensions: createDimensions(3.5, 2, 0.125, 0.125),
    background: { type: 'solid', value: '#f5f0e8' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#2d5016', secondary: '#f5f0e8', accent: '#d97706', text: '#2d5016', background: '#f5f0e8' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('name', 'Name', { x: 5, y: 20, width: 90, height: 35 }, { placeholder: 'Guest Name', required: true, style: { fontSize: 22, textAlign: 'center', color: '#2d5016', fontStyle: 'italic' } }),
      { id: 'leaf', type: 'divider', name: 'Accent', position: { x: 35, y: 60, width: 30, height: 0.3 }, style: { backgroundColor: '#2d5016' } },
      createTextField('table', 'Table', { x: 20, y: 68, width: 60, height: 12 }, { placeholder: 'Table Five', style: { fontSize: 11, textAlign: 'center', color: '#d97706' } }),
      createTextField('meal', 'Meal', { x: 20, y: 82, width: 60, height: 10 }, { placeholder: 'Vegetarian', style: { fontSize: 9, textAlign: 'center', color: '#6b7280' } })
    ],
    tags: ['place-card', 'botanical', 'nature', 'garden']
  }
];

// ============= TABLE NUMBER TEMPLATES =============

export const TABLE_NUMBER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'table-number-elegant', name: 'Elegant Table Number', description: 'Classic elegant table number',
    assetType: AssetType.TableNumber, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'solid', value: '#0f0f0f' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#0f0f0f', accent: '#ffffff', text: '#d4af37', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Border', position: { x: 5, y: 4, width: 90, height: 92 }, style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 30, y: 8, width: 40, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('number', 'Table Number', { x: 10, y: 30, width: 80, height: 40 }, { placeholder: '1', required: true, style: { fontSize: 96, fontWeight: 'bold', textAlign: 'center', color: '#d4af37' } }),
      createTextField('event', 'Event', { x: 15, y: 78, width: 70, height: 8 }, { placeholder: 'Annual Gala 2024', style: { fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['table-number', 'elegant', 'gold']
  },
  {
    id: 'table-number-modern', name: 'Modern Table Number', description: 'Clean modern table number',
    assetType: AssetType.TableNumber, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#1e40af', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'accent', type: 'shape', name: 'Top Accent', position: { x: 0, y: 0, width: 100, height: 3 }, style: { backgroundColor: '#1e40af' } },
      createTextField('label', 'Label', { x: 10, y: 15, width: 80, height: 8 }, { placeholder: 'TABLE', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#1e40af', letterSpacing: 6 } }),
      createTextField('number', 'Number', { x: 10, y: 30, width: 80, height: 40 }, { placeholder: '5', required: true, style: { fontSize: 120, fontWeight: '800', textAlign: 'center', color: '#0f172a' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 78, width: 30, height: 12 }, { placeholder: 'Logo' })
    ],
    tags: ['table-number', 'modern', 'clean']
  },
  {
    id: 'table-number-bold-color', name: 'Bold Color Table Number', description: 'Vibrant colored table number',
    assetType: AssetType.TableNumber, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#667eea', accent: '#fbbf24', text: '#ffffff', background: '#667eea' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 8, width: 40, height: 10 }, { placeholder: 'Logo' }),
      createTextField('label', 'Label', { x: 10, y: 22, width: 80, height: 6 }, { placeholder: 'TABLE', style: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.8)', letterSpacing: 4 } }),
      createTextField('number', 'Number', { x: 10, y: 32, width: 80, height: 40 }, { placeholder: '12', required: true, style: { fontSize: 110, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('event', 'Event', { x: 10, y: 78, width: 80, height: 8 }, { placeholder: 'Conference Dinner', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['table-number', 'bold', 'colorful']
  },
  {
    id: 'table-number-rustic', name: 'Rustic Table Number', description: 'Warm rustic table number',
    assetType: AssetType.TableNumber, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'solid', value: '#f5f0e8' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#92400e', secondary: '#f5f0e8', accent: '#d97706', text: '#92400e', background: '#f5f0e8' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('number', 'Number', { x: 10, y: 15, width: 80, height: 50 }, { placeholder: '3', required: true, style: { fontSize: 120, textAlign: 'center', color: '#92400e', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 25, y: 68, width: 50, height: 0.3 }, style: { backgroundColor: '#d97706' } },
      createTextField('event', 'Event', { x: 10, y: 74, width: 80, height: 8 }, { placeholder: 'Wedding Reception', style: { fontSize: 12, textAlign: 'center', color: '#92400e', fontStyle: 'italic' } })
    ],
    tags: ['table-number', 'rustic', 'warm']
  },
  {
    id: 'table-number-minimal', name: 'Minimal Table Number', description: 'Ultra-minimal table number',
    assetType: AssetType.TableNumber, category: 'universal', dimensions: createDimensions(5, 7, 0.125, 0.25),
    background: { type: 'solid', value: '#fafafa' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#fafafa', accent: '#3b82f6', text: '#0f172a', background: '#fafafa' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('number', 'Number', { x: 10, y: 20, width: 80, height: 50 }, { placeholder: '7', required: true, style: { fontSize: 140, fontWeight: '100', textAlign: 'center', color: '#0f172a' } }),
      { id: 'dot', type: 'shape', name: 'Dot', position: { x: 47, y: 75, width: 6, height: 4 }, style: { backgroundColor: '#3b82f6', borderRadius: 50 } }
    ],
    tags: ['table-number', 'minimal', 'ultra-clean']
  }
];

// ============= PROGRAM BOOKLET COVER TEMPLATES =============

export const PROGRAM_BOOKLET_TEMPLATES: EditableTemplate[] = [
  {
    id: 'program-cover-corporate', name: 'Corporate Program Cover', description: 'Professional program booklet cover',
    assetType: AssetType.ProgramBooklet, category: 'universal', dimensions: createDimensions(5.5, 8.5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Open Sans' },
    defaultColors: { primary: '#1e3a5f', secondary: '#ffffff', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 25, y: 8, width: 50, height: 15 }, { placeholder: 'Event logo' }),
      createTextField('event-name', 'Event Name', { x: 5, y: 28, width: 90, height: 15 }, { placeholder: 'ANNUAL CONFERENCE', required: true, style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('year', 'Year', { x: 30, y: 44, width: 40, height: 8 }, { placeholder: '2024', style: { fontSize: 24, textAlign: 'center', color: '#f59e0b' } }),
      createImageField('cover-image', 'Cover Image', { x: 10, y: 55, width: 80, height: 25 }, { placeholder: 'Event photo', style: { borderRadius: 8 } }),
      createTextField('date-location', 'Date & Location', { x: 10, y: 84, width: 80, height: 8 }, { placeholder: 'March 15-17 | San Francisco, CA', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('label', 'Label', { x: 25, y: 93, width: 50, height: 4 }, { placeholder: 'EVENT PROGRAM', style: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', color: '#f59e0b', letterSpacing: 3 } })
    ],
    tags: ['program', 'booklet', 'cover', 'corporate']
  },
  {
    id: 'program-cover-gala', name: 'Gala Program Cover', description: 'Elegant gala program cover',
    assetType: AssetType.ProgramBooklet, category: 'universal', dimensions: createDimensions(5.5, 8.5, 0.125, 0.25),
    background: { type: 'solid', value: '#0f0f0f' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#d4af37', secondary: '#0f0f0f', accent: '#ffffff', text: '#ffffff', background: '#0f0f0f' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'border', type: 'shape', name: 'Border', position: { x: 4, y: 3, width: 92, height: 94 }, style: { borderColor: '#d4af37', borderWidth: 2, borderStyle: 'solid' } },
      createLogoField('logo', 'Logo', { x: 30, y: 8, width: 40, height: 12 }, { placeholder: 'Logo' }),
      createTextField('label', 'Label', { x: 10, y: 25, width: 80, height: 5 }, { placeholder: 'PROGRAM', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#d4af37', letterSpacing: 6 } }),
      createTextField('event', 'Event Name', { x: 10, y: 35, width: 80, height: 18 }, { placeholder: 'The Annual\nCharity Gala', required: true, style: { fontSize: 30, textAlign: 'center', color: '#ffffff', fontStyle: 'italic', lineHeight: 1.3 } }),
      { id: 'gold-line', type: 'divider', name: 'Line', position: { x: 25, y: 58, width: 50, height: 0.3 }, style: { backgroundColor: '#d4af37' } },
      createTextField('date', 'Date', { x: 15, y: 62, width: 70, height: 8 }, { placeholder: 'Saturday, March 15, 2024', style: { fontSize: 14, textAlign: 'center', color: '#d4af37' } }),
      createTextField('venue', 'Venue', { x: 15, y: 72, width: 70, height: 8 }, { placeholder: 'The Ritz-Carlton', style: { fontSize: 13, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } }),
      createTextField('benefiting', 'Benefiting', { x: 15, y: 85, width: 70, height: 6 }, { placeholder: 'Benefiting Education for All Foundation', style: { fontSize: 10, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' } })
    ],
    tags: ['program', 'booklet', 'gala', 'elegant']
  },
  {
    id: 'program-cover-modern', name: 'Modern Program Cover', description: 'Contemporary program booklet cover',
    assetType: AssetType.ProgramBooklet, category: 'universal', dimensions: createDimensions(5.5, 8.5, 0.125, 0.25),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#ffffff', accent: '#3b82f6', text: '#0f172a', background: '#ffffff' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      { id: 'accent-bar', type: 'shape', name: 'Accent', position: { x: 0, y: 0, width: 5, height: 100 }, style: { backgroundColor: '#3b82f6' } },
      createLogoField('logo', 'Logo', { x: 10, y: 8, width: 25, height: 10 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 10, y: 24, width: 85, height: 15 }, { placeholder: 'Tech Summit', required: true, style: { fontSize: 36, fontWeight: '800', color: '#0f172a' } }),
      createTextField('year', 'Year', { x: 10, y: 40, width: 30, height: 8 }, { placeholder: '2024', style: { fontSize: 24, fontWeight: '800', color: '#3b82f6' } }),
      createImageField('image', 'Cover Image', { x: 10, y: 52, width: 85, height: 30 }, { placeholder: 'Event imagery', style: { borderRadius: 8 } }),
      createTextField('details', 'Details', { x: 10, y: 86, width: 85, height: 6 }, { placeholder: 'March 15-17 • San Francisco Convention Center', style: { fontSize: 11, color: '#6b7280' } }),
      createTextField('label', 'Label', { x: 10, y: 94, width: 30, height: 4 }, { placeholder: 'PROGRAM', style: { fontSize: 9, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 3 } })
    ],
    tags: ['program', 'booklet', 'modern', 'tech']
  },
  {
    id: 'program-cover-vibrant', name: 'Vibrant Program Cover', description: 'Colorful gradient program cover',
    assetType: AssetType.ProgramBooklet, category: 'universal', dimensions: createDimensions(5.5, 8.5, 0.125, 0.25),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #f472b6 0%, #8b5cf6 50%, #06b6d4 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#8b5cf6', accent: '#fbbf24', text: '#ffffff', background: '#8b5cf6' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 8, width: 40, height: 12 }, { placeholder: 'Event logo' }),
      createTextField('event', 'Event', { x: 5, y: 25, width: 90, height: 18 }, { placeholder: 'BLOOM FEST', required: true, style: { fontSize: 48, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 15, y: 45, width: 70, height: 6 }, { placeholder: 'Create • Connect • Celebrate', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }),
      createTextField('dates', 'Dates', { x: 20, y: 58, width: 60, height: 8 }, { placeholder: 'June 20-23, 2024', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('venue', 'Venue', { x: 20, y: 68, width: 60, height: 6 }, { placeholder: 'Riverside Park', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('label', 'Label', { x: 20, y: 85, width: 60, height: 6 }, { placeholder: 'OFFICIAL PROGRAM', style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 4 } })
    ],
    tags: ['program', 'booklet', 'vibrant', 'festival']
  },
  {
    id: 'program-cover-wedding', name: 'Wedding Program', description: 'Romantic wedding ceremony program',
    assetType: AssetType.ProgramBooklet, category: 'universal', dimensions: createDimensions(5.5, 8.5, 0.125, 0.25),
    background: { type: 'solid', value: '#fef9f0' },
    defaultFonts: { heading: 'Playfair Display', body: 'Lato' },
    defaultColors: { primary: '#2d5016', secondary: '#fef9f0', accent: '#d97706', text: '#2d5016', background: '#fef9f0' },
    colorMode: 'CMYK', dpi: 300,
    fields: [
      createTextField('couple', 'Couple Names', { x: 10, y: 15, width: 80, height: 18 }, { placeholder: 'Sarah & James', required: true, style: { fontSize: 36, textAlign: 'center', color: '#2d5016', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 25, y: 36, width: 50, height: 0.3 }, style: { backgroundColor: '#d97706' } },
      createTextField('date', 'Date', { x: 15, y: 40, width: 70, height: 8 }, { placeholder: 'June 22, 2024', style: { fontSize: 16, textAlign: 'center', color: '#d97706' } }),
      createTextField('venue', 'Venue', { x: 15, y: 50, width: 70, height: 8 }, { placeholder: 'Botanica Gardens', style: { fontSize: 14, textAlign: 'center', color: '#2d5016' } }),
      createImageField('image', 'Photo', { x: 15, y: 62, width: 70, height: 22 }, { placeholder: 'Couple photo', style: { borderRadius: 8 } }),
      createTextField('label', 'Label', { x: 20, y: 88, width: 60, height: 5 }, { placeholder: 'Order of Ceremony', style: { fontSize: 11, textAlign: 'center', color: '#d97706', fontStyle: 'italic' } })
    ],
    tags: ['program', 'wedding', 'ceremony', 'romantic']
  }
];

export const ALL_EVENT_ESSENTIALS_TEMPLATES: EditableTemplate[] = [
  ...INVITATION_TEMPLATES,
  ...TICKET_TEMPLATES,
  ...CERTIFICATE_TEMPLATES,
  ...MENU_TEMPLATES,
  ...PLACE_CARD_TEMPLATES,
  ...TABLE_NUMBER_TEMPLATES,
  ...PROGRAM_BOOKLET_TEMPLATES
];
